import jwt from "jsonwebtoken";
import { env } from "../config.js";

export type AccessTokenClaims = {
  id: number;
  email: string;
  role: "agent" | "admin";
};

export function signAccessToken(claims: AccessTokenClaims) {
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL_SECONDS });
}

export function signRefreshToken(claims: AccessTokenClaims) {
  const seconds = env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60;
  return jwt.sign(claims, env.JWT_REFRESH_SECRET, { expiresIn: seconds });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessTokenClaims & { iat: number; exp: number };
}

