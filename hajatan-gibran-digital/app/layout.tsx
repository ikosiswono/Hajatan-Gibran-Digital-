import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Hajatan Gibran Digital", template: "%s | Hajatan Gibran Digital" },
  description: "Dokumentasi dan sistem pengelolaan hajatan Gibran dalam satu platform digital.",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7656d8"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
