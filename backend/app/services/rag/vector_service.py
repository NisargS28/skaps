import os
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from app.services.rag.embedding_service import create_embedding

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "rag_documents")
EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "768"))

# Initialize Qdrant Client (support local/cloud with optional API key)
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)

def ensure_collection_exists():
    """Verifies if the Qdrant collection exists; creates it with Cosine distance if missing."""
    try:
        exists = client.collection_exists(QDRANT_COLLECTION)
        if not exists:
            print(f"Creating Qdrant collection '{QDRANT_COLLECTION}' with dimensions={EMBEDDING_DIMENSIONS}...")
            client.create_collection(
                collection_name=QDRANT_COLLECTION,
                vectors_config=VectorParams(size=EMBEDDING_DIMENSIONS, distance=Distance.COSINE),
            )
    except Exception as e:
        print(f"Error checking/creating Qdrant collection: {e}")
        raise Exception(f"Failed to initialize Qdrant collection: {str(e)}")

def store_document_chunks(document_id: int, chunks: list, file_name: str, workspace_id: int, user_id: int = None) -> int:
    """
    Generates embeddings for chunks and saves them in Qdrant with associated metadata.
    Returns the number of chunks successfully stored.
    """
    ensure_collection_exists()
    points = []
    
    for idx, chunk_text in enumerate(chunks):
        if not chunk_text.strip():
            continue
            
        embedding = create_embedding(chunk_text)
        point_id = str(uuid.uuid4())
        
        payload = {
            "document_id": int(document_id),
            "chunk_index": int(idx),
            "text": chunk_text,
            "file_name": file_name,
            "workspace_id": int(workspace_id),
        }
        if user_id is not None:
            payload["user_id"] = int(user_id)
            
        points.append(
            PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload
            )
        )
        
    if points:
        client.upsert(collection_name=QDRANT_COLLECTION, points=points)
        
    return len(points)

def search_similar_chunks(embedding: list, workspace_id: int, top_k: int = 5) -> list:
    """
    Searches Qdrant for top relevant chunks, filtered strictly by workspace_id.
    """
    ensure_collection_exists()
    
    query_filter = Filter(
        must=[
            FieldCondition(
                key="workspace_id",
                match=MatchValue(value=int(workspace_id))
            )
        ]
    )
    
    try:
        results = client.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=embedding,
            query_filter=query_filter,
            limit=top_k
        )
        return results
    except Exception as e:
        raise Exception(f"Failed to query Qdrant vector database: {str(e)}")

def delete_document_chunks(document_id: int):
    """
    Removes all stored vectors/chunks associated with document_id from Qdrant.
    """
    ensure_collection_exists()
    try:
        client.delete(
            collection_name=QDRANT_COLLECTION,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=int(document_id))
                    )
                ]
            )
        )
    except Exception as e:
        print(f"Error deleting chunks for document #{document_id} from Qdrant: {e}")
        # Non-fatal to allow main DB status to complete deletion
