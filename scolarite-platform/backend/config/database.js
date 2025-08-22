/**
 * Configuration de la base de données MySQL
 * Utilise mysql2 avec support des promises
 */

const mysql = require('mysql2');
require('dotenv').config();

// Configuration de la connexion
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'scolarite_db',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    timezone: '+00:00',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    // Pool de connexions pour optimiser les performances
    connectionLimit: 10,
    queueLimit: 0,
    // Configuration SSL si nécessaire
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};

// Créer le pool de connexions
const pool = mysql.createPool(dbConfig);

// Promisify pour utiliser async/await
const promisePool = pool.promise();

/**
 * Tester la connexion à la base de données
 * @returns {Promise<boolean>} - True si la connexion réussit
 */
async function testConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Connexion à la base de données réussie');
        console.log(`📊 Base de données: ${dbConfig.database}`);
        console.log(`🏠 Serveur: ${dbConfig.host}:${dbConfig.port}`);
        
        // Tester une requête simple
        const [rows] = await connection.execute('SELECT 1 as test');
        connection.release();
        
        return rows[0].test === 1;
    } catch (error) {
        console.error('❌ Erreur de connexion à la base de données:', error.message);
        return false;
    }
}

/**
 * Exécuter une requête SQL
 * @param {string} query - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise<Array>} - Résultat de la requête
 */
async function execute(query, params = []) {
    try {
        const [rows] = await promisePool.execute(query, params);
        return [rows];
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution de la requête:', error.message);
        console.error('🔍 Requête:', query);
        console.error('📝 Paramètres:', params);
        throw error;
    }
}

/**
 * Exécuter une requête SQL avec gestion des transactions
 * @param {Function} callback - Fonction contenant les requêtes à exécuter
 * @returns {Promise<any>} - Résultat de la transaction
 */
async function transaction(callback) {
    const connection = await promisePool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Créer un objet de connexion avec execute
        const transactionConnection = {
            execute: async (query, params = []) => {
                const [rows] = await connection.execute(query, params);
                return [rows];
            }
        };
        
        const result = await callback(transactionConnection);
        
        await connection.commit();
        connection.release();
        
        return result;
    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
}

/**
 * Fermer le pool de connexions
 * @returns {Promise<void>}
 */
async function closePool() {
    try {
        await promisePool.end();
        console.log('🔐 Pool de connexions fermé');
    } catch (error) {
        console.error('❌ Erreur lors de la fermeture du pool:', error.message);
    }
}

/**
 * Obtenir des informations sur le pool
 * @returns {Object} - Informations sur le pool
 */
function getPoolInfo() {
    return {
        connectionLimit: pool.config.connectionLimit,
        acquireTimeout: pool.config.acquireTimeout,
        timeout: pool.config.timeout,
        // Statistiques du pool
        allConnections: pool._allConnections ? pool._allConnections.length : 0,
        freeConnections: pool._freeConnections ? pool._freeConnections.length : 0,
        acquiringConnections: pool._acquiringConnections ? pool._acquiringConnections.length : 0
    };
}

/**
 * Exécuter un fichier SQL (pour les migrations)
 * @param {string} sqlContent - Contenu du fichier SQL
 * @returns {Promise<void>}
 */
async function executeSqlFile(sqlContent) {
    try {
        // Diviser le contenu en requêtes individuelles
        const queries = sqlContent
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0 && !query.startsWith('--'));

        const connection = await promisePool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            for (const query of queries) {
                if (query.trim()) {
                    await connection.execute(query);
                }
            }
            
            await connection.commit();
            console.log(`✅ Fichier SQL exécuté avec succès (${queries.length} requêtes)`);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution du fichier SQL:', error.message);
        throw error;
    }
}

// Gestionnaire d'événements pour le pool
pool.on('connection', (connection) => {
    console.log(`🔗 Nouvelle connexion établie: ${connection.threadId}`);
});

pool.on('error', (error) => {
    console.error('❌ Erreur du pool de connexions:', error.message);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔄 Tentative de reconnexion...');
    }
});

// Gestionnaire de fermeture propre de l'application
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt de l\'application...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Arrêt de l\'application...');
    await closePool();
    process.exit(0);
});

module.exports = {
    // Pool de connexions principal
    pool: promisePool,
    
    // Méthodes utilitaires
    execute,
    transaction,
    testConnection,
    closePool,
    getPoolInfo,
    executeSqlFile,
    
    // Configuration
    config: dbConfig
};