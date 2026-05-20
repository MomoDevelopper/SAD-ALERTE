import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { validateBody } from "../middleware/validate.js";
import { hashPassword, randomToken, sha256Base64Url, verifyPassword } from "../utils/crypto.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../services/tokens.js";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../config.js";
import { writeAuditLog } from "../services/audit.js";
import { sendPasswordResetEmail } from "../services/mailer.js";

const router = Router();

const signupRequestSchema = z.object({
  nom: z.string().min(1).max(100),
  prenom: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(10).max(200),
  matricule: z.string().optional(),
  unite: z.string().optional(),
  zone: z.string().optional(),
});

router.post("/request-signup", validateBody(signupRequestSchema), async (req, res) => {
  const { nom, prenom, email, password, matricule, unite, zone } = req.body as z.infer<typeof signupRequestSchema>;
  
  /* Fonctionnalité à venir: Vérification du matricule dans la base FDS
  if (!matricule || (!matricule.startsWith("FAN-") && !matricule.startsWith("FDS-"))) {
    res.status(400).json({ error: "INVALID_MATRICULE", message: "Le matricule fourni n'a pas pu être vérifié dans la base des Forces de Défense et de Sécurité." });
    return;
  }
  */

  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO utilisateur (nom, prenom, email, role, password_hash, actif, matricule, unite, zone_affectation)
       VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8)
       RETURNING id`,
      [nom, prenom, email.toLowerCase(), "agent", passwordHash, matricule || null, unite || null, zone || null]
    );

    await writeAuditLog({
      req,
      client,
      actorUserId: undefined,
      action: "AUTH_SIGNUP_REQUEST",
      targetType: "utilisateur",
      targetId: String(result.rows[0]!.id),
      metadata: { email: email.toLowerCase(), role: "agent" },
    });

    await client.query("COMMIT");
    res.status(201).json({ ok: true });
  } catch (e: unknown) {
    await client.query("ROLLBACK").catch(() => undefined);
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "23505") {
      res.status(409).json({ error: "EMAIL_TAKEN" });
      return;
    }
    if (env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[request-signup]", e);
    }
    res.status(500).json({ error: "SIGNUP_INTERNAL_ERROR" });
  } finally {
    client.release();
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const userRes = await pool.query(
      `SELECT id, email, role, password_hash, actif FROM utilisateur WHERE email = $1 LIMIT 1`,
      [email.toLowerCase()]
    );
    const user = userRes.rows[0] as
      | { id: number; email: string; role: "agent" | "admin"; password_hash: string; actif: boolean }
      | undefined;

    if (!user || !user.actif) {
      res.status(401).json({ error: "INVALID_CREDENTIALS" });
      return;
    }

    const ok = await verifyPassword(user.password_hash, password);
    if (!ok) {
      res.status(401).json({ error: "INVALID_CREDENTIALS" });
      return;
    }

    const claims = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(claims);

    const refreshRaw = randomToken();
    const refreshToken = signRefreshToken(claims);
    const tokenHash = sha256Base64Url(`${refreshRaw}.${refreshToken}`);

    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO refresh_session (user_id, token_hash, user_agent, ip, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, tokenHash, req.headers["user-agent"] ?? null, req.ip ?? null, expiresAt]
    );

    res.cookie("refresh", `${refreshRaw}.${refreshToken}`, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    });

    await writeAuditLog({
      req,
      actorUserId: user.id,
      action: "AUTH_LOGIN",
      metadata: { email: user.email },
    });

    res.json({ accessToken });
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/refresh", async (req, res) => {
  const cookie = req.cookies?.refresh as string | undefined;
  if (!cookie) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }

  const tokenHash = sha256Base64Url(cookie);

  const sessionRes = await pool.query(
    `SELECT id, user_id, revoked_at, expires_at FROM refresh_session WHERE token_hash = $1 LIMIT 1`,
    [tokenHash]
  );
  const session = sessionRes.rows[0] as
    | { id: number; user_id: number; revoked_at: Date | null; expires_at: Date }
    | undefined;

  if (!session || session.revoked_at || new Date(session.expires_at).getTime() < Date.now()) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }

  try {
    const dot = cookie.indexOf(".");
    const refreshJwt = dot > 0 ? cookie.slice(dot + 1) : "";
    const claims = verifyRefreshToken(refreshJwt);
    if (claims.id !== session.user_id) {
      res.status(401).json({ error: "UNAUTHENTICATED" });
      return;
    }

    // rotation: revoke old session, create new one
    await pool.query(`UPDATE refresh_session SET revoked_at = NOW() WHERE id = $1`, [session.id]);

    const newAccess = signAccessToken({ id: claims.id, email: claims.email, role: claims.role });
    const newRefreshRaw = randomToken();
    const newRefreshJwt = signRefreshToken({ id: claims.id, email: claims.email, role: claims.role });
    const newCookie = `${newRefreshRaw}.${newRefreshJwt}`;
    const newHash = sha256Base64Url(newCookie);

    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO refresh_session (user_id, token_hash, user_agent, ip, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [claims.id, newHash, req.headers["user-agent"] ?? null, req.ip ?? null, expiresAt]
    );

    res.cookie("refresh", newCookie, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccess });
  } catch {
    res.status(401).json({ error: "UNAUTHENTICATED" });
  }
});

router.post("/logout", async (req, res) => {
  const cookie = req.cookies?.refresh as string | undefined;
  if (cookie) {
    const tokenHash = sha256Base64Url(cookie);
    await pool.query(`UPDATE refresh_session SET revoked_at = NOW() WHERE token_hash = $1`, [tokenHash]);
  }
  res.clearCookie("refresh", { path: "/api/auth/refresh" });
  res.json({ ok: true });
});

router.get("/profile", requireAuth, async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }
  
  try {
    const result = await pool.query(
      `SELECT id, nom, prenom, email, role, score_confiance, actif, date_creation, matricule, unite 
       FROM utilisateur 
       WHERE id = $1 LIMIT 1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "USER_NOT_FOUND" });
      return;
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

