# Hajatan Gibran Digital

Website full-stack ringan untuk pendataan dan dokumentasi hajatan. Frontend menggunakan **Next.js** dan siap dideploy ke **Vercel**. Backend menggunakan **Google Apps Script**, database utama **Google Sheets**, dan penyimpanan foto **Google Drive**.

## Fitur

- Landing page modern dan mobile-first.
- Login admin dengan cookie HTTP-only.
- Dashboard sinkron otomatis setiap 5 detik.
- Buku Tamu digital.
- Telitian Anak dan Telitian Dewasa terpisah.
- Total nominal otomatis.
- CRUD data telitian, tamu, dan panitia.
- Upload dokumentasi dari HP.
- Kompresi foto di browser sebelum upload.
- Penyimpanan foto ke Google Drive.
- Moderasi foto: Menunggu Persetujuan / Disetujui / Ditolak.
- Galeri publik hanya menampilkan foto yang disetujui.
- Log aktivitas.
- Backup spreadsheet ke Google Drive.
- Export CSV dan Print untuk tabel utama.
- Responsive untuk HP, tablet, laptop, dan desktop.
- PWA manifest dasar.

---

## Arsitektur

```text
HP / Laptop / PC
      │
      ▼
Next.js di Vercel
      │
      ▼
/api/backend (server-side proxy)
      │ APP_SECRET hanya di server
      ▼
Google Apps Script Web App
      ├── Google Sheets (database)
      └── Google Drive (dokumentasi + backup)
```

Data utama **tidak disimpan di localStorage**. Semua perangkat membaca database Google Sheets yang sama.

---

# 1. Persiapan Google Spreadsheet

1. Buat Google Spreadsheet baru.
2. Nama bebas, contoh: `Database Hajatan Gibran Digital`.
3. Ambil Spreadsheet ID dari URL.

Contoh:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Anda tidak perlu membuat sheet satu per satu. Fungsi `setupProject()` akan membuat dan menata sheet secara otomatis.

Sheet yang dibuat:

- Dashboard
- Tamu
- Telitian Anak
- Telitian Dewasa
- Dokumentasi
- Panitia
- Aktivitas
- Pengaturan
- Backup

---

# 2. Persiapan Google Drive

1. Buat folder baru di Google Drive.
2. Nama disarankan: `Hajatan Gibran Digital`.
3. Buka folder dan salin Folder ID dari URL.

Contoh:

```text
https://drive.google.com/drive/folders/FOLDER_ID
```

Script akan membuat subfolder otomatis:

```text
Hajatan Gibran Digital/
├── Dokumentasi Tamu/
├── Dokumentasi Panitia/
├── Persiapan/
├── Acara Utama/
├── Keluarga/
├── Singa Dangdut/
├── Telitian/
├── Dekorasi/
├── Hiburan/
├── Lainnya/
└── Backup/
```

---

# 3. Pasang Google Apps Script

Cara paling mudah:

1. Buka Spreadsheet database.
2. Pilih **Extensions / Ekstensi → Apps Script**.
3. Hapus kode contoh.
4. Buat dua file Apps Script:
   - `Code.gs`
   - `Setup.gs`
5. Salin isi dari folder project:
   - `apps-script/Code.gs`
   - `apps-script/Setup.gs`

Di `Setup.gs`, ubah:

```javascript
const INITIAL_SETUP = {
  SPREADSHEET_ID: 'GANTI_DENGAN_SPREADSHEET_ID',
  ROOT_DRIVE_FOLDER_ID: 'GANTI_DENGAN_FOLDER_ID',
  APP_SECRET: 'GANTI_DENGAN_SECRET_RANDOM_YANG_PANJANG'
};
```

Gunakan APP_SECRET acak dan panjang. Contoh pola:

