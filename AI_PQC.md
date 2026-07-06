# Panduan Pra-Implementasi, Operasional & Keamanan AI Predictive Quality Control (PQC)
### **Laboratory Information Management System (LIMS) AI Integration**

Dokumen ini berisi panduan persiapan teknis, instruksi operasional layanan AI PQC (FastAPI Python), manajemen database, serta mekanisme otorisasi keamanan override supervisor pada sistem LIMS.

---

## BAGIAN I: Persiapan Sebelum Implementasi (Pre-Implementation)

Sebelum kode modul AI Predictive Quality Control dipasang ke lingkungan produksi LIMS, pastikan kesiapan berikut:

### 1. Kesiapan Data Historis Uji (Data Readiness)
Model kecerdasan buatan membutuhkan data historis sebagai bahan belajar (*training data*):
*   **Jumlah Rekaman Minimum:** Siapkan minimal **1.000 - 5.000 data hasil pengujian** masa lalu yang tersimpan di tabel database LIMS (`testing_applications` dan `testing_results`).
    > [!NOTE]
    > **Dampak Sistem Baru (Belum Ada Data Transaksi):**
    > Jika data belum mencukupi untuk training, nonaktifkan sementara validasi AI (`AI_PQC_ENABLED=false` di `.env`). Jalankan transaksi normal selama beberapa bulan hingga data terkumpul alami, atau impor data pengujian pabrik (*Cold Start*) untuk pelatihan awal.
*   **Kualitas Parameter:** Pastikan kolom parameter numerik penting (seperti suhu uji, tekanan, getaran, voltase, dll.) terisi lengkap (tidak banyak nilai kosong atau *NULL*).
*   **Kebutuhan Data Spesifikasi Alat:** Setiap tipe alat baru wajib terdaftar lengkap beserta batas spesifikasi standarnya di database LIMS sebagai basis referensi deteksi anomali.

### 2. Kesiapan Lingkungan Server (Infrastructure Readiness)
Layanan AI PQC berjalan secara mandiri (*decoupled*) menggunakan Python FastAPI.
*   **Python Runtime:** Instal **Python 3.10 atau versi di atasnya** di sistem (WSL Linux atau VM Ubuntu).
    ```bash
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv python3.10-venv python3-dev
    ```
*   **Virtual Environment:** Siapkan ruang terisolasi Python di home directory Anda (untuk menghindari error *Permission Denied* pada folder `/opt`):
    ```bash
    python3 -m venv ~/lims-ai-env
    source ~/lims-ai-env/bin/activate
    ```
*   **Instalasi Pustaka ML:** Pasang pustaka-pustaka yang diperlukan:
    ```bash
    pip install fastapi uvicorn scikit-learn xgboost pandas numpy sqlalchemy psycopg2-binary
    ```
*   **Konfigurasi Port:** Pastikan port internal **`8086`** tersedia dan tidak digunakan oleh aplikasi lain.

---

## BAGIAN II: Panduan Operasional Layanan AI PQC

Layanan AI PQC berjalan sebagai layanan latar belakang (*background service*). Pada sistem operasi Linux (WSL/Ubuntu), disarankan mendaftarkannya sebagai **Systemd Service** bernama `lims-ai-pqc.service`.

### 1. File Konfigurasi Systemd (Rekomendasi Produksi)
Simpan konfigurasi berikut di `/etc/systemd/system/lims-ai-pqc.service`:
```ini
[Unit]
Description=LIMS AI Predictive Quality Control Service
After=network.target

[Service]
User=lims
WorkingDirectory=/mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/ai_service
ExecStart=/home/lims/lims-ai-env/bin/uvicorn main:app --host 127.0.0.1 --port 8086 --workers 1
Restart=always

[Install]
WantedBy=multi-user.target
```

### 2. Perintah Operasional Utama (Sistem dengan Systemd)
```bash
# Memulai Proses (Start)
sudo systemctl start lims-ai-pqc.service

# Menghentikan Proses (Stop)
sudo systemctl stop lims-ai-pqc.service

# Memulai Ulang Proses (Restart)
sudo systemctl restart lims-ai-pqc.service

# Memeriksa Status Layanan (Status)
sudo systemctl status lims-ai-pqc.service

# Mengaktifkan Auto-Start saat Boot (Enable)
sudo systemctl enable lims-ai-pqc.service

# Mematikan Auto-Start (Disable)
sudo systemctl disable lims-ai-pqc.service
```

