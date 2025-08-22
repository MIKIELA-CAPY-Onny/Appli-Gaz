// Middleware de gestion d'erreurs global
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur
  console.error('❌ Erreur:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = 'Données de validation invalides';
    error = {
      statusCode: 400,
      message,
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    };
  }

  // Erreur de contrainte unique Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Conflit de données';
    error = {
      statusCode: 409,
      message,
      details: err.errors.map(e => ({
        field: e.path,
        message: `La valeur '${e.value}' existe déjà pour le champ '${e.path}'`,
        value: e.value
      }))
    };
  }

  // Erreur de clé étrangère Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Référence invalide';
    error = {
      statusCode: 400,
      message,
      details: [{
        field: err.fields[0],
        message: `La référence n'existe pas dans la table '${err.table}'`
      }]
    };
  }

  // Erreur de base de données
  if (err.name === 'SequelizeDatabaseError') {
    const message = 'Erreur de base de données';
    error = {
      statusCode: 500,
      message,
      details: [{
        field: 'database',
        message: 'Une erreur est survenue lors de l\'accès à la base de données'
      }]
    };
  }

  // Erreur de connexion à la base de données
  if (err.name === 'SequelizeConnectionError') {
    const message = 'Erreur de connexion à la base de données';
    error = {
      statusCode: 503,
      message,
      details: [{
        field: 'connection',
        message: 'Impossible de se connecter à la base de données'
      }]
    };
  }

  // Erreur de timeout
  if (err.name === 'SequelizeTimeoutError') {
    const message = 'Délai d\'attente dépassé';
    error = {
      statusCode: 408,
      message,
      details: [{
        field: 'timeout',
        message: 'La requête a pris trop de temps à s\'exécuter'
      }]
    };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = {
      statusCode: 401,
      message,
      details: [{
        field: 'token',
        message: 'Le token d\'authentification est invalide'
      }]
    };
  }

  // Erreur d'expiration JWT
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = {
      statusCode: 401,
      message,
      details: [{
        field: 'token',
        message: 'Le token d\'authentification a expiré'
      }]
    };
  }

  // Erreur de validation des fichiers
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux';
    error = {
      statusCode: 400,
      message,
      details: [{
        field: 'file',
        message: 'Le fichier téléchargé dépasse la taille maximale autorisée'
      }]
    };
  }

  // Erreur de type de fichier
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Type de fichier non autorisé';
    error = {
      statusCode: 400,
      message,
      details: [{
        field: 'file',
        message: 'Le type de fichier n\'est pas autorisé'
      }]
    };
  }

  // Erreur de rate limiting
  if (err.status === 429) {
    const message = 'Trop de requêtes';
    error = {
      statusCode: 429,
      message,
      details: [{
        field: 'rate_limit',
        message: 'Vous avez dépassé la limite de requêtes autorisées'
      }]
    };
  }

  // Erreur par défaut
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = 'Erreur interne du serveur';
    error.details = [{
      field: 'server',
      message: 'Une erreur inattendue s\'est produite'
    }];
  }

  // Réponse d'erreur
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details || [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  });
};

// Middleware de gestion des routes non trouvées
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Middleware de gestion des erreurs asynchrones
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};