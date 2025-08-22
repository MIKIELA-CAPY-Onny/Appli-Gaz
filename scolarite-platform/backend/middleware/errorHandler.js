/**
 * Middleware de gestion des erreurs
 * Centralise la gestion des erreurs de l'application
 */

/**
 * Classe d'erreur personnalisée pour l'API
 */
class ApiError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Créer des erreurs spécifiques
 */
const createError = {
    badRequest: (message = 'Requête invalide') => new ApiError(message, 400),
    unauthorized: (message = 'Non autorisé') => new ApiError(message, 401),
    forbidden: (message = 'Accès interdit') => new ApiError(message, 403),
    notFound: (message = 'Ressource non trouvée') => new ApiError(message, 404),
    conflict: (message = 'Conflit de données') => new ApiError(message, 409),
    unprocessable: (message = 'Données non traitables') => new ApiError(message, 422),
    tooManyRequests: (message = 'Trop de requêtes') => new ApiError(message, 429),
    internal: (message = 'Erreur interne du serveur') => new ApiError(message, 500),
    notImplemented: (message = 'Fonctionnalité non implémentée') => new ApiError(message, 501),
    serviceUnavailable: (message = 'Service indisponible') => new ApiError(message, 503)
};

/**
 * Middleware de gestion des erreurs 404 (route non trouvée)
 */
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(`Route non trouvée: ${req.method} ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Middleware principal de gestion des erreurs
 */
const errorHandler = (error, req, res, next) => {
    let { statusCode = 500, message } = error;

    // Log de l'erreur
    const errorLog = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous',
        error: {
            message: error.message,
            stack: error.stack,
            statusCode
        }
    };

    // Logger selon la sévérité
    if (statusCode >= 500) {
        console.error('🚨 Erreur serveur:', JSON.stringify(errorLog, null, 2));
    } else if (statusCode >= 400) {
        console.warn('⚠️ Erreur client:', JSON.stringify(errorLog, null, 2));
    }

    // Gestion des erreurs spécifiques
    if (error.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'Cette donnée existe déjà';
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Référence invalide vers une ressource inexistante';
    } else if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        statusCode = 400;
        message = 'Impossible de supprimer: des données liées existent';
    } else if (error.code === 'ECONNREFUSED') {
        statusCode = 503;
        message = 'Service de base de données indisponible';
    } else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Erreur de validation des données';
    } else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Format de données invalide';
    }

    // Réponse d'erreur
    const errorResponse = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };

    // Ajouter des détails en mode développement
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
        errorResponse.details = {
            originalMessage: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState
        };
    }

    // Ajouter un ID d'erreur pour le suivi
    if (statusCode >= 500) {
        errorResponse.errorId = generateErrorId();
        console.error(`🆔 ID d'erreur: ${errorResponse.errorId}`);
    }

    res.status(statusCode).json(errorResponse);
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
 * Middleware de validation des types de contenu
 */
const validateContentType = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');
        
        if (!contentType || !contentType.includes('application/json')) {
            return next(createError.badRequest('Content-Type doit être application/json'));
        }
    }
    
    next();
};

/**
 * Middleware de limitation de taille du body
 */
const validateBodySize = (req, res, next) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
        return next(createError.badRequest('Taille de requête trop importante'));
    }
    
    next();
};

/**
 * Générer un ID unique pour l'erreur
 */
function generateErrorId() {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Middleware pour gérer les timeouts
 */
const timeoutHandler = (timeoutMs = 30000) => {
    return (req, res, next) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    message: 'Délai d\'attente dépassé',
                    timestamp: new Date().toISOString()
                });
            }
        }, timeoutMs);

        // Nettoyer le timeout quand la réponse est envoyée
        res.on('finish', () => {
            clearTimeout(timeout);
        });

        next();
    };
};

/**
 * Middleware pour gérer les erreurs de base de données
 */
const databaseErrorHandler = (error, req, res, next) => {
    // Erreurs spécifiques MySQL
    const mysqlErrors = {
        'ER_ACCESS_DENIED_ERROR': {
            status: 503,
            message: 'Erreur d\'accès à la base de données'
        },
        'ER_BAD_DB_ERROR': {
            status: 503,
            message: 'Base de données non trouvée'
        },
        'ER_NO_SUCH_TABLE': {
            status: 503,
            message: 'Table de base de données non trouvée'
        },
        'ER_DUP_ENTRY': {
            status: 409,
            message: 'Cette donnée existe déjà'
        },
        'ER_NO_REFERENCED_ROW_2': {
            status: 400,
            message: 'Référence vers une donnée inexistante'
        },
        'ER_ROW_IS_REFERENCED_2': {
            status: 400,
            message: 'Impossible de supprimer: des données liées existent'
        },
        'ER_DATA_TOO_LONG': {
            status: 400,
            message: 'Données trop longues pour le champ'
        },
        'ER_BAD_NULL_ERROR': {
            status: 400,
            message: 'Champ requis manquant'
        }
    };

    if (error.code && mysqlErrors[error.code]) {
        const { status, message } = mysqlErrors[error.code];
        return next(new ApiError(message, status));
    }

    // Passer à l'handler suivant si ce n'est pas une erreur MySQL
    next(error);
};

/**
 * Middleware pour gérer les erreurs JWT
 */
const jwtErrorHandler = (error, req, res, next) => {
    if (error.name === 'JsonWebTokenError') {
        return next(createError.unauthorized('Token JWT invalide'));
    }
    
    if (error.name === 'TokenExpiredError') {
        return next(createError.unauthorized('Token JWT expiré'));
    }
    
    if (error.name === 'NotBeforeError') {
        return next(createError.unauthorized('Token JWT pas encore valide'));
    }

    next(error);
};

/**
 * Middleware de nettoyage des ressources en cas d'erreur
 */
const cleanupHandler = (error, req, res, next) => {
    // Nettoyer les fichiers temporaires si nécessaire
    if (req.files) {
        // Logic pour supprimer les fichiers uploadés en cas d'erreur
    }

    // Nettoyer les connexions de base de données si nécessaire
    if (req.dbConnection) {
        // Logic pour fermer les connexions ouvertes
    }

    next(error);
};

module.exports = {
    // Classes et utilitaires
    ApiError,
    createError,
    
    // Middlewares principaux
    errorHandler,
    notFoundHandler,
    asyncHandler,
    
    // Middlewares de validation
    validateContentType,
    validateBodySize,
    timeoutHandler,
    
    // Middlewares spécialisés
    databaseErrorHandler,
    jwtErrorHandler,
    cleanupHandler,
    
    // Utilitaires
    generateErrorId
};