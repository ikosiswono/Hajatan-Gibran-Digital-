import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "hgd_session";

function sessionSecret() {
  const value = process.env.SESSION_SECRET || "hgd_default_session_secret_change_in_production_32chars";
  return value;
}

export function createSessionToken() {
  return createHmac("sha256", sessionSecret()).update("hgd-admin-v1").digest("hex");
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false;
  const expected = createSessionToken();
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function isAuthenticated() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export const authCookieName = COOKIE_NAME;
