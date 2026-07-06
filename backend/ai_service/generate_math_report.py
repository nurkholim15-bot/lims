import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sqlalchemy import text
from db import SessionLocal

def generate_report():
    db = SessionLocal()
    try:
        # 1. Fetch real KEPEN data from DB
        q = text("""
            SELECT r.application_id, r.sub_aspect_code, r.score
            FROM lims.testing_results r
            JOIN lims.testing_applications a ON r.application_id = a.id
            WHERE r.aspect_code = 'KEPEN' AND r.sub_aspect_code IS NOT NULL
        """)
        rows = db.execute(q).fetchall()
        df_raw = pd.DataFrame(rows, columns=["application_id", "sub_aspect_code", "score"])
        
        # Pivot
        df_pivoted = df_raw.pivot_table(
            index="application_id", 
            columns="sub_aspect_code", 
            values="score"
        )
        medians = df_pivoted.median()
        stds = df_pivoted.std()
        df_pivoted = df_pivoted.fillna(medians)
        
        features = list(df_pivoted.columns)
        print(f"Features: {features}")
        print(f"Medians:\n{medians.to_dict()}")
        print(f"Stds:\n{stds.to_dict()}")
        print(f"Number of samples: {len(df_pivoted)}")
        
        # Fit Isolation Forest
        clf = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        X = df_pivoted.values
        clf.fit(X)
        
        # Helper to align input
        def get_vector(vals):
            vec = []
            for f in features:
                if f in vals:
                    vec.append(vals[f])
                else:
                    vec.append(medians[f])
            return np.array([vec])
            
        # Normal sample
        x_norm = get_vector({"KEDAI": 90.0, "KESEN": 85.0, "KELCH": 85.0})
        score_norm = clf.score_samples(x_norm)[0]
        pred_norm = clf.predict(x_norm)[0]
        
        # Anomaly sample
        x_anom = get_vector({"KEDAI": 10.0, "KESEN": 15.0, "KELCH": 12.0})
        score_anom = clf.score_samples(x_anom)[0]
        pred_anom = clf.predict(x_anom)[0]
        
        print(f"\n--- NORMAL VECTOR ---")
        print(f"Vector: {x_norm.tolist()}")
        print(f"Raw Score: {score_norm}")
        print(f"Anomaly Score (min(1, max(0, -raw_score))): {max(0.0, min(1.0, -score_norm))}")
        print(f"Predict (1=normal, -1=outlier): {pred_norm}")
        
        print(f"\n--- ANOMALY VECTOR ---")
        print(f"Vector: {x_anom.tolist()}")
        print(f"Raw Score: {score_anom}")
        print(f"Anomaly Score: {max(0.0, min(1.0, -score_anom))}")
        print(f"Predict (1=normal, -1=outlier): {pred_anom}")
        
        # SHAP calculation
        print(f"\n--- SHAP LEAVE-ONE-OUT ---")
        contributions = {}
        for i, feat in enumerate(features):
            x_temp = x_anom.copy()
            x_temp[0, i] = medians[feat]
            temp_score = clf.score_samples(x_temp)[0]
            contrib = temp_score - score_anom
            contributions[feat] = max(0.0, contrib)
            print(f"Substituted {feat} with median {medians[feat]}: new_raw_score = {temp_score}, diff = {contrib}")
            
        total = sum(contributions.values())
        shap_percentages = {}
        for feat, val in contributions.items():
            shap_percentages[feat] = round((val / total) * 100, 2) if total > 0 else 0.0
            
        print(f"SHAP %: {shap_percentages}")
        
    finally:
        db.close()

if __name__ == "__main__":
    generate_report()
