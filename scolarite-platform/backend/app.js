const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import des routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const courseRoutes = require('./routes/courses');
const moduleRoutes = require('./routes/modules');
const enrollmentRoutes = require('./routes/enrollments');
const gradeRoutes = require('./routes/grades');
const absenceRoutes = require('./routes/absences');

// Import du middleware de gestion d'erreurs
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes par défaut
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite par IP
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});

// Middlewares de sécurité et de base
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Parser pour le body des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: '🎓 API Plateforme de Scolarité',
    version: '1.0.0',
    status: 'Actif',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      teachers: '/api/teachers',
      courses: '/api/courses',
      modules: '/api/modules',
      enrollments: '/api/enrollments',
      grades: '/api/grades',
      absences: '/api/absences'
    }
  });
});

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/absences', absenceRoutes);

// Route 404 pour les endpoints non trouvés
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    message: `L'endpoint ${req.originalUrl} n'existe pas`,
    availableEndpoints: [
      '/api/auth',
      '/api/students',
      '/api/teachers',
      '/api/courses',
      '/api/modules',
      '/api/enrollments',
      '/api/grades',
      '/api/absences'
    ]
  });
});

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

module.exports = app;