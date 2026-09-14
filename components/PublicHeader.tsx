"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "@/components/BrandMark";

const links = [
  ["/", "Beranda"],
  ["/galeri", "Galeri"],
  ["/kirim-foto", "Kirim Foto"],
  ["/tentang", "Tentang"]
];

export default function PublicHeader() {
  const pathname = usePathname();
  return (
    <header className="public-header" id="public-header">
      <div className="container header-inner" id="public-header-inner">
        <Link href="/" className="brand-link" id="public-brand-link"><BrandMark /></Link>
        <nav className="desktop-nav" id="public-desktop-nav" aria-label="Navigasi utama">
          {links.map(([href, label]) => (
            <Link key={href} id={`public-nav-${href.replace(/\//g, "") || "beranda"}`} className={pathname === href ? "nav-link active" : "nav-link"} href={href}>{label}</Link>
          ))}
        </nav>
        <Link className="btn btn-soft btn-small" id="btn-nav-admin" href="/login">Admin</Link>
      </div>
      <nav className="mobile-public-nav" id="public-mobile-nav" aria-label="Navigasi mobile">
        {links.map(([href, label]) => (
          <Link key={href} id={`public-mobile-nav-${href.replace(/\//g, "") || "beranda"}`} className={pathname === href ? "active" : ""} href={href}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
