# Option B — Plan des diapositives de soutenance (15–20 min)

**Format conseillé :** 18 slides + 2 slides de secours.  
**Rythme :** ~1 minute par slide.

---

## Slide 1 — Titre (30 s)

**À l’écran :**
- SAD-ALERTE — Système d’Aide à la Décision pour l’Alerte Précoce
- OUEDRAOGO Moumouni — Licence Informatique — BIT — 2025-2026
- Encadrant : Dr Philippe KAHOUN

**À dire :**
> « Bonjour Mesdames et Messieurs les membres du jury. Je suis OUEDRAOGO Moumouni. Je vous présente mon travail de fin de cycle : la conception et la réalisation de SAD-ALERTE, un système d’alerte précoce des menaces sécuritaires au Burkina Faso. »

---

## Slide 2 — Contexte & problématique (1 min)

**À l’écran :**
- Insécurité persistante dans plusieurs régions
- Signalements dispersés, traitement lent, décisions tardives
- **Problème :** comment centraliser, analyser et alerter plus tôt ?

**À dire :**
> « Le Burkina Faso fait face à des menaces sécuritaires localisées. Les informations arrivent par canaux hétérogènes. Le défi est de transformer ces signaux en alertes exploitables pour les décideurs, avant que la situation ne dégénère. »

---

## Slide 3 — Objectifs (1 min)

**À l’écran :**
- Objectif général : plateforme d’aide à la décision pour l’alerte précoce
- Objectifs spécifiques :
  1. Collecte terrain (mobile)
  2. Tableau de bord analyste (web)
  3. Analyse automatique de rapports PDF (IA)
  4. Visualisation cartographique et alertes

**À dire :**
> « Nous visons quatre capacités : saisie terrain, supervision web, analyse documentaire et aide à la décision visuelle. »

---

## Slide 4 — Solution proposée (1 min)

**À l’écran :**
- Schéma d’architecture (agent → API → BDD → dashboard / IA)
- Stack : Flutter, Next.js, Node.js, PostgreSQL/PostGIS, Python

**À dire :**
> « SAD-ALERTE relie le terrain au centre de décision via une API sécurisée et une base géolocalisée. »

---

## Slide 5 — Acteurs & rôles (45 s)

**À l’écran :**
- Agent terrain | Analyste / Admin | Décideur (vision)
- RBAC, authentification JWT

**À dire :**
> « Chaque acteur a un périmètre d’action défini pour garantir la traçabilité et la sécurité des données. »

---

## Slide 6 — Diagramme de cas d’utilisation (1 min)

**À l’écran :** figure `media/use_case.png`

**À dire :**
> « Ce diagramme résume les interactions : signalement, import de documents, consultation carte, gestion des alertes. »

---

## Slide 7 — Modèle de données (1 min)

**À l’écran :** figure `media/db_schema.png`

**À dire :**
> « Le cœur métier repose sur les incidents géolocalisés, les alertes, les utilisateurs et les documents analysés par l’IA. »

---

## Slide 8 — Sécurité (45 s)

**À l’écran :**
- JWT + refresh, Argon2, RBAC, rate limiting, audit log

**À dire :**
> « La sécurité n’est pas un ajout : elle structure chaque échange entre clients et serveur. »

---

## Slide 9 — Application mobile (1 min)

**À l’écran :** captures `mobile_login.png`, `mobile_signalement.png`

**À dire :**
> « L’agent terrain signale un incident avec localisation et média, même en zone à faible connectivité (saisie manuelle possible). »

---

## Slide 10 — Tableau de bord web (1 min)

**À l’écran :** `web_dashboard_carte.png`

**À dire :**
> « L’analyste visualise les menaces sur une carte et suit l’évolution des signalements en temps quasi réel. »

---

## Slide 11 — Module IA documents (1 min)

**À l’écran :** `web_import_validation.png` + flux PDF → worker Python

**À dire :**
> « Un rapport PDF importé est analysé automatiquement : extraction du type, de la gravité et création d’un incident en base. »

---

## Slide 12 — Alertes & aide à la décision (1 min)

**À l’écran :** `web_alertes_decision.png`, `web_ia_prediction.png`

**À dire :**
> « Les alertes sont classées par niveau. Le tableau de bord aide à prioriser les réponses opérationnelles. »

---

## Slide 13 — Démonstration (annonce) (30 s)

**À l’écran :**
- « Démo live : 3 scénarios »
- 1. Signalement mobile → 2. Réception dashboard → 3. Import PDF IA

**À dire :**
> « Je vais maintenant vous montrer le système en fonctionnement sur un scénario réaliste. »

---

## Slide 14 — Résultats & limites (1 min)

**À l’écran :**
- Prototype fonctionnel multi-composants
- Limites : données de test, IA simplifiée, déploiement pilote à prévoir

**À dire :**
> « Le prototype valide la chaîne complète. Les prochaines étapes visent un déploiement pilote régional et l’enrichissement des modèles IA. »

---

## Slide 15 — Perspectives (45 s)

**À l’écran :**
- Déploiement région pilote
- Formation utilisateurs
- Modèles ML avancés (scikit-learn en production)

**À dire :**
> « Nous proposons une montée en charge progressive, en collaboration avec les structures de sécurité. »

---

## Slide 16 — Conclusion (45 s)

**À l’écran :**
- SAD-ALERTE = collecte + analyse + alerte + décision
- Réponse à la problématique initiale

**À dire :**
> « En synthèse, SAD-ALERTE apporte une réponse concrète au besoin d’alerte précoce, en s’appuyant sur des technologies modernes et une architecture évolutive. »

---

## Slide 17 — Remerciements (30 s)

**À l’écran :**
- Encadrant, famille, jury, établissement

**À dire :**
> « Je remercie mon encadrant Dr KAHOUN, ma famille, et vous, membres du jury, pour votre attention. »

---

## Slide 18 — Questions (30 s)

**À l’écran :**
- **Merci pour votre attention**
- Questions ?

---

## Slides de secours (si le jury pose des questions techniques)

**S1 — Architecture détaillée** (couches frontend / API / BDD / workers)  
**S2 — Choix technologiques** (pourquoi PostGIS, pourquoi JWT, etc.)

---

## Conseils pour captiver le jury

1. **Accroche dès la slide 2** : une phrase sur l’enjeu national, pas seulement technique.
2. **Peu de texte** : 5–7 mots par puce maximum.
3. **Montrez la démo** avant la slide « limites ».
4. **Regardez le jury**, pas l’écran.
5. **Chronométrez** : 15 min présentation + 5 min démo + 10 min questions.

---

## Format LaTeX Beamer (optionnel)

Un fichier `docs/soutenance/slides-beamer.tex` peut être ajouté sur demande pour compiler les slides sur Overleaf avec le même compte que le mémoire.
