/**
 * Configuration de l'authentification JWT
 * Gère la génération et la validation des tokens
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuration JWT
const jwtConfig = {
    secret: process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_changez_moi',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'scolarite-platform',
    audience: 'scolarite-users'
};

// Configuration bcrypt
const bcryptConfig = {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
};

/**
 * Générer un token JWT
 * @param {Object} payload - Données à inclure dans le token
 * @param {Object} options - Options supplémentaires
 * @returns {string} - Token JWT
 */
function generateToken(payload, options = {}) {
    try {
        const tokenOptions = {
            expiresIn: options.expiresIn || jwtConfig.expiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
            ...options
        };

        return jwt.sign(payload, jwtConfig.secret, tokenOptions);
    } catch (error) {
        throw new Error(`Erreur lors de la génération du token: ${error.message}`);
    }
}

/**
 * Vérifier et décoder un token JWT
 * @param {string} token - Token à vérifier
 * @param {Object} options - Options de vérification
 * @returns {Object} - Payload décodé
 */
function verifyToken(token, options = {}) {
    try {
        const verifyOptions = {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
            ...options
        };

        return jwt.verify(token, jwtConfig.secret, verifyOptions);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expiré');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token invalide');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Token pas encore valide');
        }
        throw new Error(`Erreur lors de la vérification du token: ${error.message}`);
    }
}

/**
 * Décoder un token sans le vérifier (pour debug)
 * @param {string} token - Token à décoder
 * @returns {Object} - Payload décodé
 */
function decodeToken(token) {
    try {
        return jwt.decode(token, { complete: true });
    } catch (error) {
        throw new Error(`Erreur lors du décodage du token: ${error.message}`);
    }
}

/**
 * Générer un token d'accès pour un utilisateur
 * @param {Object} user - Objet utilisateur
 * @returns {string} - Token d'accès
 */
function generateAccessToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
        type: 'access'
    };

    return generateToken(payload, { expiresIn: '15m' });
}

/**
 * Générer un token de rafraîchissement
 * @param {Object} user - Objet utilisateur
 * @returns {string} - Token de rafraîchissement
 */
function generateRefreshToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        type: 'refresh'
    };

    return generateToken(payload, { expiresIn: '7d' });
}

/**
 * Générer une paire de tokens (accès + rafraîchissement)
 * @param {Object} user - Objet utilisateur
 * @returns {Object} - Paire de tokens
 */
function generateTokenPair(user) {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
        tokenType: 'Bearer',
        expiresIn: 900 // 15 minutes en secondes
    };
}

/**
 * Hacher un mot de passe
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>} - Mot de passe haché
 */
async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, bcryptConfig.rounds);
    } catch (error) {
        throw new Error(`Erreur lors du hachage du mot de passe: ${error.message}`);
    }
}

/**
 * Vérifier un mot de passe
 * @param {string} password - Mot de passe en clair
 * @param {string} hashedPassword - Mot de passe haché
 * @returns {Promise<boolean>} - Résultat de la vérification
 */
async function verifyPassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error(`Erreur lors de la vérification du mot de passe: ${error.message}`);
    }
}

/**
 * Extraire le token de l'en-tête Authorization
 * @param {string} authHeader - En-tête Authorization
 * @returns {string|null} - Token extrait ou null
 */
function extractTokenFromHeader(authHeader) {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Vérifier si un token est expiré
 * @param {string} token - Token à vérifier
 * @returns {boolean} - True si expiré
 */
function isTokenExpired(token) {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return true;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}

/**
 * Obtenir le temps restant avant expiration
 * @param {string} token - Token à vérifier
 * @returns {number} - Temps restant en secondes (0 si expiré)
 */
function getTokenRemainingTime(token) {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return 0;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTime = decoded.exp - currentTime;
        
        return Math.max(0, remainingTime);
    } catch (error) {
        return 0;
    }
}

/**
 * Générer un token de réinitialisation de mot de passe
 * @param {Object} user - Objet utilisateur
 * @returns {string} - Token de réinitialisation
 */
function generatePasswordResetToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        type: 'password_reset',
        timestamp: Date.now()
    };

    return generateToken(payload, { expiresIn: '1h' });
}

/**
 * Générer un token de vérification d'email
 * @param {Object} user - Objet utilisateur
 * @returns {string} - Token de vérification
 */
function generateEmailVerificationToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        type: 'email_verification',
        timestamp: Date.now()
    };

    return generateToken(payload, { expiresIn: '24h' });
}

/**
 * Créer un middleware d'authentification personnalisé
 * @param {Object} options - Options du middleware
 * @returns {Function} - Middleware d'authentification
 */
function createAuthMiddleware(options = {}) {
    const { 
        required = true, 
        roles = [], 
        skipExpiredCheck = false 
    } = options;

    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const token = extractTokenFromHeader(authHeader);

            if (!token) {
                if (required) {
                    return res.status(401).json({
                        success: false,
                        message: 'Token d\'accès requis'
                    });
                }
                return next();
            }

            if (!skipExpiredCheck && isTokenExpired(token)) {
                return res.status(401).json({
                    success: false,
                    message: 'Token expiré'
                });
            }

            const decoded = verifyToken(token);

            // Vérifier le type de token
            if (decoded.type !== 'access') {
                return res.status(401).json({
                    success: false,
                    message: 'Type de token invalide'
                });
            }

            // Vérifier les rôles si spécifiés
            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Permissions insuffisantes'
                });
            }

            // Ajouter les informations utilisateur à la requête
            req.user = decoded;
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }
    };
}

module.exports = {
    // Configuration
    jwtConfig,
    bcryptConfig,

    // Gestion des tokens
    generateToken,
    verifyToken,
    decodeToken,
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    generatePasswordResetToken,
    generateEmailVerificationToken,

    // Gestion des mots de passe
    hashPassword,
    verifyPassword,

    // Utilitaires
    extractTokenFromHeader,
    isTokenExpired,
    getTokenRemainingTime,
    createAuthMiddleware
};