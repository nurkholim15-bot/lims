"""
Script untuk inspeksi isi model .joblib:
- Menampilkan fitur, median, std, threshold, jumlah sample
- Membantu diagnosis: apakah std = 0.0 atau memiliki nilai nyata
Usage: python inspect_model_stds.py [aspect_code]
       python inspect_model_stds.py KEPEN
"""
import os
import sys
import joblib
import math

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

def inspect_model(aspect_code):
    model_path = os.path.join(MODELS_DIR, f"pqc_{aspect_code}.joblib")
    if not os.path.exists(model_path):
        print(f"[ERROR] Model tidak ditemukan: {model_path}")
        return

    data = joblib.load(model_path)
    clf    = data.get("model")
    feats  = data.get("features", [])
    meds   = data.get("medians", {})
    stds   = data.get("stds", {})
    trained_at   = data.get("trained_at", "?")
    num_samples  = data.get("num_samples", "?")
    num_features = data.get("num_features", "?")
    contamination = getattr(clf, "contamination", "?") if clf else "?"

    print(f"\n{'='*60}")
    print(f"  MODEL: pqc_{aspect_code}.joblib")
    print(f"{'='*60}")
    print(f"  Trained at   : {trained_at}")
    print(f"  Num samples  : {num_samples}")
    print(f"  Num features : {num_features}")
    print(f"  Contamination: {contamination}")
    print(f"\n  {'Sub-Aspek':<12} {'Median':>10} {'Std (raw)':>12} {'Clipped Std':>12} {'Margin (×1.5)':>14} {'Batas Bawah':>12} {'Batas Atas':>12}")
    print(f"  {'-'*12} {'-'*10} {'-'*12} {'-'*12} {'-'*14} {'-'*12} {'-'*12}")

    for feat in feats:
        med = meds.get(feat, 0.0)
        raw_std = stds.get(feat, 0.0)

        # Handle NaN
        if raw_std is None or (isinstance(raw_std, float) and math.isnan(raw_std)):
            raw_std = 0.0

        clipped_std = max(2.0, float(raw_std))
        margin = clipped_std * 1.5
        lo = max(0.0, med - margin)
        hi = med + margin

        flag = " ⚠ (was 0.0, clipped)" if raw_std < 2.0 else ""
        print(f"  {feat:<12} {med:>10.2f} {raw_std:>12.4f} {clipped_std:>12.4f} {margin:>14.4f} {lo:>12.2f} {hi:>12.2f}{flag}")

    print(f"\n  Keterangan: 'Clipped Std' = max(2.0, raw_std)")
    print(f"              'Margin'      = clipped_std × 1.5")
    print(f"              'Batas'       = Median ± Margin\n")

def list_models():
    files = [f for f in os.listdir(MODELS_DIR) if f.endswith(".joblib")]
    if not files:
        print("[INFO] Tidak ada model .joblib di folder models/")
        return
    for f in sorted(files):
        path = os.path.join(MODELS_DIR, f)
        size_kb = os.path.getsize(path) / 1024
        aspect = f.replace("pqc_", "").replace(".joblib", "")
        print(f"  {aspect:<10}  {size_kb:>8.1f} KB  →  {f}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("\nModel tersedia:")
        list_models()
        print("\nUsage: python inspect_model_stds.py <ASPECT_CODE>")
        print("       python inspect_model_stds.py KEPEN")
        print("       python inspect_model_stds.py ALL\n")
    elif sys.argv[1].upper() == "ALL":
        files = [f for f in os.listdir(MODELS_DIR) if f.endswith(".joblib")]
        for f in sorted(files):
            aspect = f.replace("pqc_", "").replace(".joblib", "")
            inspect_model(aspect)
    else:
        inspect_model(sys.argv[1].upper())
