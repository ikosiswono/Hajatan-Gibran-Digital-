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
    <div className="admin-shell" id="admin-shell-root">
      <aside className="admin-sidebar" id="admin-sidebar">
        <Link href="/admin" className="admin-brand" id="admin-brand-link"><BrandMark /></Link>
        <nav className="admin-nav" id="admin-sidebar-nav">
          {items.map(([href, label, icon]) => (
            <Link key={href} id={`admin-nav-${href.replace(/\//g, "-").replace(/^-/, "")}`} href={href} className={pathname === href ? "active" : ""}>
              <span className="admin-nav-icon">{icon}</span><span>{label}</span>
            </Link>
          ))}
        </nav>
        <button id="btn-sidebar-logout" className="sidebar-logout" onClick={() => logout()}>Keluar Admin</button>
      </aside>
      <div className="admin-content-wrap" id="admin-content-wrap">
        <header className="admin-topbar" id="admin-topbar">
          <div><strong>Hajatan Gibran Digital</strong><span>Panel pengelola acara</span></div>
          <button id="btn-topbar-logout" className="btn btn-soft btn-small" onClick={() => logout()}>Keluar</button>
        </header>
        <main className="admin-main" id="admin-main-container">{children}</main>
      </div>
      <nav className="admin-mobile-nav" id="admin-mobile-nav">
        {items.slice(0, 5).map(([href, label, icon]) => (
          <Link key={href} id={`admin-mobile-nav-${href.replace(/\//g, "-").replace(/^-/, "")}`} href={href} className={pathname === href ? "active" : ""}>
            <span>{icon}</span><small>{label.replace("Telitian ", "")}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}
