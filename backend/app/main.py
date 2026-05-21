# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, chat, settings, user_session
from app.models import admin as admin_models  # registers Workspace, Document, SystemSetting, AuditLog
from app.routes import users, chat as chat_routes, settings as settings_routes
from app.routes import admin as admin_routes
import os
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

# Ensure upload directories exist
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads", "chat_attachments"), exist_ok=True)
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads", "documents"), exist_ok=True)

app = FastAPI(title="SKAPS AI Backend", version="1.0.0")

# CORS — allow the Next.js frontend to reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(chat_routes.router, prefix="/api")
app.include_router(settings_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")

app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")), name="uploads")

@app.get("/")
def home():
    return {"message": "Backend is working"}

@app.get("/users")
def get_users_redirect():
    return RedirectResponse(url="/api/users")