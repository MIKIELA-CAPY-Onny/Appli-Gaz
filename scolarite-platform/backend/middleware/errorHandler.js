/**
 * Middleware de gestion d'erreurs global
 * Doit être placé en dernier dans la chaîne de middlewares
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur
  console.error('🚨 Erreur:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = 'Données de validation invalides';
    const details = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));

    error = {
      statusCode: 400,
      message,
      details,
      error: 'VALIDATION_ERROR'
    };
  }

  // Erreur de cast Mongoose (ID invalide)
  if (err.name === 'CastError') {
    const message = 'Identifiant de ressource invalide';
    error = {
      statusCode: 400,
      message,
      error: 'INVALID_ID',
      details: {
        field: err.path,
        value: err.value,
        expectedType: err.kind
      }
    };
  }

  // Erreur de duplication (clé unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `La valeur '${value}' pour le champ '${field}' existe déjà`;
    
    error = {
      statusCode: 409,
      message,
      error: 'DUPLICATE_KEY',
      details: {
        field,
        value,
        duplicateKey: err.keyPattern
      }
    };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token JWT invalide';
    error = {
      statusCode: 401,
      message,
      error: 'INVALID_JWT'
    };
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token JWT expiré';
    error = {
      statusCode: 401,
      message,
      error: 'EXPIRED_JWT'
    };
  }

  // Erreur de limite de taille de fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux';
    error = {
      statusCode: 413,
      message,
      error: 'FILE_TOO_LARGE',
      details: {
        maxSize: err.limit,
        actualSize: err.size
      }
    };
  }

  // Erreur de type de fichier
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Type de fichier non autorisé';
    error = {
      statusCode: 400,
      message,
      error: 'INVALID_FILE_TYPE'
    };
  }

  // Erreur de connexion à la base de données
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    const message = 'Erreur de connexion à la base de données';
    error = {
      statusCode: 503,
      message,
      error: 'DATABASE_CONNECTION_ERROR'
    };
  }

  // Erreur de timeout de la base de données
  if (err.name === 'MongoTimeoutError') {
    const message = 'Timeout de la base de données';
    error = {
      statusCode: 504,
      message,
      error: 'DATABASE_TIMEOUT'
    };
  }

  // Erreur de validation Joi
  if (err.isJoi) {
    const message = 'Données de validation invalides';
    const details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type,
      value: detail.context?.value
    }));

    error = {
      statusCode: 400,
      message,
      details,
      error: 'JOI_VALIDATION_ERROR'
    };
  }

  // Erreur de rate limiting
  if (err.status === 429) {
    const message = 'Trop de requêtes - Veuillez réessayer plus tard';
    error = {
      statusCode: 429,
      message,
      error: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Erreur de pagination
  if (err.name === 'PaginationError') {
    const message = 'Paramètres de pagination invalides';
    error = {
      statusCode: 400,
      message,
      error: 'INVALID_PAGINATION',
      details: {
        page: err.page,
        limit: err.limit,
        maxLimit: err.maxLimit
      }
    };
  }

  // Erreur de recherche
  if (err.name === 'SearchError') {
    const message = 'Erreur lors de la recherche';
    error = {
      statusCode: 400,
      message,
      error: 'SEARCH_ERROR',
      details: {
        query: err.query,
        reason: err.reason
      }
    };
  }

  // Erreur de permission
  if (err.name === 'PermissionError') {
    const message = 'Permissions insuffisantes';
    error = {
      statusCode: 403,
      message,
      error: 'INSUFFICIENT_PERMISSIONS',
      details: {
        required: err.required,
        user: err.user
      }
    };
  }

  // Erreur de ressource non trouvée
  if (err.name === 'ResourceNotFoundError') {
    const message = 'Ressource non trouvée';
    error = {
      statusCode: 404,
      message,
      error: 'RESOURCE_NOT_FOUND',
      details: {
        resource: err.resource,
        id: err.id
      }
    };
  }

  // Erreur de conflit
  if (err.name === 'ConflictError') {
    const message = 'Conflit détecté';
    error = {
      statusCode: 409,
      message,
      error: 'CONFLICT',
      details: {
        reason: err.reason,
        conflictingResource: err.conflictingResource
      }
    };
  }

  // Erreur de business logic
  if (err.name === 'BusinessLogicError') {
    const message = err.message || 'Erreur de logique métier';
    error = {
      statusCode: 400,
      message,
      error: 'BUSINESS_LOGIC_ERROR',
      details: {
        code: err.code,
        context: err.context
      }
    };
  }

  // Réponse d'erreur
  const response = {
    success: false,
    message: error.message || 'Erreur interne du serveur',
    error: error.error || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error.details
    })
  };

  // Ajouter des détails spécifiques si disponibles
  if (error.details) {
    response.details = error.details;
  }

  // Ajouter l'ID de requête pour le debugging
  if (req.requestId) {
    response.requestId = req.requestId;
  }

  // Ajouter des informations de timestamp
  response.timestamp = new Date().toISOString();

  // Définir le code de statut
  const statusCode = error.statusCode || err.statusCode || 500;

  // Envoyer la réponse
  res.status(statusCode).json(response);
};

/**
 * Middleware pour capturer les erreurs asynchrones
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware pour gérer les erreurs 404
 */
const notFound = (req, res, next) => {
  const error = new Error(`Endpoint non trouvé - ${req.originalUrl}`);
  error.statusCode = 404;
  error.error = 'ENDPOINT_NOT_FOUND';
  next(error);
};

/**
 * Middleware pour gérer les erreurs de parsing JSON
 */
const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Format JSON invalide',
      error: 'INVALID_JSON',
      details: {
        message: err.message,
        position: err.position
      }
    });
  }
  next(err);
};

/**
 * Middleware pour gérer les erreurs de timeout
 */
const timeoutHandler = (timeout = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      const error = new Error('Timeout de la requête');
      error.statusCode = 408;
      error.error = 'REQUEST_TIMEOUT';
      next(error);
    }, timeout);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  jsonErrorHandler,
  timeoutHandler
};