import type { ApiResponse } from "@/lib/types";

function sanitizePayload(data: unknown): unknown {
  if (data === null || data === undefined) return {};
  if (typeof data !== "object") return data;
  try {
    const seen = new WeakSet();
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (typeof Node !== "undefined" && value instanceof Node) return undefined;
          if (typeof Window !== "undefined" && value instanceof Window) return undefined;
          if (seen.has(value)) return undefined;
          seen.add(value);
        }
        return value;
      })
    );
  } catch {
    return {};
  }
}

export async function apiCall<T = unknown>(action: string, payload: unknown = {}): Promise<ApiResponse<T>> {
  try {
    const cleanPayload = sanitizePayload(payload);
    const response = await fetch("/api/backend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload: cleanPayload }),
      cache: "no-store"
    });
    return await response.json();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Tidak dapat terhubung ke server." };
  }
}

export function safePrint() {
  try {
    if (typeof window !== "undefined") {
      window.print();
    }
  } catch {
    // Gracefully handle sandboxed iframe print restrictions
  }
}

export function rupiah(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number.isFinite(num) ? num : 0);
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
