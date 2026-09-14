"use client";
import { useCallback, useEffect, useState } from "react";
import { apiCall } from "@/lib/clientApi";
type Row=Record<string,string|number>;
export default function AktivitasPage(){
  const[rows,setRows]=useState<Row[]>([]);
  const load=useCallback(async()=>{
    const r=await apiCall<Row[]>("getActivity");
    if(r.ok)setRows(r.data||[])
  },[]);
  useEffect(()=>{
    load();
    const id=setInterval(load,5000);
    return()=>clearInterval(id)
  },[load]);

  return (
    <div id="admin-aktivitas-container">
      <div className="admin-page-heading" id="admin-aktivitas-header">
        <div>
          <span className="eyebrow">Audit sederhana</span>
          <h1>Aktivitas</h1>
          <p>Riwayat penambahan, perubahan, penghapusan, validasi, dan backup.</p>
        </div>
      </div>
      <section className="admin-section-card" id="admin-aktivitas-card">
        {!rows.length ? (
          <div className="empty-state" id="aktivitas-empty-state">Belum ada aktivitas.</div>
        ) : (
          <div className="activity-list" id="admin-aktivitas-list">
            {rows.map((r, i) => (
              <div className="activity-item" key={String(r.ID || i)} id={`activity-item-${i}`}>
                <span className="activity-dot" />
                <div>
                  <strong>{String(r.Aktivitas || "")}</strong>
                  <p>{String(r.Keterangan || r.Jenis_Data || "")}</p>
                </div>
                <time>{String(r.Tanggal || "")} {String(r.Jam || "")}</time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
