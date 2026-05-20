# SAD-ALERTE

Système d’Aide à la Décision pour l’Alerte Précoce des menaces sécuritaires (Burkina Faso).

## Soutenance (mémoire, slides, démo, archive)

Guides prêts dans [`docs/soutenance/`](docs/soutenance/) :

| Fichier | Contenu |
|---------|---------|
| [A-GUIDE-OVERLEAF-PDF.md](docs/soutenance/A-GUIDE-OVERLEAF-PDF.md) | Compiler `main.tex` → PDF via Overleaf |
| [B-PLAN-SLIDES-SOUTENANCE.md](docs/soutenance/B-PLAN-SLIDES-SOUTENANCE.md) | Plan diapo par diapo + script oral |
| [C-SCENARIO-DEMO-LIVE.md](docs/soutenance/C-SCENARIO-DEMO-LIVE.md) | Scénario démo live millimétré |
| [D-ARCHIVE-PROJET.md](docs/soutenance/D-ARCHIVE-PROJET.md) | Archive ZIP propre pour le jury |
| [GIT-GITHUB.md](docs/soutenance/GIT-GITHUB.md) | Pousser le code sur GitHub |

## Architecture

- `backend/` : API Node.js/Express (sécurisée) + PostgreSQL/PostGIS
- `frontend/` : application web Next.js (App Router)
- `ia/` : scripts Python (scikit-learn) pour entraînement/anomalies/seuils
- `python_ai/` : worker qui interroge l’API (`/api/documents/non_traites`) et met à jour les PDF en file d’attente
- `mobile_agent/` : application Flutter (agent terrain) vers l’API
- `scripts/` : SQL et scripts utilitaires

## Démarrage rapide (développement)

### Pré-requis

- Node.js (LTS)
- Python 3.11+
- PostgreSQL + PostGIS **ou** [Docker](https://docs.docker.com/get-docker/) (recommandé pour la base)

### Base de données avec Docker

À la racine du dépôt :

```bash
docker compose up -d db
```

Attendre que le conteneur soit `healthy` (`docker compose ps`). La base de données **de référence** pour le développement est **uniquement** ce conteneur Docker. Sur la machine hôte, PostgreSQL est exposé sur le port **5433** (évite les conflits avec un PostgreSQL local sur 5432). Identifiants : voir `backend/.env.example` (`postgres` / `postgres`, base `sad_alerte`). Le schéma `scripts/init_db.sql` est appliqué automatiquement au **premier** démarrage. Pour repartir de zéro : `docker compose down -v` puis `docker compose up -d db`.

### Base de données (installation locale sans Docker)

1. Crée une base `sad_alerte`
2. Active PostGIS
3. Lance le script :

```bash
psql -d sad_alerte -f scripts/init_db.sql
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Lancement manuel (stack complète + moteur IA documents)

Utiliser **un terminal par service** (laisser chaque processus tourner).

1. **Base** (racine du dépôt) : `docker compose up -d db` puis `docker compose ps` jusqu’à `healthy`.
2. **Backend** : `cd backend`, `npm install`, copier `cp .env.example .env` si besoin, puis `npm run dev`.  
   - Ajouter dans `backend/.env` une clé **`DOCUMENTS_AI_API_KEY`** (même valeur que pour le worker Python ci‑dessous). Elle sert au script `python_ai` pour appeler l’API.
3. **Frontend** : `cd frontend`, `npm install`, `cp .env.local.example .env.local`, puis `npm run dev`.
4. **Moteur IA (fichiers PDF en attente)** : avec l’API déjà démarrée sur le port 4000 :

```powershell
cd python_ai
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DOCUMENTS_AI_API_KEY="la_meme_valeur_que_dans_backend_env"
python analyzer.py
```

Sous Linux ou macOS : `source venv/bin/activate`, `export DOCUMENTS_AI_API_KEY=...`, puis `python analyzer.py`.

Le worker interroge l’API toutes les 5 secondes, lit les PDF dans `backend/uploads/`, puis appelle `PUT /api/documents/:id/traiter`. Les PDF sont déposés via l’écran **Import documents** (rôle analyste).

5. **Application mobile (Flutter)** — avec l’API sur le port 4000 et un compte **agent** connecté (token stocké par l’app si vous ajoutez un flux login, ou selon l’état actuel du code) :

```powershell
cd mobile_agent
flutter pub get
flutter run
```

- **Android émulateur** : `localhost` ne pointe pas vers votre PC ; utiliser par exemple  
  `flutter run --dart-define=API_BASE=http://10.0.2.2:4000`  
  (voir commentaire dans `mobile_agent/lib/api_config.dart`).
- **Téléphone physique** : même principe avec l’adresse IP locale de la machine qui héberge l’API.

### Dépannage : `authentification par mot de passe échouée` (`28P01`)

Vérifiez que `DATABASE_URL` pointe vers **Docker** : `...@localhost:5433/sad_alerte` (port **5433** publié par `docker-compose.yml`). Si le volume a été recréé ou le mot de passe changé dans le compose sans recréer le volume, exécutez `docker compose down -v` puis `docker compose up -d db`.

## Sécurité (principes appliqués)

- Authentification **JWT access + refresh** (refresh stocké côté serveur, rotation)
- **RBAC** (agent / analyste / decideur / admin)
- Mots de passe hashés (`argon2id`)
- Validation stricte des entrées (`zod`) + sanitation
- Protection headers (`helmet`), CORS strict, cookies `httpOnly` + `sameSite`
- Rate limiting + détection basique d’abus
- Journalisation + **audit log** des actions sensibles

