# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, chat
from app.routes import users, chat as chat_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SKAPS AI Backend", version="1.0.0")

# CORS — allow the Next.js frontend to reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(chat_routes.router, prefix="/api")

@app.get("/")
def home():
    return {"message": "Backend is working"}

@app.get("/users")
def get_users_redirect():
    return RedirectResponse(url="/api/users")