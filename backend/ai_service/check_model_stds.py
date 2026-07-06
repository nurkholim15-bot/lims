"""Check if PESWT model has stds stored after retraining."""
import joblib, os
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
for name in sorted(os.listdir(MODELS_DIR)):
    if not name.endswith(".joblib"):
        continue
    m = joblib.load(os.path.join(MODELS_DIR, name))
    stds = m.get("stds", {})
    trained = m.get("trained_at", "?")
    n = m.get("num_samples", "?")
    has_stds = "OK" if stds else "MISSING"
    print(f"{name:<25} trained={trained[:10]}  samples={n}  stds={has_stds}  ({len(stds)} feats)")
    if stds:
        for k,v in list(stds.items())[:3]:
            print(f"   {k}: {v:.4f}")
