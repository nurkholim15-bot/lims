# 🔄 Visualisasi Alur Proses Bisnis LIMS (Laboratory Information Management System)

Dokumen ini menyajikan visualisasi diagram alur (*flowchart*) terstruktur untuk 3 modul utama sistem LIMS, mencakup alur pengujian dengan integrasi AI, manajemen pergerakan aset (*asset movement*), serta alur operasional keuangan dari Surat Perintah Dinas (SPD) hingga *Reimbursement*.

---

## 1. 🧪 Alur Pengujian & Penerbitan Sertifikat (End-to-End dengan AI)

Diagram berikut menggambarkan alur hidup (*lifecycle*) permohonan pengujian mulai dari registrasi awal, pengujian laboratorium, sintesis laporan berbasis **AI (Ollama Local SSE Streaming)**, persetujuan sertifikator, hingga penerbitan sertifikat resmi.

```mermaid
flowchart TD
    subgraph STAGE1["1. REGISTRASI & VERIFIKASI SAMPEL"]
        A["Pemohon / Instansi"] -->|Submit Form Pengajuan| B["Registrasi Permohonan Uji"]
        B -->|Status: PENDING| C{"Verifikasi Dokumen & Sampel"}
        C -->|Dokumen / Sampel Ditolak| D["Permohonan Ditolak (REJECTED)"]
        C -->|Verifikasi Disetujui| E["Penjadwalan & Plotting Pengujian"]
        E -->|Status: PLANNED| F["Sampel Diserahkan ke Tim Lab"]
    end

    subgraph STAGE2["2. PELAKSANAAN PENGUJIANKUANTITATIF"]
        F -->|Status: EXECUTED| G["Pengujian Laboratorium & Input Nilai Parameter"]
        G -->|Status: ANALYZED| H["Kalkulasi Skor Otomatis & Dynamic Threshold Checking"]
    end

    subgraph STAGE3["3. GENERASI LAPORAN AI REAL-TIME"]
        H -->|Klik Generate Laporan AI| I["Backend Go (ai_controller.go)"]
        I -->|Prompt Optimization & SSE Stream| J["Ollama Engine Local (qwen2.5:1.5b / 3b)"]
        J -->|Real-Time Token Stream| K["Laporan AI Terbentuk (STATUS: REPORTING)"]
        K --> L["Executive Summary, Deviasi Teknis & Rekomendasi"]
    end

    subgraph STAGE4["4. SERTIFIKASI & PENERBITAN"]
        K --> M{"Review Certifier / Supervisor"}
        M -->|Minta Perbaikan| G
        M -->|Setuju & Tanda Tangan Digital| N["Status: CERTIFIED"]
        N --> O["Penerbitan Sertifikat PDF Resmi + QR Code Verification"]
        O -->|Status: FINALIZED / CLOSED| P["Sertifikat Diserahkan ke Pemohon"]
    end

    style STAGE1 fill:#f8fafc,stroke:#cbd5e1
    style STAGE2 fill:#f1f5f9,stroke:#94a3b8
    style STAGE3 fill:#eff6ff,stroke:#3b82f6
    style STAGE4 fill:#f0fdf4,stroke:#22c55e
```

### 📋 Penjelasan Tahapan:
1. **Registrasi (`PENDING` $\rightarrow$ `PLANNED`)**: Pemohon mendaftarkan pengujian instrumen/peralatan. Admin meneliti sampel dan dokumen administrasi.
2. **Pengujian (`EXECUTED` $\rightarrow$ `ANALYZED`)**: Pengujian fisik/teknis dilakukan di lab. Sistem menghitung skor per aspek dan mengecek threshold kelulusan dinamis.
3. **Generasi AI (`REPORTING`)**: Modul AI lokal (Ollama `qwen2.5`) menyintesis narasi *Executive Summary*, analisis parameter deviasi/gagal, dan tindakan perbaikan spesifik secara *real-time streaming*.
4. **Penerbitan (`CERTIFIED` $\rightarrow$ `FINALIZED` / `CLOSED`)**: Supervisor menelaah dan menyetujui laporan. Sertifikat digital PDF dengan stempel QR Code diterbitkan.

---

## 2. 📦 Alur Movement Asset Testing (Manajemen Pergerakan Alat Uji)

Diagram ini mengontrol siklus peminjaman, pelacakan lokasi (*tracking*), dan pengembalian aset alat uji yang digunakan untuk pengujian lapangan maupun antar-laboratorium.

```mermaid
flowchart TD
    subgraph INVENTORY["KATALOG & INVENTARIS ASET"]
        A1["Katalog Aset Utama (Equipment Inventory)"] -->|Status: AVAILABLE| B1["Siap Digunakan"]
    end

    subgraph MOVEMENT_REQ["PENGANJUAN & PERSETUJUAN PERGERAKAN"]
        B1 -->|Kebutuhan Pengujian Lapangan / Lab| C1["Form Pengajuan Pergerakan Aset (Asset Movement Request)"]
        C1 --> D1{"Approval Manager / Pengelola Aset"}
        D1 -->|Ditolak| E1["Pengajuan Dibatalkan"]
        D1 -->|Disetujui| F1["Penerbitan Surat Jalan / Pass Pergerakan Aset"]
    end

    subgraph TRANSIT["PEMINJAMAN & PENGGUNAAN LAPANGAN"]
        F1 -->|Check-out Alat| G1["Status Aset: IN TRANSIT / IN USE"]
        G1 --> H1["Penggunaan Alat pada Kegiatan Pengujian"]
        H1 --> I1["Pelacakan Lokasi & Riwayat Pemakai (Asset Tracking Log)"]
    end

    subgraph RETURN["PENGEMBALIAN & INSPEKSI KONDISI"]
        I1 -->|Selesai Tugas| J1["Check-in Pengembalian Aset"]
        J1 --> K1{"Inspeksi Kondisi Fisik & Kalibrasi Alat"}
        K1 -->|Kondisi Baik & Normal| L1["Status: AVAILABLE (Kembali ke Stok)"]
        K1 -->|Rusak / Perlu Kalibrasi| M1["Status: MAINTENANCE / REPAIR"]
        M1 --> N1["Jadwal Pemeliharaan / Perbaikan Alat"]
        N1 --> L1
    end

    style INVENTORY fill:#f8fafc,stroke:#cbd5e1
    style MOVEMENT_REQ fill:#fefce8,stroke:#eab308
    style TRANSIT fill:#eff6ff,stroke:#3b82f6
    style RETURN fill:#f0fdf4,stroke:#22c55e
```

