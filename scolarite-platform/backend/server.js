const app = require('./app');
const { connectDB } = require('./config/database');

// Charger les variables d'environnement
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Connexion à la base de données
connectDB();

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📚 Plateforme de scolarité accessible sur http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err);
  process.exit(1);
});