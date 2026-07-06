"""Check actual score variance in database for a given aspect."""
import sys
from db import SessionLocal
from sqlalchemy import text

aspect = sys.argv[1] if len(sys.argv) > 1 else "KEPEN"

db = SessionLocal()
q = text("""
SELECT sub_aspect_code,
       COUNT(*) as n,
       ROUND(AVG(score)::numeric, 2) as mean,
       ROUND(STDDEV(score)::numeric, 4) as stddev,
       MIN(score) as min_val,
       MAX(score) as max_val,
       COUNT(DISTINCT score) as distinct_values
FROM lims.testing_results
WHERE aspect_code = :aspect AND sub_aspect_code IS NOT NULL
GROUP BY sub_aspect_code
ORDER BY sub_aspect_code
""")
rows = db.execute(q, {"aspect": aspect}).fetchall()
print(f"\n=== Distribusi Skor di DB untuk Aspek: {aspect} ===")
print(f"{'Sub':12} {'N':>5} {'Mean':>8} {'StdDev':>8} {'Min':>7} {'Max':>7} {'Distinct':>9}")
print("-" * 65)
for r in rows:
    flag = " ⚠ ZERO VARIANCE!" if float(r[3] or 0) < 0.01 else ""
    print(f"{r[0]:12} {r[1]:>5} {float(r[2]):>8.2f} {float(r[3] or 0):>8.4f} {float(r[4]):>7.2f} {float(r[5]):>7.2f} {r[6]:>9}{flag}")
db.close()
