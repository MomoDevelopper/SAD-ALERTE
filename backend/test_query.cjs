const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });
const pool = new Pool();
pool.query(`
      SELECT i.id, i.date_incident, i.type, i.description, i.gravite_ia, i.confiance, i.date_saisie,
             l.latitude, l.longitude, l.region, l.province, l.commune, l.precision_niveau,
             (SELECT chemin_fichier FROM media_document m WHERE m.titre = 'Média Incident ' || i.id LIMIT 1) as chemin_fichier,
             u.nom as signalant_nom, u.prenom as signalant_prenom, u.email as signalant_email,
             u.matricule as signalant_matricule, u.unite as signalant_unite, u.zone_affectation as signalant_zone
      FROM incident i
      LEFT JOIN localisation l ON i.id = l.incident_id
      LEFT JOIN utilisateur u ON i.source_id = u.id
      ORDER BY i.date_saisie DESC LIMIT 1;
`)
  .then(res => console.log('Success:', res.rows))
  .catch(err => console.error('Error:', err.message))
  .finally(() => pool.end());
