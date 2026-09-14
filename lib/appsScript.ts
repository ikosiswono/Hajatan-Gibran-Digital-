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

    // Check if the response is HTML instead of JSON
    if (text.trim().startsWith("<") || text.toLowerCase().includes("<!doctype")) {
      const isLoginRedirect =
        text.includes("ServiceLogin") ||
        text.includes("accounts.google.com") ||
        text.includes("Google Accounts") ||
        text.includes("Sign in");

      if (isLoginRedirect) {
        return {
          ok: false,
          error: "Akses Google Apps Script memerlukan login (dialihkan ke Google Login).",
          message:
            "Solusi: Buka Google Apps Script > Klik 'Deploy' > 'Manage deployments' > Klik ikon Pensil (Edit) > Ubah 'Who has access' (Siapa saja yang memiliki akses) menjadi 'Anyone' (Siapa saja), BUKAN 'Only myself' > Klik 'Deploy' (Pilih 'New version')."
        };
      }

      if (text.includes("ScriptError") || text.includes("Google Docs")) {
        return {
          ok: false,
          error: "Terjadi error internal pada Google Apps Script.",
          message:
            "Pastikan Anda sudah menjalankan fungsi setupProject() minimal 1 kali di Google Apps Script dan folder Drive tidak terkunci."
        };
      }

      return {
        ok: false,
        error: "Google Apps Script mengembalikan halaman HTML alih-alih data JSON.",
        message:
          "Pastikan URL yang dimasukkan di APPS_SCRIPT_URL adalah URL Web App yang berakhiran '/exec' (bukan link editor /edit atau /dev) dan deployment disetel 'Who has access: Anyone'."
      };
    }

    let parsed: ApiResponse<T>;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        ok: false,
        error: "Respons Apps Script bukan format JSON yang valid.",
        message: text.slice(0, 180)
      };
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
