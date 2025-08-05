const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Middleware d'authentification principal
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token d\'authentification requis',
        code: 'AUTH_TOKEN_MISSING'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'WAFYA',
        audience: 'WAFYA-USERS'
      });
      
      // Récupérer l'utilisateur depuis la base de données
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        logger.logSecurityEvent('Invalid token - user not found', {
          userId: decoded.id,
          ip: req.ip
        });
        return res.status(401).json({
          error: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        });
      }
      
      if (!user.is_active) {
        logger.logSecurityEvent('Inactive user login attempt', {
          userId: user.id,
          email: user.email,
          ip: req.ip
        });
        return res.status(401).json({
          error: 'Compte désactivé',
          code: 'ACCOUNT_DISABLED'
        });
      }
      
      if (user.isAccountLocked()) {
        logger.logSecurityEvent('Locked account login attempt', {
          userId: user.id,
          email: user.email,
          ip: req.ip
        });
        return res.status(423).json({
          error: 'Compte verrouillé temporairement',
          code: 'ACCOUNT_LOCKED',
          lockedUntil: user.locked_until
        });
      }
      
      // Ajouter l'utilisateur à la requête
      req.user = user;
      req.userId = user.id;
      
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expiré',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        logger.logSecurityEvent('Invalid JWT token', {
          error: jwtError.message,
          ip: req.ip
        });
        return res.status(401).json({
          error: 'Token invalide',
          code: 'INVALID_TOKEN'
        });
      }
      
      throw jwtError;
    }
    
  } catch (error) {
    logger.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware d'autorisation par rôle
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      logger.logSecurityEvent('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      
      return res.status(403).json({
        error: 'Accès non autorisé',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Middleware pour vérifier si l'utilisateur appartient à une structure
const requireFacility = async (req, res, next) => {
  try {
    if (!req.user.facility_id) {
      return res.status(403).json({
        error: 'Utilisateur non associé à une structure de santé',
        code: 'NO_FACILITY_ASSOCIATION'
      });
    }
    
    // Optionnel : vérifier que la structure est active
    const { Facility } = require('../models');
    const facility = await Facility.findByPk(req.user.facility_id);
    
    if (!facility || !facility.is_active) {
      return res.status(403).json({
        error: 'Structure de santé inactive ou non trouvée',
        code: 'FACILITY_INACTIVE'
      });
    }
    
    req.facility = facility;
    next();
    
  } catch (error) {
    logger.error('Erreur de vérification de structure:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware pour vérifier l'accès aux données patient
const authorizePatientAccess = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.body.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        error: 'ID patient requis',
        code: 'PATIENT_ID_REQUIRED'
      });
    }
    
    const { Patient } = require('../models');
    const patient = await Patient.findByPk(patientId, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!patient) {
      return res.status(404).json({
        error: 'Patient non trouvé',
        code: 'PATIENT_NOT_FOUND'
      });
    }
    
    // Vérifier les droits d'accès
    const canAccess = 
      req.user.role === 'super_admin' ||
      req.user.id === patient.user_id ||
      (req.user.role === 'doctor' && patient.primary_doctor_id === req.user.id) ||
      (req.user.facility_id && patient.primary_facility_id === req.user.facility_id) ||
      (req.user.role === 'facility_admin' && req.user.facility_id === patient.primary_facility_id);
    
    if (!canAccess) {
      logger.logSecurityEvent('Unauthorized patient data access', {
        userId: req.user.id,
        patientId: patient.id,
        userRole: req.user.role,
        ip: req.ip
      });
      
      return res.status(403).json({
        error: 'Accès non autorisé aux données de ce patient',
        code: 'PATIENT_ACCESS_DENIED'
      });
    }
    
    req.patient = patient;
    next();
    
  } catch (error) {
    logger.error('Erreur d\'autorisation patient:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware pour vérifier l'abonnement de la structure
const checkSubscription = async (req, res, next) => {
  try {
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    if (!req.user.facility_id) {
      return res.status(403).json({
        error: 'Aucune structure associée',
        code: 'NO_FACILITY'
      });
    }
    
    const { Facility } = require('../models');
    const facility = await Facility.findByPk(req.user.facility_id);
    
    if (!facility) {
      return res.status(404).json({
        error: 'Structure non trouvée',
        code: 'FACILITY_NOT_FOUND'
      });
    }
    
    if (facility.subscription_status !== 'active' && facility.subscription_status !== 'trial') {
      return res.status(402).json({
        error: 'Abonnement requis',
        code: 'SUBSCRIPTION_REQUIRED',
        subscriptionStatus: facility.subscription_status
      });
    }
    
    if (facility.subscription_expires_at && facility.subscription_expires_at < new Date()) {
      await facility.update({ subscription_status: 'expired' });
      
      return res.status(402).json({
        error: 'Abonnement expiré',
        code: 'SUBSCRIPTION_EXPIRED',
        expiresAt: facility.subscription_expires_at
      });
    }
    
    req.facility = facility;
    next();
    
  } catch (error) {
    logger.error('Erreur de vérification d\'abonnement:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware optionnel pour authentification (pour les routes publiques avec données conditionnelles)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (user && user.is_active && !user.isAccountLocked()) {
      req.user = user;
      req.userId = user.id;
    }
  } catch (error) {
    // Ignorer les erreurs d'authentification pour les routes optionnelles
    logger.debug('Authentification optionnelle échouée:', error.message);
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  requireFacility,
  authorizePatientAccess,
  checkSubscription,
  optionalAuth
};