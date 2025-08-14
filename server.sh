#!/bin/bash

# 🎯 Se placer à la racine du projet (utile si lancé d'ailleurs)
cd "$(dirname "$0")"

# 🌱 Charger les variables d’environnement
if [ -f .env ]; then
  source .env
  echo "✅ Variables d'environnement chargées depuis .env"
else
  echo "⚠️ Fichier .env non trouvé – variables non chargées"
fi

# 🧪 Vérification : Node installé ?
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé. Installe-le avec nvm ou via ton gestionnaire de paquets."
  exit 1
fi

# 🚀 Lancer le serveur Express
echo "📡 Lancement du serveur..."
node src/api/server.js
