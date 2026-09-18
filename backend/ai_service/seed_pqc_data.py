import os
import random
import datetime
import numpy as np
from sqlalchemy import text
from db import SessionLocal

PHYSICAL_SPECS = {
    # KEPEN (Penerima)
    "KEDAI": {"unit": "mW", "mean": 185.0, "std": 12.0, "min": 60.0, "max": 300.0, "score_calc": lambda v: 100.0 if v >= 160.0 else (60.0 if v >= 100.0 else 20.0)},
    "KERUS": {"unit": "mA", "mean": 125.0, "std": 10.0, "min": 50.0, "max": 250.0, "score_calc": lambda v: 100.0 if v <= 150.0 else (60.0 if v <= 200.0 else 20.0)},
    "KESEL": {"unit": "dB", "mean": 5.5, "std": 1.1, "min": 1.0, "max": 18.0, "score_calc": lambda v: 100.0 if v <= 8.0 else (60.0 if v <= 10.0 else 20.0)},
    "KESEN": {"unit": "µV", "mean": 0.22, "std": 0.03, "min": 0.05, "max": 0.8, "score_calc": lambda v: 100.0 if v <= 0.30 else (60.0 if v <= 0.35 else 20.0)},
    "KESUA": {"unit": "dB", "mean": 88.0, "std": 8.0, "min": 25.0, "max": 105.0, "score_calc": lambda v: 100.0 if v >= 25.0 else (60.0 if v >= 17.0 else 20.0)},
    # KOCAR (Pemancar)
    "KEDRF": {"unit": "W", "mean": 25.0, "std": 1.8, "min": 5.0, "max": 50.0, "score_calc": lambda v: 100.0 if v >= 20.0 else (60.0 if v >= 15.0 else 20.0)},
    "KEPAN": {"unit": "A", "mean": 4.2, "std": 0.3, "min": 1.0, "max": 10.0, "score_calc": lambda v: 100.0 if v <= 5.0 else (60.0 if v <= 6.5 else 20.0)},
    "KETEL": {"unit": "Hz", "mean": 12.0, "std": 2.5, "min": 0.0, "max": 50.0, "score_calc": lambda v: 100.0 if v <= 20.0 else (60.0 if v <= 35.0 else 20.0)},
    "KENEL": {"unit": "SWR", "mean": 1.25, "std": 0.08, "min": 1.0, "max": 3.0, "score_calc": lambda v: 100.0 if v <= 1.5 else (60.0 if v <= 2.0 else 20.0)},
    # OPR
    "SUHU1": {"unit": "°C", "mean": 96.0, "std": 7.5, "min": 50.0, "max": 160.0, "score_calc": lambda v: 100.0 if 80.0 <= v <= 120.0 else (75.0 if 120.0 < v <= 140.0 else (50.0 if v < 80.0 else 30.0))},
}

def seed_data():
    db = SessionLocal()
    try:
        print("Cleaning up old SEED data...")
        db.execute(text("""
            DELETE FROM lims.testing_results 
            WHERE application_id IN (
                SELECT id FROM lims.testing_applications WHERE reg_number LIKE 'SEED%'
            )
        """))
        db.execute(text("DELETE FROM lims.testing_applications WHERE reg_number LIKE 'SEED%'"))
        db.commit()
        print("Old SEED data cleaned up successfully.")

        # 1. Fetch target aspects and their sub-aspects
        q = text("""
            SELECT DISTINCT aspect_code, code 
            FROM lims.scoring_sub_aspects 
            WHERE is_active = true
            ORDER BY aspect_code, code
        """)
        rows = db.execute(q).fetchall()
        
        aspect_to_subs = {}
        for row in rows:
            aspect, sub = row[0], row[1]
            if aspect not in aspect_to_subs:
                aspect_to_subs[aspect] = []
            aspect_to_subs[aspect].append(sub)
            
        print(f"Target aspects count: {len(aspect_to_subs)}")
        
        # 2. Generate Applications
        num_apps = 150
        app_ids = []
        
        print(f"Creating {num_apps} mock testing applications...")
        for i in range(1, num_apps + 1):
            timestamp_suffix = datetime.datetime.now().strftime("%H%M%S")
            reg_num = f"SEED-2026-{timestamp_suffix}-{i:05d}"
            
            q_insert_app = text("""
                INSERT INTO lims.testing_applications (reg_number, status, created_at)
                VALUES (:reg_num, 'APPROVED', :created_at)
                RETURNING id
            """)
            days_ago = random.randint(1, 90)
            created_at = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days_ago)
            
            res = db.execute(q_insert_app, {"reg_num": reg_num, "created_at": created_at})
            app_id = res.scalar()
            app_ids.append(app_id)
            
        # 3. Generate Testing Results with realistic physical actual_value & score
        total_inserted = 0
        print("Generating realistic physical actual_value and scores into testing_results...")
        for app_id in app_ids:
            # Select 2 to 4 aspects for each application
            aspect_keys = list(aspect_to_subs.keys())
            num_aspects_for_app = random.randint(2, min(4, len(aspect_keys)))
            # Prioritize KEPEN, KONPE, KOCAR so they have plenty of training data
            selected_aspects = set(random.sample(["KEPEN", "KONPE", "KOCAR"], k=random.randint(1, 3)))
            other_aspects = [a for a in aspect_keys if a not in selected_aspects]
            if other_aspects and len(selected_aspects) < num_aspects_for_app:
                selected_aspects.update(random.sample(other_aspects, k=num_aspects_for_app - len(selected_aspects)))
            
            created_at = datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 90))
            
            for aspect in selected_aspects:
                subs = aspect_to_subs[aspect]
                for sub in subs:
                    is_anomaly = random.random() < 0.04  # 4% chance of anomaly
                    
                    if sub in PHYSICAL_SPECS:
                        spec = PHYSICAL_SPECS[sub]
                        if is_anomaly:
                            # Extreme outlier
                            if random.random() < 0.5:
                                val = spec["min"] * random.uniform(0.3, 0.7)
                            else:
                                val = spec["max"] * random.uniform(1.3, 2.0)
                        else:
                            val = np.random.normal(spec["mean"], spec["std"])
                            val = max(spec["min"] * 0.8, min(spec["max"] * 1.2, val))
                        
                        actual_val = round(float(val), 3 if spec["unit"] == "µV" else 2)
                        score = float(spec["score_calc"](actual_val))
                    else:
                        # Qualitative / discrete checklist parameter
                        if is_anomaly:
                            score = random.choice([20.0, 30.0, 50.0])
                        else:
                            score = random.choice([100.0, 100.0, 100.0, 75.0, 60.0])
                        actual_val = None  # Qualitative parameters have no physical unit
                        
                    q_insert_res = text("""
                        INSERT INTO lims.testing_results (application_id, aspect_code, sub_aspect_code, actual_value, score, created_at)
                        VALUES (:app_id, :aspect, :sub, :actual_value, :score, :created_at)
                    """)
                    db.execute(q_insert_res, {
                        "app_id": app_id,
                        "aspect": aspect,
                        "sub": sub,
                        "actual_value": actual_val,
                        "score": score,
                        "created_at": created_at
                    })
                    total_inserted += 1
                    
        db.commit()
        print(f"Seeding completed successfully! Total testing_results rows inserted: {total_inserted}")
        return total_inserted
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
