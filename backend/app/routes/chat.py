from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat import ChatSession, ChatMessage, ChatAttachment
from typing import List, Optional
from datetime import datetime
import uuid
import os
import shutil

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


@router.post("/send")
async def send_chat_message(
    session_id: int = Form(...),
    message: str = Form(...),
    model: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    """Send a chat message with optional file attachments."""

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

    return {
        "message": {
            "id": db_message.id,
            "session_id": db_message.session_id,
            "role": db_message.role,
            "content": db_message.content,
            "created_at": db_message.created_at.isoformat() if db_message.created_at else None,
        },
        "attachments": saved_attachments,
    }

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
