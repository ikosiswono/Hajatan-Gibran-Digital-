import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Satu acara • Satu sistem • Tersinkron</span>
              <h1>Hajatan Gibran <span>Digital</span></h1>
              <p>Dokumentasi, pendataan, dan pengelolaan acara dalam satu website yang ramah HP dan dapat digunakan bersama dari berbagai perangkat.</p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/kirim-foto">Kirim Dokumentasi</Link>
                <Link className="btn btn-ghost" href="/galeri">Lihat Galeri</Link>
              </div>
              <div className="hero-trust">
                <span>✓ Data terpusat</span><span>✓ Sinkron antar perangkat</span><span>✓ Dokumentasi Drive</span>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="visual-card visual-main"><span className="visual-icon">✦</span><strong>Momen Gibran</strong><small>Tersimpan rapi, mudah ditemukan.</small></div>
              <div className="visual-card visual-float top"><b>Live Data</b><span className="pulse-dot" /> Sinkron</div>
              <div className="visual-card visual-float bottom"><b>Galeri</b><span>Foto terpilih</span></div>
            </div>
          </div>
        </section>

        <section className="section container">
          <div className="section-heading"><span className="eyebrow">Fitur utama</span><h2>Semua kebutuhan acara lebih teratur</h2><p>Dibuat agar mudah dipahami panitia dan nyaman digunakan langsung dari HP.</p></div>
          <div className="feature-grid">
            <article className="feature-card"><div className="feature-icon">◎</div><h3>Buku Tamu Digital</h3><p>Catat tamu dan alamat secara terpusat agar tidak tercecer di perangkat tertentu.</p></article>
            <article className="feature-card"><div className="feature-icon">Rp</div><h3>Telitian Terpisah</h3><p>Telitian anak dan dewasa dicatat terpisah, dengan total otomatis dan riwayat aktivitas.</p></article>
            <article className="feature-card"><div className="feature-icon">▣</div><h3>Dokumentasi Bersama</h3><p>Tamu dapat mengirim foto. Admin memoderasi sebelum foto ditampilkan di galeri publik.</p></article>
            <article className="feature-card"><div className="feature-icon">↻</div><h3>Backup & Aktivitas</h3><p>Perubahan penting dicatat dan database dapat dicadangkan ke Google Drive.</p></article>
          </div>
        </section>

        <section className="section soft-section">
          <div className="container split-callout">
            <div><span className="eyebrow">Bagikan momen</span><h2>Punya foto acara yang bagus?</h2><p>Kirim langsung melalui halaman dokumentasi. Foto akan masuk ke antrean persetujuan panitia.</p></div>
            <Link className="btn btn-primary" href="/kirim-foto">Buka Form Kirim Foto</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
