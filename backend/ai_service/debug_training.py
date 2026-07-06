"""Debug: kenapa std = 0.0 meski database punya variance besar."""
from db import SessionLocal
from sqlalchemy import text
import pandas as pd

db = SessionLocal()

print("=== DEBUG: Training data untuk KEPEN ===\n")

# Query sama persis dengan train.py
query = text("""
    SELECT r.application_id, r.aspect_code, r.sub_aspect_code, r.score
    FROM lims.testing_results r
    JOIN lims.testing_applications a ON r.application_id = a.id
    WHERE r.sub_aspect_code IS NOT NULL AND r.aspect_code = 'KEPEN'
""")
rows = db.execute(query).fetchall()
df = pd.DataFrame(rows, columns=["application_id", "aspect_code", "sub_aspect_code", "score"])

print(f"Total rows dari JOIN: {len(df)}")
print(f"Unique applications : {df['application_id'].nunique()}")
print(f"Unique sub_aspects  : {df['sub_aspect_code'].nunique()}")

print("\n--- Score distribution (raw rows, tanpa pivot) ---")
print(df.groupby("sub_aspect_code")["score"].agg(["count", "mean", "std", "min", "max"]).round(4))

print("\n--- Pivot table (index=application_id, columns=sub_aspect_code) ---")
df_pivoted = df.pivot_table(
    index="application_id",
    columns="sub_aspect_code",
    values="score"
)
print(f"Pivot shape: {df_pivoted.shape}")
print(f"\nNon-null count per kolom:\n{df_pivoted.count()}")
print(f"\nStd SEBELUM fillna (dari pivot):\n{df_pivoted.std().round(4)}")
print(f"\nMedian dari pivot:\n{df_pivoted.median().round(4)}")

# Check apakah ada duplikat application_id + sub_aspect_code
dupes = df.groupby(["application_id", "sub_aspect_code"]).size()
dupes_count = (dupes > 1).sum()
print(f"\n--- Duplikat (same app_id + sub_aspect) ---")
print(f"Jumlah kombinasi duplikat: {dupes_count}")
if dupes_count > 0:
    print("Contoh duplikat:")
    print(df.groupby(["application_id","sub_aspect_code"])
            .filter(lambda x: len(x) > 1)
            .sort_values(["application_id","sub_aspect_code"])
            .head(10))

db.close()
