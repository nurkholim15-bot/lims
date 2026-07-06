# MEC System: frontend Technical Specification & Document Flow

Laporan ini mendokumentasikan spesifikasi program dan alur kerja aplikasi frontend MEC System yang dibangun menggunakan arsitektur modern berbasis React (Vite).

## 1. Arsitektur Umum
Sistem menggunakan pola **Single Page Application (SPA)** dengan manajemen state terpusat di `App.jsx`. Untuk memaksimalkan performa, sistem menerapkan strategi *Lazy Loading* terhadap data berat.

- **Teknologi Utama**: React 18, Vite, React Router DOM v6.
- **Styling**: Vanilla CSS (Modern CSS Variables) dengan desain *premium aesthetics*.
- **Aset Lokal**: Fontsource (Inter/Outfit) dan FontAwesome (Local Package) untuk operasional 100% offline.

---

## 2. Struktur Direktori Utama
```text
frontend/src/
├── components/     # Reusable UI (Button, Modal, Card, Table)
├── context/        # AppContext untuk Global State (User, Token)
├── models/         # Layer API (api.js - fungsi fetch)
├── views/
│   ├── layout/     # Sidebar, Header, MainContent (Router)
│   └── pages/      # Halaman Modul (Dashboard, Submission, etc.)
├── main.jsx        # Entry point & Import Aset Lokal
└── App.jsx         # Kontroler Utama (State & Fetch Logic)
```

---

## 3. Alur Kerja & Fragmentasi Data (Document Flow)

MEC System mengikuti alur kerja *linear* dari registrasi hingga sertifikasi. Berikut adalah dokumentasi cara data mengalir di frontend:

### A. Lifecycle Login & Booting
1. **Inisialisasi**: `main.jsx` memuat font dan ikon lokal.
2. **Autentikasi**: `App.jsx` memeriksa token di `localStorage`.
3. **Pemuatan Awal (Fast Boot)**:
   - Sistem memuat `WelcomePage` (Landing Page ringan).
   - Pengambilan menu sidebar (`/api/menus`) dan konfigurasi sistem (`/api/config`) dilakukan di background.
   - **Optimasi**: Data aplikasi berat *tidak* dimuat saat booting.

### B. Navigasi & Pemuatan Data (On-Demand)
Saat User berpindah menu melalui Sidebar:
1. **Trigger**: `activePath` berubah.
2. **Logic Fetch (`fetchData`)**:
   - Jika path adalah modul kerja (Submission, Verification, dll), sistem memanggil `refreshData`.
   - Jika path adalah `Dashboard`, sistem memanggil `fetchStats` dan `refreshData`.
   - **Cache**: Data tidak akan di-fetch ulang jika sudah pernah dimuat dalam 30 detik terakhir untuk menghemat bandwidth.
3. **Komponen Pengolah**: `MainContent.jsx` menerima state `applications` dan memberikannya ke komponen halaman yang aktif.

### C. Alur Modul Kerja (Workflow)
Setiap modul memiliki pola integrasi yang sama:
1. **Submission**: User input form -> `api.post("/api/applications")` -> Refresh data otomatis.
2. **Action (Verifikasi/Eksekusi)**: Modal dibuka -> Input data -> `api.put("/api/applications/:id")` -> Notifikasi sukses -> Refresh tabel.

---

## 4. Manajemen Partisi Database di frontend
frontend dioptimalkan untuk mendukung **Database Partitioning** backend:
- **Filter Otomatis**: Secara default, sistem mengirimkan parameter `start_date` dan `end_date` (Bulan Berjalan).
- **Partition Routing**: Backend menginformasikan tabel sumber (misal: `testing_applications_202604`) yang kemudian ditampilkan di header setiap modul agar user tahu data mana yang sedang mereka lihat.
- **Riwayat Data (Query)**: Khusus modul ini, pemuatan data dilakukan secara **Manual** (User harus klik "Cari Data") untuk mencegah query besar yang tidak perlu pada tabel partisi arsip.

---

## 5. Fitur Offline & Ekspor
1. **Ikon & Font**: Diimpor dari paket NPM (`@fontsource` & `@fortawesome`), bukan dari CDN internet.
2. **Cetak PDF**: Menggunakan `html2pdf.js` yang terintegrasi secara lokal.
   - Flow: Pilih Data -> Klik Cetak -> frontend menangkap DOM element -> Transformasi ke PDF di sisi klien -> Unduh otomatis.

---

## 6. Penanganan Error & Notifikasi
- **Sistem Notifikasi**: Menggunakan `AppSuccessNotif` dan `AppErrorNotif` yang dipicu oleh server response.
- **API Error**: Jika token expired atau server offline, frontend akan merespons dengan menampilkan modal login atau pesan "Server Unreachable".

---

> [!NOTE]
> Spesifikasi ini dapat diperbarui seiring bertambahnya modul baru. Pastikan setiap penambahan halaman baru tetap didaftarkan di dalam `workflowRoutes` di `frontend/src/routes.jsx` agar fitur auto-fetch dapat berjalan.
