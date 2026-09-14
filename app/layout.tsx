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
  return (
    <html lang="id" id="hajatan-html" suppressHydrationWarning>
      <head>
        <script
          id="anti-circular-json-patch"
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  if (typeof window === 'undefined') return;
  var origStringify = JSON.stringify;
  JSON.stringify = function(val, replacer, space) {
    var seen = new WeakSet();
    function safeReplacer(k, v) {
      if (typeof v === "object" && v !== null) {
        if (typeof Node !== "undefined" && v instanceof Node) {
          return "[DOM " + (v.nodeName || "Element") + (v.id ? "#" + v.id : "") + "]";
        }
        if (typeof Window !== "undefined" && v instanceof Window) {
          return "[Window]";
        }
        if (seen.has(v)) {
          return "[Circular]";
        }
        seen.add(v);
      }
      if (typeof replacer === "function") {
        return replacer.call(this, k, v);
      }
      return v;
    }
    try {
      return origStringify(val, safeReplacer, space);
    } catch (err) {
      try {
        return origStringify(String(val));
      } catch (_) {
        return '""';
      }
    }
  };
})();
`
          }}
        />
      </head>
      <body id="hajatan-body" suppressHydrationWarning>{children}</body>
    </html>
  );
}