### 3. Manajemen Proses Python Langsung (WSL / Tanpa Systemd)
Jika Systemd tidak tersedia, gunakan perintah shell Linux berikut:
```bash
# Memulai Proses di Latar Belakang (Start Background)
source ~/lims-ai-env/bin/activate
cd /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/ai_service
nohup uvicorn main:app --host 127.0.0.1 --port 8086 --workers 1 > ai_service.log 2>&1 &

# Memeriksa Status Port 8086
lsof -i :8086
# Atau cari proses uvicorn
ps -ef | grep uvicorn

# Menghentikan Proses
kill $(lsof -t -i:8086)
```

### 4. Fitur Soft-Bypass di LIMS Go Backend (Penanganan Darurat)
Administrator dapat menonaktifkan pengecekan AI tanpa mematikan server dengan mengubah nilai pada file `.env` Go LIMS:
```env
# Aktifkan (true) atau matikan (false) validasi AI PQC secara global
AI_PQC_ENABLED=false
```
*Dampak:* Saat bernilai `false`, backend Go LIMS langsung meloloskan penyimpanan data uji tanpa mengirim request HTTP REST ke AI Service di port `8086`.

### 5. Pengelolaan Manual Pelatihan AI (Manual Retraining)
Pelatihan ulang model AI dilakukan untuk mempresisikan hasil analisis seiring pertambahnya transaksi baru:
```bash
# Mengirim trigger retraining manual
curl -X POST http://127.0.0.1:8086/api/pqc/train
```
Proses ini berjalan asinkron di latar belakang (*background thread*). Untuk membatalkan proses pelatihan berjalan:
```bash
sudo systemctl restart lims-ai-pqc.service
```

---

## BAGIAN III: Otorisasi Keamanan Override & Solusi Konflik Sesi Login

### 1. Masalah Konflik Kredensial Login Operator vs Override Supervisor
Dalam operasional harian:
*   **Operator Uji** memiliki role `OPERATOR_TEST` dan bertugas menginput nilai pengujian.
*   **Supervisor** memiliki role `SUPERVISOR_SCORE` (atau `ADMIN`) dan memegang wewenang analisis kelayakan.
*   Ketika model mendeteksi anomali pada entri data operator, penyimpanan diblokir.
*   Jika sistem memaksa password override dicocokkan dengan session login (Operator), maka supervisor tidak bisa melakukan override secara mandiri tanpa operator melakukan log-out terlebih dahulu (menyulitkan proses *on-site override*).

### 2. Solusi: Otorisasi "Supervisor Authentication" Satu Kali (*One-Off Verification*)
Sistem mengimplementasikan alur verifikasi supervisor asinkron di tingkat API backend:
1.  **Form Input Override:** Modal anomali UI tetap menampilkan form **Username Supervisor** dan **Password Supervisor**.
2.  **Verifikasi Backend Mandiri:** Saat data dikirim, backend Go LIMS membaca `spv_username` dan `spv_password` dari payload FormData secara terpisah dari kredensial operator yang sedang aktif.
3.  **Proses Validasi di Controller (`SaveAspectResults`):**
    *   Mencari record user berdasarkan `spv_username` yang diinput.
    *   Memverifikasi kecocokan hash bcrypt password (`utils.CheckPasswordHash`).
    *   Memastikan `Role.Name` milik akun tersebut adalah `SUPERVISOR_SCORE` atau `ADMIN`.
4.  **Pencatatan Audit Log:** Jika valid, data disimpan dengan status `OVERRIDDEN` dan kolom `override_reason` dicatat dengan format audit: `[Override by: supervisor_username] alasan_override`. Jika gagal, status tetap `BLOCKED`.
5.  **Hasil:** Sesi login operator tetap aktif dan aman tanpa terganggu, sementara otentikasi supervisor terverifikasi penuh secara langsung di tempat kejadian.

