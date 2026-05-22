"""
Admin API Router
Provides all endpoints for the admin dashboard.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
import os
import uuid
import shutil
import httpx


from app.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage, ChatAttachment
from app.models.settings import UserSettings
from app.models.admin import Workspace, Document, SystemSetting, AuditLog
from app.models.user_session import UserSession

router = APIRouter(prefix="/admin", tags=["Admin"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads", "documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ─── Audit Log Helper ─────────────────────────────────────────────────────────

def log_audit(
    db: Session,
    action: str,
    entity_type: str = None,
    entity_id: int = None,
    details: dict = None,
    user_id: int = None,
    ip_address: str = None,
):
    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address,
        created_at=datetime.utcnow(),
    )
    db.add(entry)
    # do NOT commit here – caller commits


# ─── Dashboard KPIs ───────────────────────────────────────────────────────────

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    """Return all KPI stats for the admin dashboard."""

    total_users = db.query(func.count(User.id)).scalar() or 0

    today = date.today()
    active_today = (
        db.query(func.count(func.distinct(ChatSession.user_id)))
        .filter(func.date(ChatSession.created_at) == today)
        .scalar() or 0
    )

    total_sessions = db.query(func.count(ChatSession.id)).scalar() or 0

    kb_documents = (
        db.query(func.count(Document.id))
        .filter(Document.processing_status != "deleted")
        .scalar() or 0
    )

    active_workspaces = (
        db.query(func.count(Workspace.id))
        .filter(Workspace.status == "active")
        .scalar() or 0
    )

    pending_docs = (
        db.query(func.count(Document.id))
        .filter(Document.processing_status.in_(["processing", "pending"]))
        .scalar() or 0
    )

    failed_queries = (
        db.query(func.count(ChatMessage.id))
        .filter(ChatMessage.role == "bot", ChatMessage.status == "failed")
        .scalar() or 0
    )

    avg_response_ms = (
        db.query(func.round(func.avg(ChatMessage.response_time_ms), 0))
        .filter(ChatMessage.role == "bot", ChatMessage.response_time_ms > 0)
        .scalar()
    )

    token_data = db.query(
        func.coalesce(func.sum(ChatMessage.prompt_tokens), 0),
        func.coalesce(func.sum(ChatMessage.completion_tokens), 0),
        func.coalesce(func.sum(ChatMessage.total_tokens), 0),
    ).one()

    # Department / workspace usage
    dept_usage = (
        db.query(
            Workspace.name.label("workspace"),
            func.count(func.distinct(ChatSession.id)).label("sessions"),
            func.count(ChatMessage.id).label("messages"),
            func.coalesce(func.sum(ChatMessage.total_tokens), 0).label("tokens"),
        )
        .outerjoin(ChatSession, ChatSession.workspace == Workspace.name)
        .outerjoin(ChatMessage, ChatMessage.session_id == ChatSession.id)
        .group_by(Workspace.name)
        .order_by(func.coalesce(func.sum(ChatMessage.total_tokens), 0).desc())
        .all()
    )

    # Check LLM Health
    llm_healthy = False
    try:
        from dotenv import load_dotenv
        load_dotenv()
        lm_url = os.getenv("LM_STUDIO_BASE_URL", "http://192.168.23.111:1233/v1")
        r = httpx.get(f"{lm_url}/models", timeout=2.0)
        if r.status_code == 200:
            llm_healthy = True
    except Exception as e:
        pass

    return {
        "llm_healthy": llm_healthy,
        "total_users": total_users,
        "active_today": active_today,
        "total_sessions": total_sessions,
        "kb_documents": kb_documents,
        "active_workspaces": active_workspaces,
        "pending_docs": pending_docs,
        "failed_queries": failed_queries,
        "avg_response_ms": int(avg_response_ms) if avg_response_ms else 0,
        "prompt_tokens": int(token_data[0]),
        "completion_tokens": int(token_data[1]),
        "total_tokens": int(token_data[2]),
        "dept_usage": [
            {
                "workspace": row.workspace,
                "sessions": row.sessions,
                "messages": row.messages,
                "tokens": int(row.tokens),
            }
            for row in dept_usage
        ],
        "model_usage": [
            {
                "model": row.model,
                "count": row.count
            }
            for row in (
                db.query(ChatMessage.model, func.count(ChatMessage.id).label("count"))
                .filter(ChatMessage.model != None)
                .group_by(ChatMessage.model)
                .order_by(func.count(ChatMessage.id).desc())
                .all()
            )
        ],
    }


# ─── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
def get_users(
    search: Optional[str] = None,
    department: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List users with optional filters. Includes aggregated token usage."""
    query = db.query(User)

    if search:
        q = f"%{search}%"
        query = query.filter(
            (User.name.ilike(q)) | (User.email.ilike(q))
        )
    if department:
        query = query.filter(User.department == department)
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)

    users = query.order_by(User.name).all()

    # Aggregate token usage per user
    token_rows = (
        db.query(
            ChatSession.user_id,
            func.coalesce(func.sum(ChatMessage.prompt_tokens), 0).label("prompt_tokens"),
            func.coalesce(func.sum(ChatMessage.completion_tokens), 0).label("completion_tokens"),
            func.coalesce(func.sum(ChatMessage.total_tokens), 0).label("total_tokens"),
        )
        .join(ChatMessage, ChatMessage.session_id == ChatSession.id)
        .group_by(ChatSession.user_id)
        .all()
    )
    token_map = {row.user_id: row for row in token_rows}

    result = []
    for u in users:
        tok = token_map.get(u.id)
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "department": u.department,
            "role": u.role,
            "status": u.status or "active",
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
            "prompt_tokens": int(tok.prompt_tokens) if tok else 0,
            "completion_tokens": int(tok.completion_tokens) if tok else 0,
            "total_tokens": int(tok.total_tokens) if tok else 0,
        })
    return result


