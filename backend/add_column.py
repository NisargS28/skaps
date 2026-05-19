from app.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE users ADD COLUMN password VARCHAR(255)'))
        conn.commit()
    print("Column added successfully!")
except Exception as e:
    print("Error:", e)
