/**
 * Serveur principal de l'application GestiScolarité
 * Point d'entrée de l'application
 */

require('dotenv').config();
const { app, initializeApp } = require('./app');

// Configuration du port
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

/**
 * Fonction principale pour démarrer le serveur
 */
async function startServer() {
    try {
        console.log('🎓 === GestiScolarité - Plateforme de Gestion Universitaire ===');
        console.log(`📅 Date de démarrage: ${new Date().toLocaleString('fr-FR')}`);
        console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📦 Version Node.js: ${process.version}`);
        
        // Initialiser l'application
        await initializeApp();
        
        // Démarrer le serveur
        const server = app.listen(PORT, HOST, () => {
            console.log('\n🚀 Serveur démarré avec succès!');
            console.log(`📍 URL locale: http://${HOST}:${PORT}`);
            console.log(`🔗 API: http://${HOST}:${PORT}/api/v1`);
            console.log(`📚 Documentation: http://${HOST}:${PORT}/api/v1/docs`);
            console.log(`💊 Health Check: http://${HOST}:${PORT}/api/v1/health`);
            console.log('\n📋 Comptes de test disponibles:');
            console.log('   👨‍💼 Admin: admin@university.com / password123');
            console.log('   👨‍🏫 Enseignant: teacher1@university.com / password123');
            console.log('   👨‍🎓 Étudiant: student1@university.com / password123');
            console.log('\n⏰ Serveur en écoute...\n');
        });

        // Configuration du serveur
        server.timeout = 30000; // 30 secondes
        server.keepAliveTimeout = 5000; // 5 secondes
        server.headersTimeout = 6000; // 6 secondes

        /**
         * Gestion propre de l'arrêt du serveur
         */
        const gracefulShutdown = (signal) => {
            console.log(`\n🛑 Signal ${signal} reçu, arrêt du serveur...`);
            
            server.close(async (err) => {
                if (err) {
                    console.error('❌ Erreur lors de l\'arrêt du serveur:', err);
                    process.exit(1);
                }

                console.log('🔐 Serveur HTTP fermé');
                
                // Fermer la connexion à la base de données
                try {
                    const db = require('./config/database');
                    await db.closePool();
                    console.log('🔐 Connexions de base de données fermées');
                } catch (error) {
                    console.error('❌ Erreur lors de la fermeture de la DB:', error);
                }

                console.log('✅ Arrêt complet du serveur');
                process.exit(0);
            });

            // Forcer l'arrêt après 10 secondes
            setTimeout(() => {
                console.error('⏰ Timeout atteint, arrêt forcé');
                process.exit(1);
            }, 10000);
        };

        // Écouter les signaux d'arrêt
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Gestion des erreurs non capturées
        process.on('uncaughtException', (error) => {
            console.error('💥 Exception non gérée:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Promesse rejetée non gérée à:', promise, 'raison:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

        return server;

    } catch (error) {
        console.error('💥 Erreur fatale lors du démarrage du serveur:', error);
        process.exit(1);
    }
}

/**
 * Afficher les informations de débogage en mode développement
 */
if (process.env.NODE_ENV === 'development') {
    console.log('\n🔧 === Mode Développement ===');
    console.log(`📊 Base de données: ${process.env.DB_NAME || 'scolarite_db'}`);
    console.log(`🏠 Host DB: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.log(`👤 Utilisateur DB: ${process.env.DB_USER || 'root'}`);
    console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '***configuré***' : '⚠️ non configuré'}`);
    console.log('===============================\n');
}

/**
 * Vérifier les variables d'environnement critiques
 */
function checkEnvironmentVariables() {
    const requiredVars = [
        'DB_HOST',
        'DB_USER', 
        'DB_NAME',
        'JWT_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Variables d\'environnement manquantes:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\n💡 Copiez .env.example vers .env et configurez les variables manquantes');
        process.exit(1);
    }

    // Avertissements pour les variables optionnelles importantes
    const optionalVars = [
        { name: 'DB_PASSWORD', warning: 'Mot de passe de base de données non défini' },
        { name: 'CORS_ORIGIN', warning: 'Origine CORS non définie' }
    ];

    optionalVars.forEach(({ name, warning }) => {
        if (!process.env[name]) {
            console.warn(`⚠️ ${warning}`);
        }
    });
}

/**
 * Afficher l'aide pour les commandes
 */
function showHelp() {
    console.log(`
📚 Serveur GestiScolarité

Usage: node server.js [options]

Options:
  --help, -h     Afficher cette aide
  --version, -v  Afficher la version
  --check-env    Vérifier les variables d'environnement

Variables d'environnement importantes:
  PORT           Port du serveur (défaut: 3000)
  DB_HOST        Host de la base de données
  DB_USER        Utilisateur de la base de données
  DB_PASSWORD    Mot de passe de la base de données
  DB_NAME        Nom de la base de données
  JWT_SECRET     Secret pour les tokens JWT

Exemples:
  node server.js              # Démarrer le serveur
  node server.js --check-env  # Vérifier la configuration
  npm start                   # Démarrer en production
  npm run dev                 # Démarrer en développement
    `);
}

/**
 * Gestion des arguments de ligne de commande
 */
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
    console.log('GestiScolarité v1.0.0');
    process.exit(0);
}

if (args.includes('--check-env')) {
    console.log('🔍 Vérification des variables d\'environnement...');
    checkEnvironmentVariables();
    console.log('✅ Configuration valide');
    process.exit(0);
}

// Vérifier les variables d'environnement au démarrage
checkEnvironmentVariables();

// Démarrer le serveur
if (require.main === module) {
    startServer().catch(error => {
        console.error('💥 Impossible de démarrer le serveur:', error);
        process.exit(1);
    });
}

module.exports = { startServer };