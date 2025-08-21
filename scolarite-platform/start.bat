@echo off
echo 🚀 Démarrage de la Plateforme de Scolarité
echo ==========================================

echo 📋 Vérification des prérequis...

REM Vérifier que Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier que MongoDB est accessible
echo 🔍 Vérification de la connexion MongoDB...
echo db.runCommand({ping: 1}) | mongo --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB n'est pas accessible.
    echo Veuillez démarrer MongoDB avant de continuer.
    echo.
    echo Sur Windows:
    echo 1. Ouvrir Services (services.msc)
    echo 2. Démarrer le service "MongoDB"
    echo.
    echo Ou utiliser MongoDB Compass
    echo.
    pause
)

echo ✅ Prérequis vérifiés
echo.
echo 🚀 Démarrage de l'application...
echo 📱 L'application sera accessible sur: http://localhost:3000
echo.
echo Appuyez sur Ctrl+C pour arrêter l'application
echo.

REM Démarrer l'application
call npm run dev

pause