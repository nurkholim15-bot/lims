import sys
sys.path.append("/mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/ai_service")
from db import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    query = text("SELECT param_key, param_value FROM lims.global_parameters;")
    results = db.execute(query).fetchall()
    for row in results:
        print(f"{row[0]}: {row[1]}")
finally:
    db.close()
