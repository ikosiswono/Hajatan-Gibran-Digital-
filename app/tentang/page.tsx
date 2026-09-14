import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export default function TentangPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-main container" id="tentang-page-root">
        <div className="page-title" id="tentang-page-title">
          <span className="eyebrow">Tentang sistem</span>
          <h1>Hajatan Gibran Digital</h1>
          <p>Sistem sederhana untuk membantu keluarga dan panitia mengelola data serta dokumentasi acara dari berbagai perangkat.</p>
        </div>
        <div className="content-card prose" id="tentang-content-card">
          <h2>Tujuan</h2>
          <p>Website ini dirancang agar data operasional tidak tersimpan hanya di satu HP. Data utama disimpan di Google Sheets melalui Google Apps Script, sedangkan dokumentasi gambar disimpan di Google Drive.</p>
          <h2>Cara kerja</h2>
          <p>Website yang berjalan di Vercel berkomunikasi dengan API server-side. API tersebut meneruskan data secara aman ke Google Apps Script. Perangkat lain membaca sumber yang sama sehingga informasi dapat tersinkron.</p>
          <h2>Dokumentasi publik</h2>
          <p>Foto yang dikirim tamu tidak langsung tampil di galeri. Panitia dapat menyetujui atau menolaknya terlebih dahulu dari panel admin.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
