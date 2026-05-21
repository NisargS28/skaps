from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import bcrypt
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.user_session import UserSession

router = APIRouter(prefix="/users", tags=["Users"])


def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


# ─── Public: get all users ────────────────────────────────────────────────────

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    """Fetch all users from the database."""
    users = db.query(User).all()
    return users


# ─── Login ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(request: LoginRequest, http_request: Request, db: Session = Depends(get_db)):
    """Authenticate a user and open a tracked session."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.status == 'disabled':
        raise HTTPException(status_code=403, detail="Your account has been disabled. Please contact admin.")

    # Close any existing active session for this user (single-device enforcement)
    existing_active = (
        db.query(UserSession)
        .filter(UserSession.user_id == user.id, UserSession.logout_at == None)  # noqa: E711
        .first()
    )
    if existing_active:
        now = datetime.utcnow()
        existing_active.logout_at = now
        existing_active.logout_reason = "displaced"
        delta = (now - existing_active.login_at).total_seconds()
        existing_active.duration_seconds = int(delta)

    # Generate new session token
    new_token = uuid.uuid4().hex
    user.session_token = new_token
    user.last_login_at = datetime.utcnow()

    # Capture IP and user-agent
    ip = http_request.headers.get("x-forwarded-for", http_request.client.host if http_request.client else "unknown")
    ua = http_request.headers.get("user-agent", "")

    # Create session record
    new_session = UserSession(
        user_id=user.id,
        session_token=new_token,
        login_at=datetime.utcnow(),
        ip_address=ip,
        user_agent=ua,
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "message": "Login successful",
        "access_token": new_token,
        "session_id": new_session.id,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "department": user.department,
            "role": user.role,
        },
    }


# ─── Logout ───────────────────────────────────────────────────────────────────

class LogoutRequest(BaseModel):
    session_id: int


@router.post("/logout")
def logout(request: LogoutRequest, db: Session = Depends(get_db)):
    """Close the active session and clear the user's session token."""
    session = db.query(UserSession).filter(UserSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.logout_at is None:
        now = datetime.utcnow()
        session.logout_at = now
        session.logout_reason = "user"
        delta = (now - session.login_at).total_seconds()
        session.duration_seconds = int(delta)

        # Clear token from user row
        user = db.query(User).filter(User.id == session.user_id).first()
        if user:
            user.session_token = None

    db.commit()
    return {"message": "Logged out successfully"}


# ─── Verify session ───────────────────────────────────────────────────────────

class VerifySessionRequest(BaseModel):
    user_id: int
    token: str


@router.post("/verify_session")
def verify_session(request: VerifySessionRequest, db: Session = Depends(get_db)):
    """Verify if the session token is still valid for the given user."""
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user or not user.session_token or user.session_token != request.token:
        raise HTTPException(status_code=401, detail="Session invalid or expired")

    if user.status == 'disabled':
        raise HTTPException(status_code=403, detail="Your account has been disabled. Please contact admin.")

    return {"message": "Session is valid"}


# ─── Admin: list sessions ─────────────────────────────────────────────────────

@router.get("/admin/sessions")
def get_admin_sessions(
    user_id: Optional[int] = None,
    status: Optional[str] = None,   # 'active' | 'ended'
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return all user session records for the admin panel."""
    query = db.query(UserSession).join(User, UserSession.user_id == User.id)

    if user_id:
        query = query.filter(UserSession.user_id == user_id)

    if status == "active":
        query = query.filter(UserSession.logout_at == None)  # noqa: E711
    elif status == "ended":
        query = query.filter(UserSession.logout_at != None)  # noqa: E711

    if date_from:
        try:
            query = query.filter(UserSession.login_at >= datetime.fromisoformat(date_from))
        except ValueError:
            pass

    if date_to:
        try:
            query = query.filter(UserSession.login_at <= datetime.fromisoformat(date_to))
        except ValueError:
            pass

    sessions = query.order_by(UserSession.login_at.desc()).all()

    result = []
    for s in sessions:
        user = s.user
        # Compute live duration for still-active sessions
        duration = s.duration_seconds
        if duration is None and s.logout_at is None:
            duration = int((datetime.utcnow() - s.login_at).total_seconds())

        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "",
            "user_department": user.department if user else "",
            "user_role": user.role if user else "",
            "login_at": s.login_at.isoformat() if s.login_at else None,
            "logout_at": s.logout_at.isoformat() if s.logout_at else None,
            "duration_seconds": duration,
            "ip_address": s.ip_address,
            "user_agent": s.user_agent,
            "logout_reason": s.logout_reason,
            "is_active": s.logout_at is None,
        })

    return result


# ─── Change Password ──────────────────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    new_password: str

@router.put("/{user_id}/change-password")
def change_password(user_id: int, payload: ChangePasswordRequest, db: Session = Depends(get_db)):
    """Change a user's password. Does not require the current password as per requirements."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed = bcrypt.hashpw(payload.new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user.password_hash = hashed
    user.updated_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Password changed successfully"}