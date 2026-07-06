"""Verify mean vs median vs model values for KEPEN aspect."""
from db import SessionLocal
from sqlalchemy import text
db = SessionLocal()
q = text("""
SELECT 
    sub_aspect_code,
    COUNT(*) AS n,
    ROUND(AVG(score)::numeric, 2) AS mean,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score)::numeric, 2) AS median,
    ROUND(STDDEV(score)::numeric, 2) AS std,
    GREATEST(0, ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) - GREATEST(2.0, STDDEV(score)) * 1.5)::numeric, 2)) AS batas_bawah,
    LEAST(100, ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) + GREATEST(2.0, STDDEV(score)) * 1.5)::numeric, 2)) AS batas_atas
FROM lims.testing_results
WHERE aspect_code = 'KEPEN' AND sub_aspect_code IS NOT NULL
GROUP BY sub_aspect_code ORDER BY sub_aspect_code
""")
rows = db.execute(q).fetchall()
print(f"\n{'Sub':8} {'N':>4} {'Mean':>8} {'Median':>8} {'Std':>8} {'Bawah':>8} {'Atas':>8}")
print("-" * 58)
for r in rows:
    print(f"{r[0]:8} {r[1]:>4} {float(r[2]):>8.2f} {float(r[3]):>8.2f} {float(r[4]):>8.2f} {float(r[5]):>8.2f} {float(r[6]):>8.2f}")
print("\nCatatan: AI menggunakan MEDIAN, bukan MEAN")
print("         Std = poin absolut, bukan persentase")
print("         Batas = Median +/- (Std * 1.5), capped [0, 100]")
db.close()
