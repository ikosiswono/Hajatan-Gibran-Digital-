"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiCall } from "@/lib/clientApi";
import type { DokumentasiRow } from "@/lib/types";
import StatusPill from "@/components/StatusPill";
import Toast from "@/components/Toast";
import KirimFotoQrModal from "@/components/KirimFotoQrModal";

export default function DokumentasiAdminPage(){
  const[rows,setRows]=useState<DokumentasiRow[]>([]);const[filter,setFilter]=useState("Semua");const[q,setQ]=useState("");const[toast,setToast]=useState<{m:string;k:"success"|"error"}|null>(null);const[loading,setLoading]=useState(true);
  const[showQrModal,setShowQrModal]=useState(false);
  const load=useCallback(async()=>{const r=await apiCall<DokumentasiRow[]>("listDocumentation");if(r.ok)setRows(r.data||[]);else setToast({m:r.error||"Gagal memuat dokumentasi.",k:"error"});setLoading(false)},[]);
  useEffect(()=>{load();const id=setInterval(load,5000);return()=>clearInterval(id)},[load]);
  const shown=useMemo(()=>rows.filter(r=>(filter==="Semua"||r.Status===filter)&&(!q||`${r.Nama_Pengirim} ${r.Judul} ${r.Kategori}`.toLowerCase().includes(q.toLowerCase()))),[rows,filter,q]);
  async function status(row:DokumentasiRow,newStatus:string){const r=await apiCall("updateDocumentationStatus",{ID_DOK:row.ID_DOK,Status:newStatus,Petugas_Validasi:"Admin"});if(r.ok){setToast({m:`Dokumentasi ${newStatus.toLowerCase()}.`,k:"success"});load()}else setToast({m:r.error||"Gagal memperbarui status.",k:"error"})}
  async function remove(row:DokumentasiRow){if(!confirm("Hapus dokumentasi dan file Google Drive ini?"))return;const r=await apiCall("deleteDocumentation",{ID_DOK:row.ID_DOK});if(r.ok){setToast({m:"Dokumentasi dihapus.",k:"success"});load()}else setToast({m:r.error||"Gagal menghapus.",k:"error"})}
  return (
    <div id="admin-dokumentasi-container">
      {toast && <Toast message={toast.m} kind={toast.k} onClose={() => setToast(null)} />}
      <div className="admin-page-heading" id="admin-dokumentasi-header">
        <div>
          <span className="eyebrow">Moderasi galeri</span>
          <h1>Dokumentasi</h1>
          <p>Foto kiriman tamu menunggu persetujuan sebelum tampil di galeri publik.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            id="btn-admin-print-qr"
            className="btn btn-primary btn-small"
            onClick={() => setShowQrModal(true)}
          >
            📱 QR Code Tamu / Cetak Meja
          </button>
          <div className="total-badge" id="badge-doc-menunggu">
            <span>Menunggu</span>
            <strong>{rows.filter((r) => r.Status === "Menunggu Persetujuan").length}</strong>
          </div>
        </div>
      </div>
      <section className="admin-section-card" id="admin-dokumentasi-card">
        <div className="toolbar">
          <input
            id="input-search-dokumentasi"
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari pengirim, judul, kategori..."
          />
          <select
            id="select-filter-dokumentasi"
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Semua</option>
            <option>Menunggu Persetujuan</option>
            <option>Disetujui</option>
            <option>Ditolak</option>
          </select>
        </div>
        {loading ? (
          <div className="empty-state" id="doc-loading-state">Memuat dokumentasi...</div>
        ) : !shown.length ? (
          <div className="empty-state" id="doc-empty-state">Tidak ada dokumentasi pada filter ini.</div>
        ) : (
          <div className="doc-admin-grid" id="doc-admin-grid">
            {shown.map((row) => (
              <article className="doc-admin-card" key={row.ID_DOK} id={`doc-card-${row.ID_DOK}`}>
                <div className="doc-thumb">
                  {row.Thumbnail_URL ? (
                    <Image
                      src={row.Thumbnail_URL}
                      alt={row.Judul || "Dokumentasi"}
                      fill
                      sizes="(max-width: 700px) 100vw, 260px"
                      unoptimized
                    />
                  ) : (
                    <span>Tanpa gambar</span>
                  )}
                </div>
                <div className="doc-body">
                  <div className="doc-meta">
                    <StatusPill status={row.Status} />
                    <span>{row.Kategori}</span>
                  </div>
                  <h3>{row.Judul || "Dokumentasi Hajatan"}</h3>
                  <p>{row.Keterangan || "Tidak ada keterangan."}</p>
                  <small>
                    {row.Nama_Pengirim} • {row.Tanggal} {row.Jam}
                  </small>
                  <div className="doc-actions">
                    {row.Status !== "Disetujui" && (
                      <button
                        id={`btn-approve-doc-${row.ID_DOK}`}
                        onClick={() => status(row, "Disetujui")}
                        className="btn btn-primary btn-small"
                      >
                        Setujui
                      </button>
                    )}
                    {row.Status !== "Ditolak" && (
                      <button
                        id={`btn-reject-doc-${row.ID_DOK}`}
                        onClick={() => status(row, "Ditolak")}
                        className="btn btn-soft btn-small"
                      >
                        Tolak
                      </button>
                    )}
                    <button
                      id={`btn-delete-doc-${row.ID_DOK}`}
                      onClick={() => remove(row)}
                      className="btn btn-danger btn-small"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <KirimFotoQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="QR Code Meja Tamu & Kirim Foto"
        subtitle="Unduh atau cetak QR Code ini untuk ditempel di meja tamu, buku tamu, prasmanan, atau area photobooth."
      />
    </div>
  );
}
