import os
from openai import OpenAI
from app.utils.model_registry import get_embedding_model_id

def create_embedding(text: str, db=None) -> list:
    """
    Calls the LM Studio embeddings endpoint using the configured embedding model ID.
    Returns the vector embedding as a list of floats.
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text.")

    base_url = os.getenv("LM_STUDIO_BASE_URL", "http://192.168.23.111:1233/v1")
    model_id = get_embedding_model_id()

    # The OpenAI client points to LM Studio's local endpoint
    client = OpenAI(base_url=base_url, api_key="lm-studio")
    
    try:
        response = client.embeddings.create(
            model=model_id,
            input=text
        )
        if response and response.data:
            return response.data[0].embedding
        else:
            raise Exception("No embedding data returned from LM Studio.")
    except Exception as e:
        raise Exception(f"Failed to generate embedding with model '{model_id}': {str(e)}")