---

## BAGIAN IV: Manajemen Database & Optimasi Indeks

Struktur tabel database AI pada PostgreSQL dikelola secara terpisah untuk menjaga performa optimal.

### 1. DDL SQL Audit Log Anomali AI LIMS (Tabel Terpartisi)
```sql
CREATE TABLE IF NOT EXISTS lims.ai_anomaly_logs (
    id BIGSERIAL,
    application_id BIGINT,
    operator_username VARCHAR(30),
    parameters_data JSONB,
    anomaly_score NUMERIC(5, 4),
    shap_values JSONB,
    status VARCHAR(20) DEFAULT 'BLOCKED', -- 'BLOCKED', 'OVERRIDDEN'
    override_reason VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partisi Bulanan Tahun 2026 untuk ai_anomaly_logs
CREATE TABLE IF NOT EXISTS lims.ai_anomaly_logs_202601 PARTITION OF lims.ai_anomaly_logs FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.ai_anomaly_logs_202602 PARTITION OF lims.ai_anomaly_logs FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.ai_anomaly_logs_202603 PARTITION OF lims.ai_anomaly_logs FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.ai_anomaly_logs_202604 PARTITION OF lims.ai_anomaly_logs FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.ai_anomaly_logs_202605 PARTITION OF lims.ai_anomaly_logs FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.ai_anomaly_logs_202606 PARTITION OF lims.ai_anomaly_logs FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
```

### 2. DDL Registrasi Model AI LIMS & Pembuatan Indeks Performa
Untuk mempercepat query lookup model aktif seiring bertumbuhnya riwayat model, database menambahkan B-Tree index pada kolom pencarian utama:
```sql
CREATE TABLE IF NOT EXISTS lims.ai_model_registry (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    accuracy_score NUMERIC(5, 4),
    f1_score NUMERIC(5, 4),
    trained_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    model_path VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Penerapan Indeks untuk Optimasi Lookup Performa Tinggi
CREATE INDEX idx_ai_model_registry_model_name ON lims.ai_model_registry (model_name);
CREATE INDEX idx_ai_model_registry_status ON lims.ai_model_registry (status);
```

---

## BAGIAN V: Sanitasi Statistik & Tampilan Batas Range Deviasi

### 1. Proteksi Nilai `NaN` (Not a Number) dan `None`
Pada model AI yang baru dilatih atau memiliki varians data historis yang sangat rendah (data konstan), nilai standar deviasi (`std`) atau nilai tengah (`median`) berpotensi menghasilkan `NaN` atau `None`. Hal ini dapat menyebabkan:
- Kegagalan serialisasi JSON pada Microservice Python FastAPI.
- Error parsing JSON saat Go Backend melakukan decoding.
- Tampilan anomali string `"NaN"` pada user interface (UI).

Sistem menangani ini pada dua tingkatan:
*   **Inference-Time Sanitization (Python):** Pada file `anomaly_detector.py`, sebelum data dikembalikan ke Go backend, seluruh dictionary `medians` dan `stds` disaring untuk mengubah `NaN` atau `None` menjadi default float `0.0`.
*   **Frontend Safeguard (React):** Pada file `AppDetail.jsx`, pembacaan standard deviasi diproteksi dengan `isNaN()` fallback ke `0.0`.

### 2. Tampilan Informasi Batas Range Skor Uji
Untuk membantu operator memahami kesalahan input yang memicu anomali, modal detail deviasi menampilkan range nilai normal secara transparan:
*   **Formula Batas Range:** Batas normal dihitung dengan rentang `Median ± (Standard Deviation * 1.5)`.
*   **Visualisasi UI:** Tiap kontributor parameter anomali (SHAP) menampilkan informasi batas range:
    > **KESEN** (Normal: 86.7 ± 1.5 | Batas: 85.2 - 88.2)
*   **Manfaat:** Operator dapat melihat secara langsung apakah nilai parameter yang diinput terlalu rendah atau terlalu tinggi dibandingkan dengan Batas yang diperbolehkan oleh pola historis normal.
