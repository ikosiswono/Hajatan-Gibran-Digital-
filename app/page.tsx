import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import KirimFotoQrCard from "@/components/KirimFotoQrCard";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main id="home-main-content">
        <section className="hero-section" id="home-hero-section">
          <div className="container hero-grid" id="home-hero-grid">
            <div className="hero-copy" id="home-hero-copy">
              <span className="eyebrow">Satu acara • Satu sistem • Tersinkron</span>
              <h1>Hajatan Gibran <span>Digital</span></h1>
              <p>Dokumentasi, pendataan, dan pengelolaan acara dalam satu website yang ramah HP dan dapat digunakan bersama dari berbagai perangkat.</p>
              <div className="hero-actions" id="home-hero-actions">
                <Link id="btn-hero-kirim-foto" className="btn btn-primary" href="/kirim-foto">Kirim Dokumentasi</Link>
                <Link id="btn-hero-galeri" className="btn btn-ghost" href="/galeri">Lihat Galeri</Link>
              </div>
              <div style={{ marginTop: "22px", maxWidth: "340px" }}>
                <KirimFotoQrCard compact idPrefix="hero-qr" />
              </div>
              <div className="hero-trust" id="home-hero-trust">
                <span>✓ Data terpusat</span><span>✓ Sinkron antar perangkat</span><span>✓ Dokumentasi Drive</span>
              </div>
            </div>
            <div className="hero-visual" id="home-hero-visual">
              <div className="visual-card visual-main" id="card-visual-main">
                <KirimFotoQrCard showTitle={false} idPrefix="hero-visual-qr" />
                <small style={{ marginTop: "10px", color: "var(--muted)", fontSize: "12px", fontWeight: 600 }}>
                  Scan Kamera HP untuk Kirim Foto
                </small>
              </div>
              <div className="visual-card visual-float top" id="card-visual-live"><b>Live Data</b><span className="pulse-dot" /> Sinkron</div>
              <div className="visual-card visual-float bottom" id="card-visual-galeri"><b>Galeri</b><span>Foto terpilih</span></div>
            </div>
          </div>
        </section>

        <section className="section container" id="home-features-section">
          <div className="section-heading" id="features-heading"><span className="eyebrow">Fitur utama</span><h2>Semua kebutuhan acara lebih teratur</h2><p>Dibuat agar mudah dipahami panitia dan nyaman digunakan langsung dari HP.</p></div>
          <div className="feature-grid" id="features-grid">
            <article className="feature-card" id="feat-buku-tamu"><div className="feature-icon">◎</div><h3>Buku Tamu Digital</h3><p>Catat tamu dan alamat secara terpusat agar tidak tercecer di perangkat tertentu.</p></article>
            <article className="feature-card" id="feat-telitian"><div className="feature-icon">Rp</div><h3>Telitian Terpisah</h3><p>Telitian anak dan dewasa dicatat terpisah, dengan total otomatis dan riwayat aktivitas.</p></article>
            <article className="feature-card" id="feat-dokumentasi"><div className="feature-icon">▣</div><h3>Dokumentasi Bersama</h3><p>Tamu dapat mengirim foto. Admin memoderasi sebelum foto ditampilkan di galeri publik.</p></article>
            <article className="feature-card" id="feat-backup"><div className="feature-icon">↻</div><h3>Backup & Aktivitas</h3><p>Perubahan penting dicatat dan database dapat dicadangkan ke Google Drive.</p></article>
          </div>
        </section>

        <section className="section soft-section" id="home-cta-section">
          <div className="container split-callout" id="home-split-callout" style={{ alignItems: "center" }}>
            <div>
              <span className="eyebrow">Bagikan momen</span>
              <h2>Punya foto acara yang bagus?</h2>
              <p>Kirim langsung melalui halaman dokumentasi dari ponsel Anda. Foto akan masuk ke antrean persetujuan panitia sebelum tampil di galeri.</p>
              <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link id="btn-cta-kirim-foto" className="btn btn-primary" href="/kirim-foto">Buka Form Kirim Foto</Link>
                <Link id="btn-cta-galeri" className="btn btn-ghost" href="/galeri">Lihat Galeri</Link>
              </div>
            </div>
            <div style={{ minWidth: "260px" }}>
              <KirimFotoQrCard idPrefix="cta-qr" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
