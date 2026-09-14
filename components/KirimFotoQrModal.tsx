"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function KirimFotoQrModal({
  isOpen,
  onClose,
  title = "Scan QR Code Kirim Foto",
  subtitle = "Arahkan kamera ponsel Anda untuk langsung membuka formulir pengiriman foto."
}: QrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/kirim-foto`;
      setTargetUrl(url);

      QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: {
          dark: "#241f32",
          light: "#ffffff"
        },
        errorCorrectionLevel: "H"
      })
        .then((data) => setQrDataUrl(data))
        .catch((err) => console.error("Gagal membuat QR Code:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleCopy() {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  }

  function handleDownload() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "QR-Code-Kirim-Foto-Hajatan-Gibran.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="lightbox"
      id="qr-modal-backdrop"
      onClick={onClose}
      style={{ zIndex: 110 }}
    >
      <div
        className="lightbox-card"
        id="qr-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          padding: "28px 24px",
          textAlign: "center",
          borderRadius: "24px"
        }}
      >
        <button
          id="btn-close-qr-modal"
          className="lightbox-close"
          onClick={onClose}
          aria-label="Tutup"
        >
          ×
        </button>

        <span className="eyebrow" style={{ marginBottom: "6px" }}>
          Akses Cepat Ponsel
        </span>
        <h2 style={{ margin: "0 0 6px", fontSize: "22px", letterSpacing: "-0.03em" }}>
          {title}
        </h2>
        <p style={{ margin: "0 0 18px", color: "var(--muted)", fontSize: "13px" }}>
          {subtitle}
        </p>

        <div
          id="qr-code-image-container"
          style={{
            background: "#fff",
            padding: "16px",
            borderRadius: "20px",
            border: "1px solid var(--line)",
            boxShadow: "0 10px 30px rgba(118,86,216,0.12)",
            margin: "0 auto 16px",
            width: "240px",
            height: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}
        >
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="QR Code Kirim Foto"
              width={208}
              height={208}
              unoptimized
              priority
              style={{ display: "block" }}
            />
          ) : (
            <div style={{ color: "var(--muted)", fontSize: "12px" }}>Menyiapkan QR Code...</div>
          )}
        </div>

        <div
          style={{
            background: "var(--surface-2)",
            padding: "8px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            color: "var(--primary-dark)",
            fontWeight: 600,
            marginBottom: "16px",
            wordBreak: "break-all",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px"
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {targetUrl}
          </span>
          <button
            type="button"
            id="btn-copy-qr-url"
            onClick={handleCopy}
            className="btn btn-soft btn-small"
            style={{ padding: "4px 8px", fontSize: "11px", flexShrink: 0 }}
          >
            {copied ? "✓ Tersalin" : "Salin"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            type="button"
            id="btn-download-qr"
            className="btn btn-primary btn-small"
            onClick={handleDownload}
            disabled={!qrDataUrl}
          >
            ⬇ Unduh Gambar QR
          </button>
          <button
            type="button"
            id="btn-print-qr"
            className="btn btn-ghost btn-small"
            onClick={handlePrint}
          >
            🖨 Cetak Meja
          </button>
        </div>
      </div>
    </div>
  );
}
