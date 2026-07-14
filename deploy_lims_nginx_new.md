# Panduan Deployment Produksi LIMS (Multi-Direktori Backend & Frontend)

Dokumen ini menjelaskan konfigurasi deployment **LIMS (Laboratory Information Management System)** di lingkungan produksi dengan arsitektur multi-direktori untuk pembagian beban kerja (*Load Balancing*) dan ketersediaan tinggi (*High Availability*).

Dalam panduan ini, semua berkas ditempatkan langsung di bawah direktori *user* (`/home/lims`):
*   **Frontend 1 (Port 3000)**: `/home/lims/lims1/frontend`
*   **Frontend 2 (Port 3001)**: `/home/lims/lims2/frontend`
*   **Backend 1 (Port 8081)**: `/home/lims/lims1/backend`
*   **Backend 2 (Port 8091)**: `/home/lims/lims2/backend`

---

## 1. Arsitektur Produksi (Multi-Direktori vs Multi-VM)

### A. Skenario 1: Multi-Direktori di 1 VM (Skenario Saat Ini)
Jika semua server berjalan di **1 VM yang sama**, direktori `/uploads` dipisahkan menjadi folder bersama (*Shared Storage*) lokal di `/home/lims/shared_uploads` dan dihubungkan via **Symbolic Link** ke masing-masing folder backend. 

### B. Skenario 2: Multi-VM (2 VM Terpisah dengan Port Sama, misal 8081)
Jika Anda menggunakan **2 VM terpisah**, disk lokal kedua VM tersebut secara fisik terpisah. Anda **tidak bisa** hanya menggunakan perintah `mkdir` dan `ln -s` lokal karena file di VM 1 tidak akan terbaca di VM 2.

**Solusi untuk Skenario Multi-VM:**
1.  **NFS (Network File System) [Rekomendasi Disk Share]**:
    Membuat folder `shared_uploads` di satu storage server (atau di VM 1), lalu me-mount folder tersebut menggunakan protokol NFS ke VM 2 pada path `/home/lims/shared_uploads`. Setelah di-mount, symbolic link `ln -s` lokal akan bekerja seolah-olah folder tersebut berada di satu mesin.
2.  **Object Storage (S3 / MinIO) [Rekomendasi Cloud/Modern]**:
    Mengubah konfigurasi kode Go backend agar langsung mengunggah file ke Object Storage (seperti MinIO server atau AWS S3) via API, bukan menyimpan ke disk lokal. Dengan cara ini, VM 1 and VM 2 tidak perlu berbagi filesystem lokal sama sekali.
3.  **GoAccess `shared_reports` di Multi-VM**:
    Setiap VM akan memiliki file log NGINX lokal masing-masing. Anda **tidak perlu** membagikan folder `shared_reports` antar VM. Biarkan setiap VM melayani `report.html` lokalnya sendiri untuk melihat trafik masing-masing VM.

```mermaid
graph TD
    Client[Web Browser / HP Client] -->|HTTPS Port 8082 / 8443 / 443| Nginx[NGINX Gateway & Load Balancer]
    
    Nginx -->|Reverse Proxy /| FE_Cluster[Frontend Cluster]
    FE_Cluster -->|Port 3000| FE1[PM2 Serve: lims-frontend-3000]
    FE_Cluster -->|Port 3001| FE2[PM2 Serve: lims-frontend-3001]
    
    Nginx -->|Reverse Proxy /api| BE_Cluster[Backend Cluster]
    BE_Cluster -->|Port 8081| BE1[Systemd: lims-backend-8081]
    BE_Cluster -->|Port 8091| BE2[Systemd: lims-backend-8091]
    
    Nginx -->|Sajikan Statis Langsung| SharedDir[shared_uploads Folder]
    BE1 & BE2 -.-->|Symlink ke /uploads| SharedDir
    
    Nginx -->|Static File /report.html| SharedReports[shared_reports Folder]
    Nginx -->|WSS Proxy /ws| GoAccess[GoAccess WebSocket Port 7890]
    
    BE1 & BE2 -->|Query| DB[(PostgreSQL Database)]
    BE1 & BE2 -->|Upload Lampiran (SPD, Reimbursement, dll)| MinIO[(MinIO Object Storage)]
```

---

## 2. Prasyarat Sistem & Manajemen Pengguna Linux

Sebelum memulai deployment, Anda harus membuat pengguna (*user*) dan grup (*group*) Linux yang sesuai serta mengatur hak akses direktori agar NGINX (user `www-data`) dan layanan sistem backend/frontend dapat saling mengakses berkas.

### A. Membuat User dan Group Linux
Untuk keamanan produksi, semua proses backend, frontend (PM2), dan crontab dijalankan di bawah pengguna (`user`) dan grup (`group`) **`lims`**.

Jalankan perintah berikut untuk membuat pengguna dan grup tersebut serta menetapkan password-nya:
```bash
# Membuat grup lims
sudo groupadd lims

# Membuat user lims dengan grup utama lims
sudo useradd -m -g lims -s /bin/bash lims

# Menetapkan password untuk user lims (Masukkan password baru saat diminta)
sudo passwd lims
```

### B. Konfigurasi Izin Direktori (Permissions)
Berikan izin baca dan masuk (*execute*) ke dalam folder home `lims` agar NGINX (`www-data`) dapat menyajikan berkas di dalam subfolder bersama:
```bash
# Berikan hak akses masuk ke folder home lims
sudo chmod 755 /home/lims

# Buat folder bersama untuk berkas unggahan, laporan analitik, & unduhan APK
mkdir -p /home/lims/shared_uploads
mkdir -p /home/lims/shared_reports
mkdir -p /home/lims/shared_downloads
sudo chmod -R 755 /home/lims/shared_uploads
sudo chmod -R 755 /home/lims/shared_reports
sudo chmod -R 755 /home/lims/shared_downloads

# Berikan kepemilikan folder bersama ke user 'lims' dan grup 'www-data' (agar Nginx bisa membaca/menulis)
sudo chown -R lims:www-data /home/lims/shared_uploads
sudo chown -R lims:www-data /home/lims/shared_reports
sudo chown -R lims:www-data /home/lims/shared_downloads
```

---

## 3. Port Mapping & Manajemen Konflik Port

Untuk mencegah kegagalan startup layanan akibat port yang tabrakan (*port conflict*), pastikan port-port berikut tersedia sebelum dijalankan.

### A. Daftar Port Ekosistem LIMS

| Komponen | Nama Layanan | Protokol | Port Default | Status Akses |
| :--- | :--- | :---: | :---: | :--- |
| **Nginx HTTP** | HTTP Redirect | TCP | `8088` (Redirect ke HTTPS) | Publik / Eksternal |
| **Nginx HTTPS** | Gateway Utama | TCP | `8082` (atau `443` di prod asli) | Publik / Eksternal |
| **Nginx Telegram** | Webhook Gateway | TCP | `8443` | Publik / Eksternal |
| **Frontend 1** | PM2 Node.js Instance 1 | TCP | `3000` | Internal (Lokal) |
| **Frontend 2** | PM2 Node.js Instance 2 | TCP | `3001` | Internal (Lokal) |
| **Backend 1** | Go Backend Instance 1 | TCP | `8081` | Internal (Lokal) |
| **Backend 2** | Go Backend Instance 2 | TCP | `8091` | Internal (Lokal) |
| **GoAccess WS** | Real-time WebSocket | TCP | `7890` | Internal / Nginx Proxy |
| **Database** | PostgreSQL | TCP | `5433` (atau `5432` standar) | Internal (Lokal) |
| **Object Storage** | MinIO API | TCP | `9000` | Internal / Nginx Proxy |
| **MinIO UI** | MinIO Console UI | TCP | `9001` | Eksternal (Opsional) |
| **Workflow Engine** | Camunda BPM Engine | TCP | `8085` | Internal / Nginx Proxy |

### B. Perintah Memeriksa Penggunaan Port (Single & Multiple)
Gunakan perintah berikut untuk memverifikasi apakah ada port yang sedang digunakan:
```bash
# 1. Memeriksa Port Tunggal (misal port 8081)
sudo ss -tulpn | grep :8081
# atau menggunakan lsof
sudo lsof -i :8081

# 2. Memeriksa Banyak Port Sekaligus (Multiple Ports)
# Memeriksa seluruh ekosistem port LIMS
sudo ss -tulpn | grep -E '8088|8082|8443|3000|3001|8081|8091|7890|5433|9000|9001|8085'
```

### C. Menghentikan/Membunuh Proses pada Port yang Bermasalah (Stop/Kill Port)
Jika suatu port terkunci oleh proses lama yang menggantung (*zombie process*), Anda dapat membunuhnya dengan cara:
```bash
# 1. Mendapatkan PID (Process ID) dari port yang terkunci
sudo lsof -t -i :8081

# 2. Membunuh proses berdasarkan nomor port (Menggunakan fuser)
sudo fuser -k 8081/tcp

# 3. Membunuh proses secara paksa (Force Kill) berdasarkan lsof PID
sudo kill -9 $(sudo lsof -t -i :8081)
```

### D. Menghentikan Layanan Secara Permanen (Untuk Kebutuhan Development/Pengembangan)
Jika Anda ingin mematikan semua layanan background secara permanen agar port-port tersebut kosong (misalnya selama development agar bisa menjalankan `go run main.go` di folder `LIM_System_Linux_OK`), jalankan perintah berikut:

#### 1. Stop & Disable Go Backend (Systemd)
```bash
# Menghentikan service secara instan
sudo systemctl stop lims-backend-8081.service lims-backend-8091.service

# Mencegah service berjalan otomatis saat boot
sudo systemctl disable lims-backend-8081.service lims-backend-8091.service
```

#### 2. Stop & Hapus PM2 Frontend (PM2)
```bash
# Menghentikan semua aplikasi frontend di PM2
sudo -u lims pm2 stop all

# Menghapus daftar aplikasi dari memori PM2
sudo -u lims pm2 delete all

# Menyimpan konfigurasi kosong agar PM2 tidak memuat ulang aplikasi saat reboot
sudo -u lims pm2 save

# Mematikan daemon PM2 secara total
sudo -u lims pm2 kill
```

#### 3. Stop & Disable NGINX (Systemd)
```bash
# Menghentikan NGINX dan mencegahnya berjalan otomatis saat boot
sudo systemctl stop nginx
sudo systemctl disable nginx
```

---

## 4. Deployment & Konfigurasi Frontend (PM2)

### A. Alur Kompilasi & Pemindahan File
Proses instalasi dependensi (`npm install`) dan kompilasi/build (`npm run build`) dilakukan di dalam folder kode sumber lokal (source code) Anda, yaitu:
`/mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/frontend/`

#### 1. Struktur Folder Frontend (Source Code):
*   `src/` (Komponen, state, dan logika React)
*   `public/` (Aset publik mentah)
*   `node_modules/` (Library dependensi)
*   `package.json` & `package-lock.json`
*   `vite.config.js`
*   `dist/` (**Folder hasil kompilasi statis**)

#### 2. Menjalankan Kompilasi:
```bash
# Pindah ke folder kode sumber
cd /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/frontend/

# Jalankan instalasi & build
npm install
npm run build
```

#### 3. Berkas yang Dicopy ke `/home/lims/`:
Karena kita menggunakan `serve` untuk menyajikan web statis, **HANYA isi folder `dist/`** yang perlu dicopy ke target deployment. Folder `src/`, `node_modules/`, dan file konfigurasi JavaScript lainnya **tidak perlu dicopy**.

```bash
# Buat folder tujuan di server
mkdir -p /home/lims/lims1/frontend/dist
mkdir -p /home/lims/lims2/frontend/dist

# Salin HANYA isi folder 'dist' ke folder tujuan
cp -r /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/frontend/dist/* /home/lims/lims1/frontend/dist/
cp -r /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/frontend/dist/* /home/lims/lims2/frontend/dist/
```

### B. Jalankan Kluster dengan PM2
Gunakan perintah `pm2` di bawah user **`lims`** untuk memicu HTTP server statis dari folder `dist/` masing-masing proyek:
```bash
# Menjalankan Server Frontend 1 (Port 3000)
pm2 start "serve -s /home/lims/lims1/frontend/dist -l 3000" --name "lims-frontend-3000"

# Menjalankan Server Frontend 2 (Port 3001)
pm2 start "serve -s /home/lims/lims2/frontend/dist -l 3001" --name "lims-frontend-3001"
```

### C. Daftar Perintah PM2 (Cheat Sheet Operasional)
Gunakan perintah-perintah berikut untuk mengelola layanan frontend:

*   **Melihat Status Layanan (Status)**:
    ```bash
    pm2 list
    # atau
    pm2 status
    ```
*   **Memantau Metrik secara Live (Monitoring)**:
    ```bash
    pm2 monit
    ```
*   **Melihat Log Aplikasi (Logs)**:
    ```bash
    # Log semua aplikasi
    pm2 logs
    # Log khusus layanan tertentu
    pm2 logs lims-frontend-3000
    ```
