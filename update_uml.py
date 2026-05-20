import re

with open('main.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remplacer le diagramme de cas d'utilisation
old_uc = r"""\begin{figure}[H]
    \centering
    \begin{verbatim}
+------------------+     +-------------------+
|    Agent terrain  |     |     Analyste      |
+------------------+     +-------------------+
         |                          |
         | • Signaler incident       | • Analyser signalements
         | • Consulter signalements  | • Valider/infirmer alertes
         | • Voir alertes locales    | • Visualiser anomalies
         |                          | • Générer rapports
         |                          |
+------------------+     +-------------------+
|     Décideur      |     |  Administrateur   |
+------------------+     +-------------------+
         |                          |
         | • Voir tableau bord       | • Gérer utilisateurs
         | • Consulter alertes       | • Importer documents
         | • Prendre décisions       | • Valider extractions
         | • Suivre évolution        | • Configurer seuils
    \end{verbatim}
    \caption{Diagramme de cas d'utilisation}
\end{figure}"""

new_uc = r"""\begin{figure}[H]
    \centering
    \includegraphics[width=0.8\textwidth]{media/use_case.png}
    \caption{Diagramme de cas d'utilisation}
\end{figure}"""
content = content.replace(old_uc, new_uc)

# 2. Remplacer le diagramme de classes
old_class = r"""\begin{figure}[H]
    \centering
    \begin{verbatim}
+----------------+          +----------------+          +----------------+
|   Utilisateur  |          |    Incident    |          |   Localisation |
+----------------+          +----------------+          +----------------+
| - id: int      |          | - id: int      |          | - id: int      |
| - nom: string  |          | - date: date   |          | - mode: enum   |
| - prenom: str  |          | - type: enum   |1       1 | - lat: float   |
| - email: str   |          | - description  |<-------->| - lng: float   |
| - role: enum   |          | - gravite: int |          | - region: str  |
| - score_conf   |          | - confiance: fl|          | - province: str|
| - actif: bool  |          | - source_id    |          | - commune: str |
+----------------+          +----------------+          | - precision    |
       1                          1                     +----------------+
       |                          |                             |
       |                    1     |       *                     |
       |                  +----------------+                   |
       |                  |     Source     |                   |
       |                  +----------------+                   |
       |                  | - id: int      |                   |
       |                  | - type: enum   |                   |
       |                  | - ident_ext    |                   |
       |                  | - score_conf   |                   |
       |                  | - nb_signals   |                   |
       |                  +----------------+                   |
       |                                                        |
       |                   +----------------+                   |
       |                   |     Alerte     |                   |
       |                   +----------------+                   |
       +------------------>| - id: int      |<------------------+
                           | - niveau: enum |
                           | - date_creation|
                           | - confiance    |
                           | - statut: enum |
                           +----------------+
    \end{verbatim}
    \caption{Diagramme de classes UML}
\end{figure}"""

new_class = r"""\begin{figure}[H]
    \centering
    \includegraphics[width=1\textwidth]{media/class_diagram.png}
    \caption{Modèle Conceptuel de Données (MCD) / Diagramme de classes}
\end{figure}"""
content = content.replace(old_class, new_class)

# 3. Remplacer le diagramme de séquence
old_seq = r"""\begin{figure}[H]
    \centering
    \begin{verbatim}
Agent       Frontend    Backend     IA        BDD
  |            |           |         |         |
  |--Signaler-->|           |         |         |
  |            |--Transmettre->|      |         |
  |            |           |--Analyser->|       |
  |            |           |         |--Vérifier->|
  |            |           |         |<--Données--|
  |            |           |<--Résultat-|       |
  |            |           |--Calculer risque   |
  |            |           |--Créer alerte----->|
  |            |<--Confirmation|      |         |
  |<--OK-------|           |         |         |
    \end{verbatim}
    \caption{Diagramme de séquence - Création d'une alerte}
\end{figure}"""

new_seq = r"""\begin{figure}[H]
    \centering
    \includegraphics[width=1\textwidth]{media/sequence.png}
    \caption{Diagramme de séquence global du système}
\end{figure}"""
content = content.replace(old_seq, new_seq)

# 4. Remplacer la structure de la base de données
old_db = r"""\begin{figure}[H]
    \centering
    \begin{verbatim}
CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100), prenom VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(20),
    score_confiance FLOAT DEFAULT 0.5,
    actif BOOLEAN DEFAULT true
);

CREATE TABLE incident (
    id SERIAL PRIMARY KEY,
    date_incident TIMESTAMP,
    type VARCHAR(50),
    description TEXT,
    gravite INT,
    source_id INT,
    confiance FLOAT
);

CREATE TABLE localisation (
    id SERIAL PRIMARY KEY,
    incident_id INT UNIQUE,
    mode_saisie VARCHAR(20),
    latitude FLOAT, longitude FLOAT,
    region VARCHAR(100), province VARCHAR(100),
    commune VARCHAR(100), precision_niveau VARCHAR(20),
    geom GEOMETRY(POINT, 4326)
);
    \end{verbatim}
    \caption{Schéma de la base de données}
\end{figure}"""

new_db = r"""\begin{figure}[H]
    \centering
    \includegraphics[width=0.8\textwidth]{media/db_schema.png}
    \caption{Code SQL de création des tables de la base de données}
\end{figure}"""
content = content.replace(old_db, new_db)

with open('main.tex', 'w', encoding='utf-8') as f:
    f.write(content)
