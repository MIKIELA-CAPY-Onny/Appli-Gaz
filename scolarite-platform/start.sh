#!/bin/bash

echo "🚀 Démarrage de la Plateforme de Scolarité"
echo "========================================="

echo "📋 Vérification des prérequis..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé."
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

# Vérifier que MongoDB est accessible
echo "🔍 Vérification de la connexion MongoDB..."

# Essayer de se connecter à MongoDB
if command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand({ping: 1})" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB est accessible"
    else
        echo "⚠️  MongoDB n'est pas accessible."
        echo "Veuillez démarrer MongoDB avant de continuer."
        echo ""
        echo "Sur Ubuntu/Debian:"
        echo "  sudo systemctl start mongod"
        echo ""
        echo "Sur macOS:"
        echo "  brew services start mongodb-community"
        echo ""
        echo "Ou utiliser MongoDB Compass"
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
    fi
else
    echo "⚠️  MongoDB CLI n'est pas installé."
    echo "Vérifiez que MongoDB est en cours d'exécution."
    read -p "Appuyez sur Entrée pour continuer..."
fi

echo "✅ Prérequis vérifiés"
echo ""
echo "🚀 Démarrage de l'application..."
echo "📱 L'application sera accessible sur: http://localhost:3000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter l'application"
echo ""

# Démarrer l'application
npm run dev