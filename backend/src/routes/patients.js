const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorize, authorizePatientAccess } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes basiques pour les patients (placeholder)
router.get('/', authorize('doctor', 'nurse', 'facility_admin', 'super_admin'), (req, res) => {
  res.json({ message: 'Liste des patients - À implémenter' });
});

router.get('/:id', param('id').isUUID(), authorizePatientAccess, (req, res) => {
  res.json({ message: 'Détails patient - À implémenter' });
});

router.put('/:id', param('id').isUUID(), authorizePatientAccess, (req, res) => {
  res.json({ message: 'Mise à jour patient - À implémenter' });
});

module.exports = router;