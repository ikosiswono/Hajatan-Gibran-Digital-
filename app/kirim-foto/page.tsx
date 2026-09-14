"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { apiCall } from "@/lib/clientApi";
import KirimFotoQrCard from "@/components/KirimFotoQrCard";

const categories = [
  "Persiapan",
  "Acara Utama",
  "Keluarga",
  "Tamu",
  "Panitia",
  "Singa Dangdut",
  "Telitian",
  "Dekorasi",
  "Hiburan",
  "Lainnya"
];

type Prepared = { id: string; file: File; dataUrl: string; preview: string };

async function compressImage(file: File): Promise<Prepared> {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WebP.");
  }

  // Load image safely across desktop & mobile browsers
  const { width, height, draw } = await new Promise<{
    width: number;
    height: number;
    draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  }>((resolve, reject) => {
    if (typeof createImageBitmap === "function") {
      createImageBitmap(file)
        .then((bmp) => {
          resolve({
            width: bmp.width,
            height: bmp.height,
            draw: (ctx, w, h) => {
              ctx.drawImage(bmp, 0, 0, w, h);
              bmp.close();
            }
          });
        })
        .catch(() => {
          // Fallback to Image element if createImageBitmap fails
          loadImageElement(file, resolve, reject);
        });
    } else {
      loadImageElement(file, resolve, reject);
    }
  });

  function loadImageElement(
    sourceFile: File,
    onSuccess: (val: { width: number; height: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }) => void,
    onFail: (err: Error) => void
  ) {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(sourceFile);
    img.onload = () => {
      onSuccess({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        draw: (ctx, w, h) => {
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(objectUrl);
        }
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      onFail(new Error("Gagal membaca file foto."));
    };
    img.src = objectUrl;
  }

  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Perangkat tidak mendukung kompresi foto.");
  }
  draw(ctx, targetW, targetH);

  let blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal memproses gambar."))),
      "image/jpeg",
      0.75
    );
  });

  // Second pass compression if still > 1.2MB
  if (blob.size > 1_200_000) {
    const secondCanvas = document.createElement("canvas");
    secondCanvas.width = Math.round(targetW * 0.8);
    secondCanvas.height = Math.round(targetH * 0.8);
    const ctx2 = secondCanvas.getContext("2d");
    if (ctx2) {
      ctx2.drawImage(canvas, 0, 0, secondCanvas.width, secondCanvas.height);
      const smallerBlob: Blob | null = await new Promise((resolve) =>
        secondCanvas.toBlob(resolve, "image/jpeg", 0.65)
      );
      if (smallerBlob) blob = smallerBlob;
    }
  }

  const safeFileName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  const compressedFile = new File([blob], safeFileName, { type: "image/jpeg" });

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca hasil kompresi foto."));
    reader.readAsDataURL(compressedFile);
  });

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    file: compressedFile,
    dataUrl,
    preview: URL.createObjectURL(blob)
  };
}

