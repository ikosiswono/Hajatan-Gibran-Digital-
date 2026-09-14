"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import KirimFotoQrModal from "./KirimFotoQrModal";

interface QrCardProps {
  compact?: boolean;
  showTitle?: boolean;
  className?: string;
  idPrefix?: string;
}

export default function KirimFotoQrCard({
  compact = false,
  showTitle = true,
  className = "",
  idPrefix = "qr-card"
}: QrCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/kirim-foto`;
      setTargetUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: "#241f32",
          light: "#ffffff"
        },
        errorCorrectionLevel: "M"
      })
        .then((data) => setQrDataUrl(data))
        .catch((err) => console.error("Gagal membuat QR Code:", err));
    }
  }, []);

  async function handleCopy() {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  if (compact) {
    return (
      <>
        <div
          className={`qr-compact-box ${className}`}
          id={`${idPrefix}-compact`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "16px",
            padding: "12px 14px",
            boxShadow: "0 4px 18px rgba(70,45,120,0.06)"
          }}
        >
          <div
            onClick={() => setIsModalOpen(true)}
            style={{
              cursor: "pointer",
              background: "#fff",
              padding: "4px",
              borderRadius: "10px",
              border: "1px solid var(--line)",
              flexShrink: 0,
              width: "72px",
              height: "72px",
              position: "relative"
            }}
            title="Klik untuk memperbesar QR Code"
          >
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="QR Kirim Foto"
                width={64}
                height={64}
                unoptimized
                style={{ display: "block" }}
              />
            ) : (
              <div style={{ fontSize: "9px", color: "var(--muted)", textAlign: "center", paddingTop: "20px" }}>
                ...
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: "13px", color: "var(--text)" }}>
              Scan untuk Buka di HP
            </strong>
            <span style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
              Buka kamera HP Anda untuk langsung kirim foto
            </span>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <button
                type="button"
                id={`${idPrefix}-btn-modal`}
                className="btn btn-soft btn-small"
                style={{ padding: "4px 8px", fontSize: "10px" }}
                onClick={() => setIsModalOpen(true)}
              >
                Perbesar
              </button>
              <button
                type="button"
                id={`${idPrefix}-btn-copy`}
                className="btn btn-ghost btn-small"
                style={{ padding: "4px 8px", fontSize: "10px" }}
                onClick={handleCopy}
              >
                {copied ? "✓ Tersalin" : "Salin Link"}
              </button>
            </div>
          </div>
        </div>

        <KirimFotoQrModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div
        className={`qr-full-card ${className}`}
        id={`${idPrefix}-card`}
        style={{
          background: "#fff",
          border: "1px solid var(--line)",
          borderRadius: "20px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "var(--shadow)"
        }}
      >
        {showTitle && (
          <div style={{ marginBottom: "14px" }}>
            <span className="eyebrow" style={{ fontSize: "11px" }}>
              Scan Langsung
            </span>
            <h3 style={{ margin: "4px 0 2px", fontSize: "16px" }}>QR Code Kirim Foto</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
              Buka kamera ponsel Anda untuk mengakses form
            </p>
          </div>
        )}

        <div
          onClick={() => setIsModalOpen(true)}
          style={{
            cursor: "pointer",
            display: "inline-flex",
            background: "#fff",
            padding: "12px",
            borderRadius: "16px",
            border: "1px solid var(--line)",
            boxShadow: "0 6px 20px rgba(118,86,216,0.1)",
            margin: "0 auto 12px",
            position: "relative"
          }}
          title="Klik untuk melihat ukuran besar"
        >
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="QR Code Kirim Foto"
              width={160}
              height={160}
              unoptimized
              style={{ display: "block" }}
            />
          ) : (
            <div style={{ width: 160, height: 160, display: "grid", placeItems: "center", fontSize: "12px", color: "var(--muted)" }}>
              Membuat QR...
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            type="button"
            id={`${idPrefix}-btn-enlarge`}
            className="btn btn-soft btn-small"
            style={{ fontSize: "11px", padding: "6px 10px" }}
            onClick={() => setIsModalOpen(true)}
          >
            🔍 Perbesar / Cetak
          </button>
          <button
            type="button"
            id={`${idPrefix}-btn-download`}
            className="btn btn-ghost btn-small"
            style={{ fontSize: "11px", padding: "6px 10px" }}
            onClick={handleDownload}
          >
            ⬇ Unduh
          </button>
        </div>
      </div>

      <KirimFotoQrModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
