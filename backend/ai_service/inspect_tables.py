from db import SessionLocal
from sqlalchemy import text

def inspect():
    db = SessionLocal()
    try:
        tables = ["testing_applications", "testing_results"]
        for table in tables:
            print(f"\n=== Columns for {table} ===")
            q = text(f"""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_schema='lims' AND table_name='{table}'
            """)
            res = db.execute(q).fetchall()
            for row in res:
                print(f"Column: {row[0]}, Type: {row[1]}, Nullable: {row[2]}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect()
