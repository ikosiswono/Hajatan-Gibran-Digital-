import type { ApiResponse } from "@/lib/types";

export async function callAppsScript<T = unknown>(action: string, payload: unknown = {}): Promise<ApiResponse<T>> {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APP_SECRET;

  if (!url || !secret) {
    return { ok: false, error: "Server belum dikonfigurasi. Periksa APPS_SCRIPT_URL dan APP_SECRET." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

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
      return { ok: false, error: "Respons Apps Script tidak valid.", message: text.slice(0, 180) };
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghubungi server.";
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