*   **Menghentikan Layanan (Stop)**:
    ```bash
    # Menghentikan satu layanan
    pm2 stop lims-frontend-3000
    # Menghentikan semua layanan
    pm2 stop all
    ```
*   **Menyalakan/Merestart Layanan (Restart)**:
    ```bash
    # Restart satu layanan
    pm2 restart lims-frontend-3000
    # Restart semua layanan
    pm2 restart all
    ```

---

## 5. Deployment & Konfigurasi Backend (Multi-Direktori)

### A. Alur Kompilasi & Pemindahan File
Proses kompilasi Go backend dilakukan di folder kode sumber:
`/mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/`

#### 1. Struktur Folder Backend (Source Code):
*   `controllers/`, `database/`, `middleware/`, `models/`, `routes/`, `services/`, `utils/` (Seluruh kode logika Go)
*   `lib/` (**Library pendukung C++ untuk AI ONNX Runtime - `libonnxruntime.so`**)
*   `ai_service/` (**Model AI `.onnx` dan metadata statistik**)
*   `paddle_ocr.py` (Script Python untuk AI-OCR)
*   `go.mod` & `go.sum`
*   `main.go` (Entrypoint aplikasi)

#### 2. Menjalankan Kompilasi (Build):
Karena Go adalah bahasa terkompilasi (*compiled language*), seluruh kode logika Go di folder-folder di atas akan disatukan ke dalam satu file biner bernama `main`.
```bash
# Masuk ke direktori kode sumber backend
cd /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/

# Lakukan build biner Linux
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o main .
```

#### 3. Berkas yang Dicopy ke `/home/lims/`:
Anda **TIDAK perlu menyalin folder kode sumber `.go`** (seperti `controllers`, `models`, dll). Cukup salin berkas-berkas berikut:
1.  Biner hasil build (`main`)
2.  File `.env` produksi (Pastikan `MINIO_*` variables sudah diatur untuk modul SPD/Reimbursement)
3.  Folder `lib/` (untuk AI ONNX)
4.  Folder `ai_service/` (jika berisi file model `.onnx`)
5.  Script `paddle_ocr.py` (untuk OCR)

```bash
# Buat direktori backend tujuan
mkdir -p /home/lims/lims1/backend
mkdir -p /home/lims/lims2/backend

# Salin berkas biner, library, dan konfigurasi
cp /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/main /home/lims/lims1/backend/
cp /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/main /home/lims/lims2/backend/

cp -r /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/lib /home/lims/lims1/backend/
cp -r /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/lib /home/lims/lims2/backend/

cp -r /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/ai_service /home/lims/lims1/backend/
cp -r /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/ai_service /home/lims/lims2/backend/

cp /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/paddle_ocr.py /home/lims/lims1/backend/
cp /mnt/d/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/paddle_ocr.py /home/lims/lims2/backend/
```

### B. Hubungkan Symbolic Link (Shared Storage)
Guna menyatukan folder penyimpanan hasil uji uploads, hubungkan folder uploads lokal ke folder bersama `shared_uploads`:
```bash
# Hapus folder uploads lokal bawaan jika ada
rm -rf /home/lims/lims1/backend/uploads
rm -rf /home/lims/lims2/backend/uploads

# Hubungkan symbolic link
ln -s /home/lims/shared_uploads /home/lims/lims1/backend/uploads
ln -s /home/lims/shared_uploads /home/lims/lims2/backend/uploads
```

### C. Membuat Systemd Services
Karena biner berjalan di bawah user `lims`, Anda wajib mengeset nilai **`User=lims`** dan **`Group=lims`** di systemd service.

1.  **Service Port 8081** (`/etc/systemd/system/lims-backend-8081.service`):
    ```ini
    [Unit]
    Description=LIMS Go Backend Service (Port 8081)
    After=network.target postgresql.service

    [Service]
    Type=simple
    User=lims
    Group=lims
    WorkingDirectory=/home/lims/lims1/backend
    ExecStart=/home/lims/lims1/backend/main
    Restart=always
    RestartSec=5
    LimitNOFILE=65535
    EnvironmentFile=/home/lims/lims1/backend/.env

    [Install]
    WantedBy=multi-user.target
    ```

2.  **Service Port 8091** (`/etc/systemd/system/lims-backend-8091.service`):
    ```ini
    [Unit]
    Description=LIMS Go Backend Service (Port 8091)
    After=network.target postgresql.service

    [Service]
    Type=simple
    User=lims
    Group=lims
    WorkingDirectory=/home/lims/lims2/backend
    ExecStart=/home/lims/lims2/backend/main
    Restart=always
    RestartSec=5
    LimitNOFILE=65535
    EnvironmentFile=/home/lims/lims2/backend/.env

    [Install]
    WantedBy=multi-user.target
    ```

Aktifkan dan jalankan kedua backend:
```bash
# Memuat ulang konfigurasi systemd (wajib jika file .service baru dibuat atau diubah)
sudo systemctl daemon-reload

# Mengaktifkan agar otomatis jalan saat boot & langsung menyalakan service
sudo systemctl enable --now lims-backend-8081.service lims-backend-8091.service
```

### D. Daftar Perintah Systemd (Cheat Sheet Operasional Backend)
Gunakan perintah-perintah berikut untuk mengelola layanan backend LIMS di server produksi Anda:

*   **Melihat Status Layanan (Status)**:
    ```bash
    # Mengecek status dan logs ringkas Backend 8081
    sudo systemctl status lims-backend-8081.service
    
    # Mengecek status dan logs ringkas Backend 8091
    sudo systemctl status lims-backend-8091.service
    ```
*   **Menghentikan Layanan (Stop)**:
    ```bash
    # Menghentikan salah satu service
    sudo systemctl stop lims-backend-8081.service
    
    # Menghentikan kedua service sekaligus
    sudo systemctl stop lims-backend-8081.service lims-backend-8091.service
    ```
*   **Menyalakan Layanan (Start)**:
    ```bash
    # Menyalakan kembali service
    sudo systemctl start lims-backend-8081.service lims-backend-8091.service
    ```
*   **Merestart Layanan (Restart)**:
    ```bash
    # Merestart layanan (biasa dilakukan saat ada update file biner 'main' atau berkas '.env' diubah)
    sudo systemctl restart lims-backend-8081.service lims-backend-8091.service
    ```
*   **Menonaktifkan Autostart saat Boot (Disable)**:
    ```bash
    # Menonaktifkan autostart (proses tidak akan berjalan otomatis saat server direboot)
    sudo systemctl disable lims-backend-8081.service lims-backend-8091.service
    ```

---

## 6. Konfigurasi NGINX

### A. Edit Konfigurasi Utama (`/etc/nginx/nginx.conf`)
Tambahkan pemetaan Client IP asli dan deklarasi log monitoring di dalam blok `http { ... }`:
```nginx
map $http_x_forwarded_for $real_client_ip {
    ""      $remote_addr;
    default $http_x_forwarded_for;
}

log_format upstream_monitoring '$remote_addr - ClientIP: $real_client_ip - [$time_local] '
                               '"$request" $status $body_bytes_sent '
                               'to_server=$upstream_addr status=$upstream_status '
                               'resp_time=$upstream_response_time '
                               'agent="$http_user_agent" '
                               'app_ver="$http_x_app_version" app_plat="$http_x_app_platform"';
```

### B. Konfigurasi Situs LIMS (`/etc/nginx/conf.d/lims.conf`)
Salin konfigurasi berikut untuk menangani pemisahan static assets, load-balancing backend, dan direktori bersama `/uploads/`:

```nginx
# =========================================================================
# FILE CONFIGURATION: /etc/nginx/conf.d/lims.conf
# =========================================================================

# --- CLUSTER LOAD BALANCER BACKEND ---
# Mendistribusikan request API ke dua instance Go backend (Port 8081 & 8091)
upstream lims_backend_cluster {
    server 127.0.0.1:8081 max_fails=3 fail_timeout=10s;
    server 127.0.0.1:8091 max_fails=3 fail_timeout=10s;
}

# --- CLUSTER LOAD BALANCER FRONTEND ---
# Mendistribusikan request Frontend ke dua instance PM2 (Port 3000 & 3001)
upstream lims_frontend_cluster {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=10s;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=10s;
}

# =========================================================================
# BLOK SERVER 1: PORT 8082 (HTTPS - WEB CLIENT & SECURE ACCESS)
# =========================================================================
server {
    listen 8082 ssl;
    server_name lims-d4551821.nip.io lims.local localhost;

    # --- SERTIFIKAT SSL ---
    # Jika menggunakan Let's Encrypt (nip.io), sesuaikan path-nya:
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # --- PENANGANAN REAL IP ---
    set_real_ip_from 127.0.0.1;
    real_ip_header X-Forwarded-For;
    real_ip_recursive on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval';" always;

    client_max_body_size 50M;

    root /home/lims/lims1/frontend/dist;
    index index.html;

    # 1. Routing Frontend Web (Proxy ke Cluster PM2)
    location / {
        proxy_pass http://lims_frontend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 2. Halaman Laporan GoAccess (Dilindungi Autentikasi Dinamis Backend via auth_request)
    location = /report.html {
        # Mengirim sub-request ke endpoint backend untuk memeriksa JWT Session & Role (nur / ADMIN)
        auth_request /api/auth/check-report-access;

        # Jika backend mengembalikan HTTP 200 OK, sajikan file dari alias berikut:
        alias /home/lims/shared_reports/report.html;
    }

    # 2b. Redirect /report.html/ ke /report.html (Mengatasi isu trailing slash dari link)
    location = /report.html/ {
        return 301 $scheme://$http_host/report.html$is_args$args;
    }

    # 3. Lokasi Proxy Internal untuk Autentikasi Keamanan report.html
    location = /api/auth/check-report-access {
        internal; # Hanya bisa diakses secara internal oleh Nginx
        proxy_pass http://lims_backend_cluster;
        
        # Optimasi performa: Jangan kirim body request ke backend
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        
        # Meneruskan header otentikasi dari klien
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 4. Proxy WebSocket untuk GoAccess Real-Time
    location /ws {
        proxy_pass http://127.0.0.1:7890;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    # 5. Proxy API ke Go Backend Cluster
    location /api {
        proxy_pass http://lims_backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Meneruskan IP Client Asli
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;
    }

    # 5b. Proxy Halaman Simulator ke Go Backend Cluster
    location /simulator {
        proxy_pass http://lims_backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 6. Penyajian Berkas Unggahan (Direct Alias)
    location /uploads/ {
        alias /home/lims/shared_uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 7. Penyajian Folder Unduhan APK LIMS (Direct Alias)
    location /downloads/ {
        alias /home/lims/shared_downloads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    access_log /var/log/nginx/lims_access.log upstream_monitoring;
    error_log /var/log/nginx/lims_error.log;
}

# =========================================================================
# BLOK SERVER 2: PORT 8087 (HTTP - WI-FI LOKAL MOBILE APP CLIENT)
# Bebas dari kendala sertifikat SSL self-signed pada HP Android
# =========================================================================
server {
    listen 8087;
    server_name localhost 192.168.0.103 212.85.24.33; # Sesuaikan IP ini dengan IP Laptop (Wi-Fi) atau IP Publik VPS Anda

    client_max_body_size 50M;

    # 1. Proxy API ke Go Backend Cluster (Load Balancer ke Port 8081 & 8091)
    location /api {
        proxy_pass http://lims_backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Penyajian Berkas Unggahan (Direct Alias)
    location /uploads/ {
        alias /home/lims/shared_uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 3. Penyajian Folder Unduhan APK LIMS (Direct Alias)
    location /downloads/ {
        alias /home/lims/shared_downloads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    access_log /var/log/nginx/lims_access.log upstream_monitoring;
    error_log /var/log/nginx/lims_error.log;
}

# =========================================================================
# BLOK SERVER 3: PORT 8443 (HTTPS - TELEGRAM WEBHOOK DENGAN SERTIFIKAT IP)
# Telegram mewajibkan Webhook dipasang di port 80, 88, 443, atau 8443.
# Blok ini menggunakan sertifikat telegram.crt yang diterbitkan khusus untuk IP VPS.
# =========================================================================
server {
    listen 8443 ssl;
    server_name 212.85.24.33;

    # Menggunakan sertifikat khusus IP (Common Name = 212.85.24.33)
    ssl_certificate /etc/nginx/ssl/telegram.crt;
    ssl_certificate_key /etc/nginx/ssl/telegram.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Teruskan request API ke backend cluster LIMS
    location /api {
        proxy_pass http://lims_backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Terapkan perubahan dan reload NGINX:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### C. Best Practice Multi-VM & Dedicated Load Balancer

Jika ekosistem LIMS Anda berkembang ke arsitektur **multi-VM** (misalnya 2 VM dedicated untuk Frontend dan 2 VM dedicated untuk Backend):

1. **Konfigurasi Upstream pada Nginx:**
   Pada Nginx, blok `upstream` diatur menggunakan IP fisik masing-masing VM di jaringan internal (LAN). Karena aplikasi di masing-masing VM adalah instansi terpisah, mereka biasanya menggunakan port yang sama.
   ```nginx
   upstream lims_frontend_cluster {
       server 192.168.10.11:3000 max_fails=3 fail_timeout=10s; # VM Frontend 1
       server 192.168.10.12:3000 max_fails=3 fail_timeout=10s; # VM Frontend 2
   }

   upstream lims_backend_cluster {
       server 192.168.10.21:8081 max_fails=3 fail_timeout=10s; # VM Backend 1
       server 192.168.10.22:8081 max_fails=3 fail_timeout=10s; # VM Backend 2
   }
   ```
2. **Penggunaan Dedicated VM untuk NGINX (Sangat Direkomendasikan):**
   Pada lingkungan produksi, Nginx sebaiknya diletakkan pada **dedicated VM** (sebagai Load Balancer Gateway) yang terpisah dari VM Frontend maupun Backend.
   * **Mengapa?**
     * **Keamanan:** VM aplikasi tidak perlu memiliki IP publik. Hanya VM Nginx Gateway yang terekspos ke internet. Nginx bertindak sebagai benteng pertahanan pertama.
     * **SSL Termination:** Nginx memproses enkripsi/dekripsi SSL secara terpusat di satu VM, mengurangi beban kerja CPU pada VM aplikasi.
     * **Kemudahan Scaling:** Anda bisa menambah/mengurangi VM backend/frontend kapan saja di belakang Nginx tanpa perlu mengubah konfigurasi DNS atau client.

---

## 7. Rotasi Log Harian (Logrotate) & Penjadwalan 01:00 Dini Hari

Rotasi log otomatis setiap hari dengan nama berakhiran `_YYYYMMDD.log` untuk menghemat ruang penyimpanan.

### A. Rotasi Log Nginx (`/etc/logrotate.d/nginx`)
Edit berkas `/etc/logrotate.d/nginx`:
```nginx
/var/log/nginx/lims_access.log
/var/log/nginx/lims_error.log {
	daily
	missingok
	rotate 14
	compress
	delaycompress
	notifempty
	create 0640 www-data adm
	sharedscripts
	dateext
	dateformat _%Y%m%d
	extension .log
	dateyesterday
	prerotate
		if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
			run-parts /etc/logrotate.d/httpd-prerotate; \
		fi \
	endscript
	postrotate
		invoke-rc.d nginx rotate >/dev/null 2>&1
	endscript
}

