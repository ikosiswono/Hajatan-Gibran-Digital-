import type { ApiResponse } from "@/lib/types";

export async function callAppsScript<T = unknown>(action: string, payload: unknown = {}): Promise<ApiResponse<T>> {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APP_SECRET;

  if (!url || !secret) {
    return {
      ok: false,
      error: "Konfigurasi server belum lengkap: APPS_SCRIPT_URL atau APP_SECRET belum diisi di Environment Variables / Settings."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, payload, secret }),
      cache: "no-store",
      signal: controller.signal,
      redirect: "follow"
    });

    const text = await response.text();
    let parsed: ApiResponse<T>;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "Respons Apps Script bukan format JSON yang valid.", message: text.slice(0, 180) };
    }
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: "Permintaan ke Google Apps Script melebihi batas waktu (timeout 60 detik). Periksa koneksi atau ukuran foto." };
    }
    const message = error instanceof Error ? error.message : "Gagal menghubungi server Apps Script.";
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
