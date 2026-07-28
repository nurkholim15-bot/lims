export const MANUAL_CONTENT = {
  // 1. PENDAHULUAN
  "pendahuluan-welcome": {
    title: "Selamat Datang di LIMS",
    subtitle: "Pengantar Sistem Manajemen Laboratorium",
    steps: [
      { text: "LIMS (Laboratory Information Management System) adalah sistem terpadu untuk mengelola seluruh operasional laboratorium." },
      { text: "Gunakan menu di sebelah kiri layar untuk menavigasi setiap modul, mulai dari Master Data hingga Laporan Keuangan." },
    ],
    callout: "Jika Anda mengalami kendala teknis, silakan hubungi tim IT Administrator perusahaan Anda.",
    mockupType: "image",
    screenshots: ["/screenshots/welcome.png"],
  },
  "pendahuluan-login": {
    title: "Masuk (Login)",
    subtitle: "Cara mengakses sistem LIMS",
    steps: [
      { text: "Buka alamat web LIMS di browser Anda." },
      { text: "Masukkan <strong>Username</strong> dan <strong>Password</strong> Anda." },
      { text: "Klik tombol <strong>Masuk</strong>." },
      { text: "Jika berhasil, Anda akan dialihkan ke halaman <strong>Dashboard</strong>." },
    ],
    callout: "Demi keamanan, pastikan Anda selalu keluar (Logout) jika menggunakan komputer publik.",
    mockupType: "image",
    screenshots: ["/screenshots/login.png"],
  },
  "pendahuluan-dashboard": {
    title: "Dashboard",
    subtitle: "Ringkasan informasi dan KPI",
    steps: [{ text: "Halaman ini menampilkan grafik, statistik pengujian, dan status alat." }, { text: "Anda dapat melihat notifikasi dan aktivitas terbaru di layar ini." }],
    callout: "Data di dashboard diperbarui secara otomatis setiap beberapa menit.",
    mockupType: "image",
    screenshots: [],
  },

  // 2. MASTER DATA
  "master-partners": {
    title: "Data Mitra (Partners)",
    subtitle: "Mengelola daftar klien atau vendor",
    steps: [
      { text: "Klik <strong>Master Data</strong> > <strong>Partners</strong>." },
      { text: "Klik <strong>Tambah Baru</strong> untuk mendaftarkan mitra." },
      { text: "Isi nama, alamat, kategori, dan kontak mitra, lalu klik <strong>Simpan</strong>." },
      { text: "Gunakan fitur pencarian untuk menemukan mitra yang sudah ada." },
    ],
    mockupType: "table",
    screenshots: [],
  },
  "master-locations": {
    title: "Data Lokasi & Kota",
    subtitle: "Mengelola data geografis",
    steps: [{ text: "Pilih menu <strong>Master Data</strong> > <strong>Locations / Cities</strong>." }, { text: "Anda dapat menambahkan kota atau lokasi laboratorium cabang di sini." }],
    mockupType: "table",
    screenshots: [],
  },
  "master-assets": {
    title: "Data Aset & Merek",
    subtitle: "Mendaftarkan aset dan merek (Brands & Models)",
    steps: [{ text: "Buka menu <strong>Brands</strong> atau <strong>Models</strong> di bawah Master Data." }, { text: "Daftarkan spesifikasi alat uji yang akan digunakan." }],
    mockupType: "table",
    screenshots: [],
  },
  "master-testing": {
    title: "Parameter & Standar Uji",
    subtitle: "Menetapkan standar kualitas",
    steps: [{ text: "Gunakan menu <strong>Test Standards</strong> dan <strong>Methodologies</strong>." }, { text: "Tentukan batas toleransi dan metode ukur untuk setiap jenis pengujian." }],
    mockupType: "table",
    screenshots: [],
  },

  // 3. OPERASIONAL
  "ops-planning": {
    title: "Perencanaan Uji (Planning)",
    subtitle: "Membuat jadwal pengujian harian",
    steps: [
      { text: "Buka menu <strong>Operasional</strong> > <strong>Planning</strong>." },
      { text: "Klik <strong>Buat Rencana Baru</strong>." },
      { text: "Pilih jenis pengujian, alat yang digunakan, dan jadwal pelaksanaannya." },
      { text: "Simpan perencanaan agar dapat diproses oleh analis." },
    ],
    callout: "Pastikan alat uji dalam status 'Tersedia' (Available) sebelum menjadwalkan pengujian.",
    mockupType: "table",
    screenshots: [],
  },
  "ops-submission": {
    title: "Pengajuan Uji (Submission)",
    subtitle: "Menerima sampel masuk",
    steps: [{ text: "Buka menu <strong>Submission</strong>." }, { text: "Masukkan data sampel yang dikirimkan oleh klien." }, { text: "Cetak label atau barcode jika diperlukan." }],
    mockupType: "table",
    screenshots: [],
  },
  "ops-assets": {
    title: "Manajemen Alat (Asset Mgt)",
    subtitle: "Melacak penggunaan dan kalibrasi",
    steps: [{ text: "Buka menu <strong>Asset Management</strong>." }, { text: "Anda bisa melihat riwayat pemakaian alat dan memantau jadwal kalibrasinya." }],
    mockupType: "table",
    screenshots: [],
  },

  // 4. KEUANGAN & PERJALANAN
  "finance-cash": {
    title: "Uang Muka (Cash Advance)",
    subtitle: "Mengajukan biaya operasional lapangan",
    steps: [{ text: "Buka menu <strong>Finance</strong> > <strong>Cash Advance</strong>." }, { text: "Isi formulir pengajuan dana dengan melampirkan rincian kebutuhan." }, { text: "Tunggu persetujuan (Approval) dari atasan." }],
    mockupType: "table",
    screenshots: [],
  },
  "finance-travel": {
    title: "Perjalanan Dinas (Travel)",
    subtitle: "Melacak biaya transportasi analis",
    steps: [{ text: "Buka menu <strong>Travel</strong>." }, { text: "Catat lokasi tujuan, moda transportasi, dan biaya tak terduga." }],
    mockupType: "table",
    screenshots: [],
  },

  // 5. LAPORAN
  "reports-detail": {
    title: "Laporan Detail Pengujian",
    subtitle: "Melihat hasil akhir",
    steps: [{ text: "Buka menu <strong>Reports Detail</strong>." }, { text: "Pilih rentang tanggal dan jenis sampel." }, { text: "Klik <strong>Export</strong> untuk mengunduh laporan dalam format PDF/Excel." }],
    mockupType: "table",
    screenshots: [],
  },

  // 6. SISTEM & ADMIN
  "admin-users": {
    title: "Manajemen Pengguna",
    subtitle: "Menambah akun staf",
    steps: [{ text: "Buka <strong>System</strong> > <strong>Users</strong>." }, { text: "Buat akun baru dan tentukan peran (Role) staf tersebut (misal: Analis, Admin, atau Finance)." }],
    callout: "Hanya pengguna dengan hak akses Administrator yang dapat membuka menu ini.",
    mockupType: "table",
    screenshots: [],
  },
};

