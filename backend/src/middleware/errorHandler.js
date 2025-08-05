const logger = require('../utils/logger');

// Middleware de gestion d'erreurs globales
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur
  logger.error('Erreur dans l\'API:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = 'Erreur de validation des données';
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return res.status(400).json({
      error: message,
      code: 'VALIDATION_ERROR',
      details: errors
    });
  }

  // Erreur de contrainte unique Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'unknown';
    const message = `Cette valeur existe déjà pour le champ: ${field}`;
    
    return res.status(409).json({
      error: message,
      code: 'DUPLICATE_ENTRY',
      field: field
    });
  }

  // Erreur de clé étrangère Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Référence invalide - l\'élément référencé n\'existe pas';
    
    return res.status(400).json({
      error: message,
      code: 'FOREIGN_KEY_ERROR',
      field: err.fields
    });
  }

  // Erreur de connexion à la base de données
  if (err.name === 'SequelizeConnectionError') {
    const message = 'Erreur de connexion à la base de données';
    
    return res.status(503).json({
      error: message,
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }

  // Erreur de timeout de base de données
  if (err.name === 'SequelizeTimeoutError') {
    const message = 'Timeout de base de données';
    
    return res.status(504).json({
      error: message,
      code: 'DATABASE_TIMEOUT'
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token d\'authentification invalide';
    
    return res.status(401).json({
      error: message,
      code: 'INVALID_TOKEN'
    });
  }

  // Token expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token d\'authentification expiré';
    
    return res.status(401).json({
      error: message,
      code: 'TOKEN_EXPIRED'
    });
  }

  // Erreur de cast MongoDB (si utilisé)
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    
    return res.status(404).json({
      error: message,
      code: 'RESOURCE_NOT_FOUND'
    });
  }

  // Erreur de validation express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Erreur de validation',
      code: 'VALIDATION_ERROR',
      details: err.errors
    });
  }

  // Erreur de fichier trop volumineux
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux';
    
    return res.status(413).json({
      error: message,
      code: 'FILE_TOO_LARGE',
      maxSize: process.env.MAX_FILE_SIZE || '10MB'
    });
  }

  // Erreur de type de fichier non autorisé
  if (err.code === 'INVALID_FILE_TYPE') {
    const message = 'Type de fichier non autorisé';
    
    return res.status(400).json({
      error: message,
      code: 'INVALID_FILE_TYPE',
      allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || []
    });
  }

  // Erreur de paiement
  if (err.type === 'StripeCardError' || err.type === 'payment_error') {
    return res.status(402).json({
      error: 'Erreur de paiement',
      code: 'PAYMENT_ERROR',
      details: err.message
    });
  }

  // Erreur de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Trop de requêtes',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter
    });
  }

  // Erreur personnalisée avec code de statut
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message || 'Erreur du serveur',
      code: err.code || 'SERVER_ERROR'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';
  
  // En production, ne pas révéler les détails de l'erreur
  const response = {
    error: process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : message,
    code: 'INTERNAL_SERVER_ERROR'
  };

  // Ajouter la stack trace en développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Middleware pour gérer les routes non trouvées
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

// Fonction utilitaire pour créer des erreurs personnalisées
const createError = (message, statusCode = 500, code = 'SERVER_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

// Wrapper pour les fonctions async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  createError,
  asyncHandler
};