const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./src/config/database');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');

// Import des routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const patientRoutes = require('./src/routes/patients');
const doctorRoutes = require('./src/routes/doctors');
const facilityRoutes = require('./src/routes/facilities');
const appointmentRoutes = require('./src/routes/appointments');
const telemedicineRoutes = require('./src/routes/telemedicine');
const prescriptionRoutes = require('./src/routes/prescriptions');
const alertRoutes = require('./src/routes/alerts');
const statisticsRoutes = require('./src/routes/statistics');
const paymentRoutes = require('./src/routes/payments');

const app = express();
const server = createServer(app);

// Configuration Socket.IO pour la téléconsultation
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
}));

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware général
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Middleware de maintenance
app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true' && !req.path.includes('/health')) {
    return res.status(503).json({
      error: 'Service temporairement indisponible pour maintenance',
      retryAfter: '1800'
    });
  }
  next();
});

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/payments', paymentRoutes);

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Gestion des connexions Socket.IO pour la téléconsultation
io.on('connection', (socket) => {
  logger.info(`Nouvelle connexion Socket.IO: ${socket.id}`);

  // Rejoindre une salle de consultation
  socket.on('join-consultation', (consultationId) => {
    socket.join(`consultation-${consultationId}`);
    socket.to(`consultation-${consultationId}`).emit('user-joined', socket.id);
    logger.info(`Socket ${socket.id} a rejoint la consultation ${consultationId}`);
  });

  // Gestion des signaux WebRTC
  socket.on('webrtc-signal', (data) => {
    socket.to(data.to).emit('webrtc-signal', {
      signal: data.signal,
      from: socket.id
    });
  });

  // Messages de chat pendant la consultation
  socket.on('consultation-message', (data) => {
    io.to(`consultation-${data.consultationId}`).emit('consultation-message', {
      message: data.message,
      from: data.from,
      timestamp: new Date().toISOString()
    });
  });

  // Fin de consultation
  socket.on('end-consultation', (consultationId) => {
    socket.to(`consultation-${consultationId}`).emit('consultation-ended');
    socket.leave(`consultation-${consultationId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Déconnexion Socket.IO: ${socket.id}`);
  });
});

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await sequelize.authenticate();
    logger.info('Connexion à la base de données établie avec succès');

    // Synchronisation des modèles (en développement uniquement)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Modèles de base de données synchronisés');
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`🏥 Serveur WAFYA démarré sur le port ${PORT}`);
      logger.info(`🌍 Environnement: ${process.env.NODE_ENV}`);
      logger.info(`📊 Base de données: ${process.env.DB_NAME}`);
    });

  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse rejetée non gérée:', { reason, promise });
  process.exit(1);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', async () => {
  logger.info('Signal SIGTERM reçu, arrêt du serveur...');
  server.close(async () => {
    await sequelize.close();
    logger.info('Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('Signal SIGINT reçu, arrêt du serveur...');
  server.close(async () => {
    await sequelize.close();
    logger.info('Serveur arrêté proprement');
    process.exit(0);
  });
});

// Démarrage du serveur
startServer();

module.exports = { app, server, io };