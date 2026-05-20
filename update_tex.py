import re

with open('main.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Dédicace
content = content.replace(
    r"\textit{Je dédie ce travail à mes parents, pour leurs sacrifices et leur soutien indéfectible tout au long de mon parcours.}",
    r"\textit{Je dédie ce travail à mes parents !}"
)

# 2. Remerciements
content = content.replace(
    r"Je remercie l'ensemble de l'administration de BIT et le corps enseignant du département d'Informatique pour la qualité de la formation dispensée. Je remercie également mon directeur de mémoire, Dr Philippe KAHOUN, pour son encadrement précieux, ses conseils avisés et sa disponibilité. Enfin, je remercie mes amis et tous ceux qui ont contribué à ce travail.",
    r"Je tiens à exprimer ma profonde gratitude à toutes les personnes qui ont contribué, de près ou de loin, à la réalisation de ce mémoire.\\" + "\n" +
    r"Mes remerciements vont en premier lieu à l'administration de Burkina Institute of Technology (BIT) et à l'ensemble du corps enseignant du département d'Informatique pour la qualité de la formation dispensée.\\" + "\n" +
    r"Je remercie tout particulièrement mon Directeur de Mémoire, Dr Philippe KAHOUN, Enseignant chercheur à BIT, pour son encadrement précieux, ses conseils avisés et sa disponibilité.\\" + "\n" +
    r"Enfin, j'adresse mes remerciements à mes camarades de classe, ainsi qu'à mes amis et à ma famille pour leur soutien indéfectible."
)

# 3. Liste des acronymes
old_acronyms = r"""\begin{longtable}{p{3cm}p{10cm}}
\textbf{2FA} & Two-Factor Authentication (Double authentification) \\
\textbf{API} & Application Programming Interface \\
\textbf{CEDEAO} & Communauté Économique des États de l'Afrique de l'Ouest \\
\textbf{DBSCAN} & Density-Based Spatial Clustering of Applications with Noise \\
\textbf{ETL} & Extract, Transform, Load \\
\textbf{FAN} & Forces Armées Nationales \\
\textbf{GPS} & Global Positioning System \\
\textbf{IA} & Intelligence Artificielle \\
\textbf{IED} & Engin Explosif Improvisé \\
\textbf{JSON} & JavaScript Object Notation \\
\textbf{KPI} & Key Performance Indicator \\
\textbf{NLP} & Natural Language Processing \\
\textbf{OCR} & Optical Character Recognition \\
\textbf{ONG} & Organisation Non Gouvernementale \\
\textbf{PostGIS} & Extension spatiale de PostgreSQL \\
\textbf{REST} & Representational State Transfer \\
\textbf{SAD} & Système d'Aide à la Décision \\
\textbf{SAP} & Système d'Alerte Précoce \\
\textbf{SIG} & Système d'Information Géographique \\
\textbf{SQL} & Structured Query Language \\
\textbf{UML} & Unified Modeling Language \\
\end{longtable}"""

new_acronyms = r"""\begin{longtable}{p{3cm}p{10cm}}
\textbf{2FA} & Two-Factor Authentication (Double authentification) \\
\textbf{API} & Application Programming Interface \\
\textbf{CEDEAO} & Communauté Économique des États de l'Afrique de l'Ouest \\
\textbf{DBSCAN} & Density-Based Spatial Clustering of Applications with Noise \\
\textbf{ETL} & Extract, Transform, Load \\
\textbf{FAN} & Forces Armées Nationales \\
\textbf{GPS} & Global Positioning System \\
\textbf{IA} & Intelligence Artificielle \\
\textbf{IED} & Engin Explosif Improvisé \\
\textbf{JSON} & JavaScript Object Notation \\
\textbf{JWT} & JSON Web Token \\
\textbf{KPI} & Key Performance Indicator \\
\textbf{NLP} & Natural Language Processing \\
\textbf{OCR} & Optical Character Recognition \\
\textbf{ONG} & Organisation Non Gouvernementale \\
\textbf{PostGIS} & Extension spatiale de PostgreSQL \\
\textbf{REST} & Representational State Transfer \\
\textbf{SAD} & Système d'Aide à la Décision \\
\textbf{SAP} & Système d'Alerte Précoce \\
\textbf{SIG} & Système d'Information Géographique \\
\textbf{SQL} & Structured Query Language \\
\textbf{UML} & Unified Modeling Language \\
\textbf{VPS} & Virtual Private Server \\
\end{longtable}"""
content = content.replace(old_acronyms, new_acronyms)

# 4. Objectifs spécifiques
old_obj = r"""\textbf{Objectifs spécifiques :}
\begin{enumerate}
    \item Analyser les systèmes existants et identifier leurs limites
    \item Concevoir une architecture logicielle adaptée aux contraintes du terrain
    \item Développer un module d'import et de structuration des rapports administratifs
    \item Implémenter un système hybride de localisation (GPS et saisie manuelle)
    \item Mettre en place un mécanisme d'apprentissage automatique basé sur les imports
    \item Développer des algorithmes de détection des fausses informations
    \item Évaluer qualitativement les performances du système
\end{enumerate}"""

new_obj = r"""\textbf{Objectifs spécifiques :}
\begin{itemize}
    \item \textbf{Développer une application mobile hybride (en Flutter)} permettant la collecte et le signalement rapide d'incidents sur le terrain, même en zone de faible connectivité.
    \item \textbf{Mettre en place un Backend robuste et une base de données (PostgreSQL)} garantissant le traitement, la sécurité et l'archivage fiable des rapports.
    \item \textbf{Concevoir une interface Web d'administration (en Next.js)} offrant aux décideurs une visualisation dynamique des menaces via une cartographie interactive et des tableaux de bord.
    \item \textbf{Intégrer un moteur d'Intelligence Artificielle (en Python)} chargé de l'analyse prédictive, du filtrage des fausses alertes, et de l'adaptation dynamique des seuils critiques (méthode des 3 sigmas).
\end{itemize}"""
content = content.replace(old_obj, new_obj)

# 5. Interface utilisateur et maquettes
old_ui = r"""\section{Interface utilisateur et maquettes}
Les maquettes (Figma) illustrent toutes les fonctionnalités (connexion, inscription, signalement, tableau de bord, carte, analyses, prédictions IA, alertes, aide à la décision, import de documents, validation extractions, historique d’apprentissage, détection des manipulations, gestion des utilisateurs).

% Insérez ici vos figures avec \includegraphics
% (je garde la structure de votre code original)"""

new_ui = r"""\section{Interface utilisateur et maquettes}

\textbf{Remarque sur l'origine des données :} L'ensemble des données, chiffres et pourcentages présentés dans les figures de cette section proviennent de \textbf{données simulées (jeux de données de test)} que nous avons générées lors du développement. Ces données fictives nous ont permis de tester la configuration du système, d'évaluer les algorithmes d'IA (calcul des seuils dynamiques) et de valider les interfaces avant un potentiel déploiement réel sur le terrain.

Les maquettes illustrent toutes les fonctionnalités du système (connexion, inscription, signalement, tableau de bord, carte, analyses, prédictions IA, alertes, aide à la décision, import de documents, validation extractions, historique d’apprentissage, détection des manipulations, gestion des utilisateurs).

\vspace{0.5cm}
\textbf{Exemple d'intégration d'une figure :}

\textit{La figure ci-dessous illustre le tableau de bord global de l'administrateur. Cette interface agrège les données simulées provenant de la base de données pour afficher le nombre d'incidents critiques et leur répartition géographique. Ces résultats permettent aux décideurs d'avoir une vue synthétique instantanée de la situation.}
% \begin{figure}[H]
%    \centering
%    \includegraphics[width=0.8\textwidth]{media/tableau_de_bord.png}
%    \caption{Tableau de bord général}
% \end{figure}"""
content = content.replace(old_ui, new_ui)

# 6. Configuration technique et matérielle, Tests, et Budget
old_conf = r"""\section{Configuration technique et matérielle}
\begin{table}[H]
\centering
\caption{Configuration matérielle recommandée}
\begin{tabular}{|l|l|l|}
\hline
\textbf{Composant} & \textbf{Serveur} & \textbf{Postes utilisateurs} \\
\hline
Processeur & Intel Xeon 8 cœurs & Intel i5 ou équivalent \\
\hline
RAM & 32 Go & 8 Go \\
\hline
Stockage & 1 To SSD & 256 Go \\
\hline
Réseau & Fibre 100 Mbps & 4G/5G pour terrain \\
\hline
\end{tabular}
\end{table}

\begin{table}[H]
\centering
\caption{Estimation des coûts de déploiement}
\begin{tabular}{|l|l|}
\hline
\textbf{Élément} & \textbf{Coût (FCFA)} \\
\hline
Serveur (1 an) & 2 400 000 \\
\hline
Développement & 5 000 000 \\
\hline
Formation & 1 000 000 \\
\hline
Maintenance (1 an) & 1 500 000 \\
\hline
\textbf{Total} & \textbf{9 900 000} \\
\hline
\end{tabular}
\end{table}

\section{Tests et évaluation (approche qualitative)}
Les tests ont été réalisés sur des données simulées. Les résultats montrent une bonne fiabilité du système."""

new_conf = r"""\section{Configuration technique et matérielle}

La mise en œuvre du système SAD-ALERTE s'appuie sur des technologies modernes pour garantir performance et évolutivité :
\begin{itemize}
    \item \textbf{Application Mobile (Agent Terrain) :} Développée en \textbf{Flutter} (Dart), permettant d'avoir une application hybride fonctionnant sur Android et iOS avec une interface fluide.
    \item \textbf{Application Web (Décideurs et Administrateurs) :} Conçue avec \textbf{Next.js} et React.js, offrant un rendu rapide et une cartographie interactive pour le suivi en temps réel.
    \item \textbf{Backend (Logique serveur) :} Développé en \textbf{Node.js avec Express}, il sécurise l'accès via des tokens (JWT) et sert d'intermédiaire entre les interfaces et la base de données.
    \item \textbf{Moteur IA :} Implémenté en \textbf{Python}, il exécute les algorithmes d'apprentissage automatique, analyse les documents et identifie les fausses informations.
    \item \textbf{Base de données :} \textbf{PostgreSQL}, associé à son extension spatiale \textbf{PostGIS} pour gérer efficacement les coordonnées géographiques des signalements.
\end{itemize}

\begin{table}[H]
\centering
\caption{Configuration matérielle recommandée}
\begin{tabular}{|l|l|l|}
\hline
\textbf{Composant} & \textbf{Serveur de Production (VPS)} & \textbf{Postes utilisateurs} \\
\hline
Processeur & 4 vCPU (cœurs) minimum & Smartphone Android 8.0+ \\
\hline
RAM & 8 Go minimum & PC avec navigateur Web à jour \\
\hline
Stockage & 100 Go SSD & -- \\
\hline
Réseau & Connexion haut débit & 3G/4G pour terrain \\
\hline
\end{tabular}
\end{table}

\section{Tests et évaluation des performances}
Pour évaluer les performances du système, nous avons généré un environnement de test local. Plusieurs scénarios ont été joués :
\begin{itemize}
    \item \textbf{Tests fonctionnels :} Validation de bout en bout du flux d'authentification, de l'envoi d'alertes depuis le mobile, et de leur réception instantanée sur l'application Web.
    \item \textbf{Tests de l'Intelligence Artificielle :} Injection massive de signalements simulés pour forcer le système à adapter dynamiquement ses seuils. L'algorithme basé sur le facteur de 3 sigmas a réussi à rejeter avec succès les faux signalements en les plaçant en quarantaine, démontrant la robustesse du filtrage.
\end{itemize}

\section{Évaluation financière estimative (Budget)}
La mise en œuvre concrète de cette solution nécessite un investissement initial qui peut être estimé comme suit :

\begin{table}[H]
\centering
\caption{Estimation des coûts de déploiement annuel}
\begin{tabular}{|l|l|}
\hline
\textbf{Élément} & \textbf{Coût (FCFA)} \\
\hline
Hébergement (Serveur VPS) et nom de domaine & 250 000 \\
\hline
Services Tiers (API Cartographie, Mails SendGrid) & 50 000 \\
\hline
Conception, développement et maintenance du système & 2 000 000 \\
\hline
\textbf{Total estimatif} & \textbf{2 300 000} \\
\hline
\end{tabular}
\end{table}

Ce système représente un coût maitrisé par rapport à l'avantage stratégique et humain qu'offre l'anticipation des crises sécuritaires."""
content = content.replace(old_conf, new_conf)

with open('main.tex', 'w', encoding='utf-8') as f:
    f.write(content)
