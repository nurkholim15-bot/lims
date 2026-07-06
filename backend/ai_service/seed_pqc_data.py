import os
import random
import datetime
import numpy as np
from sqlalchemy import text
from db import SessionLocal

def seed_data():
    db = SessionLocal()
    try:
        print("Starting sample data seeding...")
        
        # 1. Fetch target aspects and their sub-aspects
        q = text("""
            SELECT aspect_code, code 
            FROM lims.scoring_sub_aspects 
            WHERE aspect_code IN ('KONPE', 'KEPEN', 'KOCAR')
        """)
        rows = db.execute(q).fetchall()
        
        aspect_to_subs = {}
        for row in rows:
            aspect, sub = row[0], row[1]
            if aspect not in aspect_to_subs:
                aspect_to_subs[aspect] = []
            aspect_to_subs[aspect].append(sub)
            
        print(f"Target aspects and sub-aspects: {aspect_to_subs}")
        
        # Ensure we have some targets
        if not aspect_to_subs:
            print("No target aspects found in scoring_sub_aspects. Querying all...")
            q_all = text("SELECT aspect_code, code FROM lims.scoring_sub_aspects LIMIT 30")
            rows = db.execute(q_all).fetchall()
            for row in rows:
                aspect, sub = row[0], row[1]
                if aspect not in aspect_to_subs:
                    aspect_to_subs[aspect] = []
                aspect_to_subs[aspect].append(sub)
                
        # 2. Generate Applications
        num_apps = 150
        app_ids = []
        
        print(f"Creating {num_apps} mock testing applications...")
        for i in range(1, num_apps + 1):
            timestamp_suffix = datetime.datetime.now().strftime("%H%M%S")
            reg_num = f"SEED-2026-{timestamp_suffix}-{i:05d}"
            
            # Insert application
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
            
        print(f"Applications created successfully. IDs: {app_ids[:10]}... (total: {len(app_ids)})")
        
        # 3. Generate Testing Results
        total_inserted = 0
        
        # Define realistic distributions (mean, std) for sub-aspects to mimic real testing results
        sub_distributions = {
            "KONSI": (82.0, 3.5),
            "KEDAI": (90.0, 5.0),
            "KERJA": (75.0, 4.0),
        }
        
        print("Generating and inserting scores into testing_results...")
        for app_id in app_ids:
            # Select 1 to 3 aspects for this application
            num_aspects_for_app = random.randint(1, len(aspect_to_subs))
            selected_aspects = random.sample(list(aspect_to_subs.keys()), k=num_aspects_for_app)
            
            for aspect in selected_aspects:
                subs = aspect_to_subs[aspect]
                for sub in subs:
                    mean, std = sub_distributions.get(sub, (85.0, 6.0))
                    
                    # Generate score: 96% chance normal, 4% chance extreme anomaly
                    if random.random() < 0.04:
                        # Anomaly (outlier)
                        score = random.choice([random.uniform(5.0, 35.0), random.uniform(130.0, 180.0)])
                    else:
                        score = np.random.normal(mean, std)
                        # Bound score
                        score = max(0.0, min(100.0, score))
                        
                    q_insert_res = text("""
                        INSERT INTO lims.testing_results (application_id, aspect_code, sub_aspect_code, score, created_at)
                        VALUES (:app_id, :aspect, :sub, :score, :created_at)
                    """)
                    created_at = datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 90))
                    db.execute(q_insert_res, {
                        "app_id": app_id,
                        "aspect": aspect,
                        "sub": sub,
                        "score": round(float(score), 2),
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
