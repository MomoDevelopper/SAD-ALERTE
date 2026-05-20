import type { PoolClient } from "pg";
import type { Request } from "express";
import { pool } from "../db/pool.js";
import { getClientIpForInet } from "../utils/http.js";

export async function writeAuditLog(params: {
  req: Request;
  actorUserId?: number;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  /** When set, run inside this client (e.g. same transaction as surrounding queries). */
  client?: PoolClient;
}) {
  const { req, actorUserId, action, targetType, targetId, metadata, client } = params;
  const q = client ?? pool;

  await q.query(
    `INSERT INTO audit_log (actor_user_id, action, target_type, target_id, metadata, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
    [
      actorUserId ?? null,
      action,
      targetType ?? null,
      targetId ?? null,
      JSON.stringify(metadata ?? {}),
      getClientIpForInet(req),
      req.headers["user-agent"] ?? null,
    ]
  );
}

