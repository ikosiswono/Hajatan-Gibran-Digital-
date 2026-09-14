"use client";
import { FormEvent, useEffect, useState } from "react";
import { apiCall } from "@/lib/clientApi";
import Toast from "@/components/Toast";

type Settings=Record<string,string>;
export default function PengaturanPage(){const[form,setForm]=useState<Settings>({nama_acara:"Hajatan Gibran Digital",nama_anak:"Gibran Kurniawan",tanggal_acara:"19 September 2026",lokasi_acara:"",pesan_beranda:"Dokumentasi dan pengelolaan acara dalam satu sistem digital."});const[toast,setToast]=useState<{m:string;k:"success"|"error"}|null>(null);useEffect(()=>{apiCall<Settings>("getSettings").then(r=>{if(r.ok&&r.data)setForm(v=>({...v,...r.data}))})},[]);async function submit(e:FormEvent){e.preventDefault();const r=await apiCall("saveSettings",form);setToast({m:r.ok?"Pengaturan berhasil disimpan.":r.error||"Gagal menyimpan pengaturan.",k:r.ok?"success":"error"})}async function backup(){const r=await apiCall<{name?:string}>("createBackup");setToast({m:r.ok?`Backup berhasil dibuat${r.data?.name?`: ${r.data.name}`:"."}`:r.error||"Backup gagal.",k:r.ok?"success":"error"})}  return (
    <div id="admin-pengaturan-container">
      {toast && <Toast message={toast.m} kind={toast.k} onClose={() => setToast(null)} />}
      <div className="admin-page-heading" id="admin-pengaturan-header">
        <div>
          <span className="eyebrow">Konfigurasi</span>
          <h1>Pengaturan</h1>
          <p>Informasi dasar acara dan pencadangan database.</p>
        </div>
      </div>
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