class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    department: str
    role: str


@router.post("/users")
def create_user(payload: CreateUserRequest, request: Request, db: Session = Depends(get_db)):
    import bcrypt
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    hashed = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed,
        department=payload.department,
        role=payload.role,
        status="active",
    )
    db.add(user)
    db.flush()

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "USER_CREATED", "User", user.id,
              {"name": payload.name, "email": payload.email, "role": payload.role, "department": payload.department},
              ip_address=ip)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email}


class UpdateUserStatusRequest(BaseModel):
    status: str  # active | inactive | disabled


@router.put("/users/{user_id}/status")
def update_user_status(user_id: int, payload: UpdateUserStatusRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_status = user.status
    user.status = payload.status
    user.updated_at = datetime.utcnow()

    # If user is disabled, immediately invalidate their session
    if payload.status == 'disabled':
        user.session_token = None
        # End any active sessions
        active_sessions = db.query(UserSession).filter(UserSession.user_id == user_id, UserSession.logout_at == None).all()
        now = datetime.utcnow()
        for session in active_sessions:
            session.logout_at = now
            session.logout_reason = "disabled by admin"
            delta = (now - session.login_at).total_seconds()
            session.duration_seconds = int(delta)

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "USER_STATUS_UPDATED", "User", user_id,
              {"old_status": old_status, "new_status": payload.status},
              ip_address=ip)
    db.commit()
    return {"message": "Status updated", "status": user.status}


@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
        
    tok = (
        db.query(
            func.coalesce(func.sum(ChatMessage.prompt_tokens), 0).label("prompt_tokens"),
            func.coalesce(func.sum(ChatMessage.completion_tokens), 0).label("completion_tokens"),
            func.coalesce(func.sum(ChatMessage.total_tokens), 0).label("total_tokens")
        )
        .join(ChatSession, ChatMessage.session_id == ChatSession.id)
        .filter(ChatSession.user_id == user_id)
        .first()
    )

    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "department": u.department,
        "role": u.role,
        "status": u.status or "active",
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        "prompt_tokens": int(tok.prompt_tokens) if tok else 0,
        "completion_tokens": int(tok.completion_tokens) if tok else 0,
        "total_tokens": int(tok.total_tokens) if tok else 0,
    }


class UpdateUserRequest(BaseModel):
    name: str
    email: str
    department: str
    role: str

