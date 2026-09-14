# Setup Ringkas — Hajatan Gibran Digital

## A. Google

1. Buat **Google Spreadsheet** baru → salin Spreadsheet ID.
2. Buat folder Drive **Hajatan Gibran Digital** → salin Folder ID.
3. Dari Spreadsheet buka **Ekstensi → Apps Script**.
4. Buat `Code.gs` dan `Setup.gs`, lalu salin file dari folder `apps-script/`.
5. Edit `INITIAL_SETUP` di `Setup.gs`.
6. Jalankan `setupProject()` satu kali dan izinkan akses.
7. Deploy Apps Script sebagai **Web app**:
   - **Execute as**: Me (email Anda)
   - **Who has access**: **Anyone** (Siapa saja)  *(Wajib Anyone agar tidak terkena error HTML/Google Login redirect)*
8. Salin URL `/exec` ke `APPS_SCRIPT_URL`.

> 💡 **Solusi Error "Unexpected token '<', <!doctype...":**
> Buka Apps Script > klik tombol biru **Deploy** > **Manage deployments** > klik ikon **Pensil (Edit)** > pastikan **Who has access** adalah **Anyone**, pilih **New version**, lalu klik **Deploy**. Pastikan juga URL yang disalin berakhiran `/exec`, bukan link editor `/edit` atau `/dev`.

## B. Website

1. Buka folder project.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env.local`.
4. Isi `APPS_SCRIPT_URL`, `APP_SECRET`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
5. Jalankan `npm run dev` untuk tes.

## C. Vercel

1. Upload project ke GitHub.
2. Import repository ke Vercel.
3. Tambahkan empat Environment Variables yang sama.
4. Deploy.

## D. Tes wajib sebelum hari acara

- Login `/login` berhasil.
- Tambah 1 tamu dari HP, cek muncul di laptop.
- Tambah Telitian Anak/Dewasa, cek total dashboard.
- Kirim foto melalui `/kirim-foto`.
- Setujui foto di `/admin/dokumentasi`.
- Cek foto muncul di `/galeri`.
- Buat backup dari `/admin/pengaturan`.

Panduan lengkap ada di `README.md`.