export const SIDEBAR_STRUCTURE = [
  {
    title: "Pendahuluan",
    items: [
      { id: "pendahuluan-welcome", label: "Selamat Datang" },
      { id: "pendahuluan-login", label: "Masuk (Login)" },
      { id: "pendahuluan-dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Master Data",
    items: [
      { id: "master-partners", label: "Mitra (Partners)" },
      { id: "master-locations", label: "Lokasi & Kota" },
      { id: "master-assets", label: "Aset & Merek" },
      { id: "master-testing", label: "Standar Pengujian" },
    ],
  },
  {
    title: "Operasional Lab",
    items: [
      { id: "ops-planning", label: "Perencanaan (Planning)" },
      { id: "ops-submission", label: "Pengajuan (Submission)" },
      { id: "ops-assets", label: "Manajemen Alat" },
    ],
  },
  {
    title: "Keuangan & Perjalanan",
    items: [
      { id: "finance-cash", label: "Uang Muka (Cash Advance)" },
      { id: "finance-travel", label: "Perjalanan Dinas (Travel)" },
    ],
  },
  {
    title: "Laporan",
    items: [{ id: "reports-detail", label: "Laporan Pengujian" }],
  },
  {
    title: "Sistem Admin",
    items: [{ id: "admin-users", label: "Pengguna (Users & Roles)" }],
  },
];