```text
HGD_2026_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Jangan gunakan contoh tersebut secara persis.

## Jalankan setup

1. Pilih fungsi `setupProject`.
2. Klik **Run / Jalankan**.
3. Berikan izin akses Spreadsheet dan Google Drive.
4. Setelah selesai, semua sheet dan folder pendukung akan tersedia.

---

# 4. Deploy Apps Script sebagai Web App

Di Apps Script:

1. Klik **Deploy → New deployment**.
2. Pilih **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Klik Deploy.
6. Salin URL yang berakhir `/exec`.

Contoh:

```text
https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec
```

Walaupun deployment dapat dipanggil publik, setiap request data tetap diperiksa menggunakan `APP_SECRET`. Browser pengguna tidak mendapatkan secret karena request ke Apps Script dikirim melalui server Vercel.

---

# 5. Setup Website Next.js

Pastikan Node.js versi modern terpasang.

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
APP_SECRET=SECRET_YANG_SAMA_DENGAN_APPS_SCRIPT
ADMIN_PASSWORD=PASSWORD_ADMIN_ANDA
SESSION_SECRET=STRING_RANDOM_MINIMAL_32_KARAKTER
```

Penting:

- `APP_SECRET` harus sama persis dengan yang digunakan saat `setupProject()`.
- `ADMIN_PASSWORD` adalah password login halaman `/login`.
- `SESSION_SECRET` berbeda dari password admin dan sebaiknya berupa string random panjang.
- Jangan menambahkan prefix `NEXT_PUBLIC_` pada secret.

Jalankan lokal:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

---

# 6. Deploy ke GitHub dan Vercel

## GitHub

Buat repository baru, lalu upload semua file project **kecuali** `.env.local`.

File `.env.local` sudah diabaikan oleh `.gitignore`.

## Vercel

1. Login Vercel.
2. **Add New → Project**.
3. Import repository GitHub project ini.
4. Framework akan terdeteksi sebagai Next.js.
5. Tambahkan Environment Variables:

```text
APPS_SCRIPT_URL
APP_SECRET
ADMIN_PASSWORD
SESSION_SECRET
```

6. Deploy.

Tidak diperlukan `vercel.json` khusus untuk penggunaan normal.

---

# 7. Alur Sinkronisasi Data

Contoh:

1. Petugas A membuka website di HP dan menambah Telitian Anak.
2. Data dikirim ke `/api/backend` di Vercel.
3. Server Vercel meneruskan request ke Apps Script menggunakan APP_SECRET.
4. Apps Script menulis data ke Google Sheets.
5. Petugas B membuka dashboard dari laptop.
6. Halaman admin melakukan refresh data otomatis setiap ±5 detik.
7. Data baru tampil tanpa perlu memindahkan file antar perangkat.

Ini adalah **near-realtime polling**, bukan WebSocket realtime penuh. Untuk kebutuhan operasional hajatan, pendekatan ini lebih sederhana dan cocok dengan Apps Script.

---

# 8. Sistem Dokumentasi Foto

Halaman publik:

```text
/kirim-foto
```

Alur:

1. Pengunjung memilih maksimal 5 foto.
2. Browser mengecilkan dimensi dan mengompres foto.
3. Setiap foto dikirim satu per satu.
4. Vercel meneruskan foto ke Apps Script.
5. Apps Script menyimpan file ke Google Drive.
6. Metadata disimpan di Sheet `Dokumentasi`.
7. Status awal: `Menunggu Persetujuan`.
8. Admin membuka `/admin/dokumentasi`.
9. Admin memilih Setujui / Tolak / Hapus.
10. Hanya status `Disetujui` yang muncul di `/galeri`.

## Catatan akses gambar Drive

Versi ini mencoba mengatur file hasil upload sebagai **Anyone with the link / Viewer** agar thumbnail dan foto dapat dirender pada website. File yang belum disetujui tidak dicantumkan di galeri publik, tetapi file tetap memiliki link berbagi.

Pada akun Google Workspace tertentu, administrator domain dapat melarang sharing publik. Jika hal tersebut terjadi, gunakan akun Drive yang mengizinkan link sharing atau migrasikan penyimpanan foto ke object storage seperti Vercel Blob / Supabase Storage / Cloudinary.

---

# 9. Backup Otomatis

Backup manual tersedia pada:

```text
/admin/pengaturan
```

Untuk backup otomatis:

1. Buka Apps Script.
2. Jalankan fungsi `installDailyBackupTrigger()` satu kali.
3. Script membuat trigger `scheduledBackup` setiap hari sekitar pukul 02.00 zona waktu project Apps Script.

