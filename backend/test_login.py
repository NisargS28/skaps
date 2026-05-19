from app.database import SessionLocal
from app.models.user import User
from app.routes.users import verify_password

with SessionLocal() as db:
    user = db.query(User).filter(User.email == 'employee@skaps.com').first()
    print("User:", user)
    if user:
        print("Password Hash:", user.password_hash)
        print("Verification:", verify_password('user123', user.password_hash))
