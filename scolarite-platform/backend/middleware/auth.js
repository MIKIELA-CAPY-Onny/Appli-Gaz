/**
 * Middleware d'authentification
 * Gère la vérification des tokens JWT et l'autorisation
 */

const { verifyToken, extractTokenFromHeader } = require('../config/auth');
const { User } = require('../models');

/**
 * Middleware d'authentification requis
 * Vérifie la présence et la validité du token JWT
 */
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'accès requis'
            });
        }

        // Vérifier le token
        const decoded = verifyToken(token);

        // Vérifier le type de token
        if (decoded.type !== 'access') {
            return res.status(401).json({
                success: false,
                message: 'Type de token invalide'
            });
        }

        // Vérifier que l'utilisateur existe toujours et est actif
        const user = await User.findById(decoded.id);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé ou désactivé'
            });
        }

        // Ajouter les informations utilisateur à la requête
        req.user = decoded;
        req.userFull = user;
        next();

    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        return res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré'
        });
    }
};

/**
 * Middleware d'authentification optionnel
 * Ajoute les informations utilisateur si un token valide est présent
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return next();
        }

        const decoded = verifyToken(token);

        if (decoded.type === 'access') {
            const user = await User.findById(decoded.id);
            if (user && user.is_active) {
                req.user = decoded;
                req.userFull = user;
            }
        }

        next();

    } catch (error) {
        // En cas d'erreur, on continue sans authentification
        next();
    }
};

/**
 * Middleware de vérification des rôles
 * Vérifie que l'utilisateur a l'un des rôles autorisés
 * @param {Array} allowedRoles - Rôles autorisés
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Permissions insuffisantes'
            });
        }

        next();
    };
};

/**
 * Middleware pour les administrateurs uniquement
 */
const requireAdmin = requireRole(['admin']);

/**
 * Middleware pour les enseignants uniquement
 */
const requireTeacher = requireRole(['teacher']);

/**
 * Middleware pour les étudiants uniquement
 */
const requireStudent = requireRole(['student']);

/**
 * Middleware pour les administrateurs et enseignants
 */
const requireAdminOrTeacher = requireRole(['admin', 'teacher']);

/**
 * Middleware pour tous les utilisateurs authentifiés
 */
const requireAnyRole = requireRole(['admin', 'teacher', 'student']);

/**
 * Middleware de vérification de propriété
 * Vérifie que l'utilisateur peut accéder à ses propres données
 */
const requireOwnership = (userIdParam = 'id', userIdField = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentification requise'
                });
            }

            // Les admins peuvent accéder à toutes les données
            if (req.user.role === 'admin') {
                return next();
            }

            const requestedUserId = req.params[userIdParam];
            const currentUserId = req.user[userIdField];

            if (parseInt(requestedUserId) !== parseInt(currentUserId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé à ces données'
                });
            }

            next();

        } catch (error) {
            console.error('Erreur de vérification de propriété:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    };
};

/**
 * Middleware de vérification de statut actif
 * Vérifie que l'utilisateur est actif
 */
const requireActiveUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentification requise'
        });
    }

    if (!req.user.is_active) {
        return res.status(403).json({
            success: false,
            message: 'Compte désactivé'
        });
    }

    next();
};

/**
 * Middleware de limitation par rôle avec exceptions
 * Permet à certains rôles d'accéder avec des restrictions
 */
const limitByRole = (config) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentification requise'
                });
            }

            const userRole = req.user.role;
            const roleConfig = config[userRole];

            if (!roleConfig) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            // Appliquer les restrictions spécifiques au rôle
            if (roleConfig.restrictToOwn) {
                // L'utilisateur ne peut accéder qu'à ses propres données
                const { Student, Teacher } = require('../models');
                
                let entityId = null;
                if (userRole === 'student') {
                    const student = await Student.findByUserId(req.user.id);
                    entityId = student?.id;
                } else if (userRole === 'teacher') {
                    const teacher = await Teacher.findByUserId(req.user.id);
                    entityId = teacher?.id;
                }

                if (entityId && req.params.id && parseInt(req.params.id) !== entityId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès limité à vos propres données'
                    });
                }
            }

            // Appliquer les filtres de requête
            if (roleConfig.queryFilters) {
                Object.assign(req.query, roleConfig.queryFilters);
            }

            next();

        } catch (error) {
            console.error('Erreur de limitation par rôle:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    };
};

module.exports = {
    requireAuth,
    optionalAuth,
    requireRole,
    requireAdmin,
    requireTeacher,
    requireStudent,
    requireAdminOrTeacher,
    requireAnyRole,
    requireOwnership,
    requireActiveUser,
    limitByRole
};