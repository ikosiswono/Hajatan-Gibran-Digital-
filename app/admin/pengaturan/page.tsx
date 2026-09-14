"use client";
import { FormEvent, useEffect, useState } from "react";
import { apiCall } from "@/lib/clientApi";
import Toast from "@/components/Toast";
import {
  initAuth,
  signInWithGoogle,
  logoutGoogle,
  listGoogleDriveFiles,
  getAccessToken
} from "@/lib/googleWorkspace";
import type { User } from "firebase/auth";

type Settings = Record<string, string>;

export default function PengaturanPage() {
  const [form, setForm] = useState<Settings>({
    nama_acara: "Hajatan Gibran Digital",
    nama_anak: "Gibran Kurniawan",
    tanggal_acara: "19 September 2026",
    lokasi_acara: "",
    pesan_beranda: "Dokumentasi dan pengelolaan acara dalam satu sistem digital."
  });
  const [toast, setToast] = useState<{ m: string; k: "success" | "error" } | null>(null);

  // Google Workspace Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);

  useEffect(() => {
    apiCall<Settings>("getSettings").then((r) => {
      if (r.ok && r.data) setForm((v) => ({ ...v, ...r.data }));
    });

    const unsubscribe = initAuth(
      (u) => setGoogleUser(u),
      () => setGoogleUser(null)
    );
    return () => unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = await apiCall("saveSettings", form);
    setToast({
      m: r.ok ? "Pengaturan berhasil disimpan." : r.error || "Gagal menyimpan pengaturan.",
      k: r.ok ? "success" : "error"
    });
  }

  async function backup() {
    const r = await apiCall<{ name?: string }>("createBackup");
    setToast({
      m: r.ok
        ? `Backup berhasil dibuat${r.data?.name ? `: ${r.data.name}` : "."}`
        : r.error || "Backup gagal.",
      k: r.ok ? "success" : "error"
    });
  }

  async function handleGoogleLogin() {
    setGoogleBusy(true);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setGoogleUser(res.user);
        setToast({ m: `Berhasil terhubung ke akun Google: ${res.user.email}`, k: "success" });
      }
    } catch (err) {
      setToast({
        m: err instanceof Error ? err.message : "Gagal login dengan Google.",
        k: "error"
      });
    } finally {
      setGoogleBusy(false);
    }
  }

  async function handleGoogleLogout() {
    await logoutGoogle();
    setGoogleUser(null);
    setDriveStatus(null);
    setToast({ m: "Akun Google telah diputus.", k: "success" });
  }

  async function testDriveConnection() {
    setGoogleBusy(true);
    setDriveStatus("Menguji koneksi ke Google Drive...");
    const res = await listGoogleDriveFiles("Hajatan Gibran Digital");
    if (res.ok) {
      const count = res.files?.length || 0;
      setDriveStatus(`Koneksi Google Drive aktif! Ditemukan ${count} file foto pada Drive.`);
      setToast({ m: "Koneksi Google Drive terverifikasi!", k: "success" });
    } else {
      setDriveStatus(`Kendala Google Drive: ${res.error}`);
      setToast({ m: res.error || "Gagal menghubungi Google Drive.", k: "error" });
    }
    setGoogleBusy(false);
  }

  return (
    <div id="admin-pengaturan-container">
      {toast && <Toast message={toast.m} kind={toast.k} onClose={() => setToast(null)} />}
      <div className="admin-page-heading" id="admin-pengaturan-header">
        <div>
          <span className="eyebrow">Konfigurasi</span>
          <h1>Pengaturan</h1>
          <p>Informasi dasar acara, integrasi Google Workspace, dan pencadangan database.</p>
        </div>
      </div>

      {/* Google Workspace Integration Section */}
      <section className="admin-section-card" id="admin-google-workspace-card">
        <div className="card-heading">
          <div>
            <h2>Integrasi Google Drive & Google Sheets</h2>
            <p>Akses langsung ke Google Drive dan Google Spreadsheet acara.</p>
          </div>
          <div>
            {googleUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.9em", color: "#166534", fontWeight: 600 }}>
                  ● Terhubung: {googleUser.email}
                </span>
                <button
                  type="button"
                  id="btn-disconnect-google"
                  className="btn btn-outline btn-small"
                  onClick={handleGoogleLogout}
                >
                  Putuskan
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-connect-google"
                className="btn btn-primary"
                disabled={googleBusy}
                onClick={handleGoogleLogin}
              >
                {googleBusy ? "Menghubungkan..." : "Hubungkan Akun Google"}
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "14px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#f9fafb" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1em", fontWeight: 600 }}>Google Drive</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "0.85em", color: "#6b7280" }}>
              Folder penyimpanan foto dokumentasi tamu dan panitia.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                id="btn-test-drive"
                className="btn btn-soft btn-small"
                disabled={!googleUser || googleBusy}
                onClick={testDriveConnection}
              >
                Tes Akses Drive
              </button>
              <a
                id="link-open-drive"
                href="https://drive.google.com/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-small"
              >
                Buka Google Drive ↗
              </a>
            </div>
            {driveStatus && (
              <p style={{ margin: "10px 0 0 0", fontSize: "0.85em", color: driveStatus.includes("aktif") ? "#15803d" : "#b91c1c" }}>
                {driveStatus}
              </p>
            )}
          </div>

          <div style={{ padding: "14px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#f9fafb" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1em", fontWeight: 600 }}>Google Sheets</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "0.85em", color: "#6b7280" }}>
              Database buku tamu, telitian sumbangan, panitia, dan log aktivitas.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <a
                id="link-open-sheets"
                href="https://docs.google.com/spreadsheets/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-small"
              >
                Buka Google Sheets ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-section-card compact" id="admin-pengaturan-form-card">
        <div className="card-heading">
          <div>
            <h2>Informasi acara</h2>
            <p>Data ini dapat digunakan untuk halaman publik.</p>
          </div>
        </div>
        <form id="form-pengaturan" className="form-grid" onSubmit={submit}>
          <label htmlFor="input-settings-nama-acara">
            Nama website
            <input
              id="input-settings-nama-acara"
              value={form.nama_acara || ""}
              onChange={(e) => setForm({ ...form, nama_acara: e.target.value })}
            />
          </label>
          <label htmlFor="input-settings-nama-anak">
            Nama anak
            <input
              id="input-settings-nama-anak"
              value={form.nama_anak || ""}
              onChange={(e) => setForm({ ...form, nama_anak: e.target.value })}
            />
          </label>
          <label htmlFor="input-settings-tgl-acara">
            Tanggal acara
            <input
              id="input-settings-tgl-acara"
              value={form.tanggal_acara || ""}
              onChange={(e) => setForm({ ...form, tanggal_acara: e.target.value })}
            />
          </label>
          <label htmlFor="input-settings-lokasi-acara">
            Lokasi acara
            <input
              id="input-settings-lokasi-acara"
              value={form.lokasi_acara || ""}
              onChange={(e) => setForm({ ...form, lokasi_acara: e.target.value })}
            />
          </label>
          <label htmlFor="textarea-settings-pesan" className="span-2">
            Pesan beranda
            <textarea
              id="textarea-settings-pesan"
              rows={3}
              value={form.pesan_beranda || ""}
              onChange={(e) => setForm({ ...form, pesan_beranda: e.target.value })}
            />
          </label>
          <div className="form-actions span-2">
            <button id="btn-submit-pengaturan" className="btn btn-primary">
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </section>

      <section className="admin-section-card" id="admin-pengaturan-backup-card">
        <div className="card-heading">
          <div>
            <h2>Backup Database</h2>
            <p>Buat salinan spreadsheet saat ini ke folder Backup di Google Drive.</p>
          </div>
          <button id="btn-run-backup" className="btn btn-primary" onClick={() => backup()}>
            Buat Backup Sekarang
          </button>
        </div>
        <div className="notice" id="backup-notice">
          Disarankan juga mengaktifkan trigger backup otomatis harian dari Apps Script.
        </div>
      </section>
    </div>
  );
}
