from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat import ChatSession, ChatMessage, ChatAttachment
from typing import List, Optional
from datetime import datetime
import uuid
import os
import shutil
import httpx

# Load environment variables for LM Studio
from dotenv import load_dotenv
load_dotenv()

from fastapi.concurrency import run_in_threadpool
from app.services.llm_service import ask_lm_studio
from app.models.admin import SystemSetting
import json

LM_STUDIO_BASE_URL = os.getenv("LM_STUDIO_BASE_URL", "http://192.168.23.111:1233/v1")
LM_STUDIO_MODEL = os.getenv("LM_STUDIO_MODEL", "google/gemma-2-9b")

router = APIRouter(prefix="/chat", tags=["Chat"])

# Allowed file extensions for chat attachments
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "xlsx", "png", "jpg", "jpeg"}
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "chat_attachments")

# Schemas
class ChatSessionCreate(BaseModel):
    user_id: int
    title: str
    workspace: str

class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    workspace: str
    created_at: datetime

    class Config:
        orm_mode = True

class ChatMessageCreate(BaseModel):
    role: str
    content: str
    model: Optional[str] = None

class ChatAttachmentResponse(BaseModel):
    id: int
    file_name: str
    original_file_name: str
    file_path: str
    file_size: int
    file_type: str
    upload_status: str

    class Config:
        orm_mode = True

class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    response_time_ms: int = 0
    status: str = "success"
    created_at: datetime
    attachments: List[ChatAttachmentResponse] = []

    class Config:
        orm_mode = True

# Routes
@router.post("/sessions", response_model=ChatSessionResponse)
def create_chat_session(session_data: ChatSessionCreate, db: Session = Depends(get_db)):
    db_session = ChatSession(**session_data.dict())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/sessions/{user_id}", response_model=List[ChatSessionResponse])
