const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes basiques pour les utilisateurs (placeholder)
router.get('/', authorize('super_admin', 'facility_admin'), (req, res) => {
  res.json({ message: 'Liste des utilisateurs - À implémenter' });
});

router.get('/:id', param('id').isUUID(), (req, res) => {
  res.json({ message: 'Détails utilisateur - À implémenter' });
});

router.put('/:id', param('id').isUUID(), (req, res) => {
  res.json({ message: 'Mise à jour utilisateur - À implémenter' });
});

module.exports = router;