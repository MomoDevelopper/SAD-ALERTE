import type { Request } from "express";

/** Raw client IP / proxy hint (may be a hostname or junk; not safe for PostgreSQL `inet`). */
export function getClientIp(req: Request): string | undefined {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return typeof req.ip === "string" ? req.ip.trim() : undefined;
}

/**
 * Value safe to bind to a PostgreSQL `inet` column, or `null`.
 * Invalid / empty / hostname-like tokens would otherwise make `INSERT` fail.
 */
export function getClientIpForInet(req: Request): string | null {
  const tryOne = (raw: string | undefined): string | null => {
    if (!raw) return null;
    const s = raw.trim();
    if (!s || s === "unknown" || s.length > 128) return null;
    if (!/^[\d.:a-fA-F%]+$/i.test(s)) return null;
    return s;
  };

  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    const v = tryOne(xff.split(",")[0]);
    if (v) return v;
  }
  return tryOne(typeof req.ip === "string" ? req.ip : undefined);
}