def get_user_chat_sessions(user_id: int, workspace: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ChatSession).filter(ChatSession.user_id == user_id)
    if workspace:
        query = query.filter(ChatSession.workspace == workspace)
    return query.order_by(ChatSession.created_at.desc()).all()

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_chat_messages(session_id: int, db: Session = Depends(get_db)):
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
def add_chat_message(session_id: int, message_data: ChatMessageCreate, db: Session = Depends(get_db)):
    db_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db_message = ChatMessage(session_id=session_id, **message_data.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Optionally update session title based on first user message if it's currently "New Chat"
    if db_message.role == "user" and db_session.title == "New Chat":
        db_session.title = db_message.content[:30] + ("..." if len(db_message.content) > 30 else "")
        db.commit()
        
    return db_message


@router.get("/models")
def get_available_models(db: Session = Depends(get_db)):
    # 1. Fetch configured models from DB setting
    setting = db.query(SystemSetting).filter(SystemSetting.setting_key == "llm_models").first()
    
    models_list = []
    enabled_map = {}
    if setting and setting.setting_value:
        val = setting.setting_value.strip()
        if val.startswith("[") and val.endswith("]"):
            try:
                parsed = json.loads(val)
                for item in parsed:
                    if isinstance(item, dict) and "id" in item:
                        m_id = item["id"]
                        models_list.append(m_id)
                        enabled_map[m_id] = item.get("enabled", True)
                    elif isinstance(item, str):
                        models_list.append(item)
                        enabled_map[item] = True
            except Exception as e:
                print(f"Error parsing JSON settings llm_models: {e}")
                models_list = [m.strip() for m in val.split(",") if m.strip()]
        else:
            models_list = [m.strip() for m in val.split(",") if m.strip()]
    else:
        # If setting doesn't exist, read from models.json and initialize setting in DB
        try:
            backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            models_path = os.path.join(backend_path, "models.json")
            if os.path.exists(models_path):
                with open(models_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict) and "chatModels" in data:
                        models_list = [m["id"] for m in data["chatModels"] if "id" in m]
                    elif isinstance(data, list):
                        models_list = [m["id"] for m in data if "id" in m]
                    else:
                        models_list = []
            else:
                # Hardcoded fallbacks if models.json not found
                models_list = [
                    "qwen/qwen3.5-9b",
                    "google/gemma-2-9b",
                    "mistralai/ministral-3-14b-reasoning",
                    "nvidia/nemotron-3-nano-4b"
                ]
            
            # Save to DB as JSON format
            json_list = [{"id": m_id, "enabled": True} for m_id in models_list]
            new_setting = SystemSetting(
                setting_key="llm_models",
                setting_value=json.dumps(json_list),
                setting_type="text",
                description="JSON list of configured LLM models with enable/disable flags."
            )
            db.add(new_setting)
            db.commit()
        except Exception as e:
            print(f"Error loading fallback models.json: {e}")
            models_list = ["google/gemma-2-9b", "qwen/qwen3.5-9b"]
    
    # 2. Check loaded models from LM Studio
    loaded_model_ids = set()
    lm_studio_online = False
    try:
        # Query f"{LM_STUDIO_BASE_URL}/models"
        response = httpx.get(f"{LM_STUDIO_BASE_URL}/models", timeout=2.0)
        if response.status_code == 200:
            data = response.json()
            if "data" in data:
                for m in data["data"]:
                    if "id" in m:
                        loaded_model_ids.add(m["id"])
            lm_studio_online = True
    except Exception as e:
        print(f"LM Studio offline or error fetching loaded models: {e}")
    
    # 3. Build return models list
    result = []
    for m_id in models_list:
        available = m_id in loaded_model_ids if lm_studio_online else True
        enabled = enabled_map.get(m_id, True)
        result.append({
            "id": m_id,
            "available": available,
            "enabled": enabled
        })
        
    return {
        "lm_studio_online": lm_studio_online,
        "models": result
    }


@router.post("/send")
async def send_chat_message(
    session_id: int = Form(...),
    message: str = Form(...),
    model: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    """Send a chat message with optional file attachments, returning an SSE stream."""

    # Validate session exists
    db_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Save the user message
    db_message = ChatMessage(session_id=session_id, role="user", content=message, model=model)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    # Update session title if first message
    if db_session.title == "New Chat":
        db_session.title = message[:30] + ("..." if len(message) > 30 else "")
        db.commit()

    # 2. Process file attachments
    saved_attachments = []

    for file in files:
        # Validate file extension
        ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type '.{ext}' is not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        # Generate unique filename
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Get file size
        file_size = os.path.getsize(file_path)

        # Insert attachment record
        db_attachment = ChatAttachment(
            message_id=db_message.id,
            file_name=unique_name,
            original_file_name=file.filename,
            file_path=f"uploads/chat_attachments/{unique_name}",
            file_size=file_size,
            file_type=file.content_type or "",
            upload_status="uploaded",
        )
        db.add(db_attachment)
        db.commit()
        db.refresh(db_attachment)

        saved_attachments.append({
            "id": db_attachment.id,
            "message_id": db_attachment.message_id,
            "file_name": db_attachment.file_name,
            "original_file_name": db_attachment.original_file_name,
            "file_path": db_attachment.file_path,
            "file_size": db_attachment.file_size,
            "file_type": db_attachment.file_type,
            "upload_status": db_attachment.upload_status,
        })

    # 3. Call LM Studio API for bot response streaming
    session_messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    
    lm_messages = []
    for msg in session_messages:
        role = "assistant" if msg.role == "bot" else "user" if msg.role == "user" else "system"
        lm_messages.append({"role": role, "content": msg.content})

    async def stream_generator():
        # First yield the "init" event with the saved user message and attachments
        yield f"data: {json.dumps({'event': 'init', 'message': {'id': db_message.id, 'session_id': db_message.session_id, 'role': db_message.role, 'content': db_message.content, 'created_at': db_message.created_at.isoformat() if db_message.created_at else None}, 'attachments': saved_attachments})}\n\n"

        from app.services.llm_service import ask_lm_studio_stream
        
        # Execute the stream generator in a thread pool to avoid blocking the main event loop
        stream = ask_lm_studio_stream(message, messages=lm_messages, model=model)
        
        bot_content = ""
        prompt_tokens = 0
        completion_tokens = 0
        total_tokens = 0
        response_time_ms = 0
        status = "success"
        
        for chunk in stream:
            event = chunk.get("event")
            if event == "token":
                text = chunk.get("text", "")
                bot_content += text
                yield f"data: {json.dumps({'event': 'token', 'text': text})}\n\n"
            elif event == "done":
                prompt_tokens = chunk.get("prompt_tokens", 0)
                completion_tokens = chunk.get("completion_tokens", 0)
                total_tokens = chunk.get("total_tokens", 0)
                response_time_ms = chunk.get("response_time_ms", 0)
                status = chunk.get("status", "success")
            elif event == "error":
                status = "failed"
                err_msg = chunk.get("error", "Error calling LLM")
                yield f"data: {json.dumps({'event': 'error', 'error': err_msg})}\n\n"

        # 4. Save the bot message to database using a fresh SessionLocal to avoid greenlet/async thread-safety issues
        from app.database import SessionLocal
        save_db = SessionLocal()
        try:
            db_bot_message = ChatMessage(
                session_id=session_id,
                role="bot",
                content=bot_content or "Sorry, I could not generate a response right now.",
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                response_time_ms=response_time_ms,
                status=status,
                model=model or LM_STUDIO_MODEL
            )
            save_db.add(db_bot_message)
            save_db.commit()
            save_db.refresh(db_bot_message)
            
            # Yield final "done" event
            yield f"data: {json.dumps({'event': 'done', 'bot_message': {'id': db_bot_message.id, 'session_id': db_bot_message.session_id, 'role': db_bot_message.role, 'content': db_bot_message.content, 'prompt_tokens': db_bot_message.prompt_tokens, 'completion_tokens': db_bot_message.completion_tokens, 'total_tokens': db_bot_message.total_tokens, 'response_time_ms': db_bot_message.response_time_ms, 'status': db_bot_message.status, 'created_at': db_bot_message.created_at.isoformat() if db_bot_message.created_at else None}})}\n\n"
        except Exception as ex:
            print(f"Error saving bot message in stream: {ex}")
            save_db.rollback()
        finally:
            save_db.close()

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

@router.delete("/history/{user_id}")
def clear_chat_history(user_id: int, db: Session = Depends(get_db)):
    """Clear all chat history for a user."""
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).all()
    for session in sessions:
        db.delete(session)
    db.commit()
    return {"message": "Chat history cleared successfully"}

class ChatSessionUpdate(BaseModel):
    title: str

@router.put("/sessions/{session_id}", response_model=ChatSessionResponse)
def update_chat_session(session_id: int, session_update: ChatSessionUpdate, db: Session = Depends(get_db)):
    db_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db_session.title = session_update.title
    db.commit()
    db.refresh(db_session)
    return db_session

@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: int, db: Session = Depends(get_db)):
    db_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db.delete(db_session)
    db.commit()
    return {"message": "Session deleted successfully"}
