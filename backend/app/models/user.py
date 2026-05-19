from sqlalchemy import Column, Integer, String
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
    
    sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")