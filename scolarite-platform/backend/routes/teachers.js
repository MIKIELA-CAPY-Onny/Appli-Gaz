const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route des enseignants fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Liste des enseignants - Contrôleur à implémenter',
    data: []
  });
});

router.get('/:id', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Détails de l\'enseignant - Contrôleur à implémenter',
    id: req.params.id
  });
});

router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Création d\'enseignant - Contrôleur à implémenter',
    data: req.body
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Mise à jour de l\'enseignant - Contrôleur à implémenter',
    id: req.params.id,
    data: req.body
  });
});

router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Suppression de l\'enseignant - Contrôleur à implémenter',
    id: req.params.id
  });
});

module.exports = router;