/var/log/nginx/access.log
/var/log/nginx/error.log {
	daily
	missingok
	rotate 14
	compress
	delaycompress
	notifempty
	create 0640 www-data adm
	sharedscripts
	prerotate
		if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
			run-parts /etc/logrotate.d/httpd-prerotate; \
		fi \
	endscript
	postrotate
		invoke-rc.d nginx rotate >/dev/null 2>&1
	endscript
}
```

### B. Rotasi Log Backend Go (`/etc/logrotate.d/lims-backend`)
Untuk log yang dihasilkan oleh aplikasi backend (seperti file `api_traffic.log`, `db_query.log`, dan log lainnya di folder `logs/`), kita wajib menggunakan parameter **`copytruncate`** dan arahan **`su`**.

> [!NOTE]
> **Pentingnya Parameter `copytruncate`**:
> Aplikasi backend Go menulis log dengan menahan *file descriptor* yang terbuka secara dinamis. Jika file log dipindah (renamed) secara langsung, program Go akan tetap menulis ke file log yang telah diganti namanya tersebut. Dengan `copytruncate`, sistem logrotate akan menyalin (copy) isi log lama terlebih dahulu kemudian memotong (truncate) log aktif menjadi kosong tanpa memutus penulisan biner Go.

Buat berkas konfigurasi baru `/etc/logrotate.d/lims-backend`:
```nginx
# Catatan: Berkas log pelatihan model (seperti lims_ai-train-YYYYMMDD.log) 
# sengaja tidak di-rotate di bawah ini karena namanya sudah mengandung format tanggal dari program.
/home/lims/lims1/backend/*.log
/home/lims/lims1/backend/logs/api_traffic.log
/home/lims/lims1/backend/logs/db_query.log
/home/lims/lims2/backend/*.log
/home/lims/lims2/backend/logs/api_traffic.log
/home/lims/lims2/backend/logs/db_query.log {
	su lims lims
	daily
	missingok
	rotate 14
	compress
	delaycompress
	copytruncate
	notifempty
	create 0664 lims lims
	dateext
	dateformat _%Y%m%d
	extension .log
	dateyesterday
}
```

### C. Rotasi Log Frontend PM2 (`/etc/logrotate.d/lims-frontend`)
Frontend LIMS dijalankan sebagai HTTP server statis menggunakan PM2, yang mencatat console output (stdout/stderr) ke berkas log PM2. Untuk merotasi berkas log ini dengan aman menggunakan logrotate sistem, buat berkas konfigurasi baru `/etc/logrotate.d/lims-frontend`:

```nginx
/home/lims/.pm2/logs/*.log {
	su lims lims
	daily
	missingok
	rotate 14
	compress
	delaycompress
	copytruncate
	notifempty
	create 0664 lims lims
	dateext
	dateformat _%Y%m%d
	extension .log
	dateyesterday
}
```

### D. Pengujian Simulasi & Eksekusi Nyata
*   **Melakukan Uji Coba Simulasi (Dry Run)**:
    *(Catatan: Parameter `-d` hanya mencetak simulasi dan TIDAK merename berkas fisik di disk).*
    ```bash
    # Mencetak simulasi berkas Nginx yang akan diganti namanya:
    sudo logrotate -df /etc/logrotate.d/nginx
    
    # Mencetak simulasi berkas log backend:
    sudo logrotate -df /etc/logrotate.d/lims-backend

    # Mencetak simulasi berkas log frontend PM2:
    sudo logrotate -df /etc/logrotate.d/lims-frontend
    ```
*   **Mengeksekusi Rotasi Secara Langsung (Nyata)**:
    ```bash
    # Menjalankan rotasi fisik di disk secara langsung
    sudo logrotate -fv /etc/logrotate.d/nginx
    sudo logrotate -fv /etc/logrotate.d/lims-backend
    sudo logrotate -fv /etc/logrotate.d/lims-frontend
    ```

### E. Konfigurasi Penjadwalan Otomatis Pukul 01:00 Dini Hari (Cron)
Secara bawaan, tugas cron harian system logrotate berjalan tidak menentu. Untuk memaksakan pemutaran berkas log dilakukan tepat pada **pukul 01:00 dini hari**, buatlah berkas cron khusus di `/etc/cron.d/logrotate-lims`:

```bash
sudo nano /etc/cron.d/logrotate-lims
```
Masukkan konfigurasi berikut:
```cron
0 1 * * * root /usr/sbin/logrotate /etc/logrotate.d/nginx >> /var/log/logrotate_nginx.log 2>&1
0 1 * * * root /usr/sbin/logrotate /etc/logrotate.d/lims-backend >> /var/log/logrotate_backend.log 2>&1
0 1 * * * root /usr/sbin/logrotate /etc/logrotate.d/lims-frontend >> /var/log/logrotate_frontend.log 2>&1
```
Set hak akses ke `0644` (wajib agar terbaca oleh cron daemon) dan restart layanan cron:
```bash
sudo chmod 0644 /etc/cron.d/logrotate-lims
sudo systemctl restart cron
```

### F. Rotasi Log Frontend (PM2 - Opsi Alternatif `pm2-logrotate`)
Aplikasi frontend disajikan sebagai aset statis oleh NGINX (log akses webnya terekam di `/var/log/nginx/lims_access.log`). Namun, karena proses HTTP server-nya diluncurkan menggunakan PM2 (`lims-frontend-3000` dan `lims-frontend-3001`), PM2 merekam output konsol (*stdout* dan *stderr*) aplikasi tersebut ke dalam berkas log lokal PM2.

*   **Lokasi Direktori Log PM2 Frontend**:
    Semua log frontend disimpan di direktori home user:
    `/home/lims/.pm2/logs/`
    *   `/home/lims/.pm2/logs/lims-frontend-3000-out.log` (stdout) & `lims-frontend-3000-error.log` (stderr)
    *   `/home/lims/.pm2/logs/lims-frontend-3001-out.log` (stdout) & `lims-frontend-3001-error.log` (stderr)

Meskipun saat ini kita telah mengonfigurasinya dengan utilitas **system logrotate** bawaan Linux di atas, sebagai alternatif internal PM2, Anda juga dapat menggunakan modul resmi **`pm2-logrotate`**:

1.  **Instalasi Modul**:
    ```bash
    pm2 install pm2-logrotate
    ```
2.  **Konfigurasi Parameter Rotasi**:
    Secara bawaan, modul ini akan memutar log jika ukuran berkas melebihi batas tertentu atau secara terjadwal. Anda dapat mengaturnya sebagai berikut:
    ```bash
    # Set batas ukuran maksimal berkas log sebelum di-rotate (misal: 10 Megabytes)
    pm2 set pm2-logrotate:max_size 10M
    
    # Set agar rotasi juga berjalan harian (tiap tengah malam) sebagai opsi tambahan
    pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
    
    # Set agar menyimpan arsip log maksimal selama 14 hari (sisanya otomatis dihapus)
    pm2 set pm2-logrotate:retain 14
    
    # Mengaktifkan kompresi berkas log lama menjadi format zip (.gz)
    pm2 set pm2-logrotate:compress true
    ```

---

## 8. Real-Time Analytics dengan GoAccess

Dasbor dipasang di latar belakang dengan target file output di folder bersama `/home/lims/shared_reports/report.html`:

```bash
# 1. Pastikan folder output sudah terbuat dan memiliki izin akses yang benar
mkdir -p /home/lims/shared_reports
sudo chown -R lims:lims /home/lims/shared_reports

# 2. Jalankan GoAccess di latar belakang (Ganti <IP_VPS_ANDA> dengan IP VPS Anda, misal 212.85.24.33)
sudo goaccess /var/log/nginx/lims_access.log \
  --log-format='%h - ClientIP: %^ - [%d:%t %^] "%r" %s %b to_server=%v status=%^ resp_time=%^ agent="%u"' \
  --date-format='%d/%b/%Y' \
  --time-format='%H:%M:%S' \
  --ws-url=wss://<IP_VPS_ANDA>:8082/ws \
  -o /home/lims/shared_reports/report.html \
  --real-time-html &
```

### A. Kontrol Pengguna & Keamanan Akses GoAccess

Secara default, GoAccess menghasilkan file HTML statis (`report.html`) yang tidak memiliki fitur autentikasi bawaan. Agar data lalu lintas server Anda tidak diakses oleh pihak luar, terapkan salah satu metode pengamanan berikut.

---

#### OPSI 1: Proteksi Basic Authentication via Nginx (Praktis & Cepat - STATIS)
> [!WARNING]
> **Keterbatasan Opsi 1:** Metode ini menggunakan password statis yang di-hash ke dalam file `.htpasswd` Nginx. Metode ini **tidak cocok** jika Anda ingin menggunakan kredensial database (seperti user `nur` yang password-nya berubah/kedaluwarsa maksimal setiap 90 hari). Perubahan password di database tidak akan menyinkronkan file `.htpasswd` secara otomatis.

Namun, jika Anda tetap ingin menggunakan Basic Auth statis, berikut adalah contoh konfigurasinya:

1. **Membuat File `.htpasswd` untuk User `nur` dan `admin`:**
   Jalankan perintah ini di terminal server Linux Anda:
   ```bash
   # Buat file baru dengan menambahkan user 'nur' (Masukkan password 'nur' saat diminta)
   sudo apt install apache2-utils -y
   sudo htpasswd -c /etc/nginx/.htpasswd nur

   # Tambahkan user 'admin' ke file yang sama (Masukkan password 'admin' saat diminta)
   sudo htpasswd /etc/nginx/.htpasswd admin
   ```

2. **Konfigurasi Nginx untuk Basic Auth:**
   Edit file konfigurasi Nginx Anda (`/etc/nginx/conf.d/lims.conf`), cari atau buat blok `/report.html` berikut:
   ```nginx
   # --- COPY-PASTE KE KONFIGURASI NGINX ---
   location = /report.html {
       alias /home/lims/shared_reports/;
       auth_basic "LIMS Analytics Restricted Area";
       auth_basic_user_file /etc/nginx/.htpasswd;
   }
   # ---------------------------------------
   ```

---

#### OPSI 2: Proxy Melalui API Otentikasi LIMS (Paling Aman - DINAMIS & TERINTEGRASI DB)
Metode ini sangat direkomendasikan karena **menyelesaikan masalah ekspirasi password 90 hari**. Autentikasi dilakukan oleh Go backend dengan memeriksa token session (JWT) pengguna yang login dari database. Jika password user `nur` berubah di database, token lamanya otomatis tidak valid dan ia harus login ulang dengan password baru untuk mengakses halaman laporan.

##### Langkah 1: Ubah Konfigurasi Nginx (`/etc/nginx/conf.d/lims.conf`)
Hapus atau beri tanda komentar pada blok `/report.html` lama agar file tidak bisa diakses secara langsung oleh siapa pun tanpa token:
```nginx
# --- COPY-PASTE: HAPUS ATAU HILANGKAN BLOK INI ---
# location = /report.html {
#     alias /home/lims/shared_reports/;
# }
# -------------------------------------------------
```
*Terapkan dan reload Nginx:* `sudo systemctl reload nginx`

##### Langkah 2: Buat Endpoint Handler di Backend Go (`backend/controllers/report_controller.go`)
Tambahkan handler fungsi berikut di bagian bawah berkas `report_controller.go` untuk membaca file secara dinamis dan memvalidasi user/role secara terintegrasi dengan database:

```go
// --- COPY-PASTE KE backend/controllers/report_controller.go ---
func GetGoAccessReport(c *gin.Context) {
	// 1. Ambil informasi dari JWT Session (yang otomatis memvalidasi password database aktif)
	username, existsUsername := c.Get("username")
	role, existsRole := c.Get("role")

	if !existsUsername || !existsRole {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Sesi tidak ditemukan"})
		return
	}

	// CONTOH A: Membatasi akses KHUSUS untuk user 'nur' saja (karena password nur berubah maksimal 90 hari)
	if username.(string) != "nur" {
		// CONTOH B: Jika bukan 'nur', periksa apakah user memiliki Role ADMIN
		if role.(string) != "ADMIN" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Hanya user 'nur' atau role ADMIN yang diizinkan mengakses analitik."})
			return
		}
	}

	// 2. Baca file report.html dari shared folder
	htmlPath := "/home/lims/shared_reports/report.html"
	htmlContent, err := os.ReadFile(htmlPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca berkas laporan analitik GoAccess"})
		return
	}

	// 3. Kirimkan konten sebagai berkas HTML murni
	c.Data(http.StatusOK, "text/html; charset=utf-8", htmlContent)
}
```

##### Langkah 3: Daftarkan Rute API di Backend (`backend/routes/routes.go`)
Daftarkan rute di dalam grup protected (di bawah middleware `AuthMiddleware`):
```go
// --- COPY-PASTE KE backend/routes/routes.go ---
// Cari grup protected di routes.go, lalu daftarkan rute ini:
protected.GET("/reports/analytics-report", controllers.GetGoAccessReport)
```
*(Catatan: Rute ini dilindungi oleh `AuthMiddleware()` sehingga otomatis menolak token kedaluwarsa atau user dengan password yang sudah expired di database).*

##### Langkah 4: Tampilan Frontend (Sisi Web)
Admin/User `nur` dapat mengakses laporan analitik langsung melalui URL API:
`https://lims.perusahaan.com/api/reports/analytics-report`

---

#### OPSI 3: Nginx `auth_request` Directive (Performa Terbaik - Hybrid Dinamis)
Metode ini adalah gabungan performa terbaik. Nginx akan bertugas **menyajikan file HTML secara langsung** dari disk (sangat cepat dan hemat memori backend), tetapi Nginx akan **meminta persetujuan Go Backend** terlebih dahulu via sub-request sebelum menyajikannya. Backend akan memvalidasi session/JWT/username user secara dinamis dari database.

##### Langkah 1: Tambahkan Rute Validasi Cepat di Go Backend (`backend/controllers/report_controller.go`)
Buat endpoint ringan yang hanya mengembalikan status HTTP 200 (jika diizinkan) atau 403/401 (jika ditolak) tanpa membaca file HTML ke memory Go:

```go
// --- COPY-PASTE KE backend/controllers/report_controller.go ---
func CheckReportAccess(c *gin.Context) {
	username, existsUsername := c.Get("username")
	role, existsRole := c.Get("role")

	if !existsUsername || !existsRole {
		c.Status(http.StatusUnauthorized)
		return
	}

	// Validasi apakah user adalah 'nur' atau memiliki role 'ADMIN'
	if username.(string) == "nur" || role.(string) == "ADMIN" {
		c.Status(http.StatusOK) // Autentikasi Berhasil
		return
	}

	c.Status(http.StatusForbidden) // Ditolak
}
```

##### Langkah 2: Daftarkan Rute Validasi di `backend/routes/routes.go`
Daftarkan rute pemeriksaan di bawah `AuthMiddleware`:
```go
// --- COPY-PASTE KE backend/routes/routes.go ---
protected.GET("/auth/check-report-access", controllers.CheckReportAccess)
```

##### Langkah 3: Konfigurasi Nginx dengan `auth_request` (`/etc/nginx/conf.d/lims.conf`)
Ganti blok `/report.html` lama Anda dengan konfigurasi copy-paste berikut:
```nginx
# 1. Halaman Laporan GoAccess yang Dilindungi
location = /report.html {
    # Nginx akan mengirimkan sub-request internal ke path /api/auth/check-report-access
    auth_request /api/auth/check-report-access;

    # Jika sub-request mengembalikan HTTP 200 OK, sajikan file ini:
    alias /home/lims/shared_reports/report.html;
}

# 1b. Redirect /report.html/ ke /report.html (Mengatasi isu trailing slash dari link)
location = /report.html/ {
    return 301 $scheme://$http_host/report.html$is_args$args;
}

# 2. Lokasi Proxy Internal untuk Pemeriksaan Autentikasi Backend LIMS
location = /api/auth/check-report-access {
    internal; # Hanya bisa diakses secara internal oleh Nginx
    proxy_pass http://lims_backend_cluster;
    
    # Jangan kirim request body ke backend untuk optimasi kecepatan
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    
    # Teruskan cookie dan header otentikasi dari klien
    proxy_set_header X-Original-URI $request_uri;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
# ---------------------------------------
```
*Terapkan dan reload Nginx:* `sudo nginx -t && sudo systemctl reload nginx`

### B. Perbandingan: GoAccess vs Grafana

| Fitur | GoAccess | Grafana (Loki/Prometheus Stack) |
| :--- | :--- | :--- |
| **Fokus Utama** | Analisis log server web secara real-time. | Visualisasi data metrik server, database, dan logs secara menyeluruh. |
| **Kebutuhan Resource** | Sangat ringan (CPU/RAM di bawah 5%). | Cukup berat (memerlukan instalasi database pencatat metrik tambahan). |
| **Keamanan & RBAC** | Tidak ada bawaan (harus via Nginx/App proxy). | Memiliki sistem login dan Role-Based Access Control (RBAC) bawaan. |
| **Historikal Data** | Terbatas pada rentang log aktif saat ini. | Sangat baik (dapat menyimpan data dari hari/bulan yang lalu). |
| **Kemudahan Setup** | Sangat mudah (hanya satu perintah install & run). | Kompleks (perlu setup agen pengumpul log/metrik di setiap VM). |
| **Kesimpulan Pemilihan** | **Pilih GoAccess** untuk pemantauan traffic web harian yang cepat, ringan, dan gratis biaya server. <br>**Pilih Grafana** untuk pemantauan infrastruktur skala enterprise yang membutuhkan audit historis jangka panjang dan alert otomatis. |

---

## 9. Pemantauan & Pemeliharaan (Checklist)

*   **Melihat log systemd Go Backend**:
    ```bash
    sudo journalctl -u lims-backend-8081.service -f
    sudo journalctl -u lims-backend-8091.service -f
    ```
*   **Melihat log PM2 Frontend**:
    ```bash
    pm2 logs lims-frontend-3000
    pm2 logs lims-frontend-3001
    ```
*   **Melihat log Nginx**:
    ```bash
    tail -f /var/log/nginx/lims_access.log
    ```

> [!NOTE]
> **Tanya Jawab Pengoperasian Layanan Backend**:
> 
> *   **Bagaimana cara merestart salah satu instance backend saja (misal port 8081)?**
>     Anda cukup menjalankan perintah berikut di terminal:
>     ```bash
>     sudo systemctl restart lims-backend-8081.service
>     ```
> *   **Kapan saya perlu menjalankan `sudo systemctl daemon-reload`?**
>     Perintah `daemon-reload` **hanya diperlukan** ketika Anda mengubah isi dari berkas konfigurasi unit `.service` (seperti memodifikasi isi file `/etc/systemd/system/lims-backend-8081.service`). Jika hanya ingin mematikan, menyalakan, atau merestart program backend biasa, Anda tidak perlu menjalankannya.

---

## 10. Pelatihan Model AI (PQC) & Penjadwalan Otomatis (Crontab)

LIMS mengintegrasikan modul *Predictive Quality Control* (PQC) berbasis AI (Isolation Forest) yang melatih model di latar belakang menggunakan pustaka Python dan mengeluarkan model berformat ONNX.

### A. Prasyarat Library Python di Server
Pastikan Python 3, Pip, dan pustaka-pustaka pendukung berikut terinstal di server produksi Anda:
```bash
# Instal pip jika belum ada
sudo apt update && sudo apt install python3-pip -y

# Instal modul pendukung manipulasi data, database, AI, dan enkripsi
pip3 install pandas numpy scikit-learn sqlalchemy skl2onnx cryptography psycopg2-binary
```

### B. Solusi Peringatan Lokasi Script (WARNING: Scripts not on PATH)
Saat menginstal modul di atas melalui `pip3`, Anda mungkin akan melihat pesan peringatan seperti berikut:
> `WARNING: The scripts f2py and numpy-config are installed in '/home/lims/.local/bin' which is not on PATH.`

Peringatan ini **tidak mengganggu** proses latihan model AI LIMS karena program mengimpor modul langsung dari Python (bukan via perintah terminal). Namun, untuk menghilangkan peringatan ini dan memastikan semua perintah binary python lokal dapat dieksekusi langsung oleh user `lims`, daftarkan direktori bin lokal ke variabel `PATH`:
```bash
# Jalankan ini di bawah user 'lims'
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### C. Menjalankan Pelatihan Secara Manual
Pelatihan model dilakukan menggunakan skrip `train.py` yang terletak di dalam folder backend.

> [!IMPORTANT]
> **Penyimpanan Berkas Model & Konfigurasi Parameter Database**:
> Agar program Go Backend (UI LIMS) dan skrip pelatihan (`train.py`) membaca dan menulis dari folder yang sama pada deployment baru, Anda wajib memperbarui nilai parameter **`AI_METADATA_FOLDER`** di tabel `lims.global_parameters` database PostgreSQL Anda ke path folder baru:
> `/home/lims/lims1/backend/ai_service/models`
>
> **Cara memperbarui parameter di database (menjalankan query SQL):**
> ```sql
> UPDATE lims.global_parameters 
> SET param_value = '/home/lims/lims1/backend/ai_service/models' 
> WHERE param_key = 'AI_METADATA_FOLDER';
> ```
> *(Jika parameter ini diatur, output model pelatihan akan otomatis ditulis ke `/home/lims/lims1/backend/ai_service/models/` dan UI LIMS dari kedua backend port 8081 & 8091 akan otomatis membaca file model dari sana).*

Anda dapat memicu pelatihan ulang (*offline retraining*) secara manual kapan saja dengan perintah:
```bash
python3 /home/lims/lims1/backend/ai_service/train.py
```
*Skrip ini akan mengambil data historis dari database PostgreSQL, melatih model baru, mengekspor model berformat `.onnx` dan berkas `.json` metadata ke folder baru `/home/lims/lims1/backend/ai_service/models`, serta memperbarui database status model di registry menjadi `ACTIVE`.*

### D. Penjadwalan Otomatis Menggunakan Crontab (Cron Job)
Untuk menjamin akurasi model selalu ter-update berdasarkan data baru, pelatihan diatur agar berjalan otomatis secara berkala (misalnya setiap hari pada pukul 01:00 dini hari).

1.  Buka editor crontab untuk user **`lims`**:
    ```bash
    # Pindah ke user lims terlebih dahulu jika saat ini login sebagai user lain
    sudo su - lims
    crontab -e
    ```
2.  Tambahkan baris penjadwalan berikut di bagian paling bawah file:
    ```cron
    0 1 * * * /usr/bin/python3 /home/lims/lims1/backend/ai_service/train.py >> /home/lims/lims1/backend/logs/train_cron.log 2>&1
    ```
3.  Simpan dan tutup editor. Cron daemon akan otomatis memuat jadwal baru.

**Penjelasan Parameter Cron di atas:**
*   `0 1 * * *`: Menunjukkan jadwal pengeksekusian script dilakukan pada **menit ke-0, jam ke-1 (01:00 AM WIB/server time), setiap hari, setiap bulan, dan setiap hari dalam seminggu**.
*   `/usr/bin/python3`: Path absolut interpreter Python 3 di Linux.
*   `>> /home/lims/lims1/backend/logs/train_cron.log 2>&1`: Mengarahkan keluaran log (`stdout` & `stderr`) ke berkas log `train_cron.log` agar proses pelatihan dapat dipantau dan di-debug apabila terjadi kendala/error.

---

## 11. Administrasi & Pemeliharaan Modul Pendukung (PostgreSQL, MinIO, Camunda)

Bagian ini mendokumentasikan instalasi, pemeriksaan (*healthcheck*), konfigurasi, status, pemantauan (*monitoring*), dan penelusuran kesalahan (*tracing/logs*) untuk modul-modul infrastruktur pendukung LIMS.

---

### A. Database Server (PostgreSQL)
PostgreSQL digunakan sebagai penyimpanan data relasional utama untuk LIMS.

#### 1. Instalasi
*   **Melalui Paket Manager Linux (Standalone)**:
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib -y
    # Install ekstensi pgvector untuk keperluan pencarian vektor AI (Chatbot RAG LIMS)
    sudo apt install postgresql-15-pgvector -y # Sesuaikan versi dengan PostgreSQL Anda (misal postgresql-16-pgvector)
    ```
*   **Melalui Docker Container (Rekomendasi Kontainerisasi)**:
    ```bash
    docker run -d \
      --name lims-postgres \
      -p 5433:5432 \
      -e POSTGRES_DB=lims_prod_db \
      -e POSTGRES_USER=lims_app \
      -e POSTGRES_PASSWORD=Nkl@130200 \
      -v postgres_data:/var/lib/postgresql/data \
      --restart always \
      postgres:15-alpine
    ```

#### 2. Pemeriksaan Instalasi (Health Check)
Gunakan utilitas `pg_isready` untuk memeriksa status ketersediaan database secara instan:
```bash
# Format: pg_isready -h [host] -p [port]
pg_isready -h 127.0.0.1 -p 5433
```
*Output sukses: `127.0.0.1:5433 - accepting connections`*

#### 3. Konfigurasi
Berkas konfigurasi utama terletak di `/etc/postgresql/[versi]/main/postgresql.conf` (standalone) atau berada di dalam volume Docker.
*   **Mengizinkan Koneksi dari Luar (WSL/Host)**:
    Pastikan `listen_addresses = '*'` aktif di `postgresql.conf`, dan baris berikut terdaftar di `/etc/postgresql/[versi]/main/pg_hba.conf`:
    ```text
    host    all             all             0.0.0.0/0               scram-sha-256
    ```

#### 4. Status & Pemantauan (Status & Monitoring)
*   **Cek Status Service**:
    ```bash
    # Standalone
    sudo systemctl status postgresql
    # Docker
    docker ps | grep lims-postgres
    ```
*   **Melihat Koneksi Aktif (SQL Query)**:
    Masuk ke psql:
    ```bash
    PGPASSWORD=Nkl@130200 psql -U lims_app -h 127.0.0.1 -p 5433 -d lims_prod_db
    ```
    Jalankan query monitoring:
    ```sql
    SELECT pid, usename, client_addr, state, query FROM pg_stat_activity;
    ```

#### 5. Penelusuran Error (Tracing & Logs)
*   **Membaca Log PostgreSQL**:
    *   *Standalone*: `/var/log/postgresql/postgresql-[versi]-main.log`
    *   *Docker*: `docker logs -f lims-postgres`

#### 6. Panduan Inisialisasi Database LIMS (Tablespace, User, Owner, Schema, & Extension)

Ikuti urutan inisialisasi database PostgreSQL berikut untuk menjamin keamanan dan keselarasan dengan arsitektur LIMS:

1. **Buat Folder Penyimpanan Data (Jika menggunakan Tablespace Kustom - Opsional):**
   ```bash
   sudo mkdir -p /var/lib/postgresql/lims_data
   sudo chown -R postgres:postgres /var/lib/postgresql/lims_data
   ```
2. **Buat User (Role) LIMS:**
   Buka terminal psql sebagai user `postgres`:
   ```sql
   -- Membuat user/role baru untuk aplikasi LIMS
   CREATE USER lims_app WITH PASSWORD 'Nkl@130200';
   ```
3. **Buat Tablespace Khusus LIMS (Opsional tapi Best Practice di Prod):**
   ```sql
   -- Memisahkan penyimpanan fisik data LIMS ke folder khusus
   CREATE TABLESPACE lims_tblspace LOCATION '/var/lib/postgresql/lims_data';
   ```
4. **Buat Database dengan Owner dan Tablespace Terkait:**
   ```sql
   -- Membuat database utama LIMS
   CREATE DATABASE lims_prod_db OWNER lims_app TABLESPACE lims_tblspace;
   
   -- Memberikan seluruh hak akses database ke user lims
   GRANT ALL PRIVILEGES ON DATABASE lims_prod_db TO lims_app;
   ```
5. **Buat Schema Khusus LIMS:**
   Hubungkan ke database baru tersebut (`\c lims_prod_db`) sebagai user `lims_app` (atau `postgres` lalu set schema owner):
   ```sql
   \c lims_prod_db
   
   -- Membuat schema lims agar seluruh tabel rapi terkelompok
   CREATE SCHEMA lims AUTHORIZATION lims_app;
   ```
6. **Aktifkan Ekstensi Chatbot (pgvector) & UUID:**
   Di dalam database `lims_prod_db`, aktifkan ekstensi berikut (harus dijalankan oleh superuser `postgres`):
   ```sql
   -- Mengaktifkan ekstensi pencarian vektor untuk RAG Chatbot
   CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;
   
   -- Mengaktifkan generator UUID
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
   ```

---

### B. Object Storage (MinIO)
MinIO digunakan secara ekstensif untuk menyimpan file mentah dan lampiran bukti dokumen (seperti dokumen PDF, foto hasil uji lapangan, lampiran nota Reimbursement, berkas SPD, dan bukti Cash Advance) yang tidak efisien jika dimasukkan ke database relasional. Modul Keuangan & Perjalanan (Finance & Travel) sepenuhnya bergantung pada MinIO.

#### 1. Instalasi
*   **Melalui Paket Manager Linux (Standalone)**:
    Unduh biner MinIO:
    ```bash
    wget https://dl.min.io/server/minio/release/linux-amd64/minio
    chmod +x minio
    sudo mv minio /usr/local/bin/
    ```
*   **Melalui Docker Container (Rekomendasi)**:
    ```bash
    docker run -d \
      -p 9000:9000 \
      -p 9001:9001 \
      --name lims-minio \
      -e "MINIO_ROOT_USER=adminmiliter" \
      -e "MINIO_ROOT_PASSWORD=password12345" \
      -v minio_data:/data \
      --restart always \
      minio/minio server /data --console-address ":9001"
    ```

#### 2. Pemeriksaan Instalasi (Health Check)
Lakukan query API healthcheck bawaan MinIO:
```bash
curl -I http://localhost:9000/minio/health/live
```
*Output sukses: HTTP/1.1 200 OK*

#### 3. Konfigurasi
*   Pastikan bucket bernama **`mec-docs`** telah dibuat saat instalasi awal.
*   Anda dapat mengakses Dashboard UI Konsol di `http://[IP_SERVER]:9001` untuk membuat bucket secara visual.

#### 4. Status & Pemantauan (Status & Monitoring)
*   **Cek Status Proses**:
    ```bash
    # Standalone
    ps aux | grep minio
    # Docker
    docker ps | grep lims-minio
    ```
*   **Memantau Dashboard Konsol**:
    Buka `http://localhost:9001` di browser Anda untuk melihat total memori terpakai, total bucket, dan kapasitas tersisa.

#### 5. Penelusuran Error (Tracing & Logs)
*   **Membaca Log MinIO**:
    *   *Standalone*: Mengalihkan output ke file log saat dijalankan (`minio server /data > /var/log/minio.log 2>&1 &`)
    *   *Docker*: `docker logs -f lims-minio`

---

### C. Workflow Engine (Camunda BPMN)
Camunda digunakan oleh LIMS sebagai pengendali workflow status persetujuan (*approval process*) hasil uji laboratorium secara dinamis sesuai standar BPMN 2.0.

#### 1. Instalasi
*   **Melalui Docker Container (Sangat Direkomendasikan)**:
    ```bash
    docker run -d \
      --name lims-camunda \
      -p 8085:8080 \
      --restart always \
      camunda/camunda-bpm-platform:run-latest
    ```

#### 2. Pemeriksaan Instalasi (Health Check)
Cek respon dari Rest API Engine Camunda:
```bash
curl http://localhost:8085/engine-rest/engine
```
*Output sukses (JSON): `[{"name":"default"}]`*

#### 3. Konfigurasi
Aplikasi Go Backend berkomunikasi dengan Camunda melalui variabel `.env` berikut:
```env
CAMUNDA_URL=http://127.0.0.1:8085/engine-rest
CAMUNDA_USER=nurcamunda
CAMUNDA_PASSWORD_ENCRYPTED=7Qnql7OCZ046YGu2pY3FAOQFg8TLv3u5k2A=
```
*Kredensial login admin default untuk Web Console Camunda Cockpit adalah `demo`/`demo`.*

#### 4. Status & Pemantauan (Status & Monitoring)
*   **Cek Status Proses**:
    ```bash
    docker ps | grep lims-camunda
    ```
*   **Cockpit UI Monitoring**:
    Buka `http://localhost:8085/camunda/app/cockpit/` di browser untuk memantau instance workflow berjalan, riwayat tugas, kegagalan task (*incidents*), serta diagram BPMN aktif.

#### 5. Penelusuran Error (Tracing & Logs)
*   **Membaca Log Camunda (Tomcat/Spring-Boot)**:
    ```bash
    docker logs -f lims-camunda
    ```
    *Cari baris yang mengandung tulisan `ENGINE-00000` atau `ERROR` untuk melacak kegagalan eksekusi skrip Java delegate atau kegagalan koneksi database.*

---

## 12. Akses LIMS dari Internet (Ngrok Dev & Produksi Asli)

Untuk kebutuhan pengembangan (*development*), LIMS sering kali perlu diakses dari luar jaringan lokal (misalnya menggunakan HP via koneksi seluler). Sedangkan pada deployment produksi asli, kita menggunakan konfigurasi jaringan resmi.

---

#### A. Menggunakan Ngrok untuk Akses Internet saat Development
Ngrok membuat terowongan aman (*secure tunnel*) dari internet langsung ke port Nginx lokal Anda.

#### 1. Cara Menjalankan Ngrok

##### Skenario A: Menghubungkan Ngrok ke Nginx Load Balancer (Mendukung Multiple Server - Sangat Direkomendasikan)
Jika Anda ingin agar lalu lintas dari luar tetap melewati Load Balancer Nginx (sehingga request dibagi secara merata ke backend port 8081 dan 8091) menggunakan konfigurasi HTTPS port `8082` yang sudah diimplementasikan:

Jalankan Ngrok dengan mengarahkan langsung ke HTTPS port `8082` Nginx lokal Anda:
```bash
# Menghubungkan Ngrok ke HTTPS Port 8082 Nginx Load Balancer
ngrok http https://localhost:8082
```
*Catatan: Jika Nginx Anda mengaktifkan pencocokan host-name ketat pada server_name, Anda dapat menambahkan argumen `--host-header="lims.local"`:*
```bash
ngrok http https://localhost:8082 --host-header="lims.local"
```

Setelah dijalankan, Ngrok akan memberikan URL publik seperti:
`https://a1b2-c3d4.ngrok-free.app`

Dengan cara ini, APK disetting dengan `VITE_API_URL=https://a1b2-c3d4.ngrok-free.app/api`. Request dari HP akan masuk ke Nginx port 8082, dan Nginx secara dinamis membagi beban kerja ke backend port 8081 & 8091 (Load Balancing) secara otomatis!

##### Skenario B: Menghubungkan Ngrok Langsung ke Salah Satu Server Backend (Tanpa Load Balancer)
Jika Anda hanya ingin melakukan debugging cepat pada satu backend saja (misal backend port 8081) tanpa load balancing:
```bash
# Menghubungkan Ngrok langsung ke Go Backend port 8081
ngrok http 8081
```
Dengan cara ini, request langsung masuk ke Go backend port 8081 tanpa melewati Nginx, sehingga tidak ada pembagian beban kerja (no load balancing).

#### 2. Konfigurasi Variabel `.env` (Jika URL Ngrok Digunakan)
Jika Anda menggunakan URL publik Ngrok untuk pengujian terintegrasi (seperti webhook atau callback pihak ketiga), perbarui variabel `SERVER_DOMAIN` di file `.env` backend Anda:
```env
SERVER_DOMAIN=a1b2-c3d4.ngrok-free.app
```

---

### B. Dampak jika Tidak Menjalankan Ngrok (Selama Development)
Jika Ngrok tidak dijalankan selama masa pengembangan:
1. **Akses Terbatas:** Aplikasi LIMS hanya dapat diakses dari mesin lokal (`localhost`) atau perangkat lain yang berada dalam satu jaringan lokal (LAN) yang sama.
2. **Tidak Bisa Diakses via Seluler:** Anda tidak dapat menguji aplikasi menggunakan browser HP jika HP terhubung ke paket data seluler (di luar jaringan Wi-Fi lokal).
3. **Webhook Terputus:** Sistem luar tidak dapat mengirimkan callback atau notifikasi langsung ke server LIMS Anda (misalnya integrasi API dari sistem luar).

---

#### C. Konfigurasi Akses Jaringan Permanen Setelah Deployment (Produksi Asli)

Pada lingkungan produksi asli, kita **tidak** menggunakan Ngrok karena URL Ngrok bersifat sementara dan memiliki keterbatasan bandwidth. Sebagai gantinya, gunakan langkah-langkah standar berikut:

#### 1. IP Publik Statis & DNS
* Dapatkan **IP Publik Statis** dari ISP Anda atau gunakan layanan Cloud Virtual Machine (AWS, GCP, DigitalOcean, Alibaba Cloud) yang sudah menyediakan IP publik.
* Daftarkan nama domain resmi (contoh: `lims.perusahaan.com`).
* Pada panel penyedia domain Anda, arahkan **A Record** DNS domain tersebut ke IP Publik Server Anda:
  ```text
  Nama Host: lims.perusahaan.com  -->  Alamat IP: [IP_PUBLIK_SERVER]
  ```

#### 2. Port Forwarding di Router / Firewall (Jika Server On-Premise)
Jika server LIMS diletakkan di dalam jaringan kantor/pabrik (on-premise) di balik router:
* Buka pengaturan port forwarding (NAT) pada router utama Anda.
* Teruskan lalu lintas dari port internet luar berikut ke IP lokal server LIMS:
  * Port luar `80` (HTTP)  --> Port lokal server LIMS `8088` (atau `80`)
  * Port luar `443` (HTTPS) --> Port lokal server LIMS `8082` (atau `443`)

#### 3. Penyesuaian Konfigurasi Nginx (`server_name` & SSL Let's Encrypt)
Perbarui berkas `/etc/nginx/conf.d/lims.conf` agar mengenali nama domain resmi Anda pada parameter `server_name`:
```nginx
server {
    listen 80;
    server_name lims.perusahaan.com;
    return 301 https://$host$request_uri; # Redirect otomatis ke HTTPS
}

server {
    listen 443 ssl; # Port HTTPS standar produksi
    server_name lims.perusahaan.com;

    root /home/lims/lims1/frontend/dist;
    ...
}
```

Di lingkungan produksi asli, jangan gunakan sertifikat *self-signed*. Gunakan sertifikat SSL tepercaya dari **Let's Encrypt** secara gratis:
```bash
# Instal certbot untuk Nginx
sudo apt install certbot python3-certbot-nginx -y

# Jalankan certbot untuk mendapatkan & memasang SSL otomatis di konfigurasi Nginx
sudo certbot --nginx -d lims.perusahaan.com
```
Certbot akan secara otomatis memperbarui file konfigurasi Nginx untuk menggunakan sertifikat SSL tepercaya dan mengatur pengalihan (redirect) otomatis dari HTTP ke HTTPS.

#### 4. Penyesuaian Arsitektur Dedicated VM Nginx (Real VM)

Jika Nginx Load Balancer dipasang pada **dedicated VM** (VM khusus) yang terpisah dari VM Backend Aplikasi LIMS, ikuti penyesuaian parameter berikut:

##### A. Konfigurasi `set_real_ip_from` (Membaca IP Client Asli)
* **Pada VM Nginx Load Balancer (Edge Gateway)**:
  * Jika Nginx Load Balancer menerima request langsung dari internet (tanpa ada proxy lain di depannya seperti Cloudflare, AWS ALB, dll), Anda **tidak perlu** menggunakan `set_real_ip_from` karena Nginx dapat membaca IP client asli secara langsung melalui variabel bawaan `$remote_addr`.
  * Namun, jika Nginx berada di balik CDN/Proxy luar (seperti Cloudflare), Anda wajib mengatur IP trust range Cloudflare:
    ```nginx
    # Percayai header X-Forwarded-For dari subnet IP Cloudflare
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    # ... (tambahkan IP Cloudflare lainnya)
    real_ip_header X-Forwarded-For;
    ```
* **Pada VM Go Backend (Internal Server)**:
  * Jika di VM Backend juga dipasang Nginx lokal sebelum masuk ke aplikasi Go, Nginx lokal tersebut harus mempercayai IP VM Nginx Load Balancer agar tidak mencatat IP Load Balancer sebagai pengirim request:
    ```nginx
    # Misal IP VM Nginx Load Balancer adalah 192.168.10.10
    set_real_ip_from 192.168.10.10;
    real_ip_header X-Forwarded-For;
    real_ip_recursive on;
    ```

##### B. Konfigurasi `proxy_pass` untuk GoAccess (`/ws`)
* Pada Nginx Load Balancer, parameter `proxy_pass http://127.0.0.1:7890;` digunakan untuk meneruskan koneksi WebSocket GoAccess.
* **Jika GoAccess berjalan di VM yang sama dengan Nginx**: Tetap gunakan `127.0.0.1:7890`.
* **Jika GoAccess berjalan di VM Backend terpisah (misal VM-1 Backend IP `192.168.10.21`)**: Ubah parameter tersebut untuk menunjuk ke IP internal VM Backend tersebut:
  ```nginx
  location /ws {
      proxy_pass http://192.168.10.21:7890; # Arahkan ke VM tempat GoAccess berjalan
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
  }
  ```

##### C. Konfigurasi Aplikasi Mobile (HP) dengan Domain Resmi
Ketika LIMS sudah berjalan menggunakan domain resmi dengan SSL Let's Encrypt yang valid (misal `https://lims.perusahaan.com`):
1. HP client **tidak perlu lagi menggunakan port HTTP khusus `8087`** untuk bypass SSL.
2. HP client dapat langsung terhubung via HTTPS port standar `443` karena Let's Encrypt adalah Certificate Authority resmi yang dipercayai oleh sistem operasi Android secara bawaan.
3. Di HP Android, buka roda gigi (**Gear Icon**), pilih mode **Internet (Ngrok/Cloud)**, lalu masukkan alamat domain resmi Anda: `https://lims.perusahaan.com`. HP akan secara aman mengakses LIMS baik via Wi-Fi kantor maupun paket data internet seluler secara *seamless*.

---

## 13. Ringkasan Lokasi Berkas Log LIMS

Untuk memudahkan pemantauan (*monitoring*) dan pelacakan kesalahan (*debugging*), berikut adalah daftar seluruh berkas log dalam ekosistem LIMS beserta perintah untuk membacanya:

| Komponen | Nama Berkas Log | Path Absolut | Format | Perintah Membaca Log |
| :--- | :--- | :--- | :---: | :--- |
| **Nginx Web Server** | Access Log | `/var/log/nginx/lims_access.log` | Teks | `tail -f /var/log/nginx/lims_access.log` |
| **Nginx Web Server** | Error Log | `/var/log/nginx/lims_error.log` | Teks | `tail -f /var/log/nginx/lims_error.log` |
| **Go Backend 1 (8081)** | Systemd Log | *Terekam di journald* | Biner (systemd) | `sudo journalctl -u lims-backend-8081.service -f -n 100` |
| **Go Backend 2 (8091)** | Systemd Log | *Terekam di journald* | Biner (systemd) | `sudo journalctl -u lims-backend-8091.service -f -n 100` |
| **Go Backend 1 (8081)** | Traffic API Log | `/home/lims/lims1/backend/logs/api_traffic.log` | Teks | `tail -f /home/lims/lims1/backend/logs/api_traffic.log` |
| **Go Backend 1 (8081)** | SQL Query Log | `/home/lims/lims1/backend/logs/db_query.log` | Teks | `tail -f /home/lims/lims1/backend/logs/db_query.log` |
| **Go Backend 2 (8091)** | Traffic API Log | `/home/lims/lims2/backend/logs/api_traffic.log` | Teks | `tail -f /home/lims/lims2/backend/logs/api_traffic.log` |
| **Go Backend 2 (8091)** | SQL Query Log | `/home/lims/lims2/backend/logs/db_query.log` | Teks | `tail -f /home/lims/lims2/backend/logs/db_query.log` |
| **Model AI Retraining** | AI Training Log | `/home/lims/lims1/backend/logs/lims_ai-train-YYYYMMDD.log` | Teks | `cat /home/lims/lims1/backend/logs/lims_ai-train-*.log` |
| **Frontend 1 (3000)** | PM2 Output Log | `/home/lims/.pm2/logs/lims-frontend-3000-out.log` | Teks | `pm2 logs lims-frontend-3000` |
| **Frontend 1 (3000)** | PM2 Error Log | `/home/lims/.pm2/logs/lims-frontend-3000-error.log` | Teks | `pm2 logs lims-frontend-3000` |
| **Frontend 2 (3001)** | PM2 Output Log | `/home/lims/.pm2/logs/lims-frontend-3001-out.log` | Teks | `pm2 logs lims-frontend-3001` |
| **Frontend 2 (3001)** | PM2 Error Log | `/home/lims/.pm2/logs/lims-frontend-3001-error.log` | Teks | `pm2 logs lims-frontend-3001` |
| **Logrotate Schedule** | Nginx Rotate Log | `/var/log/logrotate_nginx.log` | Teks | `cat /var/log/logrotate_nginx.log` |
| **Logrotate Schedule** | Backend Rotate Log | `/var/log/logrotate_backend.log` | Teks | `cat /var/log/logrotate_backend.log` |
| **Logrotate Schedule** | Frontend Rotate Log | `/var/log/logrotate_frontend.log` | Teks | `cat /var/log/logrotate_frontend.log` |

> [!NOTE]
> **Penyimpanan Berkas Systemd Log (journald)**:
> Berkas log systemd backend yang diakses menggunakan `journalctl` disimpan secara fisik (persisten) di disk Linux pada direktori:
> `/var/log/journal/[machine-id]/` (contoh: `/var/log/journal/1f32c6465a29450093352d06f0af7a2e/`).
> Berkas ini disimpan dalam format **biner** (bukan teks biasa) demi keamanan, penghematan ruang penyimpanan, dan optimalisasi pencarian cepat. Untuk membacanya, Anda harus menggunakan perintah `journalctl`.

---

### A. Pembersihan & Pengosongan Log Biner secara Manual (Clean-Up Journald)
Jika direktori log biner systemd mulai memenuhi kapasitas penyimpanan disk Anda, Anda dapat melakukan pembersihan log lama secara manual menggunakan perintah berikut:
```bash
# 1. Bersihkan semua log yang berumur lebih dari 7 hari (Keep 7 hari terakhir)
sudo journalctl --vacuum-time=7d

# 2. Batasi kapasitas total penyimpanan berkas log biner menjadi maksimal 500MB
sudo journalctl --vacuum-size=500M
```

---

### B. Konfigurasi Batasan Masa Simpan Log Otomatis (Retention Configuration)
Agar sistem secara otomatis membatasi kapasitas log dan membuang log lama tanpa intervensi manual, Anda wajib mengonfigurasi berkas `/etc/systemd/journald.conf`:

1. Buka dan edit file konfigurasi:
   ```bash
   sudo nano /etc/systemd/journald.conf
   ```
2. Cari dan edit/tambahkan baris konfigurasi berikut (hilangkan tanda komentar `#` jika ada):
   ```ini
   [Journal]
   # Menjamin penyimpanan log ditulis permanen ke disk /var/log/journal/
   Storage=persistent

   # Batas maksimal ukuran total folder log biner di disk (misal: 1 Gigabyte)
   SystemMaxUse=1G

   # Batas ukuran maksimal per file log tunggal sebelum dirotasikan (misal: 100 Megabytes)
   SystemMaxFileSize=100M

   # Batas waktu retensi penyimpanan log secara otomatis (misal: disimpan selama 14 hari saja)
   MaxRetentionSec=14day
   ```
3. Simpan berkas tersebut, lalu jalankan perintah berikut untuk memuat ulang dan menerapkan konfigurasi journald yang baru:
   ```bash
   sudo systemctl restart systemd-journald
   ```

---

## 14. Ringkasan Perintah Manajemen Modul LIMS (Start, Stop, Status)

Berikut adalah tabel referensi cepat untuk memulai (*start*), menghentikan (*stop*), dan memeriksa status (*status check*) seluruh layanan/modul dalam ekosistem LIMS:

| Komponen | Nama Layanan / Proses | Perintah Menjalankan (Start) | Perintah Menghentikan (Stop) | Perintah Restart / Reload | Perintah Cek Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nginx Web Server** | Nginx Gateway | `sudo systemctl start nginx` | `sudo systemctl stop nginx` | `sudo systemctl restart nginx` (atau `reload`) | `sudo systemctl status nginx` |
| **Go Backend 1 (8081)** | Systemd: `lims-backend-8081` | `sudo systemctl start lims-backend-8081.service` | `sudo systemctl stop lims-backend-8081.service` | `sudo systemctl restart lims-backend-8081.service` | `sudo systemctl status lims-backend-8081.service` |
| **Go Backend 2 (8091)** | Systemd: `lims-backend-8091` | `sudo systemctl start lims-backend-8091.service` | `sudo systemctl stop lims-backend-8091.service` | `sudo systemctl restart lims-backend-8091.service` | `sudo systemctl status lims-backend-8091.service` |
| **Frontend 1 (3000)** | PM2: `lims-frontend-3000` | `pm2 start lims-frontend-3000` | `pm2 stop lims-frontend-3000` | `pm2 restart lims-frontend-3000` | `pm2 status lims-frontend-3000` |
| **Frontend 2 (3001)** | PM2: `lims-frontend-3001` | `pm2 start lims-frontend-3001` | `pm2 stop lims-frontend-3001` | `pm2 restart lims-frontend-3001` | `pm2 status lims-frontend-3001` |
| **PostgreSQL DB (Local)** | Standalone Postgres | `sudo systemctl start postgresql` | `sudo systemctl stop postgresql` | `sudo systemctl restart postgresql` | `sudo systemctl status postgresql` |
| **PostgreSQL DB (Docker)** | Container: `lims-postgres` | `docker start lims-postgres` | `docker stop lims-postgres` | `docker restart lims-postgres` | `docker ps -f name=lims-postgres` |
| **Object Storage** | Container: `lims-minio` | `docker start lims-minio` | `docker stop lims-minio` | `docker restart lims-minio` | `docker ps -f name=lims-minio` |
| **Workflow Engine** | Container: `lims-camunda` | `docker start lims-camunda` | `docker stop lims-camunda` | `docker restart lims-camunda` | `docker ps -f name=lims-camunda` |
| **Cron Jobs** | Linux Cron Daemon | `sudo systemctl start cron` | `sudo systemctl stop cron` | `sudo systemctl restart cron` | `sudo systemctl status cron` |
| **Real-Time Dashboard** | GoAccess WebSocket | *Jalan otomatis di background jika di-spawn* | `pkill goaccess` | *Jalankan kembali kueri GoAccess* | `ps aux \| grep goaccess` |

> [!NOTE]
> Seluruh perintah PM2 wajib dijalankan di bawah pengguna **`lims`** (gunakan `sudo su - lims` terlebih dahulu) untuk mencegah ketidakcocokan hak akses file log atau sesi PM2 antar-user.

---

## 15. Strategi Manajemen Versi Aplikasi Android LIMS

Bagian ini menjelaskan arsitektur untuk memantau versi aplikasi Android LIMS yang aktif digunakan oleh user serta mekanisme pemblokiran paksa (*force upgrade*) untuk menjamin keselarasan versi API backend. Fitur ini telah sepenuhnya terintegrasi dalam sistem LIMS.

### A. Mekanisme Pemantauan Versi Android Klien
1. **Custom Header HTTP (Direkomendasikan)**:
   Setiap kali aplikasi Android mengirimkan permintaan API ke backend, aplikasi menyertakan informasi versi pada header HTTP:
   * `X-App-Version: 1.0` (dikonfigurasi via `VITE_APP_VERSION` di berkas `.env` frontend)
   * `X-App-Platform: Android` (dideteksi dinamis menggunakan Capacitor)
2. **Pencatatan Audit Sesi Login (`user_sessions`)**:
   Saat operator sukses melakukan login dari HP Android, backend menangkap header di atas dan mencatat informasi versi klien ke kolom `client_version` dan `client_platform` pada tabel `lims.user_sessions`. 
   
   **DDL untuk menambahkan kolom:**
   ```sql
   ALTER TABLE lims.user_sessions 
   ADD COLUMN client_version VARCHAR(50) DEFAULT NULL,
   ADD COLUMN client_platform VARCHAR(50) DEFAULT NULL;
   ```
   
   Admin dapat memonitor statistik versi aktif via query SQL:
   ```sql
   SELECT client_version, client_platform, COUNT(*) 
   FROM lims.user_sessions 
   GROUP BY client_version, client_platform;
   ```
3. **Analisis Traffic User-Agent (NGINX Logs)**:
   Informasi versi juga dapat ditangkap oleh NGINX dengan memetakan User-Agent khusus (misalnya `LIMS-Android/1.0`) dan divisualisasikan melalui GoAccess.

### B. Mekanisme Pemblokiran & Paksa Upgrade (Force Upgrade)
Untuk memblokir pengguna yang menggunakan versi aplikasi Android di bawah batas minimum (misal di bawah `1.1`), sistem menerapkan langkah-langkah berikut:

1. **Parameterisasi Batas Versi Minimum di Database**:
   Tambahkan parameter global baru pada tabel `lims.global_parameters` (diatur dinamis via database):
   * `MIN_ANDROID_VERSION` (default: `1.1`) - Versi minimal aplikasi Android LIMS yang diperbolehkan.
   * `ANDROID_DOWNLOAD_URL` - URL unduh langsung APK LIMS versi terbaru.
2. **Endpoint Pemeriksaan Versi (Public Endpoint)**:
   Backend Go menyediakan rute publik `/api/check-version` yang diakses oleh Android klien saat aplikasi pertama kali dibuka (startup) dengan menyuplai query parameter `version` dan `platform`:
   * **Respons API (Upgrade Dipaksa)**:
     ```json
     {
       "status": "FORCE_UPGRADE",
       "minimum_version": "1.1",
       "download_url": "https://lims.perusahaan.com/downloads/lims-v1.1.apk",
       "message": "Versi aplikasi Anda (1.0) sudah tidak didukung. Harap perbarui ke versi 1.1 demi keamanan dan stabilitas."
     }
     ```
3. **Penanganan Sisi Android (Blocking Overlay)**:
   Jika aplikasi React Frontend mendeteksi respons `"status": "FORCE_UPGRADE"`, aplikasi menampilkan **blocking dialog overlay** glassmorphism premium berwarna merah-gelap yang mengunci seluruh interaksi sistem dan mengarahkan pengguna untuk mengunduh APK LIMS terbaru melalui link `download_url`.
4. **Middleware Validasi API (Backend Hard-Block Guard)**:
   Sebagai perlindungan lapis kedua, backend menerapkan middleware **`VersionCheckMiddleware`** pada seluruh rute API. Middleware ini otomatis memeriksa header `X-App-Version` pada request masuk. Jika versi di bawah `MIN_ANDROID_VERSION`, request langsung ditolak dengan status HTTP `426 Upgrade Required` dan response:
   ```json
   {
     "error": "UPGRADE_REQUIRED",
     "message": "Versi aplikasi LIMS Android Anda sudah tidak didukung. Harap perbarui ke versi terbaru."
   }
   ```

---

## 16. Panduan Pembuatan APK Android (Berbagai Skema Jaringan & Target)

Proses kompilasi APK Android LIMS dibagi menjadi beberapa tipe build (Debug vs Release) dan skema jaringan (Ngrok vs Wi-Fi Lokal vs Domain Resmi). Semua konfigurasi API Endpoint dipasang secara statis (*baked-in*) ke aset web pada saat proses build frontend.

### A. Matriks Konfigurasi API Endpoint (Sisi Frontend)

Sebelum melakukan build, sesuaikan berkas `frontend/.env.production` (atau `.env`) sesuai dengan target pengujian Anda:

| Skema Jaringan | Kasus Penggunaan | Konfigurasi `VITE_API_URL` | Konfigurasi `VITE_APP_VERSION` | Contoh Nilai |
| :--- | :--- | :--- | :--- | :--- |
| **1. Ngrok Tunnel** | Pengujian jarak jauh via internet (HP client via paket data, Server di WSL laptop). | `https://[SUBDOMAIN_NGROK].ngrok-free.dev/api` | Harus sama dengan `versionName` di Gradle. | `https://police-sacred-pound.ngrok-free.dev/api` |
| **2. Wi-Fi Lokal (Non-Ngrok)** | Pengujian cepat tanpa internet. HP client dan laptop server harus terhubung ke satu router/Wi-Fi yang sama. | `https://lims.local:8082/api` (Lewat Nginx HTTPS Load Balancer dengan pemetaan IP) | Harus sama dengan `versionName` di Gradle. | `https://lims.local:8082/api` |
| **3. Domain Resmi & IP Publik** | Deployment rilis produksi final untuk pengguna nyata dengan IP Publik / Domain Resmi. | `https://[DOMAIN_RESMI_PERUSAHAAN]/api` | Harus sama dengan `versionName` di Gradle. | `https://lims.perusahaan.com/api` |

#### Penjelasan Penting Konfigurasi Berkas `.env.production`:
1. **Untuk Deployment Web Server (lims1 & lims2):**
   * Aset web untuk diakses via browser sebaiknya dikompilasi dengan `VITE_API_URL=/api`. Hal ini karena web disajikan dari domain yang sama, dan Nginx bertindak sebagai reverse proxy yang meneruskan path `/api` ke cluster backend secara otomatis.
2. **Untuk Build Aplikasi Mobile (APK):**
   * Aplikasi mobile membutuhkan **alamat absolut** (bukan relatif `/api`) karena webview berjalan secara internal di dalam HP (`https://localhost`). Jika menggunakan `/api`, aplikasi mobile akan crash dengan error `Unexpected token '<'`.
3. **Skenario Wi-Fi Lokal (Mendukung Multiple Server / Load Balancer Nginx):**
   * Hubungkan laptop server dan HP Android ke satu router Wi-Fi yang sama.
   * Cari IP lokal laptop server Anda (misal `192.168.0.103` - dapat dilihat via perintah `ipconfig` di Windows Command Prompt).
   
   ###### Metode A: Lewat HTTPS Port 8082 (Membutuhkan Instalasi Sertifikat SSL di HP)
   * **Pemetaan Host Lokal (`lims.local`):** Petakan nama domain `lims.local` ke IP lokal laptop server Anda (`192.168.0.103`) di jaringan lokal atau file hosts perangkat.
   * Atur `VITE_MOBILE_API_URL=https://lims.local:8082/api` pada berkas `.env.production` sebelum melakukan build APK.
   * *Catatan:* Karena menggunakan SSL HTTPS lokal, pastikan sertifikat SSL untuk `lims.local` (atau root CA pembuatnya) telah di-install dan dipercaya (*trusted*) pada HP Android Anda agar WebView tidak memblokir koneksi akibat error SSL self-signed.

   ###### Metode B: Lewat HTTP Port 8087 (Paling Mudah, Tanpa Internet, Bebas Kendala SSL)
   * Karena kita telah mengaktifkan **`android:usesCleartextTraffic="true"`** pada berkas `AndroidManifest.xml` aplikasi, HP Android diizinkan melakukan request HTTP biasa tanpa enkripsi (bebas dari pemblokiran SSL self-signed).
   * **Tambahkan Blok Server HTTP Baru di Nginx (`/etc/nginx/conf.d/lims.conf`):**
     Tambahkan server block ini di sebelah blok port 8082 Anda:
     ```nginx
     # --- COPY-PASTE KE CONFIG NGINX (UNTUK WI-FI LOKAL LOAD BALANCER HTTP) ---
     server {
         listen 8087;
         server_name localhost 192.168.0.103 212.85.24.33; # Ganti dengan IP laptop (Wi-Fi) atau IP Publik VPS Anda

         client_max_body_size 50M;

         # Proxy API ke Go Backend Cluster (Load Balancer ke Port 8081 & 8091)
         location /api {
             proxy_pass http://lims_backend_cluster;
             proxy_http_version 1.1;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
         }

         # Sajikan uploads langsung dari shared folder
         location /uploads/ {
             alias /home/lims/shared_uploads/;
             expires 30d;
         }

         # Sajikan unduhan APK langsung dari shared folder
         location /downloads/ {
             alias /home/lims/shared_downloads/;
             expires 30d;
         }
     }
     # -------------------------------------------------------------------------
     ```
     *Reload Nginx setelah disimpan:* `sudo nginx -t && sudo systemctl reload nginx`
   * Atur `VITE_MOBILE_API_URL=http://192.168.0.103:8087/api` pada berkas `.env.production` laptop Anda sebelum melakukan build APK.
   * Dengan cara ini, aplikasi mobile di HP Anda dapat mengakses API melalui HTTP biasa di port 8087 (bebas error SSL), dan Nginx tetap membagi bebannya secara merata ke backend port 8081 & 8091.

4. **Skenario Domain dengan IP Publik (Produksi Asli):**
   * Petakan IP Publik server Anda ke domain resmi (misal `lims.perusahaan.com`) di DNS panel.
   * Atur `VITE_MOBILE_API_URL=https://lims.perusahaan.com/api` (jika Nginx menggunakan port HTTPS standar `443`) atau `https://lims.perusahaan.com:8082/api` (jika menggunakan port HTTPS custom `8082`).

> [!CAUTION]
> Jangan menggunakan URL relatif `/api` pada build APK Android. Hal ini akan menyebabkan error `Unexpected token '<'` karena WebView akan memanggil `https://localhost/api` yang mengembalikan berkas HTML statis.

---

### B. Alur Kompilasi Aset Web (Vite & Capacitor Sync)

Setiap kali Anda mengubah konfigurasi `.env` atau berkas source code frontend, Anda **WAJIB** menyelaraskan aset web ke dalam proyek native Android sebelum melakukan kompilasi APK.

Jalankan perintah berikut di terminal komputer Windows Anda:
```powershell
# Pindah ke direktori frontend
cd D:\Data_NK\Project5\AI\LIM_System_Linux_OK\frontend

# Jalankan kompilasi React dan salin otomatis ke folder assets android
npm run cap:sync
```
*(Perintah di atas akan menjalankan `npm run build` -> `npx cap copy` -> `npx cap sync` secara otomatis).*

---

### C. Panduan Menghasilkan File APK

Masuk ke folder proyek native Android Anda:
```powershell
cd D:\Data_NK\Project5\AI\LIM_System_Linux_OK\frontend\android
```

#### 1. Membuat APK Versi Debug (Development / Pengujian Cepat)
APK Debug digunakan untuk pengembangan harian dan proses instalasi cepat tanpa perlu verifikasi tanda tangan digital rilis resmi.
* **Via Terminal CLI**:
  ```powershell
  # Langsung jalankan build (cepat karena menggunakan cache)
  ./gradlew assembleDebug
  ```
  *(Catatan: Jika Anda baru saja menambahkan plugin baru atau mengalami error cache, jalankan `./gradlew clean` terlebih dahulu sebelum `./gradlew assembleDebug`).*
  File output berada di: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`
* **Via Android Studio (Rekomendasi untuk Live Debugging)**:
  1. Buka folder `frontend/android` menggunakan Android Studio.
  2. Sambungkan HP Android Anda via kabel USB (aktifkan USB Debugging di HP).
  3. Klik tombol **Run 'app'** (ikon Play hijau) atau jalankan `npx cap run android` di terminal. Aplikasi akan otomatis terkompilasi, terpasang, dan langsung berjalan di HP Anda.

#### 2. Membuat APK Versi Release (Produksi / Siap Distribusi)
APK Release digunakan untuk pengetesan resmi, distribusi internal, atau unggahan ke toko aplikasi. Versi ini sudah ditandatangani secara resmi menggunakan kunci rilis LIMS.
* **Perintah Build**:
  ```powershell
  ./gradlew clean
  ```
  ```powershell
  ./gradlew assembleRelease
  ```
  File output berada di: `frontend/android/app/build/outputs/apk/release/app-release.apk`
  
  *(Berkas ini ditandatangani menggunakan berkas `lims-release-key.jks` dengan password `Nkl@130200` sesuai dengan konfigurasi `signingConfigs` di build.gradle).*

> [!IMPORTANT]
> **Penting untuk Versi Rilis:**
> 1. Buka berkas [build.gradle](file:///d:/Data_NK/Project5/AI/LIM_System_Linux_OK/frontend/android/app/build.gradle), temukan blok `defaultConfig`, lalu naikkan `versionCode` (angka bulat naik terus) dan sesuaikan `versionName` dengan versi frontend:
>    ```groovy
>    android {
>        defaultConfig {
>            applicationId "com.lims.app"
>            versionCode 4      // <-- UBAH INI (Angka bulat naik terus, misal 2 -> 3 -> 4)
>            versionName "1.3"  // <-- UBAH INI (Harus sama dengan VITE_APP_VERSION di .env.production)
>        }
>    }
>    ```
> 2. Pastikan Anda melakukan **Uninstall total** aplikasi LIMS lama yang terpasang di HP Anda sebelum memasang APK rilis baru ini untuk menghindari error *App not installed* akibat bentrok tanda tangan digital debug/release.

---

### D. Konsep In-App Auto-Update (Self-Update) Tanpa Google Play Store

Karena aplikasi APK didistribusikan secara mandiri di luar Google Play Store, proses instalasi pembaruan otomatis di latar belakang secara diam-diam (*silent background update*) tidak diizinkan oleh sistem keamanan Android (kecuali perangkat di-root). 

Namun, LIMS dapat diintegrasikan dengan fitur **In-App Auto-Update (Self-Update)** dengan alur sebagai berikut:

1. **Deteksi Pembaruan:** Aplikasi mendeteksi respon `"status": "FORCE_UPGRADE"` melalui API `/api/check-version` saat startup.
2. **Download File APK:** Aplikasi menggunakan plugin Capacitor (seperti `@capacitor-community/http` or `@capgo/capacitor-updater`) untuk mengunduh berkas APK baru langsung dari server (`ANDROID_DOWNLOAD_URL`) ke penyimpanan lokal cache perangkat Android.
3. **Memicu Proses Instalasi (Package Installer Intent):** Setelah pengunduhan selesai, aplikasi memanggil fungsi native Android menggunakan **FileProvider** untuk meluncurkan antarmuka sistem penginstalan aplikasi:
   ```java
   Intent intent = new Intent(Intent.ACTION_VIEW);
   intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
   intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
   context.startActivity(intent);
   ```
4. **Interaksi Pengguna:** Layar sistem Android akan menampilkan dialog konfirmasi kepada pengguna: *"Apakah Anda ingin memasang pembaruan untuk aplikasi yang sudah ada ini?"*. Pengguna cukup mengetuk **"Update / Perbarui"** dan sistem akan menyelesaikan instalasinya secara otomatis dan membuka kembali aplikasi LIMS yang baru.

---

#### E. Troubleshooting Koneksi Jaringan Wi-Fi Lokal & Windows Firewall

Ketika menguji aplikasi LIMS di HP Android Anda menggunakan skema **Wi-Fi Lokal Tanpa Internet (Metode B - Port 8087)** atau **Ngrok (Internet)**, lakukan pengecekan berikut untuk menyelesaikan error `Failed to fetch` atau kendala konektivitas:

#### 1. Fitur Pengaturan Server API Dinamis (Bypass Rebuild APK)
Mulai versi `1.4`, Anda tidak perlu lagi melakukan kompilasi ulang APK jika IP laptop server Anda berubah. Kami telah menambahkan tombol roda gigi (**Gear Icon**) di halaman Login aplikasi mobile LIMS:
* **Cara Menggunakan:**
  1. Buka aplikasi LIMS di HP Anda.
  2. Ketuk ikon roda gigi (**Gear**) di pojok kanan atas kartu Login.
  3. Pilih mode **Wi-Fi Lokal** jika ingin terhubung ke laptop via router lokal, lalu masukkan **IP Laptop Server** aktif Anda (misal `192.168.1.50`). Port HTTP `8087` akan otomatis digunakan.
  4. Pilih mode **Internet (Ngrok)** jika ingin mengakses dari luar menggunakan data seluler, lalu masukkan **URL Ngrok** aktif Anda (misal `https://xxxx.ngrok-free.app`).
  5. Ketuk tombol **Tes Koneksi** untuk memverifikasi. Jika berhasil terhubung, indikator status akan berubah menjadi hijau **"Terhubung"**.
  6. Ketuk **Simpan & Terapkan** untuk menyimpan konfigurasi dan memicu pemuatan ulang (*reload*) aplikasi.

#### 2. Masalah Perubahan IP Laptop Dinamis (DHCP Router)
Router Wi-Fi sering memberikan IP baru secara dinamis ke laptop Anda ketika terhubung kembali. Jika koneksi HP tiba-tiba terputus:
* **Solusi:**
  1. Periksa IP laptop aktif saat ini (buka Command Prompt di Windows, jalankan `ipconfig`, cari bagian *IPv4 Address* di bawah adapter Wi-Fi aktif, misal `192.168.1.50`).
  2. Buka menu roda gigi di HP Anda, ganti IP lama dengan IP aktif saat ini, ketuk **Tes Koneksi**, lalu **Simpan & Terapkan**. Anda tidak perlu menginstal ulang APK.

#### 3. Masalah Pengalihan Paket Data Seluler (Smart Network Switch)
Pada HP Android modern, sistem akan secara otomatis mengalihkan koneksi ke paket data seluler jika mendeteksi bahwa Wi-Fi lokal yang terhubung **tidak memiliki akses internet** (karena Anda mematikan koneksi internet eksternal pada router tersebut).
* **Solusi:** Matikan **Paket Data Seluler (Mobile Data)** di HP Anda secara total selama pengujian offline, dan biarkan HP Anda hanya terhubung ke Wi-Fi lokal laptop server Anda.

#### 4. Windows Defender Firewall Memblokir Koneksi Masuk
Sistem operasi Windows pada laptop Anda secara default memblokir semua request masuk dari perangkat lain di jaringan lokal ke port custom Nginx (seperti port 8082 untuk HTTPS atau port 8087 untuk HTTP).
* **Solusi:** Jalankan **PowerShell sebagai Administrator** pada komputer Windows Anda, kemudian salin dan jalankan perintah berikut untuk membuka port Nginx di Windows Firewall:
  ```powershell
  # Membuka port HTTPS 8082
  New-NetFirewallRule -DisplayName "LIMS Nginx HTTPS" -Direction Inbound -LocalPort 8082 -Protocol TCP -Action Allow

  # Membuka port HTTP 8087 (Wi-Fi Mobile)
  New-NetFirewallRule -DisplayName "LIMS Nginx HTTP Mobile" -Direction Inbound -LocalPort 8087 -Protocol TCP -Action Allow
  ```

#### 5. Pemblokiran Mixed Content oleh Android WebView
Capacitor menyajikan file aplikasi di dalam HP menggunakan skema HTTPS (`https://localhost`). Jika aplikasi menembak URL HTTP biasa (`http://192.168.1.50:8087/api`), WebView Android akan memblokirnya karena dianggap tidak aman (*Mixed Content*).
* **Solusi:** Pastikan parameter `"androidScheme"` pada berkas `capacitor.config.json` diatur ke **`"http"`**:
  ```json
  "server": {
    "androidScheme": "http",
    "cleartext": true
  }
  ```
  *(Dengan skema http, aplikasi dijalankan pada http://localhost sehingga WebView mengizinkan request HTTP ke laptop port 8087 tanpa pemblokiran).*

#### 6. Uji Coba Diagnostik Awal Melalui Browser HP
Sebelum menjalankan aplikasi LIMS, pastikan HP Anda secara fisik bisa menghubungi laptop server:
* Buka browser (Google Chrome / Safari) di HP Anda, lalu buka URL:
  `http://<IP_LAPTOP_SERVER>:8087/api/check-version?version=1.4&platform=android` (misal `http://192.168.1.50:8087/api/check-version?version=1.4&platform=android`)
* Jika browser menampilkan teks data JSON seperti `{"status":"OK"}`, artinya jalur koneksi Wi-Fi lokal dan firewall Anda sudah benar. Jika loading terus-menerus atau error (ERR_ADDRESS_UNREACHABLE), router, segmen subnet, atau firewall laptop Anda masih bermasalah.

---

### F. Cara Remote Debugging (Tracing) WebView HP via Chrome DevTools

Jika aplikasi LIMS di HP Anda mengalami error `Failed to fetch` tetapi Anda tidak tahu apa penyebab pastinya, Anda dapat melacak (*tracing*) log console dan network request yang dikirimkan oleh WebView HP secara langsung dari laptop Anda:

1. **Gunakan APK Versi Debug (`app-debug.apk`):**
   * Android mematikan fitur inspeksi WebView secara default pada APK Release demi alasan keamanan.
   * Pastikan Anda menginstal berkas debug APK yang terletak di:
     `frontend/android/app/build/outputs/apk/debug/app-debug.apk`
2. **Aktifkan USB Debugging di HP Android Anda:**
   * Masuk ke **Pengaturan HP** $\rightarrow$ **Tentang Ponsel** $\rightarrow$ **Informasi Perangkat Lunak**.
   * Ketuk **Nomor Versi (Build Number)** sebanyak **7 kali** hingga muncul pesan "Mode pengembang aktif".
   * Buka menu baru **Pilihan Pengembang (Developer Options)** di Pengaturan, dan aktifkan **USB Debugging (Mendebug USB)**.
3. **Hubungkan HP ke Laptop Menggunakan Kabel USB Data:**
   * Pastikan kabel USB yang Anda gunakan mendukung transfer file (bukan hanya kabel charger).
   * Pada HP Anda, ubah mode koneksi USB menjadi **MTP / File Transfer**.
   * Izinkan pop-up konfirmasi *"Izinkan mendebug USB dari komputer ini?"* yang muncul di layar HP.
4. **Buka Inspektur Chrome di Laptop:**
   * Buka browser Google Chrome di laptop Anda, lalu masuk ke alamat:
     `chrome://inspect`
   * Pastikan aplikasi LIMS sudah dibuka di HP Anda.
   * Nama HP Anda dan tulisan **LIM System (com.lims.app)** akan muncul di bawah bagian **Remote Target / Devices**.
   * Klik tombol **inspect** di bawah nama aplikasi tersebut. Jendela Developer Tools laptop akan terbuka untuk memantau log error konsol dan jaringan HP secara real-time.
