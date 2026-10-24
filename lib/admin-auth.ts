import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_SECONDS = 60 * 60 * 8;

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;

  const safeEqual = (a: string, b: string) => {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
  };

  return safeEqual(username, expectedUser) && safeEqual(password, expectedPassword);
}

export function createAdminSessionToken(username: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(token: string, secret: string): boolean {
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return false;
    const expected = sign(payload, secret);
    const gotBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (gotBuf.length !== expectedBuf.length || !timingSafeEqual(gotBuf, expectedBuf)) return false;

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof decoded.sub === "string" && decoded.sub === process.env.ADMIN_USERNAME && typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
