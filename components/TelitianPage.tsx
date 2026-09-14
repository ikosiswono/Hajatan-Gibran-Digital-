"use client";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiCall, downloadCsv, rupiah, safePrint } from "@/lib/clientApi";
import type { TelitianRow } from "@/lib/types";
import Toast from "@/components/Toast";

export default function TelitianPage({ jenis }: { jenis: "Anak" | "Dewasa" }) {
  const [rows, setRows] = useState<TelitianRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<TelitianRow | null>(null);
  const [toast, setToast] = useState<{m:string;k:"success"|"error"}|null>(null);
  const [form, setForm] = useState({ Nama: "", Alamat: "", Nominal: "", Petugas: "Admin", Catatan: "" });

  const load = useCallback(async () => {
    const res = await apiCall<TelitianRow[]>("listTelitian", { jenis });
    if (res.ok) setRows(res.data || []);
    else setToast({m:res.error || "Gagal memuat data.", k:"error"});
    setLoading(false);
  }, [jenis]);

  useEffect(() => { load(); const id=setInterval(load,5000); return()=>clearInterval(id); }, [load]);

  const total = useMemo(() => rows.reduce((a,b)=>a+Number(b.Nominal||0),0),[rows]);
  const filtered = useMemo(() => {
    const q=query.toLowerCase();
    return rows.filter(r => !q || `${r.Nama} ${r.Alamat} ${r.Petugas}`.toLowerCase().includes(q));
  },[rows,query]);

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { jenis, ...form, Nominal: Number(form.Nominal), ID: editing?.ID };
    const res = await apiCall(editing ? "updateTelitian" : "addTelitian", payload);
    if (res.ok) {
      setToast({m: editing ? "Data berhasil diperbarui." : "Data berhasil disimpan.", k:"success"});
      setForm({ Nama:"",Alamat:"",Nominal:"",Petugas:"Admin",Catatan:""}); setEditing(null); await load();
    } else setToast({m:res.error || "Gagal menyimpan data.",k:"error"});
    setSaving(false);
  }

  function edit(row: TelitianRow){setEditing(row); setForm({Nama:row.Nama,Alamat:row.Alamat,Nominal:String(row.Nominal),Petugas:row.Petugas||"Admin",Catatan:row.Catatan||""}); window.scrollTo({top:0,behavior:"smooth"});}
  async function remove(row: TelitianRow){if(!confirm(`Hapus data ${row.Nama}?`)) return; const res=await apiCall("deleteTelitian",{jenis,ID:row.ID}); if(res.ok){setToast({m:"Data dihapus.",k:"success"});load();}else setToast({m:res.error||"Gagal menghapus.",k:"error"});}

  const slug = jenis.toLowerCase();

  return <div id={`telitian-${slug}-container`}>
    {toast && <Toast message={toast.m} kind={toast.k} onClose={()=>setToast(null)} />}
    <div className="admin-page-heading" id={`telitian-${slug}-header`}><div><span className="eyebrow">Pencatatan keuangan</span><h1>Telitian {jenis}</h1><p>Data tersimpan terpusat dan total dihitung otomatis.</p></div><div className="total-badge" id={`telitian-${slug}-total-badge`}><span>Total</span><strong>{rupiah(total)}</strong></div></div>
    <section className="admin-section-card compact" id={`telitian-${slug}-form-card`}>
      <div className="card-heading"><div><h2>{editing ? "Edit data" : "Tambah data"}</h2><p>Isi nama, alamat, dan nominal masuk.</p></div>{editing&&<button id={`btn-cancel-edit-telitian-${slug}`} className="btn btn-soft btn-small" onClick={()=>{setEditing(null);setForm({Nama:"",Alamat:"",Nominal:"",Petugas:"Admin",Catatan:""})}}>Batal Edit</button>}</div>
      <form id={`form-telitian-${slug}`} onSubmit={submit} className="form-grid">
        <label htmlFor={`input-nama-${slug}`}>Nama<input id={`input-nama-${slug}`} value={form.Nama} onChange={e=>setForm({...form,Nama:e.target.value})} required placeholder="Nama pemberi" /></label>
        <label htmlFor={`input-alamat-${slug}`}>Alamat<input id={`input-alamat-${slug}`} value={form.Alamat} onChange={e=>setForm({...form,Alamat:e.target.value})} placeholder="Alamat" /></label>
        <label htmlFor={`input-nominal-${slug}`}>Nominal (Rp)<input id={`input-nominal-${slug}`} inputMode="numeric" type="number" min="0" value={form.Nominal} onChange={e=>setForm({...form,Nominal:e.target.value})} required placeholder="100000" /></label>
        <label htmlFor={`input-petugas-${slug}`}>Petugas<input id={`input-petugas-${slug}`} value={form.Petugas} onChange={e=>setForm({...form,Petugas:e.target.value})} placeholder="Nama petugas" /></label>
        <label htmlFor={`input-catatan-${slug}`} className="span-2">Catatan<input id={`input-catatan-${slug}`} value={form.Catatan} onChange={e=>setForm({...form,Catatan:e.target.value})} placeholder="Opsional" /></label>
        <div className="form-actions span-2"><button id={`btn-submit-telitian-${slug}`} className="btn btn-primary" disabled={saving}>{saving?"Menyimpan...":editing?"Simpan Perubahan":"Tambah Data"}</button></div>
      </form>
    </section>
    <section className="admin-section-card" id={`telitian-${slug}-table-card`}>
      <div className="toolbar"><input id={`input-search-telitian-${slug}`} className="search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama, alamat, petugas..."/><button id={`btn-export-telitian-${slug}`} className="btn btn-soft btn-small" onClick={()=>downloadCsv(`telitian-${slug}.csv`,rows as unknown as Record<string,unknown>[])}>Export CSV</button><button id={`btn-print-telitian-${slug}`} className="btn btn-soft btn-small" onClick={()=>safePrint()}>Print</button></div>
      {loading?<div className="empty-state">Memuat data...</div>:!filtered.length?<div className="empty-state">Belum ada data Telitian {jenis}.</div>:<div className="table-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>Alamat</th><th>Nominal</th><th>Petugas</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody>{filtered.map((r)=><tr key={r.ID}><td>{r.No}</td><td><strong>{r.Nama}</strong></td><td>{r.Alamat}</td><td>{rupiah(r.Nominal)}</td><td>{r.Petugas}</td><td>{r.Tanggal}<small className="table-sub">{r.Jam}</small></td><td><div className="row-actions"><button id={`btn-edit-${r.ID}`} onClick={()=>edit(r)}>Edit</button><button id={`btn-del-${r.ID}`} className="danger-link" onClick={()=>remove(r)}>Hapus</button></div></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