### 📋 Penjelasan Tahapan:
1. **Pengajuan**: Petugas mengajukan peminjaman aset alat uji dengan mencantumkan tujuan pengujian dan durasi pemakaian.
2. **Approval & Suratan**: Pengelola aset menyetujui dan menerbitkan manifes pergerakan barang.
3. **Peminjaman (`IN USE`)**: Lokasi dan pengguna aktif tercatat pada log riwayat aset.
4. **Inspeksi Pengembalian**: Setelah dikembalikan, alat diinspeksi. Jika normal, status kembali ke `AVAILABLE`; jika ada penyimpangan/kerusakan, dialihkan ke `MAINTENANCE`.

---

## 3. 💰 Alur Operational Financial (SPD $\rightarrow$ Kasbon $\rightarrow$ Reimbursement)

Diagram ini menggambarkan integrasi alur administrasi perjalanan dinas (SPD), pencairan dana dimuka (*Cash Advance / Kasbon*), hingga klaim biaya (*Reimbursement*) dan pelunasan (*Settlement*).

```mermaid
flowchart TD
    subgraph SPD_STAGE["1. SURAT PERINTAH DINAS (SPD)"]
        A2["Pegawai / Tim Penguji"] -->|Submit Pengajuan| B2["Form Pengajuan SPD (Travel Request)"]
        B2 --> C2{"Approval Supervisor SPD"}
        C2 -->|Ditolak| D2["SPD Ditolak"]
        C2 -->|Disetujui| E2["Status SPD: APPROVED"]
    end

    subgraph CASH_ADVANCE["2. PENGAJUAN KASBON (CASH ADVANCE) - OPSIONAL"]
        E2 -->|Butuh Dana Dimuka| F2["Pengajuan Kasbon Terhubung No. SPD"]
        F2 --> G2{"Approval Supervisor Kasbon"}
        G2 -->|Disetujui| H2["Proses Transfer Dana oleh Keuangan"]
        H2 -->|Status: TRANSFERRED| I2["Pencairan Kasbon Selesai"]
    end

    subgraph EXECUTION["3. PELAKSANAAN TUGAS DINAS"]
        E2 --> J2["Pelaksanaan Perjalanan Dinas & Pengumpulan Bukti Kwitansi"]
        I2 --> J2
    end

    subgraph REIMBURSEMENT["4. REIMBURSEMENT & SETTLEMENT"]
        J2 --> K2["Pengajuan Reimbursement (Terhubung SPD & Kasbon)"]
        K2 --> L2["Upload Bukti Kwitansi / Nota Biaya"]
        L2 --> M2{"Verifikasi & Approval Supervisor Reimbursement"}
        M2 -->|Tolak| N2["Reimbursement Ditolak"]
        M2 -->|Setuju| O2["Kalkulasi Selisih Kasbon vs Total Kwitansi"]
        O2 --> P2{"Hasil Kalkulasi Settlement"}
        P2 -->|Biaya Riil > Kasbon| Q2["Pencairan Kekurangan Biaya ke Pegawai"]
        P2 -->|Kasbon > Biaya Riil| R2["Pengembalian Kelebihan Kasbon ke Kas"]
        Q2 --> S2["Status Reimbursement: PAID / CLOSED"]
        R2 --> S2
        S2 --> T2["Modal Detail: Klik 'Closed' Membuka UI Tanpa Password Prompt"]
    end

    style SPD_STAGE fill:#f8fafc,stroke:#cbd5e1
    style CASH_ADVANCE fill:#fef3c7,stroke:#f59e0b
    style EXECUTION fill:#eff6ff,stroke:#3b82f6
    style REIMBURSEMENT fill:#f0fdf4,stroke:#22c55e
```

### 📋 Penjelasan Tahapan:
1. **SPD (`Travel Request`)**: Pengajuan dinas diajukan dan disetujui supervisor.
2. **Kasbon (`Cash Advance`)**: Jika membutuhkan dana operasional awal, kasbon diajukan terhubung ke nomor SPD dan dicairkan oleh bagian keuangan.
3. **Pelaksanaan**: Tim melakukan kegiatan pengujian dan mengumpulkan bukti transaksi/kwitansi resmi.
4. **Reimbursement & Settlement (`Reimbursement`)**: Pengajuan klaim dibuat dengan melampirkan kwitansi. Sistem memperhitungkan selisih antara kasbon dimuka dan biaya nyata. Setelah disetujui, pembayaran dilunasi dan status menjadi `PAID` / `CLOSED` (di mana tombol "Closed" pada modal UI menutup tampilan secara bersih).
