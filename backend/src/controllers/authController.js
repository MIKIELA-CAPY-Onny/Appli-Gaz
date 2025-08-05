const { User, Patient } = require('../models');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Inscription d'un nouvel utilisateur
const register = asyncHandler(async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erreurs de validation',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role = 'patient',
    dateOfBirth,
    gender,
    address,
    emergencyContact
  } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ 
    where: { email },
    paranoid: false
  });

  if (existingUser) {
    return res.status(409).json({
      error: 'Un compte avec cet email existe déjà',
      code: 'EMAIL_ALREADY_EXISTS'
    });
  }

  // Créer l'utilisateur
  const user = await User.create({
    email,
    password,
    first_name: firstName,
    last_name: lastName,
    phone,
    role,
    verification_token: crypto.randomBytes(32).toString('hex'),
    verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  });

  // Si c'est un patient, créer aussi le profil patient
  if (role === 'patient') {
    await Patient.create({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      gender,
      phone,
      email,
      address: address || {},
      emergency_contact: emergencyContact
    });
  }

  // Générer les tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Logger l'événement
  logger.logBusinessEvent('User Registration', {
    userId: user.id,
    email: user.email,
    role: user.role,
    ip: req.ip
  });

  res.status(201).json({
    message: 'Compte créé avec succès',
    user: user.toPublicJSON(),
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    requiresVerification: true
  });
});

// Connexion
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erreurs de validation',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }

  const { email, password, twoFactorCode } = req.body;

  // Trouver l'utilisateur
  const user = await User.findOne({ where: { email } });

  if (!user) {
    logger.logSecurityEvent('Login attempt with non-existent email', {
      email,
      ip: req.ip
    });
    return res.status(401).json({
      error: 'Identifiants invalides',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Vérifier si le compte est verrouillé
  if (user.isAccountLocked()) {
    logger.logSecurityEvent('Login attempt on locked account', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });
    return res.status(423).json({
      error: 'Compte temporairement verrouillé',
      code: 'ACCOUNT_LOCKED',
      lockedUntil: user.locked_until
    });
  }

  // Vérifier le mot de passe
  const isPasswordValid = await user.validatePassword(password);

  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    
    logger.logSecurityEvent('Invalid password attempt', {
      userId: user.id,
      email: user.email,
      attempts: user.login_attempts,
      ip: req.ip
    });

    return res.status(401).json({
      error: 'Identifiants invalides',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Vérifier si le compte est actif
  if (!user.is_active) {
    return res.status(401).json({
      error: 'Compte désactivé',
      code: 'ACCOUNT_DISABLED'
    });
  }

  // Vérifier la 2FA si activée
  if (user.two_factor_enabled) {
    if (!twoFactorCode) {
      return res.status(200).json({
        message: 'Code 2FA requis',
        requiresTwoFactor: true,
        userId: user.id
      });
    }

    const isValidTwoFactor = user.verify2FAToken(twoFactorCode);
    if (!isValidTwoFactor) {
      await user.incrementLoginAttempts();
      
      logger.logSecurityEvent('Invalid 2FA code', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      return res.status(401).json({
        error: 'Code 2FA invalide',
        code: 'INVALID_2FA_CODE'
      });
    }
  }

  // Réinitialiser les tentatives de connexion
  await user.resetLoginAttempts();

  // Mettre à jour les informations de dernière connexion
  await user.update({
    last_login: new Date(),
    last_login_ip: req.ip
  });

  // Générer les tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Logger la connexion réussie
  logger.logBusinessEvent('User Login', {
    userId: user.id,
    email: user.email,
    role: user.role,
    ip: req.ip
  });

  res.json({
    message: 'Connexion réussie',
    user: user.toPublicJSON(),
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  });
});

// Déconnexion
const logout = asyncHandler(async (req, res) => {
  // TODO: Implémenter une blacklist de tokens pour une déconnexion complète
  
  logger.logBusinessEvent('User Logout', {
    userId: req.user.id,
    email: req.user.email,
    ip: req.ip
  });

  res.json({
    message: 'Déconnexion réussie'
  });
});

// Rafraîchir le token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'Refresh token requis',
      code: 'REFRESH_TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {
      issuer: 'WAFYA',
      audience: 'WAFYA-REFRESH'
    });

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Refresh token invalide',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    return res.status(401).json({
      error: 'Refresh token invalide',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

// Demande de réinitialisation de mot de passe
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    // Ne pas révéler si l'email existe ou non
    return res.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await user.update({
    password_reset_token: resetToken,
    password_reset_expires: resetTokenExpires
  });

  // TODO: Envoyer l'email de réinitialisation
  
  logger.logBusinessEvent('Password Reset Requested', {
    userId: user.id,
    email: user.email,
    ip: req.ip
  });

  res.json({
    message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
  });
});

