import re

with open('main.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Expand "Mécanismes réactifs en place"
old_mecanismes = r"""\section{Mécanismes réactifs en place}
Les forces de défense utilisent des rapports hiérarchiques et des patrouilles. Les comités de vigilance locaux jouent un rôle crucial mais avec des informations non structurées. Les ONG et médias apportent des données complémentaires mais hétérogènes."""

new_mecanismes = r"""\section{Mécanismes réactifs en place}
Actuellement, le système de gestion des incidents sécuritaires repose de manière prédominante sur des mécanismes réactifs. Les Forces de Défense et de Sécurité (FDS) s'appuient principalement sur des rapports hiérarchiques manuscrits ou numérisés a posteriori, ainsi que sur les retours réguliers des patrouilles de terrain. Par ailleurs, les comités de vigilance locaux et les Volontaires pour la Défense de la Patrie (VDP) jouent un rôle crucial de renseignement à la base. Cependant, les informations qu'ils remontent souffrent souvent d'un manque de structuration et de standardisation. En parallèle, les Organisations Non Gouvernementales (ONG) et les médias locaux apportent des données complémentaires, bien que celles-ci restent très hétérogènes et difficiles à agréger en temps réel."""
content = content.replace(old_mecanismes, new_mecanismes)

# 2. Expand "Risques liés aux fausses informations"
old_risques = r"""\section{Risques liés aux fausses informations}
Les risques incluent la diversion (fausses alertes), la dissimulation (non‑signalement), l'amplification, l'usurpation, la saturation, et la coordination malveillante. Les conséquences peuvent être graves : vies humaines, perte de crédibilité, gaspillage de ressources."""

new_risques = r"""\section{Risques liés aux fausses informations}
Dans un contexte de guerre asymétrique, la gestion de l'information est devenue un enjeu stratégique majeur. Les systèmes d'alerte font face à de nombreux risques liés à l'injection de données erronées. Parmi ces menaces, nous retrouvons la diversion, qui consiste à déclencher de fausses alertes pour éloigner les forces de sécurité de leur cible réelle. La dissimulation et l'amplification permettent quant à elles de manipuler la perception du danger. Par ailleurs, des adversaires peuvent recourir à l'usurpation d'identité ou à la saturation du système par un afflux massif de signalements inutiles. Les conséquences de ces manipulations peuvent être désastreuses, allant du gaspillage critique des ressources logistiques à la perte de crédibilité du système, et dans le pire des cas, à la perte de vies humaines."""
content = content.replace(old_risques, new_risques)

# 3. Expand "Synthèse des besoins"
old_besoins = r"""\section{Synthèse des besoins}
\textbf{Besoins fonctionnels :} centralisation des données, import de documents, localisation hybride, apprentissage automatique, seuils adaptatifs, détection des manipulations, visualisation.

\textbf{Besoins non fonctionnels :} sécurité, résilience, adaptativité, accessibilité, inclusivité."""

new_besoins = r"""\section{Synthèse des besoins}
Afin de pallier les insuffisances des mécanismes actuels, nous avons dégagé plusieurs besoins majeurs pour la conception de notre système. 

\textbf{Besoins fonctionnels :} Le système doit impérativement permettre la centralisation sécurisée des données en un point unique. Il doit intégrer un module d'import de documents administratifs pour numériser les archives existantes. De plus, il est crucial de mettre à disposition une localisation hybride (GPS et saisie manuelle) pour s'adapter aux zones sans couverture réseau. Enfin, l'application doit embarquer des algorithmes d'apprentissage automatique pour le calcul de seuils adaptatifs, tout en assurant une détection proactive des tentatives de manipulation de l'information.

\textbf{Besoins non fonctionnels :} Sur le plan technique, l'application doit garantir un haut niveau de sécurité pour protéger l'identité des signalants. Elle doit faire preuve de résilience face aux pannes de réseau, offrir une grande adaptativité selon l'évolution du contexte, et maintenir une accessibilité maximale pour les agents disposant de terminaux mobiles aux performances limitées."""
content = content.replace(old_besoins, new_besoins)

# 4. Expand "Mécanismes de détection des fausses informations" & "Gestion dynamique des seuils par IA"
old_ai_mechanisms = r"""\section{Mécanismes de détection des fausses informations}
Trois niveaux sont implémentés : filtrage technique, analyse comportementale, analyse croisée (convergence).

\section{Gestion dynamique des seuils par IA}
Le seuil est calculé selon la règle des 3 sigmas et s’adapte à chaque zone."""

new_ai_mechanisms = r"""\section{Mécanismes de détection des fausses informations}
Afin d'assurer la fiabilité des données collectées, le système implémente une procédure stricte de vérification reposant sur trois niveaux distincts. Le premier niveau est un filtrage technique qui s'assure de l'intégrité de la requête et de la validité des coordonnées géographiques. Le deuxième niveau consiste en une analyse comportementale du signalant, qui attribue un score de confiance basé sur l'historique de l'utilisateur. Enfin, le troisième niveau est une analyse croisée de convergence, qui recoupe de multiples signalements similaires émanant de sources indépendantes pour confirmer un événement avant de déclencher une alerte formelle.

\section{Gestion dynamique des seuils par IA}
Dans les systèmes d'alerte classiques, les seuils de déclenchement sont statiques et deviennent rapidement inadaptés. Notre solution intègre une gestion dynamique des seuils pilotée par l'Intelligence Artificielle. Ce mécanisme s'appuie sur la règle statistique des 3 sigmas. L'algorithme analyse en continu la fréquence moyenne des incidents dans une région donnée. Si le nombre de signalements dépasse la moyenne plus trois fois l'écart-type, le système identifie formellement une anomalie statistique et lève une alerte critique, s'adaptant ainsi à la "normalité" spécifique de chaque localité."""
content = content.replace(old_ai_mechanisms, new_ai_mechanisms)

# 5. Expand "Implémentation technique"
old_impl = r"""\section{Implémentation technique}
\subsection{Backend Node.js/Express}
\subsection{Frontend React/Next.js}
\subsection{Base de données PostgreSQL/PostGIS}
\subsection{IA avec Python/scikit-learn}"""

new_impl = r"""\section{Implémentation technique détaillée}

La concrétisation de l'architecture proposée a nécessité l'utilisation d'un ensemble de technologies robustes et modernes.

\subsection{Backend avec Node.js et Express}
Le Backend constitue le cœur logique de notre système. Développé en JavaScript avec l'environnement d'exécution Node.js et le framework Express, il permet de gérer de manière asynchrone un grand volume de requêtes simultanées. Ce module expose une API RESTful sécurisée. Il est en charge de l'authentification des utilisateurs, de la vérification des droits d'accès via des JSON Web Tokens (JWT), et du traitement métier avant l'insertion des données en base.

\subsection{Frontend Web avec React et Next.js}
L'interface d'administration a été bâtie à l'aide de React.js et du framework Next.js. Ce choix technologique garantit un rendu côté serveur (SSR) qui accélère le temps de chargement des pages. Le tableau de bord offre une expérience utilisateur fluide, permettant aux décideurs d'interagir en temps réel avec la cartographie des incidents générée via la librairie Leaflet.

\subsection{Application Mobile avec Flutter}
Pour les agents de terrain, nous avons développé une application mobile utilisant le framework Flutter. Ce choix permet de disposer d'une base de code unique compatible avec les systèmes Android et iOS. L'application mobile met l'accent sur la simplicité d'utilisation et intègre des fonctionnalités de mise en cache locale pour supporter la saisie de signalements même lorsque la connexion internet est indisponible.

\subsection{Base de données PostgreSQL et PostGIS}
L'ensemble des données est persisté au sein d'une base de données relationnelle PostgreSQL. Afin de traiter efficacement les problématiques de localisation, nous avons couplé ce SGBD avec son extension spatiale PostGIS. Cette combinaison permet de réaliser des requêtes géographiques complexes, telles que le regroupement d'incidents par rayon ou l'identification d'anomalies de positionnement.

\subsection{Intelligence Artificielle avec Python et Scikit-Learn}
L'analyse des menaces et l'évaluation des seuils sont déléguées à un micro-service écrit en Python. Ce module exploite les librairies spécialisées telles que Scikit-Learn et Pandas. Il se connecte régulièrement à la base de données pour réentraîner les modèles d'apprentissage automatique en fonction des nouvelles données importées, garantissant ainsi un système qui s'améliore de manière autonome avec le temps."""
content = content.replace(old_impl, new_impl)

# 6. Expand "Stratégie d’innovation"
old_strat = r"""\section{Stratégie d’innovation (obligatoire)}
\begin{enumerate}
    \item Développement d’un prototype
    \item Tests terrain avec comités de vigilance
    \item Collaboration avec les forces de sécurité
    \item Formation des utilisateurs
    \item Évaluation continue
\end{enumerate}"""

new_strat = r"""\section{Stratégie d’innovation et de déploiement}
L'intégration de ce système au sein de l'architecture sécuritaire du pays s'inscrit dans une démarche d'innovation progressive. Pour garantir son adoption, nous recommandons la stratégie de déploiement suivante :

\begin{enumerate}
    \item \textbf{Déploiement d'un prototype à périmètre réduit :} La première étape consiste à déployer une version bêta de l'application dans une seule région pilote, afin d'évaluer le comportement du système dans des conditions réelles contrôlées.
    \item \textbf{Tests de terrain avec les comités de vigilance :} Les agents locaux et les Volontaires pour la Défense de la Patrie (VDP) seront équipés de l'application mobile pour éprouver sa résilience face aux pannes de réseau et son ergonomie.
    \item \textbf{Collaboration institutionnelle avec les forces de sécurité :} Le succès du projet repose sur un partenariat étroit avec l'état-major. Les retours d'expérience des analystes militaires permettront d'affiner les modèles d'Intelligence Artificielle.
    \item \textbf{Campagne de formation des utilisateurs :} Des sessions de formation pratiques devront être organisées pour accompagner les agents dans l'appropriation de l'outil et dans la compréhension de l'importance de la rigueur de saisie.
    \item \textbf{Évaluation continue et maintenance itérative :} Enfin, un comité technique devra être mis en place pour assurer une surveillance permanente des performances des algorithmes de détection et procéder aux mises à jour nécessaires face à l'évolution des menaces.
\end{enumerate}"""
content = content.replace(old_strat, new_strat)


with open('main.tex', 'w', encoding='utf-8') as f:
    f.write(content)
