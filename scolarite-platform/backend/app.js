/**
 * Configuration principale de l'application Express
 * Configure tous les middlewares et routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import des routes
const apiRoutes = require('./routes');

// Import des middlewares
const { 
    errorHandler, 
    notFoundHandler, 
    databaseErrorHandler,
    jwtErrorHandler,
    validateContentType,
    timeoutHandler
} = require('./middleware/errorHandler');

// Import de la configuration
const { testConnection } = require('./config/database');
const { RATE_LIMIT, API_ENDPOINTS } = require('./utils/constants');

// Créer l'application Express
const app = express();

/**
 * Configuration de sécurité avec Helmet
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

/**
 * Configuration CORS
 */
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            process.env.CORS_ORIGIN
        ].filter(Boolean);

        // Permettre les requêtes sans origin (ex: applications mobiles)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

/**
 * Configuration de compression
 */
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    threshold: 1024 // Compresser seulement si > 1KB
}));

/**
 * Configuration du logging avec Morgan
 */
const morganFormat = process.env.NODE_ENV === 'production' 
    ? 'combined' 
    : 'dev';

app.use(morgan(morganFormat, {
    skip: (req, res) => {
        // Ignorer les requêtes de health check en production
        return process.env.NODE_ENV === 'production' && req.url === '/api/v1/health';
    }
}));

/**
 * Rate limiting global
 */
const globalLimiter = rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    message: {
        success: false,
        message: 'Trop de requêtes, veuillez réessayer plus tard',
        retryAfter: Math.ceil(RATE_LIMIT.WINDOW_MS / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Ignorer le rate limiting pour les admins en développement
        return process.env.NODE_ENV === 'development' && req.user?.role === 'admin';
    }
});

app.use(globalLimiter);

/**
 * Rate limiting spécifique pour l'authentification
 */
const authLimiter = rateLimit({
    windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
    max: RATE_LIMIT.AUTH_MAX_REQUESTS,
    message: {
        success: false,
        message: 'Trop de tentatives de connexion, veuillez réessayer plus tard',
        retryAfter: Math.ceil(RATE_LIMIT.AUTH_WINDOW_MS / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: RATE_LIMIT.SKIP_SUCCESSFUL_REQUESTS
});

// Appliquer le rate limiting d'auth aux routes de connexion
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/reset-password', authLimiter);

/**
 * Configuration du parsing des requêtes
 */
app.use(express.json({ 
    limit: '10mb',
    strict: true
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

/**
 * Middleware de validation du type de contenu
 */
app.use(validateContentType);

/**
 * Middleware de timeout global
 */
app.use(timeoutHandler(30000)); // 30 secondes

/**
 * Configuration des fichiers statiques
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Servir le frontend depuis le dossier parent
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/**
 * Middleware pour ajouter des en-têtes utiles
 */
app.use((req, res, next) => {
    res.set({
        'X-API-Version': '1.0.0',
        'X-Powered-By': 'GestiScolarité',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    });
    next();
});

/**
 * Route de base pour vérifier que le serveur fonctionne
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Serveur GestiScolarité opérationnel',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        api: {
            base: API_ENDPOINTS.BASE,
            documentation: API_ENDPOINTS.BASE + '/docs',
            health: API_ENDPOINTS.BASE + '/health'
        }
    });
});

/**
 * Route de favicon (éviter les erreurs 404)
 */
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

/**
 * Routes de l'API
 */
app.use(API_ENDPOINTS.BASE, apiRoutes);

/**
 * Middleware de gestion des erreurs de base de données
 */
app.use(databaseErrorHandler);

/**
 * Middleware de gestion des erreurs JWT
 */
app.use(jwtErrorHandler);

/**
 * Middleware pour les routes non trouvées (404)
 */
app.use(notFoundHandler);

/**
 * Middleware principal de gestion des erreurs
 */
app.use(errorHandler);

/**
 * Fonction d'initialisation de l'application
 */
async function initializeApp() {
    try {
        console.log('🚀 Initialisation de l\'application...');
        
        // Tester la connexion à la base de données
        const isDbConnected = await testConnection();
        if (!isDbConnected) {
            console.error('❌ Impossible de se connecter à la base de données');
            process.exit(1);
        }

        console.log('✅ Application initialisée avec succès');
        return true;

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        process.exit(1);
    }
}

/**
 * Gestion propre de l'arrêt de l'application
 */
process.on('SIGTERM', () => {
    console.log('🛑 Signal SIGTERM reçu, arrêt de l\'application...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Signal SIGINT reçu, arrêt de l\'application...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('💥 Exception non gérée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promesse rejetée non gérée:', reason);
    process.exit(1);
});

module.exports = { app, initializeApp };