# Panduan Instalasi pgvector pada PostgreSQL

Dokumen ini menjelaskan langkah-langkah instalasi ekstensi **`pgvector`** pada database PostgreSQL, baik untuk sistem operasi **Linux/Ubuntu (WSL)** maupun **Windows**. Ekstensi ini sangat krusial untuk mendukung penyimpanan dan pencarian data berbasis vektor numerik (Embeddings) pada sistem AI Chatbot RAG.

---

## A. Aktivasi & Verifikasi Ekstensi (Langkah Terakhir di pgAdmin)
Setelah instalasi file (di bagian B atau C) selesai, Anda cukup mengaktifkan ekstensi ini dengan menjalankan SQL command berikut di **Query Tool pgAdmin** pada database target Anda:

```sql
-- Mengaktifkan ekstensi pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Verifikasi apakah ekstensi sudah terinstal dengan benar
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```
*Jika berhasil, tabel akan memunculkan nama `vector` beserta versinya (misalnya `0.7.0`).*

---

## B. Instalasi di Windows (PostgreSQL Windows)
Jika database PostgreSQL Anda berjalan langsung di sistem host Windows, ikuti langkah mudah menggunakan *precompiled binary* yang disediakan oleh komunitas (tidak perlu kompilasi manual menggunakan Visual Studio):

1. **Unduh Precompiled File:**
   * Buka halaman rilis precompiled Windows di GitHub: [pgvector Windows Precompiled Releases](https://github.com/andreiramani/pgvector_pgsql_windows/releases).
   * Cari versi yang sesuai dengan versi PostgreSQL yang terinstal di komputer Anda, lalu unduh file `.zip` di bagian **Assets**:
     * **`vector.v0.8.2-pg18.zip`** (Jika menggunakan PostgreSQL 18)
     * **`pgvector-pg17-windows.zip`** (Jika menggunakan PostgreSQL 17)
     * **`pgvector-pg16-windows.zip`** (Jika menggunakan PostgreSQL 16)
     * **`pgvector-pg15-windows.zip`** (Jika menggunakan PostgreSQL 15)
     * **`pgvector-pg14-windows.zip`** (Jika menggunakan PostgreSQL 14)

2. **Ekstrak dan Salin File ke Direktori PostgreSQL:**
   * Ekstrak file zip tersebut.
   * Salin file **`vector.dll`** (dari folder `lib`) dan paste ke folder lib PostgreSQL Anda, biasanya di:
     `C:\Program Files\PostgreSQL\<VERSI_PG>\lib\`
   * Salin seluruh file ekstensi (file `.control` dan `.sql` dari folder `share/extension`) dan paste ke folder extension PostgreSQL Anda, biasanya di:
     `C:\Program Files\PostgreSQL\<VERSI_PG>\share\extension\`

3. **Restart Service PostgreSQL:**
   * Buka **Services** di Windows (cari "Services" di Start Menu).
   * Cari layanan **`postgresql-x64-<versi>`**, klik kanan lalu pilih **Restart**.
   * Jalankan query aktivasi pada **Bagian A**.

---

## C. Instalasi di Linux / Ubuntu (WSL)
Jika PostgreSQL Anda berjalan di dalam lingkungan Linux/Ubuntu (WSL), Anda bisa menginstalnya melalui Package Manager atau kompilasi dari source code.

### Opsi 1: Menggunakan Package Manager (Sangat Mudah)
Pada Ubuntu versi terbaru (22.04 ke atas), Anda bisa langsung menginstalnya menggunakan `apt` sesuai versi PostgreSQL Anda (ganti `15` dengan versi PostgreSQL Anda):

```bash
# Update package list
sudo apt update

# Instal pgvector (sesuaikan angka 15 dengan versi Postgres Anda)
sudo apt install postgresql-15-pgvector
```
Setelah selesai instalasi, restart PostgreSQL:
```bash
sudo service postgresql restart
```

---

### Opsi 2: Kompilasi Manual dari Source Code (Jika Opsi 1 Tidak Tersedia)
Jika versi PostgreSQL Anda tidak didukung oleh repositori APT default, lakukan kompilasi manual yang sangat aman ini:

1. **Instal Paket Pendukung Kompilasi:**
   ```bash
   sudo apt update
   sudo apt install git make gcc postgresql-server-dev-all
   ```

2. **Clone Repositori pgvector:**
   ```bash
   git clone --branch v0.7.0 https://github.com/pgvector/pgvector.git
   cd pgvector
   ```

3. **Lakukan Kompilasi dan Instalasi:**
   ```bash
   make
   sudo make install
   ```

4. **Restart Layanan PostgreSQL:**
   ```bash
   sudo service postgresql restart
   ```
5. **Jalankan perintah SQL aktivasi pada Bagian A.**
