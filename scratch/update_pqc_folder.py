import sys
sys.path.append("/home/lims/lims1/backend/ai_service")
from db import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    new_val = "/home/lims/lims1/backend/ai_service/models"
    query = text("UPDATE lims.global_parameters SET param_value = :val WHERE param_key = 'AI_METADATA_FOLDER';")
    db.execute(query, {"val": new_val})
    db.commit()
    print("SUCCESS: Updated AI_METADATA_FOLDER to", new_val)
except Exception as e:
    db.rollback()
    print("ERROR:", e)
finally:
    db.close()
