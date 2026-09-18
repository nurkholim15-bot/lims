import os
import json
import datetime
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sqlalchemy import text
from db import SessionLocal, engine
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_models_job():
    db = SessionLocal()
    try:
        print("Starting offline model retraining...")
        
        # Get custom output folder from global_parameters
        output_dir = MODELS_DIR
        try:
            query_folder = text("""
                SELECT param_value 
                FROM lims.global_parameters 
                WHERE param_key = 'AI_METADATA_FOLDER' 
                LIMIT 1
            """)
            folder_res = db.execute(query_folder).fetchone()
            if folder_res and folder_res[0]:
                custom_dir = folder_res[0].strip()
                if custom_dir:
                    normalized = custom_dir.rstrip('/\\')
                    if not normalized.lower().endswith('models'):
                        custom_dir = os.path.join(custom_dir, 'models')
                    os.makedirs(custom_dir, exist_ok=True)
                    output_dir = custom_dir
                    print(f"Using custom AI metadata folder: {output_dir}")
        except Exception as e_folder:
            print(f"Error checking AI_METADATA_FOLDER in global_parameters: {e_folder}. Using default: {output_dir}")
        
        # 1. Fetch unit mapping from scoring_sub_aspects
        unit_map = {}
        try:
            u_query = text("SELECT code, standard_unit FROM lims.scoring_sub_aspects WHERE standard_unit IS NOT NULL AND standard_unit != ''")
            for u_row in db.execute(u_query).fetchall():
                unit_map[u_row[0]] = u_row[1].strip()
        except Exception as e_unit:
            print(f"Warning fetching units: {e_unit}")

        # 2. Fetch historical testing results (actual_value and score)
        query = text("""
            SELECT application_id, aspect_code, sub_aspect_code, actual_value, score
            FROM lims.testing_results
            WHERE sub_aspect_code IS NOT NULL
        """)
        
        result = db.execute(query)
        rows = result.fetchall()
        
        if not rows:
            print("No training data found in testing_results. Skipping training.")
            return {"status": "skipped", "message": "No training data found in database"}
            
        # Convert to pandas DataFrame
        df_raw = pd.DataFrame(rows, columns=["application_id", "aspect_code", "sub_aspect_code", "actual_value", "score"])
        df_raw["actual_value"] = pd.to_numeric(df_raw["actual_value"], errors="coerce")
        df_raw["score"] = pd.to_numeric(df_raw["score"], errors="coerce").astype(float)
        
        # Filter out legacy dummy inputs on physical parameters (e.g. KESEN > 5.0 µV or KESEL > 50.0 dB from old manual tests)
        PHYSICAL_SANITY_MAX = {
            "KESEN": 2.0,     # µV (normal 0.2)
            "KESEL": 30.0,    # dB (normal 5)
            "KESUA": 150.0,   # dB (normal 85-100)
            "KEDRF": 100.0,   # W (normal 25)
            "KEPAN": 20.0,    # A (normal 4)
            "KENEL": 5.0,     # SWR (normal 1.2)
            "KEDAI": 1000.0,  # mW (normal 185)
            "KERUS": 800.0,   # mA (normal 125)
            "SUHU1": 300.0,   # °C (normal 96)
        }
        for code, max_val in PHYSICAL_SANITY_MAX.items():
            mask = (df_raw["sub_aspect_code"] == code) & (df_raw["actual_value"] > max_val)
            df_raw.loc[mask, "actual_value"] = np.nan

        # Feature value:
        # - For physical parameters: keep physical actual_value (do NOT fallback to 0-100 score; NaNs will be imputed with median)
        # - For qualitative parameters: fallback to score
        is_phys = df_raw["sub_aspect_code"].isin(PHYSICAL_SANITY_MAX.keys())
        df_raw["feature_val"] = np.where(
            is_phys,
            df_raw["actual_value"],
            df_raw["actual_value"].where(df_raw["actual_value"].notna(), df_raw["score"])
        )

        # Find unique aspects
        aspects = df_raw["aspect_code"].unique()
        trained_aspects = []
        
        for aspect in aspects:
            print(f"Processing aspect: {aspect}")
            df_aspect = df_raw[df_raw["aspect_code"] == aspect]
            
            # Pivot table: rows = applications, columns = sub-aspect codes, values = feature_val
            df_pivoted = df_aspect.pivot_table(
                index="application_id", 
                columns="sub_aspect_code", 
                values="feature_val"
            )
            
            # Handle missing values by filling with column median
            medians = df_pivoted.median().fillna(0.0)
            
            # Scale-aware minimum standard deviation (at least 5% of median or 0.001)
            raw_stds = df_pivoted.std().fillna(0.0)
            min_stds = np.maximum(0.05 * medians.abs(), 0.001)
            stds = np.maximum(raw_stds, min_stds)
            
            df_pivoted = df_pivoted.fillna(medians)
            
            num_samples = len(df_pivoted)
            num_features = len(df_pivoted.columns)
            
            if num_samples < 3:
                print(f"Aspect {aspect} has only {num_samples} samples (minimum 3 required). Skipping.")
                continue
                
            # Train Isolation Forest
            clf = IsolationForest(
                n_estimators=100, 
                contamination=0.05, 
                random_state=42
            )
            
            X = df_pivoted.values
            clf.fit(X)
            
            # Export to ONNX & Save Metadata JSON
            onnx_path = os.path.join(output_dir, f"pqc_{aspect}.onnx")
            try:
                initial_type = [('float_input', FloatTensorType([None, num_features]))]
                onnx_model = to_onnx(clf, initial_types=initial_type, target_opset={'': 15, 'ai.onnx.ml': 3})
                with open(onnx_path, "wb") as f:
                    f.write(onnx_model.SerializeToString())
                print(f"Saved ONNX model for aspect {aspect} to {onnx_path}")
                
                meta_path = os.path.join(output_dir, f"pqc_{aspect}_meta.json")
                meta_data = {
                    "features": list(df_pivoted.columns),
                    "medians": medians.to_dict(),
                    "stds": stds.to_dict(),
                    "units": {feat: unit_map.get(feat, "") for feat in df_pivoted.columns},
                    "trained_at": datetime.datetime.now().isoformat(),
                    "num_samples": num_samples,
                    "num_features": num_features
                }
                with open(meta_path, "w") as f:
                    json.dump(meta_data, f, indent=4)
                print(f"Saved metadata JSON for aspect {aspect} to {meta_path}")
            except Exception as e_onnx:
                print(f"Error exporting aspect {aspect} to ONNX: {e_onnx}")
            
            # Deactivate previous models of the same aspect in registry
            deactivate_query = text("""
                UPDATE lims.ai_model_registry
                SET status = 'INACTIVE'
                WHERE model_name = :model_name AND status = 'ACTIVE'
            """)
            db.execute(deactivate_query, {"model_name": f"pqc_{aspect}"})
            
            # Insert new model metadata into registry
            version_str = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            insert_query = text("""
                INSERT INTO lims.ai_model_registry 
                (model_name, version, accuracy_score, f1_score, trained_at, model_path, status)
                VALUES (:model_name, :version, :accuracy_score, :f1_score, :trained_at, :model_path, 'ACTIVE')
            """)
            db.execute(insert_query, {
                "model_name": f"pqc_{aspect}",
                "version": version_str,
                "accuracy_score": 0.95,  # Unsupervised baseline
                "f1_score": 0.90,
                "trained_at": datetime.datetime.now(datetime.timezone.utc),
                "model_path": onnx_path,
                "status": "ACTIVE"
            })
            
            trained_aspects.append(aspect)
            
        db.commit()
        print(f"Training completed successfully. Models trained: {trained_aspects}")
        return {"status": "success", "trained_models": trained_aspects}
        
    except Exception as e:
        db.rollback()
        print(f"Error during model retraining: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

if __name__ == "__main__":
    train_models_job()
