const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  res.json({ message: 'Routes prescriptions - À implémenter' });
});

module.exports = router;