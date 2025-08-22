#!/usr/bin/env node

/**
 * Script de démarrage rapide pour GestiScolarité
 * Installe les dépendances, configure la base de données et lance l'application
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎓 === Script de démarrage GestiScolarité ===\n');

/**
 * Exécuter une commande et retourner une promesse
 */
function runCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 Exécution: ${command}`);
        
        const child = spawn(command, [], {
            shell: true,
            cwd,
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Commande échouée avec le code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Vérifier si un fichier existe
 */
function fileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Vérifier si Node.js et npm sont installés
 */
function checkPrerequisites() {
    return new Promise((resolve, reject) => {
        exec('node --version && npm --version', (error, stdout, stderr) => {
            if (error) {
                reject(new Error('Node.js et npm sont requis. Veuillez les installer d\'abord.'));
            } else {
                console.log('✅ Node.js et npm détectés');
                console.log(stdout.trim());
                resolve();
            }
        });
    });
}

/**
 * Créer le fichier .env s'il n'existe pas
 */
function createEnvFile() {
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');
    
    if (!fileExists(envPath) && fileExists(envExamplePath)) {
        console.log('📝 Création du fichier .env...');
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Fichier .env créé à partir de .env.example');
        console.log('⚠️ N\'oubliez pas de configurer vos paramètres de base de données dans .env');
    } else if (fileExists(envPath)) {
        console.log('✅ Fichier .env trouvé');
    } else {
        console.log('⚠️ Aucun fichier .env ou .env.example trouvé');
    }
}

/**
 * Fonction principale
 */
async function main() {
    try {
        // 1. Vérifier les prérequis
        console.log('1️⃣ Vérification des prérequis...');
        await checkPrerequisites();
        
        // 2. Créer le fichier .env
        console.log('\n2️⃣ Configuration de l\'environnement...');
        createEnvFile();
        
        // 3. Installer les dépendances du projet principal
        console.log('\n3️⃣ Installation des dépendances principales...');
        if (fileExists(path.join(__dirname, 'package.json'))) {
            await runCommand('npm install');
        }
        
        // 4. Installer les dépendances du backend
        console.log('\n4️⃣ Installation des dépendances backend...');
        const backendPath = path.join(__dirname, 'backend');
        if (fileExists(path.join(backendPath, 'package.json'))) {
            await runCommand('npm install', backendPath);
        }
        
        // 5. Demander si l'utilisateur veut configurer la base de données
        console.log('\n5️⃣ Configuration de la base de données...');
        console.log('⚠️ Assurez-vous que MySQL est installé et démarré');
        console.log('💡 Configurez vos paramètres de base de données dans le fichier .env');
        
        // Attendre une confirmation de l'utilisateur
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const answer = await new Promise((resolve) => {
            rl.question('\n❓ Voulez-vous configurer la base de données maintenant ? (y/N): ', (answer) => {
                rl.close();
                resolve(answer.toLowerCase());
            });
        });
        
        if (answer === 'y' || answer === 'yes') {
            console.log('🗄️ Configuration de la base de données...');
            await runCommand('npm run setup-db', backendPath);
        } else {
            console.log('⏭️ Configuration de la base de données ignorée');
            console.log('💡 Vous pouvez la configurer plus tard avec: cd backend && npm run setup-db');
        }
        
        // 6. Démarrer l'application
        console.log('\n6️⃣ Démarrage de l\'application...');
        console.log('🚀 Lancement du serveur...\n');
        
        await runCommand('npm run dev', backendPath);
        
    } catch (error) {
        console.error('\n❌ Erreur lors du démarrage:', error.message);
        console.log('\n🛠️ Dépannage:');
        console.log('1. Vérifiez que MySQL est installé et démarré');
        console.log('2. Configurez le fichier .env avec vos paramètres de base de données');
        console.log('3. Exécutez manuellement: cd backend && npm run setup-db');
        console.log('4. Démarrez le serveur: cd backend && npm run dev');
        process.exit(1);
    }
}

/**
 * Afficher l'aide
 */
function showHelp() {
    console.log(`
📚 Script de démarrage GestiScolarité

Usage: node start.js [options]

Options:
  --help, -h     Afficher cette aide
  --skip-db      Ignorer la configuration de la base de données
  --dev          Démarrer en mode développement (par défaut)
  --prod         Démarrer en mode production

Ce script va:
1. Vérifier que Node.js et npm sont installés
2. Créer le fichier .env à partir de .env.example
3. Installer toutes les dépendances
4. Configurer la base de données (optionnel)
5. Démarrer l'application

Prérequis:
- Node.js 14+ et npm
- MySQL 5.7+ ou 8.0+
- Accès en écriture dans le dossier du projet

Après le démarrage, l'application sera accessible sur:
http://localhost:3000
    `);
}

// Gestion des arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Démarrer le script
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });
}

module.exports = { main, runCommand, checkPrerequisites };