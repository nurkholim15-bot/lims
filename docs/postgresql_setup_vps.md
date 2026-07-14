# Panduan Setup User dan Tablespace PostgreSQL di VPS (via pgAdmin & CLI)

Ya, **sangat bisa** menggunakan pgAdmin untuk membuat *user* (Login Role) dan *tablespace* baru. 

Namun, ada satu **prasyarat mutlak** yang harus dilakukan terlebih dahulu secara langsung di sistem operasi VPS Anda (lewat SSH) sebelum Anda membuat *tablespace* di pgAdmin. PostgreSQL membutuhkan direktori fisik di VPS yang memiliki hak akses penuh oleh user sistem `postgres`.

Untuk menyesuaikan dengan konfigurasi di Windows, kita akan membuat dua *tablespace*:
1.  **`ts_data_lims`** (untuk penyimpanan tabel data)
2.  **`ts_index_lims`** (untuk penyimpanan indeks)

Berikut adalah panduan langkah demi langkah untuk menyiapkannya.

---

## Langkah 1: Prasyarat di VPS (Membuat Folder Fisik & Hak Akses)

PostgreSQL tidak dapat membuat folder baru di VPS secara otomatis saat Anda membuat *tablespace* dari pgAdmin. Anda harus membuat foldernya secara manual melalui SSH terlebih dahulu.

1. Hubungkan ke VPS Anda menggunakan SSH:
   ```bash
   ssh username@ip_vps_anda
   ```
2. Buat direktori fisik baru untuk kedua tablespace tersebut:
   ```bash
   # Direktori untuk tablespace data
   sudo mkdir -p /var/lib/postgresql/data/ts_data_lims
   
   # Direktori untuk tablespace indeks
   sudo mkdir -p /var/lib/postgresql/data/ts_index_lims
   ```
3. **[PENTING]** Ubah kepemilikan dan hak akses direktori tersebut agar dapat ditulis oleh user sistem `postgres`:
   ```bash
   # Ubah kepemilikan ke user 'postgres'
   sudo chown -R postgres:postgres /var/lib/postgresql/data/ts_data_lims
   sudo chown -R postgres:postgres /var/lib/postgresql/data/ts_index_lims
   
   # Atur hak akses agar aman (hanya dapat dibaca/ditulis oleh postgres)
   sudo chmod 700 /var/lib/postgresql/data/ts_data_lims
   sudo chmod 700 /var/lib/postgresql/data/ts_index_lims
   ```

---

## Langkah 2: Membuat Tablespace Baru via pgAdmin

Setelah folder fisik siap dan hak aksesnya diatur, buka pgAdmin di komputer Anda:

1. Hubungkan pgAdmin ke Server Database PostgreSQL VPS Anda.
2. Di panel pohon navigasi sebelah kiri, cari node **Tablespaces**.
3. **Membuat Tablespace Data (`ts_data_lims`)**:
   *   Klik kanan pada **Tablespaces** ➔ Pilih **Create** ➔ **Tablespace...**
   *   **Tab General**:
       *   **Name**: Masukkan nama `ts_data_lims`.
       *   **Owner**: Pilih `postgres`.
   *   **Tab Definition**:
       *   **Location**: Masukkan `/var/lib/postgresql/data/ts_data_lims`.
   *   Klik **Save**.
4. **Membuat Tablespace Indeks (`ts_index_lims`)**:
   *   Klik kanan pada **Tablespaces** ➔ Pilih **Create** ➔ **Tablespace...**
   *   **Tab General**:
       *   **Name**: Masukkan nama `ts_index_lims`.
       *   **Owner**: Pilih `postgres`.
   *   **Tab Definition**:
       *   **Location**: Masukkan `/var/lib/postgresql/data/ts_index_lims`.
   *   Klik **Save**.

---

## Langkah 3: Membuat User (Login Role) Baru via pgAdmin

Untuk membuat user baru yang akan mengakses database LIMS Anda:

1. Di panel navigasi sebelah kiri pgAdmin, klik kanan pada **Login/Group Roles** ➔ Pilih **Create** ➔ **Login/Group Role...**
2. Di jendela pop-up:
   *   **Tab General**:
       *   **Name**: Masukkan nama user database (misal: `admin_lims` atau `user_lims`).
   *   **Tab Definition**:
       *   **Password**: Masukkan kata sandi yang aman untuk user ini.
   *   **Tab Privileges**:
       *   **Can login?**: Set ke **Yes** (agar user bisa masuk ke database).
       *   *Opsi Tambahan*: Sesuaikan hak akses lain seperti *Superuser*, *Create databases*, atau *Create roles* sesuai kebutuhan Anda.
