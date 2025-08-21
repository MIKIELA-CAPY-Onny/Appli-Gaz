const { verifyToken, extractTokenFromHeader } = require('../config/auth');
const User = require('../models/User');

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
        error: 'AUTH_TOKEN_MISSING'
      });
    }

    // Vérifier et décoder le token
    const decoded = verifyToken(token);
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Vérifier que l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte utilisateur désactivé',
        error: 'USER_INACTIVE'
      });
    }

    // Vérifier que le compte n'est pas verrouillé
    if (user.isLocked && user.isLocked()) {
      return res.status(401).json({
        success: false,
        message: 'Compte temporairement verrouillé',
        error: 'USER_LOCKED'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.token = token;

    // Mettre à jour la dernière activité
    user.lastLogin = new Date();
    await user.save();

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware de vérification des rôles
 * Vérifie que l'utilisateur a le rôle requis
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Convertir en tableau si c'est une seule chaîne
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Rôle insuffisant',
        error: 'INSUFFICIENT_ROLE',
        requiredRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware de vérification des permissions spécifiques
 * Vérifie que l'utilisateur a les permissions requises
 */
const requirePermission = (permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Convertir en tableau si c'est une seule chaîne
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

    // Pour les administrateurs, vérifier les permissions spécifiques
    if (req.user.role === 'admin') {
      try {
        const Admin = require('../models/Admin');
        const adminUser = await Admin.findOne({ user: req.user._id });
        
        if (!adminUser) {
          return res.status(403).json({
            success: false,
            message: 'Profil administrateur non trouvé',
            error: 'ADMIN_PROFILE_NOT_FOUND'
          });
        }

        // Vérifier chaque permission requise
        for (const permission of requiredPermissions) {
          if (!adminUser.hasPermission(permission)) {
            return res.status(403).json({
              success: false,
              message: `Permission insuffisante: ${permission}`,
              error: 'INSUFFICIENT_PERMISSION',
              requiredPermission: permission
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des permissions:', error);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la vérification des permissions',
          error: 'PERMISSION_CHECK_ERROR'
        });
      }
    }

    next();
  };
};

/**
 * Middleware de vérification de propriétaire
 * Vérifie que l'utilisateur est le propriétaire de la ressource ou a les droits d'administration
 */
const requireOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    try {
      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID de ressource manquant',
          error: 'RESOURCE_ID_MISSING'
        });
      }

      // Récupérer la ressource
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée',
          error: 'RESOURCE_NOT_FOUND'
        });
      }

      // Les administrateurs ont accès à tout
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Vérifier la propriété selon le type de ressource
      let isOwner = false;

      if (resourceModel.modelName === 'Student' && resource.user.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resourceModel.modelName === 'Teacher' && resource.user.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resourceModel.modelName === 'Course' && resource.createdBy.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resourceModel.modelName === 'Enrollment' && resource.student.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resourceModel.modelName === 'Grade' && resource.student.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resourceModel.modelName === 'Absence' && resource.student.toString() === req.user._id.toString()) {
        isOwner = true;
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Vous n\'êtes pas le propriétaire de cette ressource',
          error: 'NOT_OWNER'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Erreur lors de la vérification de propriété:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des droits d\'accès',
        error: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware de vérification de session active
 * Vérifie que la session utilisateur est toujours valide
 */
const checkSession = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Session utilisateur non trouvée',
      error: 'SESSION_NOT_FOUND'
    });
  }

  try {
    // Vérifier que l'utilisateur existe toujours et est actif
    const currentUser = await User.findById(req.user._id).select('isActive');
    
    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Session utilisateur invalide',
        error: 'INVALID_SESSION'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification de session:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de session',
      error: 'SESSION_CHECK_ERROR'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  checkSession
};