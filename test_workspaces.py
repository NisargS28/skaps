import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.database import SessionLocal
from app.routes.admin import get_workspaces

try:
    db = SessionLocal()
    res = get_workspaces(db)
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
