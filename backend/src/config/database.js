const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME || 'wafya_db',
  process.env.DB_USER || 'wafya_user',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? 
      (msg) => logger.debug(msg) : false,
    
    // Pool de connexions
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    
    // Configuration SSL pour la production
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    
    // Timezone
    timezone: '+01:00', // Gabon timezone
    
    // Hooks pour la journalisation
    hooks: {
      beforeConnect: () => {
        logger.info('Tentative de connexion à la base de données...');
      },
      afterConnect: () => {
        logger.info('Connexion à la base de données établie');
      },
      beforeDisconnect: () => {
        logger.info('Déconnexion de la base de données...');
      }
    },
    
    // Options de requête par défaut
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft delete
      freezeTableName: true,
      charset: 'utf8',
      collate: 'utf8_general_ci'
    }
  }
);

// Test de connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Connexion à PostgreSQL réussie');
    return true;
  } catch (error) {
    logger.error('❌ Erreur de connexion à PostgreSQL:', error.message);
    return false;
  }
};

// Fonction de synchronisation des modèles
const syncModels = async (options = {}) => {
  try {
    const defaultOptions = {
      force: false,
      alter: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development'
    };
    
    await sequelize.sync({ ...defaultOptions, ...options });
    logger.info('✅ Modèles synchronisés avec la base de données');
    return true;
  } catch (error) {
    logger.error('❌ Erreur lors de la synchronisation:', error.message);
    return false;
  }
};

// Fonction de fermeture propre de la connexion
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('✅ Connexion à la base de données fermée');
  } catch (error) {
    logger.error('❌ Erreur lors de la fermeture de la connexion:', error.message);
  }
};

// Configuration des types de données personnalisés
const DataTypes = Sequelize.DataTypes;

// Fonction utilitaire pour les requêtes brutes sécurisées
const executeRawQuery = async (query, replacements = {}, options = {}) => {
  try {
    const [results, metadata] = await sequelize.query(query, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
      ...options
    });
    return results;
  } catch (error) {
    logger.error('Erreur lors de l\'exécution de la requête brute:', error.message);
    throw error;
  }
};

// Export des fonctions et objets utiles
module.exports = {
  sequelize,
  DataTypes,
  testConnection,
  syncModels,
  closeConnection,
  executeRawQuery,
  
  // Opérateurs Sequelize couramment utilisés
  Op: Sequelize.Op,
  
  // Types de données couramment utilisés
  STRING: DataTypes.STRING,
  TEXT: DataTypes.TEXT,
  INTEGER: DataTypes.INTEGER,
  BIGINT: DataTypes.BIGINT,
  FLOAT: DataTypes.FLOAT,
  DECIMAL: DataTypes.DECIMAL,
  BOOLEAN: DataTypes.BOOLEAN,
  DATE: DataTypes.DATE,
  DATEONLY: DataTypes.DATEONLY,
  TIME: DataTypes.TIME,
  JSON: DataTypes.JSON,
  JSONB: DataTypes.JSONB,
  UUID: DataTypes.UUID,
  ENUM: DataTypes.ENUM,
  ARRAY: DataTypes.ARRAY,
  VIRTUAL: DataTypes.VIRTUAL
};