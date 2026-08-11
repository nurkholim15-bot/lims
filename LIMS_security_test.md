# 🛡️ LIMS Security Testing & Audit Documentation

Dokumen ini berisi daftar standar keamanan (*Security Checklists*), metodologi pengujian, serta bukti eksekusi (*Test Execution Evidence*) untuk **Laboratory Information Management System (LIMS)**.

---

## 📌 1. Tabel Checklist & Standard Requirement Keamanan LIMS (22 Item)

| No | Kategori Keamanan | Check Item (Standard Requirement) | Comply | Temuan / Catatan Sistem | Cara Testing (Langkah-Langkah Pengujian) |
|---|---|---|:---:|---|---|
| **1** | **Authentication** | **JWT Secret Protection**: Kunci rahasia JWT hanya boleh dibaca dari `.env` dan tidak boleh memiliki fallback di dalam kode. | `✔ Yes` | Sistem membaca dari `.env`. Jika `.env` tidak terkonfigurasi, aplikasi wajib menolak boot (*fatal error*). | **1. Code Audit:** Inspect `middleware/auth.go` & `controllers/auth_controller.go`. <br>**2. Env Isolation:** Hapus `JWT_SECRET` di `.env` & restart backend. <br>**3. Verifikasi:** Backend harus crash/stop (tidak boleh ada fallback string `"secret"`). |
| **2** | **Authentication** | **Token Transmission**: Token autentikasi tidak boleh dikirim melalui URL / Query Parameter untuk mencegah kebocoran di log. | `✔ Yes` | Token JWT dipasang di HTTP Headers / HttpOnly Cookie. | **1. API Request:** Kirim `GET /api/v1/assets?token=<JWT>` tanpa Header Auth. <br>**2. Log Audit:** Cek log Nginx / Backend. <br>**3. Verifikasi:** API menolak dengan `401 Unauthorized`. Token tidak bocor di web log. |
| **3** | **Session Mgmt** | **Secure Token Storage**: Token harus disimpan di HttpOnly Cookies agar kebal dari pencurian skrip jahat (XSS). | `✔ Yes` | Token disimpan di `HttpOnly` & `Secure` Cookie. Local Storage dibersihkan dari token JWT. | **1. DevTools Audit:** Login di LIMS, buka F12 -> **Application** -> **Local Storage** & **Cookies**. <br>**2. XSS Test:** Jalankan `console.log(localStorage.getItem('auth_token'))`. <br>**3. Verifikasi:** Local Storage tidak menyimpan token. Cookie `auth_token` memiliki flag `HttpOnly`. |
| **4** | **Availability** | **Rate Limiting**: Pembatasan jumlah request (terutama endpoint `/login`) untuk mencegah Brute Force. | `✔ Yes` | Middleware Gin Rate Limiter membatasi login max 10 RPM & general API 500 RPM. | **1. Brute Force Simulation:** Jalankan cURL loop 20x request login dalam 5 detik. <br>**2. Verifikasi:** Request ke-1 s/d N = `401`, request N+1 = `429 Too Many Requests`. |
| **5** | **Authorization** | **Dynamic Role Verification**: Sistem tidak boleh menggunakan hardcoded string untuk verifikasi Role (misal bypass "ADMIN"). | `✔ Yes` | Pengecekan role dinamis berdasarkan relasi tabel `roles` dan ID user di database. | **1. Code Audit:** Inspeksi `middleware/role_check.go`. <br>**2. Escalation Test:** User role biasa mencoba memanggil API khusus Admin. <br>**3. Verifikasi:** Akses ditolak (`403 Forbidden`). |
| **6** | **Authentication** | **Password Hashing**: Password user wajib di-hash menggunakan algoritma kuat (Bcrypt). | `✔ Yes` | LIMS menggunakan algoritma `Bcrypt` dengan cost factor 10 saat register/login. | **1. DB Query:** Jalankan `SELECT username, password FROM mecs.users;`. <br>**2. Verifikasi:** Kolom password diawali `$2a$` / `$2b$` (hash 60 karakter), bukan plaintext. |
| **7** | **Data Protection** | **Encrypted Configs**: Kredensial sensitif di `.env` (password DB & Minio) wajib terenkripsi. | `✔ Yes` | Sistem membaca password terenkripsi via AES (`DB_PASSWORD_ENCRYPTED`). | **1. File Audit:** Periksa file `.env` di server backend. <br>**2. Verifikasi:** Password database berupa ciphertext Base64 AES, bukan teks terbuka. |
| **8** | **Data Protection** | **Secure Data in Transit**: Komunikasi client-server wajib menggunakan enkripsi TLS/HTTPS. | `✔ Yes` | Server Nginx & Go dikonfigurasi dengan sertifikat SSL (TLS v1.2/v1.3). | **1. Protocol Audit:** Akses `http://lims.local` via cURL. <br>**2. Traffic Sniffing:** Cek Wireshark saat login. <br>**3. Verifikasi:** HTTP otomatis redirect `301` ke `https://`, lalu lintas data terenkripsi. |
| **9** | **Injection** | **SQL Injection Prevention**: Kebal dari injeksi database dengan Prepared Statements. | `✔ Yes` | GORM ORM secara otomatis melakukan parameter binding & escaping SQL injection. | **1. Automated Scanning:** Jalankan `sqlmap -u "https://lims.local/api/v1/assets?search=test*"`. <br>**2. Manual Payload:** Input `' OR '1'='1` pada pencarian. <br>**3. Verifikasi:** Tidak ada error SQL Postgres. |
| **10** | **Injection** | **Cross-Site Scripting (XSS) Prevention**: Output HTML di-escape sebelum di-render ke user. | `✔ Yes` | React JS secara default meng-escape semua string JSX. | **1. Stored XSS:** Input `<script>alert('XSS')</script>` pada nama asset. <br>**2. Verifikasi:** Browser menampilkan teks murni `<script>...` dan script tidak dieksekusi. |
| **11** | **File Security** | **File Upload Controls**: Pembatasan ukuran file dan isolasi penyimpanan malware. | `✔ Yes` | Terdapat `MAX_UPLOAD_SIZE` dan file disimpan terisolasi di MinIO Object Storage. | **1. Size Test:** Upload file > 50MB. <br>**2. Extension Test:** Upload file `.php` / `.exe`. <br>**3. Verifikasi:** File besar ditolak `413`, ekstensi terlarang ditolak `400`. |
| **12** | **Configuration** | **CORS Policy**: CORS dikonfigurasi membatasi request dari domain luar. | `✔ Yes` | `CORSWithWhitelist` middleware membatasi Access-Control-Allow-Origin dari `.env`. | **1. Origin Spoofing:** `curl -I -X OPTIONS https://lims.local/api/v1/assets -H "Origin: https://attacker.com"`. <br>**2. Verifikasi:** Response menolak origin asing. |
| **13** | **Configuration** | **Production Error Handling**: Stack trace / log internal tidak boleh bocor ke End-User. | `✔ Yes` | Setting `GIN_MODE=release` menyembunyikan stack trace internal Go dari response JSON. | **1. Trigger 500 Error:** Kirim payload JSON korup ke backend. <br>**2. Verifikasi:** Response JSON hanya menampilkan `{"message":"Internal Server Error"}` tanpa stack trace. |
| **14** | **Audit & Logging** | **Activity Audit Trail**: Transaksi kritikal (serah terima asset) harus tercatat. | `✔ Yes` | Terrekam di tabel `mecs.asset_logs` dan DB Query logging. | **1. Action Execution:** Lakukan transaksi serah terima asset. <br>**2. DB Audit:** `SELECT * FROM mecs.asset_logs ORDER BY created_at DESC;`. <br>**3. Verifikasi:** Terrekam User, Timestamp, Aksi, & IP. |
| **15** | **Availability** | **Database Resource Limits**: Batasan koneksi database untuk mencegah Resource Exhaustion. | `✔ Yes` | Database pool disetel ketat (`MaxIdleConns`, `MaxOpenConns`) di `db.go`. | **1. Stress Test:** Jalankan 500 concurrent request via `wrk`. <br>**2. DB Check:** Monitor `pg_stat_activity`. <br>**3. Verifikasi:** Koneksi DB aktif tidak melebihi batas pool. |
| **16** | **Validation** | **Input Data Validation**: Validasi tipe data dan kewajiban isi formulir secara strict. | `✔ Yes` | Struct Binding Validation dari Gin menolak data korup di layer controller. | **1. Invalid Payload:** Kirim request POST tanpa required field. <br>**2. Verifikasi:** Server menolak dengan HTTP `400 Bad Request` dan pesan validasi spesifik. |
| **17** | **Authorization** | **Role-Based Access Control (RBAC)**: Hak akses menu disesuaikan secara dinamis via relasi tabel. | `✔ Yes` | Tabel `role_menus` mengontrol otorisasi spesifik per role. | **1. Privilege Bypassing:** Login sebagai Operator, panggil API `/admin/users`. <br>**2. Verifikasi:** Backend menolak dengan status `403 Forbidden`. |
| **18** | **System Security** | **Directory Traversal Protection**: Tidak mengekspos direktori/file sistem operasi internal. | `✔ Yes` | Router Go dan Nginx menonaktifkan directory listing (`autoindex off`). | **1. Traversal Attack:** `GET /public/../../../../etc/passwd` atau `win.ini`. <br>**2. Verifikasi:** Response `404 Not Found` / `403 Forbidden`. |
| **19** | **Data Protection** | **Mass Assignment Protection**: Membatasi kolom DB yang boleh di-update oleh user. | `✔ Yes` | Pembaruan data LIMS menggunakan DTO Struct khusus & Select/Omit dari GORM. | **1. Field Injection:** Kirim `PUT /api/v1/users/profile` dengan menyisipkan `"role":"ADMIN"`. <br>**2. Verifikasi:** Kolom `role` di DB tidak berubah. |
| **20** | **Database Sec** | **Schema Isolation**: Aplikasi berjalan di schema khusus untuk mencegah bentrok data. | `✔ Yes` | LIMS menggunakan custom schema (`DB_SCHEMA=mecs`) di PostgreSQL. | **1. DB Audit:** Jalankan `\dn` dan `\dt mecs.*` di PostgreSQL. <br>**2. Verifikasi:** Seluruh tabel LIMS berada di skema `mecs`, skema `public` bersih. |
| **21** | **Availability / Network** | **Payload Data Compression (Gzip)**: Respon API dan file statis dikompresi (Gzip/Brotli) untuk menghemat bandwidth. | `✔ Yes` | `GzipMiddleware` terpasang di Go Backend & Nginx `gzip on;` mereduksi payload hingga ~80%. | **1. Header Inspection:** Kirim request dengan `Accept-Encoding: gzip`. <br>**2. Verifikasi:** Header `Content-Encoding: gzip` muncul di Chrome DevTools & cURL. |
| **22** | **Session Security** | **Device & Client Fingerprint Validation (Anti-Token Hijacking)**: Menolak token jika IP/User-Agent berbeda & otomatis mencabut (*revoke*) sesi dari DB. | `✔ Yes` | `AuthMiddleware` mencocokkan IP & User-Agent. Jika terdeteksi perangkat asing, record sesi di `mecs.user_sessions` langsung dihapus permanen. | **1. Token Copy Test:** Salin token dari Chrome, panggil via cURL (tanpa User-Agent Chrome). <br>**2. Verifikasi:** Backend menolak dengan `401 Deteksi perubahan perangkat...` & menghapus sesi di DB. Request lanjutan ditolak. |