// Réinitialisation de mot de passe
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: {
      password_reset_token: token,
      password_reset_expires: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    return res.status(400).json({
      error: 'Token de réinitialisation invalide ou expiré',
      code: 'INVALID_RESET_TOKEN'
    });
  }

  // Mettre à jour le mot de passe
  await user.update({
    password: newPassword,
    password_reset_token: null,
    password_reset_expires: null,
    login_attempts: 0,
    locked_until: null
  });

  logger.logBusinessEvent('Password Reset Completed', {
    userId: user.id,
    email: user.email,
    ip: req.ip
  });

  res.json({
    message: 'Mot de passe réinitialisé avec succès'
  });
});

// Vérification d'email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: {
      verification_token: token,
      verification_token_expires: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    return res.status(400).json({
      error: 'Token de vérification invalide ou expiré',
      code: 'INVALID_VERIFICATION_TOKEN'
    });
  }

  await user.update({
    is_verified: true,
    verification_token: null,
    verification_token_expires: null
  });

  logger.logBusinessEvent('Email Verified', {
    userId: user.id,
    email: user.email,
    ip: req.ip
  });

  res.json({
    message: 'Email vérifié avec succès'
  });
});

// Configuration de la 2FA
const setup2FA = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.two_factor_enabled) {
    return res.status(400).json({
      error: '2FA déjà activée',
      code: '2FA_ALREADY_ENABLED'
    });
  }

  const secret = user.generate2FASecret();

  res.json({
    message: 'Secret 2FA généré',
    secret: secret.base32,
    qrCode: secret.otpauth_url
  });
});

// Activation de la 2FA
const enable2FA = asyncHandler(async (req, res) => {
  const { token, secret } = req.body;
  const user = req.user;

  const isValid = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });

  if (!isValid) {
    return res.status(400).json({
      error: 'Code 2FA invalide',
      code: 'INVALID_2FA_CODE'
    });
  }

  // Générer des codes de récupération
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  await user.update({
    two_factor_enabled: true,
    two_factor_secret: secret,
    backup_codes: backupCodes
  });

  logger.logBusinessEvent('2FA Enabled', {
    userId: user.id,
    email: user.email,
    ip: req.ip
  });

  res.json({
    message: '2FA activée avec succès',
    backupCodes
  });
});

// Désactivation de la 2FA
const disable2FA = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Mot de passe incorrect',
      code: 'INVALID_PASSWORD'
    });
  }

  await user.update({
    two_factor_enabled: false,
    two_factor_secret: null,
    backup_codes: null
  });

  logger.logBusinessEvent('2FA Disabled', {
    userId: user.id,
    email: user.email,
    ip: req.ip
  });

  res.json({
    message: '2FA désactivée avec succès'
  });
});

// Obtenir le profil utilisateur actuel
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Inclure le profil patient si c'est un patient
  let profile = user.toPublicJSON();
  
  if (user.role === 'patient') {
    const patient = await Patient.findOne({ 
      where: { user_id: user.id }
    });
    if (patient) {
      profile.patientProfile = patient.toPublicJSON();
    }
  }

  res.json({
    user: profile
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  setup2FA,
  enable2FA,
  disable2FA,
  getProfile
};