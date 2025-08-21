const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route des modules fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

router.get('/', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Liste des modules - Contrôleur à implémenter',
    data: []
  });
});

router.get('/:id', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Détails du module - Contrôleur à implémenter',
    id: req.params.id
  });
});

router.post('/', authenticateToken, requireRole(['admin', 'teacher']), (req, res) => {
  res.json({
    success: true,
    message: 'Création de module - Contrôleur à implémenter',
    data: req.body
  });
});

module.exports = router;