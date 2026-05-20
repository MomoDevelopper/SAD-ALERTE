# Option A — Générer le PDF du mémoire avec Overleaf (sans installer LaTeX)

Votre fichier principal est `main.tex` à la racine du projet. Il utilise le dossier `media/` pour les images et diagrammes UML.

## Étape 1 — Créer un compte Overleaf (gratuit)

1. Ouvrez [https://www.overleaf.com](https://www.overleaf.com)
2. Cliquez sur **Register** (inscription gratuite avec e-mail ou Google).

## Étape 2 — Importer le projet en 2 clics

### Méthode recommandée : ZIP du dossier mémoire

1. Sur votre PC, ouvrez le dossier `SAD-ALERTE`.
2. Sélectionnez **uniquement** ces éléments pour le ZIP du mémoire :
   - `main.tex`
   - le dossier `media/` (toutes les images : logos, UML, captures mobile/web)
3. Clic droit → **Envoyer vers** → **Dossier compressé** → nommez `memoire-sad-alerte.zip`.
4. Sur Overleaf : **New Project** → **Upload Project** → glissez `memoire-sad-alerte.zip`.

> Si le dossier `media/` est vide chez vous, copiez-y d’abord toutes les images référencées dans `main.tex` (voir liste ci-dessous).

### Méthode alternative : depuis GitHub (après push)

1. Poussez le dépôt sur GitHub (voir `docs/soutenance/GIT-GITHUB.md`).
2. Sur Overleaf : **New Project** → **Import from GitHub** → sélectionnez le dépôt.

## Étape 3 — Vérifier la structure sur Overleaf

Dans l’arborescence Overleaf, vous devez avoir :

```
main.tex
media/
  image1.jpeg
  image2.jpeg
  use_case.png
  class_diagram.png
  sequence.png
  db_schema.png
  mobile_login.png
  mobile_signalement.png
  web_dashboard_carte.png
  web_ia_prediction.png
  web_import_validation.png
  web_alertes_decision.png
```

## Étape 4 — Compiler le PDF

1. Ouvrez `main.tex` dans l’éditeur Overleaf.
2. En haut à gauche, le compilateur doit être **pdfLaTeX** (par défaut).
3. Cliquez sur le bouton vert **Recompile**.
4. Attendez la fin (barre de progression). Le PDF s’affiche à droite.
5. Cliquez sur **Download PDF** pour enregistrer le rapport final.

## Erreurs fréquentes et solutions

| Message d’erreur | Solution |
|------------------|----------|
| `File 'media/xxx.png' not found` | Ajoutez l’image manquante dans `media/` sur Overleaf (bouton Upload). |
| Caractères accentués bizarres | Vérifiez que `main.tex` utilise `\usepackage[utf8]{inputenc}` (déjà présent). |
| Tableau trop large | Overleaf indique la ligne : réduisez les colonnes ou passez en `\small`. |
| Timeout compilation | Projet lourd : compilez par parties ou supprimez les images trop lourdes (>5 Mo). |

## Étape 5 — Version finale pour le jury

1. Relisez le PDF généré (page de garde, dédicaces, remerciements, sommaire, figures).
2. Renommez le fichier : `Memoire_OUEDRAOGO_Moumouni_SAD-ALERTE_2025-2026.pdf`
3. Imprimez ou envoyez selon les consignes de votre école.

## Checklist avant soutenance

- [ ] Tous les diagrammes UML s’affichent correctement
- [ ] Numérotation des figures et tables cohérente
- [ ] Pas de « ? » à la place des références (`\ref`)
- [ ] Page de garde avec noms corrects (encadrant, année 2025-2026)
- [ ] PDF téléchargé et sauvegardé en double (clé USB + cloud)
