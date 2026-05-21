from sqlalchemy import (
    Column, Integer, BigInteger, String, Text, Boolean,
    ForeignKey, DateTime, Date, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    status = Column(String(30), default="active")
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # documents = relationship("Document", back_populates="workspace")
    # sessions = relationship("ChatSession", back_populates="workspace_rel", foreign_keys="ChatSession.workspace_id")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_name = Column(String(255))
    original_file_name = Column(String(255))
    file_path = Column(Text)
    file_size = Column(BigInteger)
    file_type = Column(String(100))
    processing_status = Column(String(50), default="processing")
    embedding_status = Column(String(50), default="pending")
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # workspace = relationship("Workspace", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(Text)
    setting_type = Column(String(50))
    description = Column(Text)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100))
    entity_id = Column(Integer)
    details = Column(JSON)
    ip_address = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])


class AnalyticsDailySummary(Base):
    __tablename__ = "analytics_daily_summary"

    id = Column(Integer, primary_key=True, index=True)
    summary_date = Column(Date, nullable=False)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True)
    total_users = Column(Integer, default=0)
    active_users = Column(Integer, default=0)
    total_chat_sessions = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    failed_queries = Column(Integer, default=0)
    avg_response_time_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
