"""Test: apakah individual range check bekerja.
Simulasi kasus user: KESEN=25, KESEL=23, KELCH=100 (di luar range) tapi IForest mungkin lolos.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from anomaly_detector import detect_anomaly

# Kasus dari screenshot user: KEPEN aspect
features = {
    "KEDAI": 90,
    "KELCH": 100,
    "KERUS": 85,
    "KESEL": 23,
    "KESEN": 25,
    "KESUA": 28
}

print("=== Test 1: Input seperti screenshot user ===")
result = detect_anomaly("KEPEN", features)
print(f"is_anomaly    : {result['is_anomaly']}")
print(f"anomaly_score : {result['anomaly_score']} ({result['anomaly_score']*100:.1f}%)")
print(f"out_of_range  : {result.get('out_of_range_count', '?')}")
print(f"shap_values   : {result.get('shap_values', {})}")
print(f"stds          : {result.get('stds', {})}")
print(f"medians       : {result.get('medians', {})}")

# Validasi
for k in features:
    med = result.get("medians", {}).get(k, 0)
    std = result.get("stds", {}).get(k, 0)
    margin = std * 1.5
    lo = max(0, med - margin)
    hi = med + margin
    val = features[k]
    oor = "⚠ OUT" if val < lo or val > hi else "✓ OK"
    print(f"  {k}: val={val:>6}  range=[{lo:.1f} – {hi:.1f}]  {oor}")

print(f"\n{'='*50}")
if result['is_anomaly']:
    print("✅ PASS: Sistem MEMBLOKIR data ini (is_anomaly=True)")
else:
    print("❌ FAIL: Sistem MELOLOSKAN data ini (is_anomaly=False)")

# Test 2: Semua normal
print("\n=== Test 2: Input semua dalam range normal ===")
features_normal = {
    "KEDAI": 90,
    "KELCH": 85,
    "KERUS": 86,
    "KESEL": 87,
    "KESEN": 86,
    "KESUA": 85
}
result2 = detect_anomaly("KEPEN", features_normal)
print(f"is_anomaly    : {result2['is_anomaly']}")
print(f"anomaly_score : {result2['anomaly_score']} ({result2['anomaly_score']*100:.1f}%)")
print(f"out_of_range  : {result2.get('out_of_range_count', '?')}")
if not result2['is_anomaly']:
    print("✅ PASS: Sistem MELOLOSKAN data normal")
else:
    print("❌ FAIL: Sistem MEMBLOKIR data normal")
