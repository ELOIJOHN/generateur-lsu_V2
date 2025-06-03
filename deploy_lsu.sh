#!/bin/bash

# 📁 Aller dans le dossier du projet
cd "$(dirname "$0")"

# 🧹 Nettoyer les fichiers inutiles
echo "🧹 Nettoyage des fichiers inutiles..."
rm -rf venv *.zip *.py *.json *.txt

# 📄 Ajouter .nojekyll
touch .nojekyll

# 🔁 Réinitialiser le dépôt Git
rm -rf .git
git init
git branch -M main
git remote add origin https://github.com/ELOIJOHN/generateur-lsu_V2.git

# ✅ Commit et push
git add .
git commit -m "💡 Déploiement complet de l'application LSU sur GitHub Pages"
git push -u origin main --force

# 🔗 Fin
echo "✅ Déploiement terminé !"
echo "🔗 Site en ligne : https://eloijohn.github.io/generateur-lsu_V2/"