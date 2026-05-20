import argon2 from "argon2";
import crypto from "node:crypto";

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export function randomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256Base64Url(input: string) {
  return crypto.createHash("sha256").update(input).digest("base64url");
}

