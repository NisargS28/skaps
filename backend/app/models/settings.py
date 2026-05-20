from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Appearance
    theme = Column(String, default="system")
    font_size = Column(String, default="medium")
    
    # Chat Preferences
    default_workspace = Column(String, default="HR")
    show_source_refs = Column(Boolean, default=True)
    auto_scroll = Column(Boolean, default=True)
    show_suggested_questions = Column(Boolean, default=True)
    
    # File Upload
    show_uploaded_files = Column(Boolean, default=True)
    
    # Personalization
    custom_instructions_enabled = Column(Boolean, default=False)
    custom_instructions_text = Column(String, default="")
    saved_memories_enabled = Column(Boolean, default=False)

    user = relationship("User", back_populates="settings")
