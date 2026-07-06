"""Debug: apakah stds tersimpan benar ke dalam file model joblib."""
from db import SessionLocal
from sqlalchemy import text
import pandas as pd
import numpy as np
import joblib
import os

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

db = SessionLocal()

# Query sama persis dengan train.py
query = text("""
    SELECT r.application_id, r.aspect_code, r.sub_aspect_code, r.score
    FROM lims.testing_results r
    JOIN lims.testing_applications a ON r.application_id = a.id
    WHERE r.sub_aspect_code IS NOT NULL AND r.aspect_code = 'KEPEN'
""")
rows = db.execute(query).fetchall()
df_raw = pd.DataFrame(rows, columns=["application_id", "aspect_code", "sub_aspect_code", "score"])
db.close()

df_aspect = df_raw[df_raw["aspect_code"] == "KEPEN"]

print(f"score column dtype: {df_aspect['score'].dtype}")
print(f"score type contoh: {type(df_aspect['score'].iloc[0])}")
print(f"score values contoh: {df_aspect['score'].head(5).tolist()}")

df_pivoted = df_aspect.pivot_table(
    index="application_id",
    columns="sub_aspect_code",
    values="score"
)

print(f"\ndf_pivoted dtype:\n{df_pivoted.dtypes}")

# Hitung std SEBELUM konversi
stds_raw = df_pivoted.std()
print(f"\nstds_raw dtype: {stds_raw.dtype}")
print(f"stds_raw values:\n{stds_raw}")
print(f"\nstds_raw type tiap elemen: {[(k, type(v)) for k, v in stds_raw.items()]}")

# Apply fillna dan clip seperti train.py
stds = df_pivoted.std().fillna(0.0).clip(lower=2.0)
print(f"\nstds SETELAH fillna+clip:\n{stds}")
print(f"stds.to_dict(): {stds.to_dict()}")

# Bandingkan dengan isi model yang tersimpan
model_path = os.path.join(MODELS_DIR, "pqc_KEPEN.joblib")
model_data = joblib.load(model_path)
stored_stds = model_data.get("stds", {})
print(f"\n=== STORED dalam file model ===")
print(f"stored stds: {stored_stds}")
print(f"stored stds types: {[(k, type(v)) for k, v in stored_stds.items()]}")
