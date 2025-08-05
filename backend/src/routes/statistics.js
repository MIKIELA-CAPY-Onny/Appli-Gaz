const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.use(authorize('super_admin', 'facility_admin'));

router.get('/', (req, res) => {
  res.json({ message: 'Routes statistiques - À implémenter' });
});

module.exports = router;