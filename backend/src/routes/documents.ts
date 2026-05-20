import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { pool } from "../db/pool.js";
import { env } from "../config.js";

const router = Router();

// Configure Multer storage
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Seul le format PDF est accepté."));
    }
  }
});

function attachUserIfPresent(req: any, _res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = auth.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: number; role: "agent" | "admin"; email: string };
    req.user = { id: payload.id, role: payload.role, email: payload.email };
  } catch {
    // Invalid bearer token is ignored here so that service-key auth can still be used.
  }
  next();
}

function hasServiceAccess(req: any): boolean {
  const apiKey = req.body?.api_key ?? req.headers["x-api-key"];
  return Boolean(env.DOCUMENTS_AI_API_KEY) && apiKey === env.DOCUMENTS_AI_API_KEY;
}

function mapCertaintyToConfidence(rawValue: unknown): number {
  const value = String(rawValue ?? "").toLowerCase().trim();
  if (value === "je suis sûr" || value === "je suis sur" || value === "certain") return 0.85;
  if (value === "je pense") return 0.6;
  if (value === "rumeur") return 0.3;
  return 0.5;
}

router.post(
  "/upload",
  requireAuth,
  requireRole(["admin"]),
  upload.single("file"),
  async (req, res, next) => {
    const file = req.file;
    const user = req.user;
    const { titre, categorie, region_cible } = req.body;

    if (!file || !titre || !categorie) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Fichier, titre ou catégorie manquant." });
      return;
    }

    if (categorie !== "rapport_incident" && categorie !== "news_rtb") {
      res.status(400).json({ error: "BAD_REQUEST", message: "Catégorie invalide." });
      return;
    }

    try {
      const cheminFichier = file.filename;
      
      const insertQuery = `
        INSERT INTO media_document (titre, categorie, chemin_fichier, region_cible, upload_par)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;
      const values = [titre, categorie, cheminFichier, region_cible || null, user?.id];

      const result = await pool.query(insertQuery, values);

      res.status(201).json({ success: true, document_id: result.rows[0].id });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", attachUserIfPresent, async (req, res, next) => {
  const hasRoleAccess = req.user?.role === "admin";
  const serviceAccess = hasServiceAccess(req);
  if (!hasRoleAccess && !serviceAccess) {
    res.status(403).json({ error: "FORBIDDEN", message: "Accès refusé." });
    return;
  }

  try {
    const result = await pool.query(`
      SELECT m.id, m.titre, m.categorie, m.chemin_fichier, m.region_cible, m.upload_par, m.statut_ia, m.date_upload, u.role as upload_par_role
      FROM media_document m
      LEFT JOIN utilisateur u ON m.upload_par = u.id
      ORDER BY m.date_upload DESC
    `);
    res.json({ documents: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get("/non_traites", attachUserIfPresent, async (req, res, next) => {
  const hasRoleAccess = req.user?.role === "admin";
  const serviceAccess = hasServiceAccess(req);
  if (!hasRoleAccess && !serviceAccess) {
    res.status(403).json({ error: "FORBIDDEN", message: "Accès refusé." });
    return;
  }

  try {
    const result = await pool.query(`
      SELECT id, titre, categorie, chemin_fichier, region_cible, upload_par, date_upload
      FROM media_document
      WHERE statut_ia = 'en_attente'
    `);
    res.json({ documents: result.rows });
  } catch (error) {
    next(error);
  }
});

router.put("/:id/traiter", attachUserIfPresent, async (req, res, next) => {
  const { id } = req.params;
  const { gravite_ia, description, type_incident, niveau_certitude } = req.body;

  const hasRoleAccess = req.user?.role === "admin";
  const serviceAccess = hasServiceAccess(req);

  if (!hasRoleAccess && !serviceAccess) {
    res.status(403).json({ error: "FORBIDDEN", message: "Accès refusé." });
    return;
  }

  if (!description) {
    res.status(400).json({ error: "BAD_REQUEST", message: "Description manquante." });
    return;
  }

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Mettre à jour le statut du document
      const updateResult = await client.query(`
        UPDATE media_document 
        SET statut_ia = 'traite' 
        WHERE id = $1
        RETURNING id
      `, [id]);

      if (updateResult.rowCount === 0) {
        res.status(404).json({ error: "NOT_FOUND", message: "Document introuvable." });
        await client.query("ROLLBACK");
        return;
      }

      // 2. Insérer l'incident déduit par l'IA
      const insertIncidentQuery = `
        INSERT INTO incident (date_incident, type, description, gravite_ia, confiance, source_id)
        VALUES (NOW(), $1, $2, $3, $4, NULL)
        RETURNING id;
      `;
      const values = [
        type_incident || "Autre",
        description,
        gravite_ia ?? null,
        mapCertaintyToConfidence(niveau_certitude),
      ];
      
      const result = await client.query(insertIncidentQuery, values);

      await client.query('COMMIT');
      res.json({ success: true, incident_id: result.rows[0].id });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

export default router;
