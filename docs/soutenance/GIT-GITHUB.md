# Placer le projet sur Git (GitHub)

## 1. Dépôt déjà initialisé localement

Le dépôt Git est à la racine de `SAD-ALERTE`. Premier commit inclus : code source + guides soutenance.

## 2. Créer le dépôt sur GitHub

1. Allez sur [https://github.com/new](https://github.com/new)
2. Nom du dépôt : `SAD-ALERTE` (ou `sad-alerte-memoire`)
3. **Ne cochez pas** « Add README » (vous en avez déjà un)
4. Créez le dépôt vide

## 3. Lier et pousser (remplacez VOTRE_USER)

```powershell
cd "C:\Users\Ce pc\Desktop\Soutenance\SAD-ALERTE"

git remote add origin https://github.com/VOTRE_USER/SAD-ALERTE.git
git branch -M main
git push -u origin main
```

Authentification : token personnel GitHub (Settings → Developer settings → Personal access tokens).

## 4. Vérification

- Ouvrez la page du dépôt sur GitHub
- Vérifiez la présence de `main.tex`, `docs/soutenance/`, `backend/`, `frontend/`, etc.
- Vérifiez qu’**aucun** fichier `.env` avec mots de passe réel n’apparaît

## 5. Overleaf depuis GitHub (optionnel)

Overleaf → **New Project** → **Import from GitHub** → choisissez `SAD-ALERTE` → compilez `main.tex`.

## Commits suivants

```powershell
git add .
git status
git commit -m "Description de vos changements"
git push
```