Pastikan timezone project Apps Script diatur ke **Asia/Jakarta**.

Backup berupa salinan file Spreadsheet ke subfolder `Backup`.

---

# 10. Keamanan yang Sudah Diterapkan

- APP_SECRET tidak ditaruh di frontend.
- Apps Script hanya menerima request dengan secret yang benar.
- Login admin menggunakan cookie HTTP-only.
- Data keuangan tidak tersedia melalui endpoint publik.
- Validasi nominal dilakukan di frontend dan backend.
- Teks dibatasi dan karakter HTML dasar dibersihkan.
- Upload hanya menerima JPEG, PNG, dan WebP.
- Ukuran gambar dibatasi setelah kompresi.
- Tombol upload dinonaktifkan saat proses berlangsung.
- ID data tidak bergantung pada nomor baris spreadsheet.
- Penulisan menggunakan `LockService` untuk mengurangi bentrok saat beberapa perangkat menulis bersamaan.
- Aktivitas penting dicatat di sheet Aktivitas.

## Untuk penggunaan publik yang sangat ramai

Apps Script mempunyai quota. Sistem ini ditujukan untuk acara keluarga/skala ringan sampai menengah. Jika lalu lintas menjadi sangat besar, backend dapat dimigrasikan ke Supabase/Firebase tanpa harus mengganti konsep UI secara total.

---

# 11. URL Utama

Publik:

```text
/               Beranda
/galeri         Galeri publik
/kirim-foto     Form upload dokumentasi
/tentang        Penjelasan sistem
/login          Login admin
```

Admin:

```text
/admin
/admin/tamu
/admin/telitian-anak
/admin/telitian-dewasa
/admin/dokumentasi
/admin/panitia
/admin/aktivitas
/admin/pengaturan
```

---

# 12. Troubleshooting

## `Server belum dikonfigurasi`

Periksa Environment Variables Vercel:

- APPS_SCRIPT_URL
- APP_SECRET
- ADMIN_PASSWORD
- SESSION_SECRET

Setelah mengubah Environment Variables, lakukan Redeploy.

## Apps Script mengembalikan `Akses ditolak`

APP_SECRET Vercel berbeda dengan APP_SECRET pada Script Properties Apps Script. Jalankan ulang `setupProject()` setelah memastikan nilainya benar atau ubah Script Properties secara manual.

## Foto berhasil upload tetapi tidak tampil

Periksa:

1. Status dokumentasi sudah `Disetujui`.
2. Kebijakan Google Drive mengizinkan Anyone with the link.
3. File tidak dipindah/dihapus manual dari Drive.

## Data tidak muncul di perangkat lain

1. Pastikan kedua perangkat membuka deployment Vercel yang sama.
2. Pastikan APPS_SCRIPT_URL menunjuk deployment Apps Script yang sama.
3. Pastikan Spreadsheet ID yang digunakan Apps Script benar.

## Mengubah Code.gs setelah deployment

Jika menggunakan deployment Apps Script versi tertentu, buat **New version** / edit deployment agar kode terbaru dipakai oleh URL `/exec`.

---

# 13. Saran Pengembangan Berikutnya

Fondasi project sudah disiapkan agar dapat dikembangkan dengan fitur tambahan seperti:

- QR Code langsung menuju `/kirim-foto`.
- Mode layar besar/slideshow galeri saat acara.
- Daftar jadwal acara.
- Dashboard panitia per bagian.
- Export XLSX/PDF server-side.
- Undangan digital.
- Nomor antrean foto/panggung.
- Rekap pemasukan per petugas.
- PIN berbeda untuk masing-masing petugas.
- Rate limiting upload publik.
- Notifikasi admin ketika dokumentasi baru masuk.

---

## Struktur Project

```text
hajatan-gibran-digital/
├── app/
│   ├── api/
│   ├── admin/
│   ├── galeri/
│   ├── kirim-foto/
│   ├── login/
│   ├── tentang/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── apps-script/
│   ├── Code.gs
│   └── Setup.gs
├── components/
├── lib/
├── public/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

Project ini dibuat agar dapat langsung disambungkan ke Google Sheets + Drive setelah konfigurasi awal selesai.