3. Klik **Save**.

### 💻 Cara Alternatif: Membuat User via Terminal VPS (CLI)

Jika Anda lebih memilih menggunakan baris perintah di terminal VPS, Anda dapat membuat user database melalui SSH dengan cara berikut:

1.  **Menggunakan utilitas `createuser` (Interaktif)**:
    Jalankan perintah ini di terminal VPS Anda:
    ```bash
    sudo -u postgres createuser --interactive -P admin_lims
    ```
    *Terminal akan meminta Anda memasukkan password baru untuk user `admin_lims` serta mengonfirmasi apakah user tersebut dijadikan Superuser (`y/n`).*

2.  **Atau, menggunakan SQL Query via shell `psql`**:
    Masuk ke shell PostgreSQL di VPS:
    ```bash
    sudo -u postgres psql
    ```
    Setelah masuk ke prompt psql, ketikkan perintah SQL berikut:
    ```sql
    CREATE ROLE admin_lims WITH LOGIN SUPERUSER PASSWORD 'password_sandi_anda';
    ```
    Ketik `\q` untuk keluar dari psql:
    ```sql
    \q
    ```

---

## Langkah 4: Membuat Database Baru dengan Tablespace Utama & Owner Baru

Setelah Tablespace dan User siap, satukan semuanya saat membuat database:

1. Di panel navigasi sebelah kiri pgAdmin, klik kanan pada **Databases** ➔ Pilih **Create** ➔ **Database...**
2. Di jendela pop-up:
   *   **Tab General**:
       *   **Database**: Masukkan nama database LIMS Anda (misal: `lims_prod_db`).
       *   **Owner**: Pilih nama user yang baru saja Anda buat di Langkah 3 (misal: `admin_lims`).
   *   **Tab Definition**:
       *   **Tablespace**: Pilih tablespace data utama `ts_data_lims`.
3. Klik **Save**.

---

## Langkah 5: Mengatur Hak Akses User Non-Owner (`lims_app`)

Untuk meningkatkan keamanan di lingkungan produksi, disarankan untuk memisahkan kredensial database menjadi dua peran (*role*):
*   **`admin_lims`**: Bertindak sebagai **Owner** database. User ini digunakan untuk proses migrasi database (misalnya membuat tabel baru, mengganti kolom, dll).
*   **`lims_app`**: Bertindak sebagai **User Non-Owner**. User ini digunakan oleh aplikasi backend Go LIMS untuk operasi sehari-hari (SELECT, INSERT, UPDATE, DELETE) tanpa izin untuk menghapus atau mengubah struktur tabel.

Berikut adalah langkah-langkah untuk mengaturnya:

### 1. Buat User `lims_app` terlebih dahulu
*   **Via pgAdmin**: Ulangi langkah pada **Langkah 3** untuk membuat Login Role bernama `lims_app`. Pastikan tab Privileges diatur ke **Can login? = Yes** saja (tidak perlu mencentang Superuser atau Create DB).
*   **Via Terminal VPS (CLI)**:
    ```bash
    sudo -u postgres createuser -P lims_app
    ```

### 2. Buat Schema dan Berikan Izin Akses di Database LIMS
Buka **Query Tool** di pgAdmin (Klik kanan pada database `lims_prod_db` ➔ Pilih **Query Tool**), lalu jalankan skrip SQL berikut:

```sql
-- 1. Membuat schema 'lims' dengan owner admin_lims (jika belum ada)
CREATE SCHEMA IF NOT EXISTS lims AUTHORIZATION admin_lims;

-- 2. Memberikan izin koneksi ke database lims_prod_db
GRANT CONNECT ON DATABASE lims_prod_db TO lims_app;

-- 3. Memberikan izin penggunaan (usage) schema 'lims'
GRANT USAGE ON SCHEMA lims TO lims_app;

-- 4. Memberikan izin SELECT, INSERT, UPDATE, DELETE pada tabel yang ada sekarang
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA lims TO lims_app;

-- 5. Memberikan izin pada sequence (wajib agar ID auto-increment / SERIAL bisa bertambah)
GRANT SELECT, USAGE ON ALL SEQUENCES IN SCHEMA lims TO lims_app;

-- 6. Menetapkan default privileges agar tabel/sequence baru yang dibuat oleh admin_lims otomatis bisa diakses lims_app ke depan
ALTER DEFAULT PRIVILEGES FOR ROLE admin_lims IN SCHEMA lims 
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lims_app;

ALTER DEFAULT PRIVILEGES FOR ROLE admin_lims IN SCHEMA lims 
    GRANT SELECT, USAGE ON SEQUENCES TO lims_app;
```

