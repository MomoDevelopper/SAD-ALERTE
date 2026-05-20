import type { NextFunction, Request, Response } from "express";

export function requireRole(roles: Array<"agent" | "admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      res.status(401).json({ error: "UNAUTHENTICATED" });
      return;
    }
    if (!roles.includes(role)) {
      res.status(403).json({ error: "FORBIDDEN" });
      return;
    }
    next();
  };
}

