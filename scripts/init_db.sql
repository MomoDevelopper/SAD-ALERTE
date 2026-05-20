-- SAD-ALERTE - Schéma minimal (PostgreSQL + PostGIS)
-- Idempotent: utilise IF NOT EXISTS quand possible.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Utilisateurs (RBAC)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('agent', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'localisation_mode') THEN
    CREATE TYPE localisation_mode AS ENUM ('gps', 'manuel');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alerte_niveau') THEN
    CREATE TYPE alerte_niveau AS ENUM ('faible', 'moyen', 'eleve', 'critique');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alerte_statut') THEN
    CREATE TYPE alerte_statut AS ENUM ('nouvelle', 'en_cours', 'resolue', 'classee');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_categorie') THEN
    CREATE TYPE document_categorie AS ENUM ('rapport_incident', 'news_rtb');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_statut_ia') THEN
    CREATE TYPE document_statut_ia AS ENUM ('en_attente', 'traite');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS utilisateur (
  id BIGSERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL,
  password_hash TEXT NOT NULL,
  score_confiance DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  twofa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  twofa_secret TEXT NULL,
  date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  matricule VARCHAR(100),
  unite VARCHAR(100),
  zone_affectation VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS refresh_session (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  user_agent TEXT NULL,
  ip INET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS password_reset_token (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Source = entité ayant émis des signalements (compte ou source externe)
CREATE TABLE IF NOT EXISTS source (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(30) NOT NULL CHECK (type IN ('compte', 'externe')),
  ident_ext VARCHAR(120) NULL,
  score_confiance DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  nb_signalements INT NOT NULL DEFAULT 0,
  last_seen TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS media_document (
  id BIGSERIAL PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  categorie document_categorie NOT NULL,
  chemin_fichier TEXT NOT NULL,
  region_cible VARCHAR(100) NULL,
  upload_par BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  statut_ia document_statut_ia NOT NULL DEFAULT 'en_attente',
  date_upload TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incident (
  id BIGSERIAL PRIMARY KEY,
  date_incident TIMESTAMP NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  gravite_ia INT NULL,
  source_id BIGINT NULL REFERENCES source(id) ON DELETE SET NULL,
  confiance DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  date_saisie TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS localisation (
  id BIGSERIAL PRIMARY KEY,
  incident_id BIGINT UNIQUE NOT NULL REFERENCES incident(id) ON DELETE CASCADE,
  mode_saisie localisation_mode NOT NULL,
  latitude DOUBLE PRECISION NULL,
  longitude DOUBLE PRECISION NULL,
  region VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  commune VARCHAR(100) NOT NULL,
  precision_niveau VARCHAR(20) NOT NULL CHECK (precision_niveau IN ('exact', 'communal', 'provincial')),
  geom GEOMETRY(POINT, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_localisation_geom ON localisation USING GIST (geom);

CREATE TABLE IF NOT EXISTS alerte (
  id BIGSERIAL PRIMARY KEY,
  incident_id BIGINT NOT NULL REFERENCES incident(id) ON DELETE CASCADE,
  niveau alerte_niveau NOT NULL,
  date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confiance DOUBLE PRECISION NOT NULL,
  statut alerte_statut NOT NULL DEFAULT 'nouvelle'
);

-- Audit log (actions sensibles)
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT NULL REFERENCES utilisateur(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(40) NULL,
  target_id VARCHAR(80) NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip INET NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