@router.put("/users/{user_id}")
def update_user(user_id: int, payload: UpdateUserRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(User).filter(User.email == payload.email, User.id != user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    user.name = payload.name
    user.email = payload.email
    user.department = payload.department
    user.role = payload.role
    user.updated_at = datetime.utcnow()

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "USER_UPDATED", "User", user_id,
              {"name": payload.name, "email": payload.email, "role": payload.role, "department": payload.department},
              ip_address=ip)
    db.commit()
    return {"message": "User updated"}


class ResetPasswordRequest(BaseModel):
    new_password: str

@router.put("/users/{user_id}/reset-password")
def reset_user_password(user_id: int, payload: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    import bcrypt
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed = bcrypt.hashpw(payload.new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user.password_hash = hashed
    user.updated_at = datetime.utcnow()

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "USER_PASSWORD_RESET", "User", user_id, {}, ip_address=ip)
    db.commit()
    return {"message": "Password reset successful"}


# ─── Workspaces ───────────────────────────────────────────────────────────────

@router.get("/workspaces")
def get_workspaces(db: Session = Depends(get_db)):
    workspaces = db.query(Workspace).order_by(Workspace.name).all()

    result = []
    for ws in workspaces:
        # Session count using workspace name (string column on chat_sessions)
        session_count = (
            db.query(func.count(ChatSession.id))
            .filter(ChatSession.workspace == ws.name)
            .scalar() or 0
        )
        
        result.append({
            "id": ws.id,
            "name": ws.name,
            "description": ws.description,
            "status": ws.status,
            "session_count": session_count,
            "doc_count": 0,
            "updated_at": ws.updated_at.isoformat() if ws.updated_at else None,
        })
    return result


class WorkspaceRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    status: Optional[str] = "active"


@router.post("/workspaces")
def create_workspace(payload: WorkspaceRequest, request: Request, db: Session = Depends(get_db)):
    existing = db.query(Workspace).filter(Workspace.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Workspace name already exists")

    ws = Workspace(name=payload.name, description=payload.description, status=payload.status)
    db.add(ws)
    db.flush()

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "WORKSPACE_CREATED", "Workspace", ws.id,
              {"name": payload.name, "description": payload.description}, ip_address=ip)
    db.commit()
    db.refresh(ws)
    return {"id": ws.id, "name": ws.name}


@router.put("/workspaces/{ws_id}")
def update_workspace(ws_id: int, payload: WorkspaceRequest, request: Request, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    ws.name = payload.name
    ws.description = payload.description
    ws.status = payload.status
    ws.updated_at = datetime.utcnow()

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "WORKSPACE_UPDATED", "Workspace", ws_id,
              {"name": payload.name, "status": payload.status}, ip_address=ip)
    db.commit()
    return {"message": "Workspace updated"}


@router.delete("/workspaces/{ws_id}")
def delete_workspace(ws_id: int, request: Request, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    ws_name = ws.name
    db.delete(ws)
    
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "WORKSPACE_DELETED", "Workspace", ws_id,
              {"name": ws_name}, ip_address=ip)
    db.commit()
    return {"message": "Workspace deleted successfully"}


# ─── Knowledge Base Documents ─────────────────────────────────────────────────

@router.get("/documents")
def get_documents(
    workspace: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(Document)
        .filter(Document.processing_status != "deleted")
        .order_by(Document.created_at.desc())
    )

    if workspace:
        ws = db.query(Workspace).filter(Workspace.name == workspace).first()
        if ws:
            query = query.filter(Document.workspace_id == ws.id)
        else:
            return []

    docs = query.all()
    result = []
    for d in docs:
        ws_name = None
        if d.workspace_id:
            ws_obj = db.query(Workspace).filter(Workspace.id == d.workspace_id).first()
            ws_name = ws_obj.name if ws_obj else None

        uploader_name = None
        if d.uploaded_by:
            uploader = db.query(User).filter(User.id == d.uploaded_by).first()
            uploader_name = uploader.name if uploader else None

        result.append({
            "id": d.id,
            "file_name": d.original_file_name or d.file_name,
            "workspace": ws_name,
            "uploaded_by": uploader_name,
            "file_size": d.file_size,
            "file_type": d.file_type,
            "processing_status": d.processing_status,
            "embedding_status": d.embedding_status,
            "chunk_count": d.chunk_count,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })
    return result


@router.post("/documents/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    workspace_name: str = Form(...),
    uploader_user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    ws = db.query(Workspace).filter(Workspace.name == workspace_name).first()
    if not ws:
        raise HTTPException(status_code=404, detail=f"Workspace '{workspace_name}' not found")

    # Build safe filename
    ext = os.path.splitext(file.filename)[1].lower()
    safe_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    # Save file
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    size = os.path.getsize(file_path)

    doc = Document(
        workspace_id=ws.id,
        uploaded_by=uploader_user_id,
        file_name=safe_name,
        original_file_name=file.filename,
        file_path=file_path,
        file_size=size,
        file_type=file.content_type or ext.lstrip("."),
        processing_status="processing",
        embedding_status="pending",
        chunk_count=0,
    )
    db.add(doc)
    db.flush()

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "DOCUMENT_UPLOADED", "Document", doc.id,
              {"file": file.filename, "workspace": workspace_name, "size_bytes": size},
              user_id=uploader_user_id, ip_address=ip)
    db.commit()
    db.refresh(doc)

    return {
        "id": doc.id,
        "file_name": doc.original_file_name,
        "workspace": workspace_name,
        "processing_status": doc.processing_status,
    }


@router.delete("/documents/{doc_id}")
def delete_document(doc_id: int, request: Request, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.processing_status = "deleted"
    doc.updated_at = datetime.utcnow()

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    log_audit(db, "DOCUMENT_DELETED", "Document", doc_id,
              {"file": doc.original_file_name}, ip_address=ip)
    db.commit()
    return {"message": "Document deleted"}


# ─── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics")
def get_analytics(
    date_range: Optional[str] = "30d",
    workspace: Optional[str] = None,
    model: Optional[str] = None,
    db: Session = Depends(get_db),
):
    from datetime import timedelta

    # Date filter
    now = datetime.utcnow()
    if date_range == "7d":
        since = now - timedelta(days=7)
    elif date_range == "90d":
        since = now - timedelta(days=90)
    elif date_range == "all":
        since = None
    else:  # default 30d
        since = now - timedelta(days=30)

    base_q = db.query(ChatMessage).join(ChatSession, ChatMessage.session_id == ChatSession.id)

    if since:
        base_q = base_q.filter(ChatMessage.created_at >= since)

    if workspace:
        base_q = base_q.filter(ChatSession.workspace == workspace)

    if model:
        base_q = base_q.filter(ChatMessage.model == model)

    total_messages = base_q.filter(ChatMessage.role == "user").count()
    successful = base_q.filter(ChatMessage.role == "bot", ChatMessage.status != "failed").count()
    failed = base_q.filter(ChatMessage.role == "bot", ChatMessage.status == "failed").count()
    avg_resp = (
        base_q.filter(ChatMessage.role == "bot", ChatMessage.response_time_ms > 0)
        .with_entities(func.round(func.avg(ChatMessage.response_time_ms), 0))
        .scalar()
    )

    token_data = base_q.with_entities(
        func.coalesce(func.sum(ChatMessage.prompt_tokens), 0),
        func.coalesce(func.sum(ChatMessage.completion_tokens), 0),
        func.coalesce(func.sum(ChatMessage.total_tokens), 0),
    ).one()

    # Workspace breakdown
    workspace_usage = (
        base_q.with_entities(
            ChatSession.workspace.label("workspace"),
            func.count(func.distinct(ChatSession.id)).label("sessions"),
            func.count(ChatMessage.id).label("messages"),
            func.coalesce(func.sum(ChatMessage.total_tokens), 0).label("tokens"),
        )
        .group_by(ChatSession.workspace)
        .order_by(func.coalesce(func.sum(ChatMessage.total_tokens), 0).desc())
        .all()
    )

    # Top token users
    top_users = (
        base_q.join(User, ChatSession.user_id == User.id)
        .with_entities(
            User.id,
            User.name,
            User.department,
            func.coalesce(func.sum(ChatMessage.prompt_tokens), 0).label("prompt_tokens"),
            func.coalesce(func.sum(ChatMessage.completion_tokens), 0).label("completion_tokens"),
            func.coalesce(func.sum(ChatMessage.total_tokens), 0).label("total_tokens"),
        )
        .group_by(User.id, User.name, User.department)
        .order_by(func.coalesce(func.sum(ChatMessage.total_tokens), 0).desc())
        .limit(10)
        .all()
    )

    # Model usage
    model_usage = (
        base_q.with_entities(
            ChatMessage.model.label("model"),
            func.count(ChatMessage.id).label("count")
        )
        .filter(ChatMessage.model != None)
        .group_by(ChatMessage.model)
        .order_by(func.count(ChatMessage.id).desc())
        .all()
    )

    return {
        "total_messages": total_messages,
        "successful": successful,
        "failed": failed,
        "avg_response_ms": int(avg_resp) if avg_resp else 0,
        "prompt_tokens": int(token_data[0]),
        "completion_tokens": int(token_data[1]),
        "total_tokens": int(token_data[2]),
        "workspace_usage": [
            {
                "workspace": row.workspace or "Unknown",
                "sessions": row.sessions,
                "messages": row.messages,
                "tokens": int(row.tokens),
            }
            for row in workspace_usage
        ],
        "top_users": [
            {
                "id": row.id,
                "name": row.name,
                "department": row.department,
                "prompt_tokens": int(row.prompt_tokens),
                "completion_tokens": int(row.completion_tokens),
                "total_tokens": int(row.total_tokens),
            }
            for row in top_users
        ],
        "model_usage": [
            {
                "model": row.model,
                "count": row.count,
            }
            for row in model_usage
        ],
    }


@router.get("/analytics/usage")
def get_analytics_usage(
    date_range: Optional[str] = "30d",
    workspace: Optional[str] = None,
    model: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Return detailed usage statistics for LM Studio calls.
    Supports filtering by date range, workspace, and model.
    """
    from datetime import timedelta

    # Date filter
    now = datetime.utcnow()
    if date_range == "7d":
        since = now - timedelta(days=7)
    elif date_range == "90d":
        since = now - timedelta(days=90)
    elif date_range == "all":
        since = None
    else:  # default 30d
        since = now - timedelta(days=30)

    base_q = db.query(ChatMessage).join(ChatSession, ChatMessage.session_id == ChatSession.id)

    if since:
        base_q = base_q.filter(ChatMessage.created_at >= since)

    if workspace:
        base_q = base_q.filter(ChatSession.workspace == workspace)

    if model:
        base_q = base_q.filter(ChatMessage.model == model)

    # 1. total_queries = count of user messages OR count of bot responses, whichever is already used consistently in project.
    total_queries = base_q.filter(ChatMessage.role == "user").count()

    # 2. successful = count where sender='bot' and status='success' (using coalesce for old database entries)
    successful = base_q.filter(
        ChatMessage.role == "bot",
        func.coalesce(ChatMessage.status, "success") == "success"
    ).count()

    # 3. failed = count where sender='bot' and status='failed'
    failed = base_q.filter(ChatMessage.role == "bot", ChatMessage.status == "failed").count()

    # 4. avg_response_time_ms = average response_time_ms where sender='bot' and response_time_ms > 0
    avg_resp = (
        base_q.filter(ChatMessage.role == "bot", ChatMessage.response_time_ms > 0)
        .with_entities(func.round(func.avg(ChatMessage.response_time_ms), 0))
        .scalar()
    )

    # 5. prompt_tokens, completion_tokens, total_tokens = sum prompt/completion/total tokens where sender='bot'
    token_data = base_q.filter(ChatMessage.role == "bot").with_entities(
        func.coalesce(func.sum(ChatMessage.prompt_tokens), 0),
        func.coalesce(func.sum(ChatMessage.completion_tokens), 0),
        func.coalesce(func.sum(ChatMessage.total_tokens), 0),
    ).one()

    return {
        "total_queries": total_queries,
        "successful": successful,
        "failed": failed,
        "avg_response_time_ms": int(avg_resp) if avg_resp else 0,
        "prompt_tokens": int(token_data[0]),
        "completion_tokens": int(token_data[1]),
        "total_tokens": int(token_data[2]),
        "estimated_cost": 0
    }


# ─── Audit Logs ───────────────────────────────────────────────────────────────

@router.get("/audit-logs")
def get_audit_logs(
    search: Optional[str] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog).order_by(AuditLog.created_at.desc())

    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    logs = query.limit(limit).all()

    result = []
    for log in logs:
        user_name = "System"
        if log.user_id:
            u = db.query(User).filter(User.id == log.user_id).first()
            user_name = u.name if u else f"User #{log.user_id}"

        # Apply search filter after join
        if search:
            q = search.lower()
            if q not in user_name.lower() and q not in log.action.lower():
                continue

        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "user": user_name,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.created_at.isoformat() if log.created_at else None,
        })
    return result


# ─── System Settings ──────────────────────────────────────────────────────────

@router.get("/system-settings")
def get_system_settings(db: Session = Depends(get_db)):
    settings = db.query(SystemSetting).order_by(SystemSetting.setting_key).all()
    return [
        {
            "id": s.id,
            "key": s.setting_key,
            "value": s.setting_value,
            "type": s.setting_type,
            "description": s.description,
        }
        for s in settings
    ]


class SettingUpdate(BaseModel):
    key: str
    value: str


@router.put("/system-settings")
def update_system_settings(
    updates: List[SettingUpdate],
    request: Request,
    db: Session = Depends(get_db),
):
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")

    for update in updates:
        setting = db.query(SystemSetting).filter(SystemSetting.setting_key == update.key).first()
        if setting:
            old_val = setting.setting_value
            setting.setting_value = update.value
            setting.updated_at = datetime.utcnow()
            log_audit(db, "SYSTEM_SETTING_UPDATED", "SystemSetting", setting.id,
                      {"key": update.key, "old": old_val, "new": update.value}, ip_address=ip)
        else:
            # Create if not exists
            new_s = SystemSetting(setting_key=update.key, setting_value=update.value)
            db.add(new_s)
            db.flush()
            log_audit(db, "SYSTEM_SETTING_CREATED", "SystemSetting", new_s.id,
                      {"key": update.key, "value": update.value}, ip_address=ip)

    db.commit()
    return {"message": f"Updated {len(updates)} setting(s)"}
