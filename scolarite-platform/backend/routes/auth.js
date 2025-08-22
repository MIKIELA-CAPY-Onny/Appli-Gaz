/**
 * Routes d'authentification
 * Gère les endpoints de connexion, déconnexion et gestion des tokens
 */

const express = require('express');
const router = express.Router();

// Contrôleurs
const AuthController = require('../controllers/authController');

// Middleware
const { requireAuth } = require('../middleware/auth');
const { 
    validateLogin, 
    validatePasswordChange, 
    validatePasswordReset,
    validateUserUpdate
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', 
    validateLogin,
    asyncHandler(AuthController.login)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Rafraîchir le token d'accès
 * @access  Public
 */
router.post('/refresh', 
    asyncHandler(AuthController.refreshToken)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Déconnexion (côté client principalement)
 * @access  Private
 */
router.post('/logout', 
    requireAuth,
    asyncHandler(AuthController.logout)
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/profile', 
    requireAuth,
    asyncHandler(AuthController.getProfile)
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @access  Private
 */
router.put('/profile', 
    requireAuth,
    validateUserUpdate,
    asyncHandler(AuthController.updateProfile)
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Changer le mot de passe de l'utilisateur connecté
 * @access  Private
 */
router.post('/change-password', 
    requireAuth,
    validatePasswordChange,
    asyncHandler(AuthController.changePassword)
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Demander une réinitialisation de mot de passe
 * @access  Public
 */
router.post('/forgot-password', 
    asyncHandler(AuthController.forgotPassword)
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Réinitialiser le mot de passe avec un token
 * @access  Public
 */
router.post('/reset-password', 
    validatePasswordReset,
    asyncHandler(AuthController.resetPassword)
);

/**
 * @route   POST /api/v1/auth/verify-token
 * @desc    Vérifier la validité d'un token
 * @access  Public
 */
router.post('/verify-token', 
    asyncHandler(AuthController.verifyToken)
);

module.exports = router;