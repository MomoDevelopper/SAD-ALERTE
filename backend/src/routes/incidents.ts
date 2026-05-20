import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth.js";
import { pool } from "../db/pool.js";

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
    // accept images, audio, pdf, and octet-stream (mobile default)
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/") || file.mimetype === "application/pdf" || file.mimetype === "application/octet-stream") {
      cb(null, true);
    } else {
      cb(new Error("Format non supporté."));
    }
  }
});

// GET /api/incidents
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT i.id, i.date_incident, i.type, i.description, i.gravite_ia, i.confiance, i.date_saisie,
             l.latitude, l.longitude, l.region, l.province, l.commune, l.precision_niveau,
             (SELECT chemin_fichier FROM media_document m WHERE m.titre = 'Média Incident ' || i.id LIMIT 1) as chemin_fichier,
             u.nom as signalant_nom, u.prenom as signalant_prenom, u.email as signalant_email,
             u.matricule as signalant_matricule, u.unite as signalant_unite, u.zone_affectation as signalant_zone
      FROM incident i
      LEFT JOIN localisation l ON i.id = l.incident_id
      LEFT JOIN utilisateur u ON i.source_id = u.id
      WHERE i.type IS NOT NULL AND i.type != '' AND i.type != 'Inconnu'
      ORDER BY i.date_saisie DESC
    `);
    res.json({ incidents: result.rows });
  } catch (error) {
    next(error);
  }
});

// POST /api/incidents
router.post(
  "/",
  requireAuth,
  upload.single("media"),
  async (req, res, next) => {
    const file = req.file;
    const user = req.user;
    
    // Parsed from multipart form data
    const { 
      type, description, 
      latitude, longitude, region, province, commune, locationMethod
    } = req.body;

    if (!type || !description) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Type et description sont requis." });
      return;
    }

    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Insert incident
        const insertIncidentQuery = `
          INSERT INTO incident (date_incident, type, description, confiance, source_id)
          VALUES (NOW(), $1, $2, $3, $4)
          RETURNING id;
        `;
        // Assuming a confidence of 0.8 for mobile agents who are verified users
        const incResult = await client.query(insertIncidentQuery, [type, description, 0.8, user?.id || null]);
        const incidentId = incResult.rows[0].id;

        // Insert localisation
        if (region && province && commune) {
          const lat = parseFloat(latitude) || null;
          const lng = parseFloat(longitude) || null;
          
          let geomQuery = "ST_SetSRID(ST_MakePoint(0, 0), 4326)"; 
          if (lat !== null && lng !== null) {
            geomQuery = `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;
          }

          const insertLocQuery = `
            INSERT INTO localisation (incident_id, mode_saisie, latitude, longitude, region, province, commune, precision_niveau, geom)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ${geomQuery})
          `;
          
          await client.query(insertLocQuery, [
            incidentId,
            locationMethod === '1' ? 'gps' : 'manuel',
            lat,
            lng,
            region,
            province,
            commune,
            locationMethod === '1' ? 'exact' : 'communal'
          ]);
        }

        // Insert media if present
        if (file) {
          const insertMediaQuery = `
            INSERT INTO media_document (titre, categorie, chemin_fichier, region_cible, upload_par, statut_ia)
            VALUES ($1, $2, $3, $4, $5, 'en_attente')
          `;
          await client.query(insertMediaQuery, [
            `Média Incident ${incidentId}`,
            'rapport_incident',
            file.filename,
            region || 'Inconnue',
            user?.id
          ]);
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, incident_id: incidentId });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