---

## 💡 Troubleshooting Kesalahan Umum
Jika saat klik **Save** pada pembuatan Tablespace muncul eror:
> *Directory "/var/lib/postgresql/data/..." does not exist* ATAU *Permission denied*

*   **Penyebab**: Folder fisik belum dibuat di VPS, atau PostgreSQL (`user: postgres`) tidak memiliki hak akses tulis ke folder tersebut.
*   **Solusi**: Ulangi langkah-langkah pada **Langkah 1** di terminal VPS Anda dengan teliti, lalu pastikan kepemilikannya sudah dialihkan menggunakan `chown -R postgres:postgres`.


---

## 💾 Prosedur Backup & Restore Database

Untuk menjaga integritas data LIMS Anda, berikut adalah prosedur melakukan pencadangan (*backup*) dan pemulihan (*restore*) di VPS.

### ❓ Tanya & Jawab Keamanan (Best Practices)
1.  **User apa yang paling aman digunakan untuk backup & restore?**
    *   **Jawaban**: Gunakan **`admin_lims`** (Database Owner). 
    *   **Alasan**: User ini memiliki hak akses penuh untuk membaca dan memulihkan semua objek database (tabel, schema, data, sequence) di `lims_prod_db`. Menjalankan backup dengan superuser `postgres` kurang aman dari sisi prinsip hak akses minimal (*least-privilege*), sedangkan menggunakan user non-owner `lims_app` berisiko gagal mem-backup objek baru yang belum di-grant izin aksesnya.
2.  **Apakah perlu password?**
    *   **Jawaban**: Secara default, PostgreSQL akan meminta sandi saat Anda memanggil perintah `pg_dump` atau `pg_restore`.
    *   **Otomatisasi Tanpa Meminta Sandi Secara Interaktif (Aman)**: 
        Jangan pernah menuliskan password secara langsung di dalam baris kode/perintah (*plain text*). Solusi terbaik adalah menggunakan berkas **`.pgpass`** di folder home pengguna Linux Anda (misal: `/home/lims/.pgpass`):
        
        *Buat berkas `.pgpass` dan isi dengan format berikut:*
        ```text
        # hostname:port:database:username:password
        localhost:5432:lims_prod_db:admin_lims:Password_Sandi_Anda
        ```
        *Atur hak akses berkas secara ketat agar hanya bisa dibaca oleh user Linux Anda:*
        ```bash
        chmod 600 ~/.pgpass
        ```
        *PostgreSQL secara otomatis akan membaca berkas ini untuk autentikasi tanpa memunculkan prompt password.*

---

### Langkah Backup Database (pg_dump)
Untuk mencadangkan database `lims_prod_db` ke sebuah berkas terkompresi (format custom tar/binary):
```bash
# Menjalankan backup menggunakan user admin_lims
pg_dump -h localhost -p 5432 -U admin_lims -F c -b -v -f /home/lims/backup_lims_$(date +%F).dump lims_prod_db
```
*Keterangan parameter:*
*   `-F c`: Menggunakan format binary custom (terkompresi secara efisien dan mendukung pemulihan parsial).
*   `-b`: Ikut mencadangkan berkas Large Objects (LOBs).
*   `-v`: Menampilkan log proses backup (*verbose mode*).
*   `-f`: Nama berkas output backup.

---

### Langkah Restore Database (pg_restore)
Jika Anda ingin memulihkan (*restore*) berkas cadangan `.dump` tadi ke database:

1.  **Buat database tujuan baru (jika belum ada)**:
    ```bash
    # Masuk ke psql sebagai superuser untuk membuat db kosong baru
    sudo -u postgres psql -c "CREATE DATABASE lims_prod_db OWNER admin_lims TABLESPACE ts_data_lims;"
    ```
