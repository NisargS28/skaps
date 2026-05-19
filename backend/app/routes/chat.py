from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat import ChatSession, ChatMessage
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Chat"])

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

class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

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
