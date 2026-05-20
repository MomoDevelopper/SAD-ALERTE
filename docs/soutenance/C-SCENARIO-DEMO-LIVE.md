# Option C — Scénario de démonstration live (millimétré)

**Durée cible :** 5 à 7 minutes  
**Objectif :** montrer la chaîne complète sans improvisation.

---

## Préparation (la veille)

### Services à lancer (4 terminaux)

```powershell
# Terminal 1 — Base
cd SAD-ALERTE
docker compose up -d db

# Terminal 2 — API
cd SAD-ALERTE\backend
npm run dev

# Terminal 3 — Web
cd SAD-ALERTE\frontend
npm run dev

# Terminal 4 — Worker IA PDF
cd SAD-ALERTE\python_ai
.\venv\Scripts\Activate.ps1
$env:DOCUMENTS_AI_API_KEY="votre_cle_identique_au_backend_env"
python analyzer.py
```

### Comptes de test

| Rôle | Usage |
|------|--------|
| Admin / analyste | Dashboard web `http://localhost:3000` — login admin |
| Agent | App mobile Flutter — login agent |

### Fichiers de test PDF

Placez dans `SAD-ALERTE\demo\rapports\` :

1. **`rapport_attaque_sahel.pdf`** — texte contenant les mots : *attaque*, *terroriste*, *embuscade* → gravité élevée (IA mock).
2. **`rapport_routine.pdf`** — texte neutre (compte-rendu administratif) → gravité faible.

> Créez ces PDF avec Word/LibreOffice : 1 page, quelques paragraphes, enregistrer en PDF. Le worker analyse le texte extrait.

### Mobile (émulateur ou téléphone)

```powershell
cd SAD-ALERTE\mobile_agent
flutter pub get
# Émulateur Android :
flutter run --dart-define=API_BASE=http://10.0.2.2:4000
```

---

## Script minute par minute

### 0:00 — Introduction (30 s)

**À dire :**
> « Je vais simuler trois actions : un agent signale une menace sur le terrain, l’analyste la voit sur le tableau de bord, puis nous importons un rapport PDF analysé automatiquement par l’IA. »

---

### 0:30 — Scène 1 : Signalement agent (2 min)

**Écran :** application mobile Flutter

**Actions :**
1. Connexion agent
2. Nouveau signalement
3. Type : **Attaque** ou **Embuscade**
4. Description : *« Groupe armé observé sur axe principal, convoi civil stoppé. »*
5. Localisation : GPS ou manuelle (ex. Sahel / Soum / Djibo)
6. Photo optionnelle
7. **Envoyer**

**À dire pendant l’action :**
> « L’agent terrain saisit l’incident avec géolocalisation et preuve visuelle. Les données partent vers l’API sécurisée. »

**Vérification :** message de succès sur mobile.

---

### 2:30 — Scène 2 : Tableau de bord analyste (2 min)

**Écran :** navigateur `http://localhost:3000` — compte admin

**Actions :**
1. Onglet **Carte des menaces** → montrer le nouveau point
2. Onglet **Alertes** → montrer l’alerte générée
3. Ouvrir le détail (type, région, description)

**À dire :**
> « En quelques secondes, l’incident apparaît côté analyste. La carte et le module d’alertes permettent de prioriser la réponse. »

---

### 4:30 — Scène 3 : Import PDF + IA (2 min)

**Écran :** **Import documents** sur le web

**Actions :**
1. Importer `rapport_attaque_sahel.pdf`
2. Catégorie : rapport d’incident
3. Région cible : Sahel
4. Attendre 5–10 s (worker Python en arrière-plan)
5. Rafraîchir **Alertes** ou **Analyses** — nouvel incident issu du PDF

**À dire :**
> « Le rapport PDF est traité sans saisie manuelle : l’IA extrait le type d’incident et la gravité, puis alimente la base pour enrichir la vue analyste. »

---

### 6:30 — Conclusion démo (30 s)

**À dire :**
> « Nous avons enchaîné terrain, centre de décision et analyse documentaire — les trois piliers de SAD-ALERTE. »

---

## Plan B si ça casse en direct

| Problème | Solution immédiate |
|----------|-------------------|
| API down | Montrer captures dans `media/` du mémoire |
| Mobile ne connecte pas | Utiliser saisie manuelle + expliquer config réseau émulateur |
| Worker PDF lent | Dire « traitement asynchrone » et montrer incident déjà créé en base |
| Pas de réseau | Vidéo ou screenshots pré-enregistrés (30 s) |

---

## Checklist jour J

- [ ] PC chargé, Docker démarré 10 min avant
- [ ] Onglets navigateur pré-ouverts (carte, alertes, import)
- [ ] Compte admin connecté (session active)
- [ ] Mobile déjà sur l’écran formulaire
- [ ] PDF de test dans un dossier accessible
- [ ] Désactiver notifications Windows
- [ ] Résolution écran 1920×1080, zoom navigateur 100 %
