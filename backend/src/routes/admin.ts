import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { writeAuditLog } from "../services/audit.js";
import { sendAccountActivationEmail } from "../services/mailer.js";

const router = Router();

router.use(requireAuth, requireRole(["admin"]));

router.get("/users", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         nom,
         prenom,
         email,
         CASE WHEN role = 'admin' THEN 'admin' ELSE 'agent' END AS role,
         actif,
         date_creation
       FROM utilisateur
       ORDER BY actif ASC, date_creation DESC`
    );
    res.json({ users: result.rows });
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

const updateRoleSchema = z.object({
  role: z.enum(["agent", "admin"]),
});

router.patch("/users/:id/role", async (req, res) => {
  const parsedId = Number(req.params.id);
  const body = updateRoleSchema.safeParse(req.body);
  const actorUserId = req.user?.id;

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    res.status(400).json({ error: "INVALID_USER_ID" });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }
  if (!actorUserId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }
  if (parsedId === actorUserId && body.data.role !== "admin") {
    res.status(400).json({ error: "CANNOT_DEMOTE_SELF" });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE utilisateur
       SET role = $2::user_role
       WHERE id = $1
       RETURNING id, nom, prenom, email, role, actif, date_creation`,
      [parsedId, body.data.role]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "USER_NOT_FOUND" });
      return;
    }

    const updated = result.rows[0] as { id: number; email: string; role: "agent" | "admin"; actif: boolean };

    await writeAuditLog({
      req,
      actorUserId,
      action: "ADMIN_USER_ROLE_UPDATED",
      targetType: "utilisateur",
      targetId: String(updated.id),
      metadata: { email: updated.email, role: updated.role },
    });

    res.json({ ok: true, user: updated });
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

const updateStatusSchema = z.object({
  actif: z.boolean(),
});

router.patch("/users/:id/status", async (req, res) => {
  const parsedId = Number(req.params.id);
  const body = updateStatusSchema.safeParse(req.body);
  const actorUserId = req.user?.id;

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    res.status(400).json({ error: "INVALID_USER_ID" });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }
  if (!actorUserId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }
  if (parsedId === actorUserId && body.data.actif === false) {
    res.status(400).json({ error: "CANNOT_DEACTIVATE_SELF" });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE utilisateur
       SET actif = $2
       WHERE id = $1
       RETURNING id, nom, prenom, email, role, actif, date_creation`,
      [parsedId, body.data.actif]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "USER_NOT_FOUND" });
      return;
    }

    const updated = result.rows[0] as { id: number; nom: string; prenom: string; email: string; actif: boolean; role: string };

    await writeAuditLog({
      req,
      actorUserId,
      action: updated.actif ? "ADMIN_USER_ACTIVATED" : "ADMIN_USER_DEACTIVATED",
      targetType: "utilisateur",
      targetId: String(updated.id),
      metadata: { email: updated.email, role: updated.role, actif: updated.actif },
    });

    if (updated.actif) {
      // Background execution of email sending
      sendAccountActivationEmail(updated.email, updated.nom, updated.prenom).catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to send activation email in background", err);
      });
    }

    res.json({ ok: true, user: updated });
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
