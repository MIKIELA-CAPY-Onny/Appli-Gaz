const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route des inscriptions fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

router.get('/', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Liste des inscriptions - Contrôleur à implémenter',
    data: []
  });
});

router.post('/', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Création d\'inscription - Contrôleur à implémenter',
    data: req.body
  });
});

module.exports = router;