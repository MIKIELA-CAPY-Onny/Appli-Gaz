const { Sequelize } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME || 'scolarite_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL établie avec succès.');
    
    // Synchroniser les modèles avec la base de données
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Modèles synchronisés avec la base de données.');
    } else {
      await sequelize.sync();
      console.log('🔄 Modèles synchronisés avec la base de données.');
    }
    
    console.log(`📊 Base de données: ${process.env.DB_NAME} sur ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion à MySQL:', error.message);
    process.exit(1);
  }
};

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('🔄 Connexion MySQL fermée via SIGINT');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await sequelize.close();
  console.log('🔄 Connexion MySQL fermée via SIGTERM');
  process.exit(0);
});

module.exports = { sequelize, connectDB };