import React from "react";

export const workflowRoutes = {
  "/submission": { title: "Registrasi & Pengajuan Uji", status: "REGISTERED,REVISI", label: "Lihat Bukti" },
  "/verification": { title: "Verifikasi Administratif", status: "REGISTERED", label: "Verifikasi" },
  "/approval": { title: "Persetujuan Pimpinan", status: "VERIFIED", label: "Review & Approve" },
  "/planning": { title: "Perencanaan Pengujian", status: "APPROVED", label: "Buat Perencanaan" },
  "/testing": { title: "Pelaksanaan Pengujian", status: "PLANNED", label: "Update Progress" },
  "/analysis": { title: "Pengolahan & Analisa Data", status: "EXECUTED", label: "Analyze" },
  "/reporting": { title: "Pelaporan & Rekomendasi", status: "ANALYZED,CERTIFIED", label: "Finalisasi" },
  "/query": { title: "Pencarian / Riwayat Data", status: "All", label: "Lihat Detail" },
};

export const getMasterRoutes = (onNavigate) => ({
  "/roles": {
    title: "Manajemen Role",
    endpoint: "/roles",
    crudEndpoint: "/management/roles",
    columns: [
      { key: "id", header: "ID" },
      { key: "name", header: "Nama Role" },
      { key: "description", header: "Deskripsi" },
    ],
  },
  "/role-menus-hist": {
    title: "Riwayat Hak Akses Menu",
    endpoint: "/hist-role-menus",
    columns: [
      { key: "id", header: "ID" },
      { key: "role_name", header: "Nama Role" },
      { key: "menu_title", header: "Menu" },
      { key: "deleted_at", header: "Waktu" },
      { key: "deleted_user", header: "Oleh" },
    ],
  },
  "/users": {
    title: "User Management",
    endpoint: "/users",
    crudEndpoint: "/management/users",
    searchField: "search",
    searchPlaceholder: "Cari Nama atau ID...",
    columns: [
      { key: "id", header: "ID" },
      { key: "username", header: "Username" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
      { key: "role_id", header: "Role Id" },
      { key: "role_name", header: "Role Name", render: (item) => (item.role ? item.role.name : "-") },
    ],
  },
  "/menus": {
    title: "Manajemen Menu",
    endpoint: "/all-menus",
    crudEndpoint: "/management/menus",
    columns: [
      { key: "id", header: "ID" },
      { key: "title", header: "Judul" },
      { key: "path", header: "Path" },
      { key: "is_password", header: "Wajib Password", render: (item) => (item.is_password ? "✓ Ya" : "✗ Tidak") },
      { key: "icon", header: "Icon" },
      { key: "order", header: "Urutan" },
    ],
  },
  "/partners": {
    title: "Manajemen Rekanan",
    endpoint: "/partners",
    crudEndpoint: "/management/partners",
    columns: [
      { key: "id", header: "ID" },
      { key: "name", header: "Nama" },
      { key: "type_name", header: "Kategori (Tipe)", render: (item) => (item.type ? item.type.name : "-") },
      { key: "pic_name", header: "PIC" },
      { key: "pic_phone", header: "Telp PIC" },
    ],
  },
  "/brands": {
    title: "Merk Peralatan",
    endpoint: "/brands",
    crudEndpoint: "/management/brands",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama" },
    ],
  },
  "/models": {
    title: "Model Peralatan",
    endpoint: "/models",
    crudEndpoint: "/management/models",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama Model" },
      { key: "brand_code", header: "Brand" },
      {
        key: "brand_name",
        header: "Nama Brand",
        render: (item) => {
          const brandData = item.brand || {};
          return brandData.name || "-";
        },
      },
    ],
  },
  "/variants": {
    title: "Varian Peralatan",
    endpoint: "/variants",
    crudEndpoint: "/management/variants",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama Varian" },
      { key: "model_code", header: "Model" },
      {
        key: "model_name",
        header: "Nama Model",
        render: (item) => {
          const modelData = item.model || {};
          return modelData.name || "-";
        },
      },
    ],
  },
  "/locations": {
    title: "Lokasi Uji",
    endpoint: "/locations",
    crudEndpoint: "/management/locations",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama Lokasi" },
      { key: "city_name", header: "Kota", render: (item) => (item.city ? item.city.city_name : "-") },
      { key: "province_name", header: "Provinsi", render: (item) => (item.city && item.city.province ? item.city.province.province_name : "-") },
      { key: "test_type_name", header: "Jenis Uji", render: (item) => (item.test_type ? item.test_type.name : "-") },
      { key: "gmt_offset", header: "GMT Offset", render: (item) => `GMT+${item.city?.gmt_offset || 7}` },
    ],
  },
  "/provinces": {
    title: "Daftar Provinsi",
    endpoint: "/provinces",
    crudEndpoint: "/management/provinces",
    columns: [
      { key: "province_code", header: "Kode" },
      { key: "province_name", header: "Nama Provinsi" },
    ],
  },
  "/cities": {
    title: "Daftar Kota",
    endpoint: "/cities",
    crudEndpoint: "/management/cities",
    columns: [
      { key: "city_code", header: "Kode" },
      { key: "city_name", header: "Nama Kota" },
      { key: "province_code", header: "Kode Prov" },
      { key: "province_name", header: "Nama Provinsi", render: (item) => (item.province ? item.province.province_name : "-") },
      { key: "gmt_offset", header: "GMT Offset", render: (item) => `GMT+${item.gmt_offset || 7}` },
    ],
  },
  "/methodologies": {
    title: "Metodologi Uji",
    endpoint: "/methodologies",
    crudEndpoint: "/management/methodologies",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama" },
      { key: "test_type_code", header: "Jenis Uji" },
      {
        key: "test_type_name",
        header: "Nama Jenis Uji",
        render: (item) => {
          const testTypeData = item.test_type || {};
          return testTypeData.name || "-";
        },
      },
      { key: "scoring_level_code", header: "Level Set" },
      {
        header: "Levels Detail",
        render: (item) => (
          <button
            className="action-btn"
            title="Manage Scoring Levels"
            style={{ background: "#f1f5f9", color: "#6366f1", border: "1px solid #e2e8f0" }}
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigate) onNavigate("/scoring-levels");
            }}
          >
            <i className="fas fa-layer-group"></i>
          </button>
        ),
      },
    ],
  },
  "/test-types": {
    title: "Jenis Uji",
    endpoint: "/test-types",
    crudEndpoint: "/management/test-types",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama" },
    ],
  },


  "/mat-cats": {
    title: "Kategori Materiil",
    endpoint: "/material-categories",
    crudEndpoint: "/management/material-categories",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama Kategori" },
    ],
  },
  "/origins": {
    title: "Negara Asal",
    endpoint: "/origins",
    crudEndpoint: "/management/origins",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama" },
    ],
  },
  "/partner-types": {
    title: "Tipe Rekanan",
    endpoint: "/partner-types",
    crudEndpoint: "/management/partner-types",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama Tipe" },
    ],
  },
  "/user-sessions": {
    title: "Sesi Pengguna",
    endpoint: "/user-sessions",
    crudEndpoint: "/management/user-sessions",
    columns: [
      { key: "id", header: "ID" },
      { key: "user_id", header: "User ID" },
      { key: "ip_address", header: "IP Address" },
      { key: "created_at", header: "Dibuat" },
      { key: "expires_at", header: "Expired" },
    ],
  },

  "/asset-status-mgmt": {
    title: "Manajemen Status Aset",
    endpoint: "/asset-statuses",
    crudEndpoint: "/management/asset-statuses",
    columns: [
      { key: "asset_status_code", header: "Kode Status" },
      { key: "asset_status_name", header: "Nama Status" },
    ],
  },
  "/status-app-mgmt": {
    title: "Manajemen Status Pengajuan",
    endpoint: "/status-applications",
    crudEndpoint: "/management/status-applications",
    columns: [
      { key: "status_code", header: "Kode Status" },
      { key: "desc", header: "Keterangan" },
    ],
  },
  "/tester-masters": {
    title: "Master Tim Penguji",
    endpoint: "/tester-masters",
    crudEndpoint: "/management/tester-masters",
    columns: [
      { key: "tester_id", header: "ID" },
      { key: "name", header: "Nama" },
      { key: "position", header: "Jabatan" },
      { key: "methodology_code", header: "Metodologi" },
    ],
  },
  "/global-params": {
    title: "Parameter Global",
    endpoint: "/global-parameters",
    crudEndpoint: "/management/global-parameters",
    searchField: "search",
    searchPlaceholder: "Cari Nama atau ID...",
    columns: [
      { key: "id", header: "ID" },
      { key: "param_key", header: "Key" },
      { key: "param_value", header: "Value" },
      { key: "description", header: "Deskripsi" },
    ],
  },
  "/scoring-aspects": {
    title: "Aspek Scoring",
    endpoint: "/scoring-aspects",
    crudEndpoint: "/management/scoring-aspects",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama Aspek" },
      { key: "methodology_code", header: "Kode Metodologi" },
      { key: "methodology_name", header: "Metodologi", render: (item) => (item.methodology ? item.methodology.name : "-") },
      { key: "weight", header: "Bobot (%)" },
    ],
  },
  "/scoring-sub-aspects": {
    title: "Sub-Aspek Scoring",
    endpoint: "/scoring-sub-aspects",
    crudEndpoint: "/management/scoring-sub-aspects",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama Sub-Aspek" },
      { key: "aspect_code", header: "Aspect Code" },
      { key: "weight", header: "Bobot (%)" },
      { key: "is_simulator", header: "Simulator", render: (item) => (item.is_simulator ? "YA" : "TIDAK") },
    ],
  },
  "/scoring-sub-aspect-items": {
    title: "Item Sub-Aspek Scoring",
    endpoint: "/scoring-sub-aspect-items",
    crudEndpoint: "/management/scoring-sub-aspect-items",
    columns: [
      { key: "id", header: "ID" },
      { key: "sub_aspect_code", header: "Kode Sub-Aspek" },
      { key: "sub_aspect_name", header: "Sub-Aspek", render: (item) => (item.sub_aspect ? item.sub_aspect.name : "-") },
      { key: "name", header: "Nama Opsi" },
      { key: "score", header: "Skor" },
    ],
  },
  "/scoring-levels": {
    title: "Level Penilaian",
    endpoint: "/scoring-levels",
    crudEndpoint: "/management/scoring-levels",
    columns: [
      { key: "id", header: "ID" },
      { key: "level_group_code", header: "Grup Level" },
      { key: "min_score", header: "Skor Min" },
      { key: "max_score", header: "Skor Max" },
      { key: "label", header: "Label" },
      { key: "description", header: "Deskripsi" },
    ],
  },
  "/testing-tools": {
    title: "Testing Tools",
    endpoint: "/testing-tools",
    crudEndpoint: "/management/testing-tools",
    columns: [
      { key: "code", header: "Kode" },
      { key: "name", header: "Nama Alat" },
      { key: "type", header: "Tipe" },
      { key: "min_stock", header: "Min. Stok / Kapasitas" },
      { key: "location_name", header: "Lokasi", render: (item) => (item.location ? item.location.name : "-") },
    ],
  },
  "/testing-packages": {
    title: "Paket Pengujian (MCU Style)",
    endpoint: "/testing-packages",
    crudEndpoint: "/management/testing-packages",
    searchField: "search",
    searchPlaceholder: "Cari Nama atau Kode...",
    columns: [
      { key: "package_code", header: "Kode Paket" },
      { key: "name", header: "Nama Paket" },
      { key: "base_price", header: "Harga Paket", render: (item) => `Rp ${item.base_price?.toLocaleString() || 0}` },
      { key: "methodology_count", header: "Jumlah Tes", render: (item) => item.methodologies?.length || 0 },
      { key: "is_active", header: "Status", render: (item) => item.is_active ? "Aktif" : "Non-Aktif" },
    ],
  },
  "/hist-package-active-aspects": {
    title: "Riwayat Aspek Aktif Paket",
    endpoint: "/hist-package-active-aspects",
    searchField: "package_id",
    searchPlaceholder: "Cari ID Paket...",
    columns: [
      { key: "id", header: "ID" },
      { key: "package_id", header: "ID Paket" },
      { key: "aspect_code", header: "Kode Aspek" },
      { key: "action_type", header: "Aksi (INSERT/DELETE)" },
      { key: "created_at", header: "Waktu", render: (item) => item.created_at ? new Date(item.created_at).toLocaleString("id-ID") : "-" },
      { key: "created_user", header: "Petugas" },
    ],
  },
  "/hist-package-active-sub-aspects": {
    title: "Riwayat Sub-Aspek Aktif Paket",
    endpoint: "/hist-package-active-sub-aspects",
    searchField: "package_id",
    searchPlaceholder: "Cari ID Paket...",
    columns: [
      { key: "id", header: "ID" },
      { key: "package_id", header: "ID Paket" },
      { key: "sub_aspect_code", header: "Kode Sub-Aspek" },
      { key: "action_type", header: "Aksi (INSERT/DELETE)" },
      { key: "created_at", header: "Waktu", render: (item) => item.created_at ? new Date(item.created_at).toLocaleString("id-ID") : "-" },
      { key: "created_user", header: "Petugas" },
    ],
  },
  "/invoices": {
    title: "Tagihan & Invoice",
    endpoint: "/invoices",
    filterConfig: { showMonthYear: true },
    forceFilter: true,
    hideActions: true,
    searchField: "search",
    searchPlaceholder: "No. Invoice / No. Register",
    columns: [
      { key: "no", header: "No.", render: (item, rowNum) => rowNum },
      { key: "invoice_number", header: "No. Invoice" },
      { key: "reg_number", header: "No. Register", render: (item) => item.application?.reg_number || item.reg_number || "-" },
      { key: "application_id", header: "App ID" },
      { key: "total_amount", header: "Total", render: (item) => `Rp ${item.total_amount?.toLocaleString() || 0}` },
      { key: "status", header: "Status", render: (item) => (
        <span className={`badge ${item.status === 'PAID' ? 'badge-green' : 'badge-yellow'}`}>{item.status}</span>
      )},
      { key: "created_at", header: "Tanggal", render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : "-" },
    ],
  },
  "/reports/invoices": {
    title: "Laporan Tagihan",
    endpoint: "/invoices",
    filterConfig: { 
      showMonthYear: true,
      showPrint: true,
      statusOptions: [
        { value: "UNPAID", label: "Belum Dibayar" },
        { value: "PAID", label: "Lunas" },
        { value: "PARTIAL", label: "Sebagian" }
      ]
    },
    forceFilter: true,
    hideActions: true,
    searchField: "search",
    searchPlaceholder: "No. Invoice / No. Register",
    columns: [
      { key: "no", header: "No.", render: (item, rowNum) => rowNum },
      { key: "invoice_number", header: "No. Invoice" },
      { key: "reg_number", header: "No. Register", render: (item) => item.application?.reg_number || item.reg_number || "-" },
      { key: "application_id", header: "App ID" },
      { key: "total_amount", header: "Total", render: (item) => `Rp ${item.total_amount?.toLocaleString() || 0}` },
      { key: "status", header: "Status", render: (item) => (
        <span className={`badge ${item.status === 'PAID' ? 'badge-green' : 'badge-yellow'}`}>{item.status}</span>
      )},
      { key: "created_at", header: "Tanggal", render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : "-" },
    ],
  },
  "/reports/payments": {
    title: "Laporan Pembayaran",
    endpoint: "/payments",
    filterConfig: { showMonthYear: true, showPrint: true },
    forceFilter: true,
    hideActions: true,
    columns: [
      { key: "no", header: "No.", render: (item, rowNum) => rowNum },
      { key: "payment_date", header: "Tgl Pembayaran", render: (item) => item.payment_date ? new Date(item.payment_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-" },
      { key: "invoice_number", header: "No. Invoice", render: (item) => item.invoice?.invoice_number || item.invoice_number || "-" },
      { key: "reg_number", header: "No. Register", render: (item) => item.invoice?.application?.reg_number || item.reg_number || "-" },
      { key: "amount", header: "Nominal", render: (item) => `Rp ${item.amount?.toLocaleString() || 0}` },
      { key: "payment_method", header: "Metode", render: (item) => item.payment_method || "-" },
      { key: "notes", header: "Referensi", render: (item) => item.notes || "-" },
      { key: "created_user", header: "User", render: (item) => item.created_user || "-" },
    ],
  },
});
