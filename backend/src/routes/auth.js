const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation pour l'inscription
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('phone')
    .matches(/^(\+241|241)?[0-9]{8}$/)
    .withMessage('Numéro de téléphone invalide (format Gabon)'),
  body('role')
    .optional()
    .isIn(['patient', 'doctor', 'nurse', 'pharmacist', 'staff'])
    .withMessage('Rôle invalide'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de naissance invalide'),
  body('gender')
    .optional()
    .isIn(['M', 'F', 'Other'])
    .withMessage('Genre invalide'),
  body('emergencyContact.name')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Nom du contact d\'urgence requis pour les patients'),
  body('emergencyContact.phone')
    .if(body('role').equals('patient'))
    .matches(/^(\+241|241)?[0-9]{8}$/)
    .withMessage('Téléphone du contact d\'urgence invalide'),
  body('emergencyContact.relationship')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Relation du contact d\'urgence requise')
];

// Validation pour la connexion
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  body('twoFactorCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Code 2FA invalide')
];

// Validation pour la réinitialisation de mot de passe
const passwordResetValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token requis'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial')
];

// Validation pour l'activation 2FA
const enable2FAValidation = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Code 2FA invalide'),
  body('secret')
    .notEmpty()
    .withMessage('Secret 2FA requis')
];

// Routes publiques
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', 
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  authController.forgotPassword
);
router.post('/reset-password', passwordResetValidation, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/refresh-token',
  body('refreshToken').notEmpty().withMessage('Refresh token requis'),
  authController.refreshToken
);

// Routes protégées (nécessitent une authentification)
router.use(authenticate); // Middleware d'authentification pour toutes les routes suivantes

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);

// Routes 2FA
router.get('/2fa/setup', authController.setup2FA);
router.post('/2fa/enable', enable2FAValidation, authController.enable2FA);
router.post('/2fa/disable',
  body('password').notEmpty().withMessage('Mot de passe requis'),
  authController.disable2FA
);

module.exports = router;