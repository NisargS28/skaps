import os
import sys
from dotenv import load_dotenv

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.services.rag.document_service import extract_text_from_file
from app.services.rag.chunk_service import chunk_text
from app.services.rag.embedding_service import create_embedding
from app.services.rag.vector_service import ensure_collection_exists, store_document_chunks, search_similar_chunks, delete_document_chunks

def test_pipeline():
    print("=== Starting RAG Pipeline Verification ===")
    
    # 1. Test Text Chunking
    test_text = "SKAPS AI is a helpful company assistant. We specialize in pair-programming and web application development." * 5
    print("\n[1/5] Testing Text Chunking...")
    chunks = chunk_text(test_text, chunk_size=100, overlap=20)
    print(f"Generated {len(chunks)} chunks.")
    if not chunks:
        print("ERROR: No chunks generated.")
        return
    print(f"First Chunk: '{chunks[0]}'")
    
    # 2. Test Embedding Generation
    print("\n[2/5] Testing Embedding Generation...")
    try:
        vec = create_embedding("Verify connection to LM Studio embeddings endpoint")
        print(f"Success! Generated vector embedding of size: {len(vec)}")
    except Exception as e:
        print(f"ERROR calling LM Studio embeddings. Is LM Studio active with the embedding model loaded? Error: {e}")
        return

    # 3. Test Qdrant Collection Ingestion
    print("\n[3/5] Testing Qdrant Collection...")
    try:
        ensure_collection_exists()
        print("Qdrant collection validated.")
    except Exception as e:
        print(f"ERROR connecting to Qdrant collection. Is Qdrant container running? Error: {e}")
        return

    # 4. Test Upserting
    print("\n[4/5] Testing Vector Upsert...")
    doc_id = 9999
    workspace_id = 1
    try:
        stored_count = store_document_chunks(
            document_id=doc_id,
            chunks=["SKAPS AI chatbot integration plan with Qdrant is fully functioning."],
            file_name="test_doc.txt",
            workspace_id=workspace_id
        )
        print(f"Successfully upserted {stored_count} vector points to Qdrant.")
    except Exception as e:
        print(f"ERROR indexing into Qdrant: {e}")
        return

    # 5. Test Semantic Search
    print("\n[5/5] Testing Semantic Search Filtering...")
    try:
        query_vec = create_embedding("How does SKAPS AI function with Qdrant?")
        results = search_similar_chunks(query_vec, workspace_id=workspace_id, top_k=2)
        print(f"Search returned {len(results)} results.")
        for r in results:
            print(f" - Found match in '{r.payload.get('file_name')}': {r.payload.get('text')} (Score: {r.score})")
    except Exception as e:
        print(f"ERROR querying vector index: {e}")
        return

    # Clean up
    print("\nCleaning up test document points...")
    delete_document_chunks(doc_id)
    print("Clean up completed.")
    print("\n=== RAG Pipeline Verification Successful! ===")

if __name__ == "__main__":
    test_pipeline()
