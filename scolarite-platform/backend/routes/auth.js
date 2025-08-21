const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validate, authSchemas } = require('../middleware/validation');

// Route de test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route d\'authentification fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

// Route de connexion (à implémenter avec le contrôleur)
router.post('/login', validate(authSchemas.login), (req, res) => {
  res.json({
    success: true,
    message: 'Route de connexion - Contrôleur à implémenter',
    data: req.body
  });
});

// Route d'inscription (à implémenter avec le contrôleur)
router.post('/register', validate(authSchemas.register), (req, res) => {
  res.json({
    success: true,
    message: 'Route d\'inscription - Contrôleur à implémenter',
    data: req.body
  });
});

// Route de déconnexion
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// Route de vérification du token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token valide',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    }
  });
});

// Route de rafraîchissement du token (à implémenter)
router.post('/refresh', (req, res) => {
  res.json({
    success: true,
    message: 'Route de rafraîchissement - Contrôleur à implémenter'
  });
});

// Route de changement de mot de passe (à implémenter)
router.post('/change-password', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Route de changement de mot de passe - Contrôleur à implémenter'
  });
});

// Route de réinitialisation de mot de passe (à implémenter)
router.post('/forgot-password', (req, res) => {
  res.json({
    success: true,
    message: 'Route de réinitialisation - Contrôleur à implémenter'
  });
});

// Route de réinitialisation avec token (à implémenter)
router.post('/reset-password', (req, res) => {
  res.json({
    success: true,
    message: 'Route de réinitialisation avec token - Contrôleur à implémenter'
  });
});

module.exports = router;