const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route des cours fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

router.get('/', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Liste des cours - Contrôleur à implémenter',
    data: []
  });
});

router.get('/:id', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Détails du cours - Contrôleur à implémenter',
    id: req.params.id
  });
});

router.post('/', authenticateToken, requireRole(['admin', 'teacher']), (req, res) => {
  res.json({
    success: true,
    message: 'Création de cours - Contrôleur à implémenter',
    data: req.body
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Mise à jour du cours - Contrôleur à implémenter',
    id: req.params.id,
    data: req.body
  });
});

router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Suppression du cours - Contrôleur à implémenter',
    id: req.params.id
  });
});

module.exports = router;