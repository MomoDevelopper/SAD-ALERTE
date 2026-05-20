import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";

export type AuthUser = {
  id: number;
  role: "agent" | "admin";
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }

  const token = auth.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUser & { iat: number; exp: number };
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "UNAUTHENTICATED" });
  }
}

