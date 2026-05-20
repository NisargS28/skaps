from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.settings import UserSettings
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsSchema(BaseModel):
    theme: str
    font_size: str
    default_workspace: str
    show_source_refs: bool
    auto_scroll: bool
    show_suggested_questions: bool
    show_uploaded_files: bool
    custom_instructions_enabled: bool
    custom_instructions_text: str
    saved_memories_enabled: bool

@router.get("/{user_id}", response_model=SettingsSchema)
def get_user_settings(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        # Return default settings
        return SettingsSchema(
            theme="system",
            font_size="medium",
            default_workspace="HR",
            show_source_refs=True,
            auto_scroll=True,
            show_suggested_questions=True,
            show_uploaded_files=True,
            custom_instructions_enabled=False,
            custom_instructions_text="",
            saved_memories_enabled=False
        )
    
    return SettingsSchema(
        theme=settings.theme,
        font_size=settings.font_size,
        default_workspace=settings.default_workspace,
        show_source_refs=settings.show_source_refs,
        auto_scroll=settings.auto_scroll,
        show_suggested_questions=settings.show_suggested_questions,
        show_uploaded_files=settings.show_uploaded_files,
        custom_instructions_enabled=settings.custom_instructions_enabled,
        custom_instructions_text=settings.custom_instructions_text,
        saved_memories_enabled=settings.saved_memories_enabled
    )

@router.put("/{user_id}", response_model=SettingsSchema)
def update_user_settings(user_id: int, payload: SettingsSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        
    settings.theme = payload.theme
    settings.font_size = payload.font_size
    settings.default_workspace = payload.default_workspace
    settings.show_source_refs = payload.show_source_refs
    settings.auto_scroll = payload.auto_scroll
    settings.show_suggested_questions = payload.show_suggested_questions
    settings.show_uploaded_files = payload.show_uploaded_files
    settings.custom_instructions_enabled = payload.custom_instructions_enabled
    settings.custom_instructions_text = payload.custom_instructions_text
    settings.saved_memories_enabled = payload.saved_memories_enabled
    
    db.commit()
    db.refresh(settings)
    
    return payload
