import os
from sqlalchemy.orm import Session
from app.models.admin import Document
from app.services.rag.document_service import extract_text_from_file
from app.services.rag.chunk_service import chunk_text
from app.services.rag.embedding_service import create_embedding
from app.services.rag.vector_service import store_document_chunks, search_similar_chunks
from app.services.llm_service import ask_lm_studio

def ingest_document(document_id: int, db: Session):
    """
    Background job to ingest an uploaded document into the RAG vector store.
    1. Extracts text from file.
    2. Chunks the text.
    3. Generates embeddings and saves to Qdrant.
    4. Updates document status in DB.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        print(f"Document ID {document_id} not found during ingestion.")
        return

    # Update status to processing
    doc.processing_status = "processing"
    doc.embedding_status = "pending"
    db.commit()

    try:
        # 1. Extract text
        print(f"Extracting text from document #{document_id} ({doc.original_file_name})...")
        text = extract_text_from_file(doc.file_path, doc.file_type)

        # 2. Chunk text
        print(f"Chunking text from document #{document_id}...")
        chunks = chunk_text(text, chunk_size=1000, overlap=200)
        if not chunks:
            raise ValueError("No valid text chunks could be extracted from this document.")

        # 3. Embed & Store in Qdrant
        print(f"Generating embeddings & saving {len(chunks)} chunks in Qdrant...")
        stored_count = store_document_chunks(
            document_id=doc.id,
            chunks=chunks,
            file_name=doc.original_file_name,
            workspace_id=doc.workspace_id,
            user_id=doc.uploaded_by
        )

        # 4. Update status in PostgreSQL DB
        doc.chunk_count = stored_count
        doc.processing_status = "completed"
        doc.embedding_status = "embedded"
        db.commit()
        print(f"Document #{document_id} successfully ingested into Qdrant!")

    except Exception as e:
        print(f"Failed to ingest document #{document_id}: {str(e)}")
        # Commit failure state to DB
        doc.processing_status = "failed"
        doc.embedding_status = "failed"
        db.commit()
        raise e

def answer_with_rag(question: str, selected_model: str, workspace_id: int, db: Session, top_k: int = 5) -> dict:
    """
    Generates grounded RAG answer from context retrieved from Qdrant vector store.
    1. Embeds question.
    2. Searches for relevant document chunks inside active workspace.
    3. Builds grounded instruction prompt.
    4. Calls active chat model.
    5. Returns grounded answer and source citations.
    """
    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    # 1. Embed query
    query_embedding = create_embedding(question)

    # 2. Search similar chunks filtered by workspace ID
    results = search_similar_chunks(query_embedding, workspace_id=workspace_id, top_k=top_k)

    contexts = []
    sources = []
    for res in results:
        # Extract metadata from payload
        p = res.payload
        file_name = p.get("file_name", "Unknown Document")
        doc_id = p.get("document_id")
        chunk_idx = p.get("chunk_index")
        chunk_text = p.get("text", "")
        
        contexts.append(f"Document: {file_name}\nContent: {chunk_text}")
        
        sources.append({
            "fileName": file_name,
            "documentId": doc_id,
            "chunkIndex": chunk_idx,
            "score": float(res.score)
        })

    # Assemble grounded context string
    context_str = "\n\n---\n\n".join(contexts)

    # 3. Build strict grounded prompt
    system_prompt = (
        "You are SKAPS AI, a helpful company assistant. Use ONLY the provided context to answer the question.\n"
        "If the answer is not in the context, say 'I don't know based on uploaded documents.' Do not make up information."
    )
    
    user_message = f"Grounded Context Documents:\n{context_str}\n\nQuestion: {question}"

    # 4. Get completions from standard LM Studio
    response = ask_lm_studio(
        user_message=user_message,
        system_prompt=system_prompt,
        model=selected_model
    )

    return {
        "answer": response.get("answer", "Sorry, I could not generate a response right now."),
        "model": selected_model,
        "sources": sources
    }
