# Panduan Manajemen Kode "Web User Manual LIMS"

Dokumen ini berisi panduan singkat untuk mengelola, mengubah, dan melakukan *deploy* (merilis) aplikasi Web User Manual ini ke server *Production*.

---

## 1. Cara Menambahkan Screenshot Baru

Gambar-gambar *screenshot* asli dari aplikasi LIMS Anda **harus** diletakkan di dalam folder `public`.

1. Buka folder `public/screenshots`.
2. Masukkan file gambar Anda (contoh: `Dashboard-Baru.png`).
3. Buka file `src/content.js`.
4. Cari bagian menu yang ingin ditambahkan gambarnya (misalnya `pendahuluan-dashboard`).
5. Ubah bagian kodenya menjadi seperti ini:
   ```javascript
   mockupType: "image",
   screenshots: ["/screenshots/Dashboard-Baru.png"],
   ```
*(Ingat: Penulisan nama file sangat sensitif terhadap huruf besar dan kecil / case-sensitive).*

---

## 2. Cara Menambah Menu / Halaman Baru

Anda tidak perlu menyentuh kode rumit di `App.jsx`. Anda hanya perlu mengedit file **`src/content.js`**.

1. Di file `content.js`, tambahkan blok kode baru di dalam variabel `MANUAL_CONTENT`.
2. Daftarkan ID menu baru tersebut ke dalam variabel `SIDEBAR_STRUCTURE` di bagian bawah agar ia muncul di navigasi sebelah kiri.

---

## 3. Cara Mengubah Port (Saat Development)

Secara bawaan (*default*), saat Anda menjalankan `npm run dev`, aplikasi akan berjalan di port `5173`. Jika port tersebut bentrok atau Anda ingin mengubahnya:

1. Buka file **`vite.config.js`** (terletak di luar folder `src`, sejajar dengan `package.json`).
2. Tambahkan pengaturan `server: { port: XXXX }` seperti contoh di bawah ini:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       port: 8080 // Ganti dengan port yang Anda inginkan
     }
   })
   ```

---

## 4. Cara Melakukan Deploy ke Server Production (Nginx)

Saat Anda sudah selesai mengisi seluruh teks panduan dan gambar, **JANGAN** gunakan `npm run dev` di server Linux. Ikuti langkah *Best Practice* berikut:

1. Buka terminal di folder `user-manual` ini pada komputer Windows Anda.
2. Jalankan perintah kompilasi:
   ```bash
   npm run build
   ```
3. Tunggu hingga selesai. Sistem akan otomatis membuat sebuah folder baru bernama **`dist`** (Kependekan dari *Distribution*).
4. Folder `dist` ini berisi file HTML, CSS, dan JS murni yang ukurannya sangat kecil.
5. **Upload (Unggah) seluruh ISI dari folder `dist` tersebut** ke dalam direktori Nginx di server VPS Linux Anda (misalnya ke `/var/www/html/lims-manual`).
6. Aplikasi Web Manual Anda kini sudah siap diakses oleh seluruh pegawai tanpa perlu menjalankan Node.js di server!
