import { NextResponse } from "next/server";
import { authCookieName, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD || "admin123";
    if (typeof password !== "string" || password !== expected) {
      return NextResponse.json({ ok: false, error: "Password salah." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, message: "Login berhasil." });
    response.cookies.set(authCookieName, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Permintaan login tidak valid." }, { status: 400 });
  }
}