2.  **Lakukan restore berkas dump**:
    ```bash
    # Memulihkan data menggunakan user admin_lims ke database tujuan
    # Disarankan menambahkan -O (no-owner) dan -x (no-privileges) untuk menghindari eror kecocokan role (seperti mecs_app)
    pg_restore -h localhost -p 5432 -U admin_lims -d lims_prod_db -O -x -v /home/lims/backup_lims_tanggal.dump
    ```
    *Catatan:*
    *   `-O` (`--no-owner`): Mengabaikan kepemilikan objek asli dari file dump dan menetapkan user saat ini (`admin_lims`) sebagai owner baru.
    *   `-x` (`--no-privileges`): Mengabaikan restore tabel hak akses asli (ACL/Grants). Sangat penting jika file dump memiliki grant lama ke user yang tidak ada di VPS (seperti `mecs_app`). Anda akan memberikan hak akses baru secara terkontrol untuk `lims_app` di **Langkah 5**.
    *   Sebelum melakukan restore, pastikan folder fisik tablespace (`ts_data_lims` dan `ts_index_lims`) di VPS sudah dipersiapkan terlebih dahulu (Langkah 1 & 2).

---

## ⚡ Tips Kestabilan Koneksi pgAdmin & SSH ke VPS (Sering Putus)

Eror **"Connection to the server has been lost"** di pgAdmin terjadi karena koneksi TCP antara komputer Anda dan VPS terputus, biasanya disebabkan oleh koneksi lokal yang kurang stabil atau pemutusan koneksi pasif (*idle TCP timeout*) oleh firewall/router.

Berikut adalah tips konfigurasi agar pgAdmin dan SSH Anda tetap awet terhubung:

### 1. Aktifkan TCP Keepalives di pgAdmin
TCP Keepalive memerintahkan pgAdmin mengirimkan paket kecil berkala ke VPS agar jaringan tetap menganggap koneksi aktif (*keep-alive*).
*   Putuskan koneksi server (Klik kanan nama server ➔ **Disconnect Server**).
*   Klik kanan nama server ➔ Pilih **Properties...**
*   Pindah ke tab **Connection** (atau tab **Parameters**):
    *   **Keepalives**: Ubah nilainya menjadi **`1`** (Aktif).
    *   **Keepalives idle**: Isi dengan **`60`** (Kirim sinyal keep-alive setiap 60 detik jika menganggur).
    *   **Keepalives interval**: Isi dengan **`10`** (Jika gagal, coba kirim ulang tiap 10 detik).
    *   **Keepalives count**: Isi dengan **`5`** (Koneksi dianggap putus jika 5 kali berturut-turut gagal merespon).
*   Klik **Save** dan hubungkan kembali server Anda.

### 2. Gunakan SSH Tunneling di pgAdmin (Lebih Stabil & Aman)
SSH memiliki kemampuan *auto-recovery* gangguan jaringan yang sangat kuat.
*   Klik kanan Server ➔ **Properties...**
*   Di tab **Connection**:
    *   Ubah **Host name/address** menjadi **`127.0.0.1`** (localhost).
*   Pindah ke tab **SSH Tunnel**:
    *   **Use SSH tunneling**: Geser ke **Yes**.
    *   **Tunnel host**: Masukkan **IP VPS Anda**.
    *   **Username**: Masukkan user login SSH VPS (misal: `root` atau `lims`).
    *   **Authentication**: Pilih **Password** (atau SSH Key). Masukkan kredensial SSH Anda.
*   Klik **Save**.

### 3. Konfigurasi Keepalive di Terminal SSH
Jika Anda sering menggunakan Terminal SSH dan sering *freeze* (membeku/putus), atur konfigurasi ini:
*   **Di Komputer Anda (Client Windows)**:
    Buka berkas `C:\Users\Username\.ssh\config` (buat baru jika belum ada), isi dengan:
    ```text
    Host *
        ServerAliveInterval 60
        ServerAliveCountMax 3
    ```
*   **Di Server VPS (Linux)**:
    Edit berkas `/etc/ssh/sshd_config` di VPS, tambahkan atau ubah baris berikut:
    ```text
    ClientAliveInterval 60
    ClientAliveCountMax 3
    ```
    Lalu jalankan restart SSH daemon:
    ```bash
    sudo systemctl restart sshd
    ```
