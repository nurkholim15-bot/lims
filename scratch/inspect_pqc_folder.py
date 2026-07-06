import sys
sys.path.append("/home/lims/lims1/backend/ai_service")
from db import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    query = text("SELECT param_value FROM lims.global_parameters WHERE param_key = 'AI_METADATA_FOLDER';")
    result = db.execute(query).fetchone()
    print("CURRENT_VAL:", result[0] if result else "None")
finally:
    db.close()
