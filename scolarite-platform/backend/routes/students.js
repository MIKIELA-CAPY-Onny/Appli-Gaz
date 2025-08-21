const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');

// Route de test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route des étudiants fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

// Obtenir tous les étudiants (protégé, admin/teacher seulement)
router.get('/', authenticateToken, requireRole(['admin', 'teacher']), (req, res) => {
  res.json({
    success: true,
    message: 'Liste des étudiants - Contrôleur à implémenter',
    data: []
  });
});

// Obtenir un étudiant par ID
router.get('/:id', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Détails de l\'étudiant - Contrôleur à implémenter',
    id: req.params.id
  });
});

// Créer un nouvel étudiant
router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Création d\'étudiant - Contrôleur à implémenter',
    data: req.body
  });
});

// Mettre à jour un étudiant
router.put('/:id', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Mise à jour de l\'étudiant - Contrôleur à implémenter',
    id: req.params.id,
    data: req.body
  });
});

// Supprimer un étudiant
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Suppression de l\'étudiant - Contrôleur à implémenter',
    id: req.params.id
  });
});

// Obtenir les cours d'un étudiant
router.get('/:id/courses', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Cours de l\'étudiant - Contrôleur à implémenter',
    studentId: req.params.id
  });
});

// Obtenir les notes d'un étudiant
router.get('/:id/grades', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Notes de l\'étudiant - Contrôleur à implémenter',
    studentId: req.params.id
  });
});

// Obtenir les présences d'un étudiant
router.get('/:id/attendance', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Présences de l\'étudiant - Contrôleur à implémenter',
    studentId: req.params.id
  });
});

module.exports = router;