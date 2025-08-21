const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route des notes fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

router.get('/', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Liste des notes - Contrôleur à implémenter',
    data: []
  });
});

router.post('/', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Création de note - Contrôleur à implémenter',
    data: req.body
  });
});

module.exports = router;