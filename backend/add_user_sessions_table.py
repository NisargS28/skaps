"""
One-time migration: create the user_sessions table.
Run from the /backend directory:
    venv\Scripts\python.exe add_user_sessions_table.py
"""
from app.database import engine
from app.models.user_session import UserSession
from app.database import Base

try:
    Base.metadata.create_all(bind=engine, tables=[UserSession.__table__])
    print("user_sessions table created (or already exists).")
except Exception as e:
    print("Error:", e)
