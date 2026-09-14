"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";

const items = [
  ["/admin", "Dashboard", "⌂"],
  ["/admin/tamu", "Tamu", "◎"],
  ["/admin/telitian-anak", "Telitian Anak", "A"],
  ["/admin/telitian-dewasa", "Telitian Dewasa", "D"],
  ["/admin/dokumentasi", "Dokumentasi", "▣"],
  ["/admin/panitia", "Panitia", "♙"],
  ["/admin/aktivitas", "Aktivitas", "↻"],
  ["/admin/pengaturan", "Pengaturan", "⚙"]
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><BrandMark /></Link>
        <nav className="admin-nav">
          {items.map(([href, label, icon]) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}>
              <span className="admin-nav-icon">{icon}</span><span>{label}</span>
            </Link>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={logout}>Keluar Admin</button>
      </aside>
      <div className="admin-content-wrap">
        <header className="admin-topbar">
          <div><strong>Hajatan Gibran Digital</strong><span>Panel pengelola acara</span></div>
          <button className="btn btn-soft btn-small" onClick={logout}>Keluar</button>
        </header>
        <main className="admin-main">{children}</main>
      </div>
      <nav className="admin-mobile-nav">
        {items.slice(0, 5).map(([href, label, icon]) => (
          <Link key={href} href={href} className={pathname === href ? "active" : ""}>
            <span>{icon}</span><small>{label.replace("Telitian ", "")}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}
