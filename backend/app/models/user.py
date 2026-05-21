from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password_hash = Column(String)
    department = Column(String)
    role = Column(String)
    session_token = Column(String, nullable=True)
    status = Column(String(30), default="active")
    last_login_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)

    sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    user_sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")