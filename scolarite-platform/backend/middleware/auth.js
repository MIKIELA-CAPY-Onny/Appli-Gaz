const { verifyToken, extractTokenFromHeader } = require('../config/auth');
const { User, Student, Teacher, Admin } = require('../models');

// Middleware d'authentification
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Accès refusé',
        message: 'Token d\'authentification manquant'
      });
    }

    // Vérifier le token
    const decoded = verifyToken(token);
    
    // Récupérer l'utilisateur avec ses rôles
    const user = await User.findByPk(decoded.userId, {
      include: [
        { model: Student, as: 'student' },
        { model: Teacher, as: 'teacher' },
        { model: Admin, as: 'admin' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé'
      });
    }

    // Ajouter l'utilisateur et ses informations au request
    req.user = user;
    req.userId = user.id;
    req.userRole = getUserRole(user);
    req.userPermissions = getUserPermissions(user);

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Token d\'authentification invalide ou expiré'
    });
  }
};

// Middleware d'authentification optionnelle (pour les routes publiques)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.userId, {
        include: [
          { model: Student, as: 'student' },
          { model: Teacher, as: 'teacher' },
          { model: Admin, as: 'admin' }
        ]
      });

      if (user && user.is_active) {
        req.user = user;
        req.userId = user.id;
        req.userRole = getUserRole(user);
        req.userPermissions = getUserPermissions(user);
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, continuer sans authentification
    next();
  }
};

// Déterminer le rôle de l'utilisateur
const getUserRole = (user) => {
  if (user.admin) return 'admin';
  if (user.teacher) return 'teacher';
  if (user.student) return 'student';
  return 'user';
};

// Obtenir les permissions de l'utilisateur
const getUserPermissions = (user) => {
  if (user.admin) {
    return {
      role: user.admin.role,
      permissions: user.admin.permissions,
      accessLevel: user.admin.access_level
    };
  }
  
  if (user.teacher) {
    return {
      role: 'teacher',
      permissions: ['courses:read', 'courses:update', 'grades:read', 'grades:create', 'grades:update'],
      accessLevel: 5
    };
  }
  
  if (user.student) {
    return {
      role: 'student',
      permissions: ['courses:read', 'grades:read', 'enrollments:read'],
      accessLevel: 3
    };
  }
  
  return {
    role: 'user',
    permissions: [],
    accessLevel: 1
  };
};

// Middleware de vérification de rôle
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource'
      });
    }

    next();
  };
};

// Middleware de vérification de permissions
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    if (req.userRole === 'admin' && req.user.admin && req.user.admin.isSuperAdmin()) {
      return next(); // Super admin a tous les droits
    }

    const userPermissions = req.userPermissions.permissions || {};
    const resourcePermissions = userPermissions[resource] || [];

    if (!resourcePermissions.includes(action)) {
      return res.status(403).json({
        error: 'Permission insuffisante',
        message: `Vous n'avez pas la permission '${action}' sur la ressource '${resource}'`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission
};