router.post("/forgot-password", validateBody(forgotPasswordSchema), async (req, res) => {
  const { email } = req.body as z.infer<typeof forgotPasswordSchema>;
  const lowerEmail = email.toLowerCase();

  try {
    const userRes = await pool.query(
      `SELECT id, nom, prenom, actif FROM utilisateur WHERE email = $1 LIMIT 1`,
      [lowerEmail]
    );

    if (userRes.rows.length === 0) {
      // Don't leak if email exists
      res.json({ ok: true });
      return;
    }

    const user = userRes.rows[0];
    if (!user.actif) {
      res.json({ ok: true });
      return;
    }

    const rawToken = randomToken(32);
    const tokenHash = sha256Base64Url(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO password_reset_token (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Send email asynchronously
    const resetLink = `http://localhost:3000/reset-password?token=${rawToken}&email=${encodeURIComponent(lowerEmail)}`;
    sendPasswordResetEmail(lowerEmail, user.nom, user.prenom, resetLink).catch(err => {
      // eslint-disable-next-line no-console
      console.error("Failed to send password reset email", err);
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  newPassword: z.string().min(10).max(200),
});

router.post("/reset-password", validateBody(resetPasswordSchema), async (req, res) => {
  const { email, token, newPassword } = req.body as z.infer<typeof resetPasswordSchema>;
  const lowerEmail = email.toLowerCase();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const userRes = await client.query(
      `SELECT id, actif FROM utilisateur WHERE email = $1 LIMIT 1`,
      [lowerEmail]
    );

    if (userRes.rows.length === 0 || !userRes.rows[0].actif) {
      res.status(400).json({ error: "INVALID_TOKEN" });
      await client.query("ROLLBACK");
      return;
    }
    const user = userRes.rows[0];
    const tokenHash = sha256Base64Url(token);

    const tokenRes = await client.query(
      `SELECT id, expires_at FROM password_reset_token WHERE user_id = $1 AND token_hash = $2 LIMIT 1`,
      [user.id, tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      res.status(400).json({ error: "INVALID_TOKEN" });
      await client.query("ROLLBACK");
      return;
    }

    const resetToken = tokenRes.rows[0];
    if (new Date(resetToken.expires_at).getTime() < Date.now()) {
      res.status(400).json({ error: "EXPIRED_TOKEN" });
      await client.query("ROLLBACK");
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    
    // Update password
    await client.query(`UPDATE utilisateur SET password_hash = $1 WHERE id = $2`, [passwordHash, user.id]);
    
    // Delete used token and all other tokens for this user
    await client.query(`DELETE FROM password_reset_token WHERE user_id = $1`, [user.id]);
    
    // Revoke all existing sessions so they have to login with new password
    await client.query(`UPDATE refresh_session SET revoked_at = NOW() WHERE user_id = $1`, [user.id]);

    await writeAuditLog({
      req,
      actorUserId: user.id,
      action: "AUTH_PASSWORD_RESET",
      targetType: "utilisateur",
      targetId: String(user.id),
      metadata: { email: lowerEmail },
    });

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  } finally {
    client.release();
  }
});

export default router;

