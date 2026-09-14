import { NextResponse } from "next/server";
import { callAppsScript } from "@/lib/appsScript";
import { isAuthenticated } from "@/lib/auth";

const PUBLIC_ACTIONS = new Set([
  "getPublicSettings",
  "getPublicGallery",
  "uploadDocumentation"
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = typeof body?.action === "string" ? body.action : "";
    const payload = body?.payload ?? {};

    if (!action) {
      return NextResponse.json({ ok: false, error: "Action wajib diisi." }, { status: 400 });
    }

    if (!PUBLIC_ACTIONS.has(action) && !(await isAuthenticated())) {
      return NextResponse.json({ ok: false, error: "Sesi admin berakhir. Silakan login kembali." }, { status: 401 });
    }

    const result = await callAppsScript(action, payload);
    const status = result.ok ? 200 : 502;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json({ ok: false, error: "Permintaan tidak valid." }, { status: 400 });
  }
}
