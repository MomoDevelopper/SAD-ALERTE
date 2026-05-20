# Option D — Nettoyage et archive ZIP pour le jury

## Utilisation du script

Depuis PowerShell, à la racine `SAD-ALERTE` :

```powershell
.\scripts\archive-projet.ps1
```

Le script :
1. Supprime les dossiers lourds (`node_modules`, `.next`, `venv`, `.dart_tool`, `build`, etc.) **uniquement dans une copie temporaire**
2. Exclut les secrets (`.env`)
3. Génère `dist-archives/SAD-ALERTE-soutenance-AAAA-MM-JJ.zip`

> Votre projet source **n’est pas modifié** : seule une copie est archivée.

## Contenu recommandé pour le jury

- Code source complet (backend, frontend, mobile, ia, python_ai, scripts)
- `README.md` + `docs/soutenance/`
- `main.tex` + `media/` (mémoire)
- **Sans** : `node_modules`, `.next`, `venv`, uploads réels

## Après envoi

Conservez une copie du ZIP sur clé USB et dans le cloud (Google Drive, etc.).
