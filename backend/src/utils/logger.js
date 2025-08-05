const winston = require('winston');
const path = require('path');

// Configuration des niveaux de log personnalisés
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'cyan'
  }
};

// Ajouter les couleurs personnalisées
winston.addColors(customLevels.colors);

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Ajouter la stack trace pour les erreurs
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    // Ajouter les métadonnées si présentes
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Format pour la console (plus lisible en développement)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    if (stack) {
      logMessage += `\n${stack}`;
    }
    return logMessage;
  })
);

// Configuration des transports
const transports = [];

// Transport console (toujours actif)
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'info'
  })
);

// Transport fichier (seulement si LOG_FILE est défini)
if (process.env.LOG_FILE) {
  const logDir = path.dirname(process.env.LOG_FILE);
  
  // Log général
  transports.push(
    new winston.transports.File({
      filename: process.env.LOG_FILE,
      format: logFormat,
      level: process.env.LOG_LEVEL || 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
  
  // Log des erreurs séparé
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      format: logFormat,
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
}

// Création du logger principal
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Fonction pour logger les requêtes HTTP
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || 'anonymous'
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

// Fonction pour logger les erreurs de base de données
logger.logDatabaseError = (operation, error, context = {}) => {
  logger.error('Database Error', {
    operation,
    error: error.message,
    stack: error.stack,
    context
  });
};

// Fonction pour logger les événements de sécurité
logger.logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Fonction pour logger les événements métier
logger.logBusinessEvent = (event, details = {}) => {
  logger.info('Business Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Fonction pour logger les performances
logger.logPerformance = (operation, duration, details = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger[level]('Performance', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

// Gestionnaire d'erreurs pour le logger lui-même
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

// En production, capturer les logs d'erreur non gérées
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(path.dirname(process.env.LOG_FILE || './logs'), 'exceptions.log'),
      format: logFormat
    })
  );
  
  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(path.dirname(process.env.LOG_FILE || './logs'), 'rejections.log'),
      format: logFormat
    })
  );
}

module.exports = logger;