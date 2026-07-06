# MEC System: Master API Documentation (Harden Version)

Dokumen ini adalah referensi lengkap seluruh endpoint API MEC System yang telah diamankan (kecuali Login).

## 1. Protokol Autentikasi
Seluruh request ke `/api` (selain login) wajib menyertakan header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 2. Endpoint Publik
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Header: `Content-Type: application/json`. Body: `{"username": "...", "password": "..."}` |

---

## 3. Koleksi API Operasional (Core)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/config` | Mengambil konfigurasi sistem (Kini Aman/Wajib Auth) |
| `GET` | `/api/menus` | Daftar menu sidebar berdasarkan role login |
| `GET` | `/api/dashboard-stats` | Statistik kartu & grafik untuk Dashboard |
| `GET` | `/api/notifications` | Notifikasi real-time untuk user |
| `GET` | `/api/download` | Unduh file (Query: `?path=...`) |

---

## 4. Alur Kerja Pengujian (Workflow)
Modul utama yang digunakan di MEC System:

| Stage | Method | Endpoint | Keterangan |
| :--- | :--- | :--- | :--- |
| **All** | `GET` | `/api/applications` | List data (Param: `status`, `page`, `start_date`) |
| **Registrasi** | `POST` | `/api/applications` | Body: `form-data` (karena kirim file) |
| **Detail** | `GET` | `/api/applications/:id` | Detail lengkap satu pengajuan & peralatan |
| **Verification** | `PUT` | `/api/applications/:id/verify` | Body JSON: `{"status": "VERIFIED"}` |
| **Approval** | `PUT` | `/api/applications/:id/approve` | Body JSON: `{"status": "APPROVED"}` |
| **Planning** | `PUT` | `/api/applications/:id/plan` | Setting jadwal uji & tim penguji |
| **Execution** | `PUT` | `/api/applications/:id/execute` | Input hasil pengujian lapangan |
| **Analysis** | `PUT` | `/api/applications/:id/analyze` | Input analisa data tingkat lanjut |
| **Finalize** | `PUT` | `/api/applications/:id/finalize` | Penerbitan status akhir (Lulus/Gagal) |

---

## 5. Master Data & Management (Admin Only)
Endpoint di bawah prefix `/api/management` hanya dapat diakses oleh role `ADMIN`.

| Master Data | Endpoint CRUD (`POST`, `PUT`, `DELETE`) |
| :--- | :--- |
| **Users** | `/api/management/users` |
| **Partners** | `/api/management/partners` |
| **Test Standards**| `/api/management/test-standards` |
| **Master Testers**| `/api/management/tester-masters` |
| **Global Param** | `/api/management/global-parameters` |

---

## 6. Fitur Pemeliharaan Database (Admin)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/management/db/backup` | Mendownload file backup database (.sql) |
| `POST` | `/api/management/db/sync` | Sinkronisasi skema tabel & partisi baru |
| `POST` | `/api/management/db/archive` | Memindahkan data lama ke tabel arsip |

---

## 7. Contoh Pengujian Versi Cepat (CURL)

### Login (Mendapatkan Token)
```bash
curl -X POST http://localhost:8080/api/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "password"}'
```

### Ambil Data dengan Token
```bash
curl -X GET http://localhost:8080/api/applications \
     -H "Authorization: Bearer <TOKEN_ANDA>"
```

### Update Parameter Global (TTL)
```bash
curl -X PUT http://localhost:8080/api/management/global-parameters/1 \
     -H "Authorization: Bearer <TOKEN_ANDA>" \
     -H "Content-Type: application/json" \
     -d '{"param_key": "FRONTEND_DATA_TTL_SECONDS", "param_value": "45"}'
```

---

> [!CAUTION]
> **Penting**: Token memiliki masa berlaku terbatas. Jika Anda menerima error **401 Unauthorized**, silakan lakukan login ulang untuk mendapatkan token baru.
