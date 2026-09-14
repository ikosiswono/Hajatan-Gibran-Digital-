"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import KirimFotoQrModal from "@/components/KirimFotoQrModal";

const links = [
  ["/", "Beranda"],
  ["/galeri", "Galeri"],
  ["/kirim-foto", "Kirim Foto"],
  ["/tentang", "Tentang"]
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [showQr, setShowQr] = useState(false);

  return (
    <>
      <header className="public-header" id="public-header">
        <div className="container header-inner" id="public-header-inner">
          <Link href="/" className="brand-link" id="public-brand-link"><BrandMark /></Link>
          <nav className="desktop-nav" id="public-desktop-nav" aria-label="Navigasi utama">
            {links.map(([href, label]) => (
              <Link key={href} id={`public-nav-${href.replace(/\//g, "") || "beranda"}`} className={pathname === href ? "nav-link active" : "nav-link"} href={href}>{label}</Link>
            ))}
            <button
              type="button"
              id="btn-header-qr-code"
              className="nav-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
              onClick={() => setShowQr(true)}
              title="Tampilkan QR Code Kirim Foto"
            >
              <span>📱</span> QR Kirim Foto
            </button>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              id="btn-header-qr-mobile-trigger"
              className="btn btn-soft btn-small"
              onClick={() => setShowQr(true)}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
              title="QR Code Ponsel"
            >
              <span>📱</span> QR
            </button>
            <Link className="btn btn-soft btn-small" id="btn-nav-admin" href="/login">Admin</Link>
          </div>
        </div>
        <nav className="mobile-public-nav" id="public-mobile-nav" aria-label="Navigasi mobile">
          {links.map(([href, label]) => (
            <Link key={href} id={`public-mobile-nav-${href.replace(/\//g, "") || "beranda"}`} className={pathname === href ? "active" : ""} href={href}>{label}</Link>
          ))}
          <button
            type="button"
            id="public-mobile-nav-qr"
            style={{
              background: "none",
              border: "none",
              fontSize: "10px",
              color: "var(--primary-dark)",
              fontWeight: 750,
              padding: "7px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px"
            }}
            onClick={() => setShowQr(true)}
          >
            <span>📱</span> QR Kirim
          </button>
        </nav>
      </header>

      <KirimFotoQrModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        title="QR Code Kirim Dokumentasi"
        subtitle="Arahkan kamera ponsel Anda ke QR code ini untuk membuka halaman pengiriman foto secara instan."
      />
    </>
  );
}