---

## 🔍 2. Detail Pengujian & Bukti Eksekusi Item #22 (Anti-Token Hijacking & Session Revocation)

### A. Mekanisme Keamanan Item #22

Pada file [auth.go](file:///d:/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/middleware/auth.go#L106-L115), LIMS mengimplementasikan *Client Fingerprint Validation*:

```go
// 2. Validasi Sidik Jari Klien (Anti-Token Sharing / Hijacking)
currentIP := strings.TrimPrefix(c.ClientIP(), "::ffff:")
currentUserAgent := c.GetHeader("User-Agent")
if session.IPAddress != currentIP || session.UserAgent != currentUserAgent {
    // Hapus sesi curian dari database
    database.DB.Delete(&session)
    c.JSON(http.StatusUnauthorized, gin.H{"error": "Akses ditolak. Deteksi perubahan perangkat atau IP ilegal. Sesi Anda telah ditutup."})
    c.Abort()
    return
}
```

### B. Mengapa Request Kedua via cURL Tetap Ditolak (`401`) Meskipun User-Agent Sudah Ditambahkan?

1. **Request Pertama (cURL Tanpa User-Agent Chrome)**:
   * `session.UserAgent` di DB = `Chrome/120.0...`
   * `currentUserAgent` di cURL = `curl/8.x` (Tidak cocok!).
   * **Eksekusi Backend**: Backend mendeteksi pencurian token -> menjalankan `database.DB.Delete(&session)` -> record sesi **DIHAPUS PERMANEN** dari database `mecs.user_sessions`.

2. **Request Kedua (cURL Dengan User-Agent Chrome)**:
   * Meskipun User-Agent cURL sudah disesuaikan, **record sesi token tersebut sudah tidak ada lagi di database PostgreSQL** (karena telah di-revoke pada percobaan pertama).
   * Backend mengembalikan `401 Unauthorized` (Sesi telah ditutup/kedaluwarsa).

### 🛠️ Cara Menguji Kembali Item #22:
1. Buka Chrome -> Login kembali ke LIMS untuk membuat **Sesi Baru**.
2. Salin token cookie baru dari F12.
3. Jalankan cURL **tanpa User-Agent Chrome** -> Verifikasi pesan `Akses ditolak. Deteksi perubahan perangkat...` muncul.
4. Periksa tabel `mecs.user_sessions` di PostgreSQL -> Record sesi untuk token tersebut **otomatis terhapus**.

---

### C. Bukti Pengujian & Hasil Detail Test #12 (CORS Policy Restrictions)

#### 1. Uji Domain Penyerang / Asing (`https://malicious-attacker.com`):
* **Perintah Pengujian (cURL OPTIONS Preflight)**:
  ```cmd
  curl -k -i -X OPTIONS https://lims.local:8081/api/assets -H "Origin: https://malicious-attacker.com" -H "Access-Control-Request-Method: GET"
  ```
* **Respon Backend**:
  ```http
  HTTP/1.1 403 Forbidden
  Content-Type: text/plain; charset=utf-8
  ```
* **Analisis Hasil**:
  - Middleware `CORSWithWhitelist()` di [security_headers.go](file:///d:/Data_NK/Project5/AI/LIM_System_Linux_OK/backend/middleware/security_headers.go#L79) memeriksa whitelist `ALLOWED_ORIGINS`.
  - Origin asing `https://malicious-attacker.com` **tidak terdaftar**, sehingga backend menolak dengan **HTTP 403 Forbidden** dan **TIDAK MENGEMBALIKAN** header `Access-Control-Allow-Origin`.
  - Sesuai standar CORS W3C, browser korban yang berada di domain penyerang akan **langsung memblokir total** request tersebut sehingga skrip jahat tidak dapat mengakses data LIMS.

#### 2. Uji Domain Resmi LIMS (`https://lims.local:3000`):
* **Perintah Pengujian**:
  ```cmd
  curl -k -i -X OPTIONS https://lims.local:8081/api/assets -H "Origin: https://lims.local:3000" -H "Access-Control-Request-Method: GET"
  ```
* **Respon Backend**:
  ```http
  HTTP/1.1 204 No Content
  Access-Control-Allow-Origin: https://lims.local:3000
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE
  ```
* **Analisis Hasil**:
  - Respon **HTTP 204 No Content** dikembalikan beserta header resmi `Access-Control-Allow-Origin: https://lims.local:3000` dan `Access-Control-Allow-Credentials: true`.
  - Aplikasi frontend resmi LIMS diizinkan berkomunikasi dengan backend secara aman.

---

## 📝 3. Kesimpulan Audit Keamanan LIMS

1. **Seluruh 22 Item Keamanan Berstatus `Comply` (Lolos)**.
2. **Session Security (Item #3 & #22)**: Token JWT dilindungi dengan `HttpOnly Cookies` serta validasi sidik jari perangkat (IP & User-Agent) dengan pencabutan sesi otomatis (*Instant Session Revocation*).
3. **CORS Restrictions (Item #12)**: Menolak penuh domain asing (`403 Forbidden` / No CORS Headers) dan hanya memberikan header `Access-Control-Allow-Origin` pada domain terdaftar di `ALLOWED_ORIGINS`.
4. **Data Compression (Item #21)**: Kompresi Gzip aktif di Backend Go & Nginx.
