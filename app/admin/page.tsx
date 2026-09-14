"use client";
import { useCallback, useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { apiCall, rupiah } from "@/lib/clientApi";
import type { DashboardData } from "@/lib/types";

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setSyncing(true);
    const result = await apiCall<DashboardData>("getDashboard");
    if (result.ok && result.data) { setData(result.data); setError(""); }
    else setError(result.error || "Gagal memuat dashboard.");
    setSyncing(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div id="admin-dashboard-container">
      <div className="admin-page-heading" id="admin-dashboard-header">
        <div><span className="eyebrow">Ringkasan acara</span><h1>Dashboard</h1><p>Pantau data utama dari seluruh perangkat yang terhubung.</p></div>
        <span id="sync-status-badge" className={error ? "sync-badge offline" : "sync-badge"}><i />{syncing ? "Menyinkronkan..." : error ? "Gangguan koneksi" : "Tersinkron"}</span>
      </div>
      {error && <div id="dashboard-error-notice" className="notice error">{error}</div>}
      <div className="stats-grid" id="dashboard-stats-grid">
        <StatCard label="Total Tamu" value={data?.totalTamu ?? "—"} hint="Data buku tamu" />
        <StatCard label="Telitian Anak" value={data ? rupiah(data.telitianAnak) : "—"} />
        <StatCard label="Telitian Dewasa" value={data ? rupiah(data.telitianDewasa) : "—"} />
        <StatCard label="Total Telitian" value={data ? rupiah(data.totalTelitian) : "—"} hint="Anak + dewasa" />
        <StatCard label="Dokumentasi" value={data?.jumlahDokumentasi ?? "—"} />
        <StatCard label="Menunggu Validasi" value={data?.dokumentasiMenunggu ?? "—"} />
        <StatCard label="Panitia" value={data?.jumlahPanitia ?? "—"} />
      </div>
      <section className="admin-section-card" id="dashboard-activity-card">
        <div className="card-heading"><div><h2>Aktivitas terbaru</h2><p>Perubahan terbaru pada sistem.</p></div><button id="btn-refresh-dashboard" className="btn btn-soft btn-small" onClick={() => load()}>Segarkan</button></div>
        {!data?.aktivitasTerbaru?.length ? <div className="empty-state">Belum ada aktivitas.</div> : (
          <div className="activity-list" id="dashboard-activity-list">{data.aktivitasTerbaru.map((row, i) => <div className="activity-item" key={String(row.ID || i)}><span className="activity-dot" /><div><strong>{String(row.Aktivitas || "Aktivitas")}</strong><p>{String(row.Keterangan || row.Jenis_Data || "")}</p></div><time>{String(row.Tanggal || "")} {String(row.Jam || "")}</time></div>)}</div>
        )}
      </section>
    </div>
  );
}
