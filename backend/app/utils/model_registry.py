import os
import json
from sqlalchemy.orm import Session
from app.models.admin import SystemSetting

BACKEND_PATH = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_JSON_PATH = os.path.join(BACKEND_PATH, "models.json")

def get_fallback_models_data():
    """Reads models from the models.json file."""
    if os.path.exists(MODELS_JSON_PATH):
        try:
            with open(MODELS_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading models.json fallback: {e}")
    return {}

def get_embedding_model_id() -> str:
    """Fetches the configured default embedding model ID."""
    data = get_fallback_models_data()
    # Default as specified in models.json defaults or a standard fallback
    return data.get("defaults", {}).get("embeddingModel", "text-embedding-nomic-embed-text-v1.5")

def get_enabled_chat_models(db: Session) -> list:
    """Fetches a list of chat models enabled by the administrator."""
    # 1. Try to fetch from DB SystemSetting
    setting = db.query(SystemSetting).filter(SystemSetting.setting_key == "llm_models").first()
    
    enabled_models = []
    if setting and setting.setting_value:
        try:
            parsed = json.loads(setting.setting_value)
            for item in parsed:
                if isinstance(item, dict) and "id" in item:
                    if item.get("enabled", True):
                        enabled_models.append(item["id"])
                elif isinstance(item, str):
                    enabled_models.append(item)
            return enabled_models
        except Exception as e:
            print(f"Error parsing system settings llm_models in registry: {e}")
            
    # 2. Fall back to models.json chatModels
    data = get_fallback_models_data()
    chat_models = data.get("chatModels", [])
    if chat_models:
        return [m["id"] for m in chat_models if m.get("enabled", True)]
        
    # 3. Final safety fallback
    return [
        "qwen/qwen3.5-9b",
        "google/gemma-2-9b",
        "mistralai/ministral-3-14b-reasoning",
        "nvidia/nemotron-3-nano-4b"
    ]

def is_model_enabled(model_id: str, db: Session) -> bool:
    """Validates if the requested model ID is enabled."""
    if not model_id:
        return False
    enabled_models = get_enabled_chat_models(db)
    return model_id in enabled_models
