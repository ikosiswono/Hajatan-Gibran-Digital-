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
    <header className="public-header">
      <div className="container header-inner">
        <Link href="/" className="brand-link"><BrandMark /></Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {links.map(([href, label]) => (
            <Link key={href} className={pathname === href ? "nav-link active" : "nav-link"} href={href}>{label}</Link>
          ))}
        </nav>
        <Link className="btn btn-soft btn-small" href="/login">Admin</Link>
      </div>
      <nav className="mobile-public-nav" aria-label="Navigasi mobile">
        {links.map(([href, label]) => (
          <Link key={href} className={pathname === href ? "active" : ""} href={href}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