export default function KirimFotoPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Acara Utama");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState<Prepared[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean; details?: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  async function choose(e: ChangeEvent<HTMLInputElement>) {
    setMessage(null);
    const selected = Array.from(e.target.files || []).slice(0, 5);
    if (!selected.length) return;

    setStatusText("Mengompres foto...");
    try {
      const output: Prepared[] = [];
      for (const f of selected) {
        output.push(await compressImage(f));
      }
      setFiles(output);
      setStatusText("");
    } catch (err) {
      setStatusText("");
      setMessage({
        text: err instanceof Error ? err.message : "Gagal memproses foto.",
        ok: false
      });
    }
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!files.length) {
      setMessage({ text: "Pilih minimal satu foto terlebih dahulu.", ok: false });
      return;
    }

    setBusy(true);
    setMessage(null);
    setProgress(0);

    const successfulIds = new Set<string>();
    let lastError = "";

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      setStatusText(`Mengirim foto ${i + 1} dari ${files.length}...`);

      const r = await apiCall("uploadDocumentation", {
        Nama_Pengirim: name.trim(),
        Kategori: category,
        Judul: title.trim(),
        Keterangan: desc.trim(),
        Nama_File: item.file.name,
        Mime_Type: item.file.type,
        Data_URL: item.dataUrl
      });

      if (r.ok) {
        successfulIds.add(item.id);
        URL.revokeObjectURL(item.preview);
      } else {
        lastError = r.error || r.message || "Gagal mengunggah foto ke Google Drive.";
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    const successCount = successfulIds.size;
    const totalCount = files.length;

    if (successCount === totalCount) {
      setMessage({
        text: "Terima kasih! Dokumentasi berhasil dikirim dan menunggu persetujuan panitia sebelum tampil di galeri.",
        ok: true
      });
      setFiles([]);
      setTitle("");
      setDesc("");
      setStatusText("");
    } else {
      // Keep only failed files so user can retry directly without reselecting
      setFiles((prev) => prev.filter((f) => !successfulIds.has(f.id)));

      const explanation = lastError
        ? `Penyebab: ${lastError}`
        : "Pastikan koneksi internet stabil dan konfigurasi server sudah aktif.";

      setMessage({
        text: `${successCount} dari ${totalCount} foto berhasil dikirim.`,
        ok: false,
        details: explanation
      });
      setStatusText("");
    }

    setBusy(false);
  }

  const isConfigError =
    message?.details?.includes("APPS_SCRIPT_URL") ||
    message?.details?.includes("APP_SECRET") ||
    message?.details?.includes("Konfigurasi server belum lengkap");

  const isDeployAccessError =
    message?.details?.includes("HTML") ||
    message?.details?.includes("doctype") ||
    message?.details?.includes("login") ||
    message?.details?.includes("Google Login") ||
    message?.details?.includes("Who has access") ||
    message?.details?.includes("dialihkan") ||
    message?.details?.includes("bukan format JSON");

  return (
    <>
      <PublicHeader />
      <main className="page-main container upload-page" id="upload-page-root">
        <div className="page-title" id="upload-page-title">
          <span className="eyebrow">Bagikan momenmu</span>
          <h1>Kirim Dokumentasi</h1>
          <p>Unggah foto hajatan Gibran. Foto akan diperiksa panitia sebelum tampil di galeri.</p>
        </div>

        <div className="upload-layout" id="upload-layout">
          <section className="content-card" id="upload-form-card">
            <form id="form-upload-foto" className="stack-form" onSubmit={submit}>
              <label htmlFor="input-pengirim-nama">
                Nama Pengirim
                <input
                  id="input-pengirim-nama"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                />
              </label>

              <label htmlFor="select-foto-kategori">
                Kategori
                <select
                  id="select-foto-kategori"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label htmlFor="input-foto-judul">
                Judul Foto
                <input
                  id="input-foto-judul"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Momen bersama keluarga"
                />
              </label>

              <label htmlFor="textarea-foto-ket">
                Keterangan
                <textarea
                  id="textarea-foto-ket"
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Keterangan singkat (opsional)"
                />
              </label>

              <label htmlFor="input-file-foto" className="file-drop">
                <input
                  id="input-file-foto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={choose}
                  disabled={busy}
                />
                <strong>{files.length > 0 ? "Pilih Foto Lain / Ganti" : "Pilih Foto"}</strong>
                <span>Maksimal 5 foto • JPG/PNG/WebP • dikompres otomatis</span>
              </label>

              {files.length > 0 && (
                <div className="preview-grid" id="preview-grid-upload">
                  {files.map((f, i) => (
                    <div className="preview-item" key={f.id} id={`preview-item-${i}`}>
                      <Image
                        src={f.preview}
                        alt={`Preview ${i + 1}`}
                        fill
                        sizes="150px"
                        unoptimized
                      />
                      <span>{Math.round(f.file.size / 1024)} KB</span>
                      {!busy && (
                        <button
                          type="button"
                          id={`btn-remove-preview-${i}`}
                          className="preview-remove-btn"
                          title="Hapus foto ini"
                          onClick={() => removeFile(f.id)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "rgba(0,0,0,0.65)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {busy && (
                <div className="upload-progress" id="upload-progress-bar">
                  <div>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <small>{statusText || `Mengunggah ${progress}%`}</small>
                </div>
              )}

              {message && (
                <div
                  id="upload-status-notice"
                  className={message.ok ? "notice success" : "notice error"}
                >
                  <strong>{message.text}</strong>
                  {message.details && (
                    <div style={{ marginTop: "6px", fontSize: "0.9em", opacity: 0.95 }}>
                      {message.details}
                    </div>
                  )}
                  {isConfigError && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        background: "rgba(255,255,255,0.85)",
                        borderRadius: "8px",
                        fontSize: "0.85em",
                        color: "#1f2937"
                      }}
                    >
                      <p style={{ margin: "0 0 6px 0", fontWeight: 600 }}>
                        Panduan Perbaikan Konfigurasi:
                      </p>
                      <ol style={{ margin: "0", paddingLeft: "18px", lineHeight: "1.4" }}>
                        <li>
                          Buka menu <strong>Settings</strong> di AI Studio / file <code>.env.local</code>.
                        </li>
                        <li>
                          Pastikan <code>APPS_SCRIPT_URL</code> berisi URL deployment web app Google Apps Script Anda (berakhiran <code>/exec</code>).
                        </li>
                        <li>
                          Pastikan <code>APP_SECRET</code> bernilai sama dengan yang Anda set di Google Apps Script (Script Properties).
                        </li>
                        <li>
                          Pastikan Anda sudah menjalankan fungsi <code>setupProject()</code> di Google Apps Script satu kali untuk membuat folder Drive dan sheet database.
                        </li>
                      </ol>
                    </div>
                  )}
                  {isDeployAccessError && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "12px",
                        background: "#fef2f2",
                        border: "1px solid #f87171",
                        borderRadius: "8px",
                        fontSize: "0.85em",
                        color: "#991b1b"
                      }}
                    >
                      <p style={{ margin: "0 0 6px 0", fontWeight: 700 }}>
                        Cara Mengatasi &quot;Unexpected token &lt; !doctype...&quot;:
                      </p>
                      <p style={{ margin: "0 0 8px 0" }}>
                        Google Apps Script mengembalikan halaman HTML/Login karena izin Web App belum disetel untuk publik.
                      </p>
                      <ol style={{ margin: "0", paddingLeft: "18px", lineHeight: "1.5" }}>
                        <li>
                          Buka Google Spreadsheet &gt; <strong>Ekstensi &gt; Apps Script</strong>.
                        </li>
                        <li>
                          Klik tombol biru <strong>Deploy</strong> (kanan atas) &gt; <strong>Manage deployments</strong>.
                        </li>
                        <li>
                          Klik ikon <strong>Pensil (Edit)</strong> pada deployment aktif:
                          <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                            <li><strong>Execute as:</strong> Me (email Anda)</li>
                            <li><strong>Who has access:</strong> <strong>Anyone</strong> (Siapa saja) &larr; <em>Wajib Anyone</em></li>
                            <li><strong>Version:</strong> <strong>New version</strong> (Versi baru)</li>
                          </ul>
                        </li>
                        <li>
                          Klik <strong>Deploy</strong>, lalu salin URL Web App yang berakhiran <code>/exec</code> ke Settings aplikasi.
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <button
                id="btn-submit-upload"
                className="btn btn-primary btn-full"
                disabled={busy || files.length === 0}
              >
                {busy ? "Mengirim Dokumentasi..." : files.length > 0 ? `Kirim ${files.length} Dokumentasi` : "Kirim Dokumentasi"}
              </button>
            </form>
          </section>

          <aside className="upload-info" id="upload-sidebar-info">
            <div className="info-bubble">✦</div>
            <h2>Foto Anda ikut menyimpan cerita.</h2>
            <p>
              Gunakan foto yang pantas untuk dokumentasi keluarga. File akan disimpan di Google Drive milik pengelola acara.
            </p>
            <ul>
              <li>Foto otomatis dioptimasi & dikompres agar hemat kuota dan cepat terkirim.</li>
              <li>Foto akan ditinjau dan disetujui panitia sebelum muncul di galeri.</li>
              <li>Data tersimpan aman terpusat di Google Drive & Google Spreadsheet acara.</li>
            </ul>
            <div style={{ marginTop: "20px" }}>
              <Link href="/galeri" className="btn btn-soft btn-small" id="link-to-galeri">
                Lihat Galeri Foto
              </Link>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--line)" }}>
              <span className="eyebrow" style={{ fontSize: "11px", display: "block", marginBottom: "6px" }}>
                Buka di Kamera HP
              </span>
              <p style={{ margin: "0 0 12px", fontSize: "12px", color: "var(--muted)" }}>
                Sedang buka di komputer? Scan kode ini menggunakan kamera ponsel agar bisa langsung jepret dan unggah foto.
              </p>
              <KirimFotoQrCard idPrefix="kirim-foto-sidebar-qr" />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
