const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./src/routes/auth');
const etudiantsRoutes = require('./src/routes/etudiants');
const modulesRoutes = require('./src/routes/modules');
const inscriptionsRoutes = require('./src/routes/inscriptions');
const notesRoutes = require('./src/routes/notes');
const absencesRoutes = require('./src/routes/absences');
const promotionsRoutes = require('./src/routes/promotions');
const utilisateursRoutes = require('./src/routes/utilisateurs');

// Middleware d'authentification
const authMiddleware = require('./src/middleware/auth');

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/etudiants', authMiddleware, etudiantsRoutes);
app.use('/api/modules', authMiddleware, modulesRoutes);
app.use('/api/inscriptions', authMiddleware, inscriptionsRoutes);
app.use('/api/notes', authMiddleware, notesRoutes);
app.use('/api/absences', authMiddleware, absencesRoutes);
app.use('/api/promotions', authMiddleware, promotionsRoutes);
app.use('/api/utilisateurs', authMiddleware, utilisateursRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur de gestion de scolarité opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    message: 'La route demandée n\'existe pas'
  });
});

// Middleware de gestion des erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  res.status(err.status || 500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📚 Plateforme de gestion de scolarité accessible sur http://localhost:${PORT}`);
  console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;