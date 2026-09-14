"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Login gagal.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page" id="login-page-root">
      <div className="login-card" id="login-card">
        <Link href="/" className="brand-link" id="login-brand-link"><BrandMark /></Link>
        <div className="login-copy" id="login-copy-header">
          <span className="eyebrow">Area Pengelola</span>
          <h1>Masuk Admin</h1>
          <p>Gunakan password pengelola untuk membuka data operasional hajatan.</p>
        </div>
        <form id="form-login" onSubmit={submit} className="stack-form">
          <label htmlFor="input-admin-password">Password Admin<input id="input-admin-password" autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required /></label>
          {error && <div id="login-error-msg" className="form-error">{error}</div>}
          <button id="btn-login-submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? "Memeriksa..." : "Masuk ke Dashboard"}</button>
        </form>
        <Link id="link-back-home" className="back-link" href="/">← Kembali ke beranda</Link>
      </div>
    </main>
  );
}
