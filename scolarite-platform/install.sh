#!/bin/bash

echo "🚀 Installation de la Plateforme de Scolarité"
echo "============================================="

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 ou supérieure est requise. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ npm $(npm -v) détecté"

# Installer les dépendances du projet principal
echo "📦 Installation des dépendances du projet principal..."
npm install

# Installer les dépendances du backend
echo "📦 Installation des dépendances du backend..."
cd backend
npm install
cd ..

echo "✅ Toutes les dépendances ont été installées avec succès!"

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "🔧 Création du fichier .env..."
    cp .env.example .env
    echo "✅ Fichier .env créé. Veuillez le configurer selon vos besoins."
else
    echo "✅ Fichier .env déjà présent."
fi

echo ""
echo "🎉 Installation terminée avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurer MongoDB et démarrer le service"
echo "2. Modifier le fichier .env selon votre configuration"
echo "3. Lancer l'application avec: npm run dev"
echo ""
echo "📚 Documentation: README.md"
echo "🌐 Serveur: http://localhost:3000"