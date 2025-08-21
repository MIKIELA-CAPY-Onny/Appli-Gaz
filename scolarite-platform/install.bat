@echo off
echo 🚀 Installation de la Plateforme de Scolarité
echo =============================================

REM Vérifier que Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérifier la version de Node.js
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 16 (
    echo ❌ Node.js version 16 ou supérieure est requise. Version actuelle: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js version détectée
node --version

REM Vérifier que npm est installé
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

echo ✅ npm version détectée
npm --version

REM Installer les dépendances du projet principal
echo 📦 Installation des dépendances du projet principal...
call npm install

REM Installer les dépendances du backend
echo 📦 Installation des dépendances du backend...
cd backend
call npm install
cd ..

echo ✅ Toutes les dépendances ont été installées avec succès!

REM Créer le fichier .env s'il n'existe pas
if not exist .env (
    echo 🔧 Création du fichier .env...
    copy .env.example .env
    echo ✅ Fichier .env créé. Veuillez le configurer selon vos besoins.
) else (
    echo ✅ Fichier .env déjà présent.
)

echo.
echo 🎉 Installation terminée avec succès!
echo.
echo 📋 Prochaines étapes:
echo 1. Configurer MongoDB et démarrer le service
echo 2. Modifier le fichier .env selon votre configuration
echo 3. Lancer l'application avec: npm run dev
echo.
echo 📚 Documentation: README.md
echo 🌐 Serveur: http://localhost:3000
echo.
pause