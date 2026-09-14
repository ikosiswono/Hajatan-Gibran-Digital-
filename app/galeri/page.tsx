"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { apiCall } from "@/lib/clientApi";
import type { DokumentasiRow } from "@/lib/types";
import KirimFotoQrCard from "@/components/KirimFotoQrCard";
import KirimFotoQrModal from "@/components/KirimFotoQrModal";

const cats=["Semua","Persiapan","Acara Utama","Keluarga","Tamu","Panitia","Singa Dangdut","Telitian","Dekorasi","Hiburan","Lainnya"];
export default function GaleriPage() {
  const [rows, setRows] = useState<DokumentasiRow[]>([]);
  const [cat, setCat] = useState("Semua");
  const [active, setActive] = useState<DokumentasiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  const load = useCallback(async () => {
    const r = await apiCall<DokumentasiRow[]>("getPublicGallery");
    if (r.ok) setRows(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(
    () => (cat === "Semua" ? rows : rows.filter((r) => r.Kategori === cat)),
    [rows, cat]
  );

  return (
    <>
      <PublicHeader />
      <main className="page-main container" id="galeri-page-root">
        <div
          id="galeri-header-flex"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}
        >
          <div className="page-title" id="galeri-page-title" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Momen kebersamaan</span>
            <h1>Galeri Hajatan Gibran</h1>
            <p>Dokumentasi yang telah disetujui panitia akan tampil di sini.</p>
            <div style={{ marginTop: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                id="btn-galeri-open-qr"
                className="btn btn-soft btn-small"
                onClick={() => setShowQrModal(true)}
              >
                📱 QR Code Kirim Foto
              </button>
              <Link id="link-galeri-kirim-foto" href="/kirim-foto" className="btn btn-primary btn-small">
                + Kirim Foto Baru
              </Link>
            </div>
          </div>

          <div style={{ width: "min(360px, 100%)" }}>
            <KirimFotoQrCard compact idPrefix="galeri-header-qr" />
          </div>
        </div>

        <div className="chip-row" id="galeri-category-chips">
          {cats.map((c) => (
            <button
              key={c}
              id={`chip-cat-${c.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setCat(c)}
              className={cat === c ? "chip active" : "chip"}
            >
              {c}
            </button>
          ))}
        </div>
        {loading ? (
          <div id="galeri-loading-state" className="empty-state big">Memuat galeri...</div>
        ) : !shown.length ? (
          <div id="galeri-empty-state" className="empty-state big">Belum ada dokumentasi pada kategori ini.</div>
        ) : (
          <div className="gallery-grid" id="galeri-grid">
            {shown.map((r) => (
              <button
                id={`btn-gallery-${r.ID_DOK}`}
                className="gallery-item"
                key={r.ID_DOK}
                onClick={() => setActive(r)}
              >
                <Image
                  src={r.Thumbnail_URL || r.Drive_URL}
                  alt={r.Judul || "Dokumentasi Hajatan Gibran"}
                  fill
                  sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
                  unoptimized
                />
                <span className="gallery-overlay">
                  <b>{r.Judul || r.Kategori}</b>
                  <small>{r.Kategori}</small>
                </span>
              </button>
            ))}
          </div>
        )}
        {active && (
          <div className="lightbox" id="galeri-lightbox" onClick={() => setActive(null)}>
            <div className="lightbox-card" id="lightbox-card" onClick={(e) => { e.stopPropagation(); }}>
              <button id="btn-close-lightbox" className="lightbox-close" onClick={() => setActive(null)}>×</button>
              <div className="lightbox-image" id="lightbox-image-box">
                <Image
                  src={active.Drive_URL || active.Thumbnail_URL}
                  alt={active.Judul || "Dokumentasi"}
                  fill
                  sizes="90vw"
                  unoptimized
                />
              </div>
              <div className="lightbox-copy" id="lightbox-copy-box">
                <span className="eyebrow">{active.Kategori}</span>
                <h2>{active.Judul || "Dokumentasi Hajatan"}</h2>
                <p>{active.Keterangan}</p>
                <small>Dikirim oleh {active.Nama_Pengirim} • {active.Tanggal}</small>
              </div>
            </div>
          </div>
        )}

        <KirimFotoQrModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          title="Kirim Foto ke Galeri"
          subtitle="Arahkan kamera HP Anda ke QR Code untuk mengunggah momen acara langsung dari ponsel."
        />
      </main>
      <Footer />
    </>
  );
}
