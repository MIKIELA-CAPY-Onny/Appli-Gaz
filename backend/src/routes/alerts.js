const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const alertController = require('../controllers/alertController');

const router = express.Router();

// Validation pour la création d'alerte
const createAlertValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Le titre doit contenir entre 10 et 200 caractères'),
  body('message')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Le message doit contenir entre 20 et 5000 caractères'),
  body('type')
    .isIn([
      'epidemic', 'pandemic', 'outbreak', 'health_emergency', 'vaccination',
      'drug_recall', 'contamination', 'shortage', 'policy_update',
      'weather_health', 'environmental', 'general'
    ])
    .withMessage('Type d\'alerte invalide'),
  body('priority')
    .isIn(['low', 'normal', 'high', 'urgent', 'critical'])
    .withMessage('Priorité invalide'),
  body('targetAudience')
    .isArray({ min: 1 })
    .withMessage('Au moins un public cible requis'),
  body('targetAudience.*')
    .isIn([
      'all', 'patients', 'doctors', 'nurses', 'pharmacists',
      'facility_admins', 'health_workers', 'general_public'
    ])
    .withMessage('Public cible invalide'),
  body('regions')
    .optional()
    .isArray()
    .withMessage('Les régions doivent être un tableau'),
  body('provinces')
    .optional()
    .isArray()
    .withMessage('Les provinces doivent être un tableau'),
  body('cities')
    .optional()
    .isArray()
    .withMessage('Les villes doivent être un tableau'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date d\'expiration invalide'),
  body('actionRequired')
    .optional()
    .isBoolean()
    .withMessage('Action requise doit être un booléen'),
  body('actionDeadline')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date limite d\'action invalide'),
  body('severityLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Niveau de sévérité doit être entre 1 et 10'),
  body('estimatedImpact')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Impact estimé invalide')
];

// Validation pour la mise à jour d'alerte
const updateAlertValidation = [
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  ...createAlertValidation.map(validation => validation.optional())
];

// Validation pour les paramètres de requête
const alertQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Numéro de page invalide'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite invalide (1-100)'),
  query('type')
    .optional()
    .isIn([
      'epidemic', 'pandemic', 'outbreak', 'health_emergency', 'vaccination',
      'drug_recall', 'contamination', 'shortage', 'policy_update',
      'weather_health', 'environmental', 'general'
    ])
    .withMessage('Type d\'alerte invalide'),
  query('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent', 'critical'])
    .withMessage('Priorité invalide'),
  query('status')
    .optional()
    .isIn(['draft', 'pending', 'active', 'expired', 'cancelled', 'archived'])
    .withMessage('Statut invalide'),
  query('region')
    .optional()
    .trim()
    .withMessage('Région invalide')
];

// Routes publiques (alertes actives pour le grand public)
router.get('/public', alertQueryValidation, alertController.getPublicAlerts);
router.get('/public/:id', 
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  alertController.getPublicAlert
);

// Middleware d'authentification pour toutes les routes suivantes
router.use(authenticate);

// Routes pour tous les utilisateurs authentifiés
router.get('/', alertQueryValidation, alertController.getAlerts);
router.get('/:id', 
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  alertController.getAlert
);
router.post('/:id/mark-read',
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  alertController.markAlertAsRead
);

// Routes pour le super admin (Ministère de la Santé)
router.post('/', 
  authorize('super_admin'),
  createAlertValidation,
  alertController.createAlert
);

router.put('/:id',
  authorize('super_admin'),
  updateAlertValidation,
  alertController.updateAlert
);

router.patch('/:id/status',
  authorize('super_admin'),
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  body('status')
    .isIn(['draft', 'pending', 'active', 'expired', 'cancelled', 'archived'])
    .withMessage('Statut invalide'),
  alertController.updateAlertStatus
);

router.post('/:id/publish',
  authorize('super_admin'),
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  alertController.publishAlert
);

router.delete('/:id',
  authorize('super_admin'),
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  alertController.deleteAlert
);

// Routes pour les statistiques d'alertes
router.get('/:id/statistics',
  authorize('super_admin'),
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  alertController.getAlertStatistics
);

router.get('/statistics/overview',
  authorize('super_admin'),
  alertController.getAlertsOverview
);

// Route pour envoyer des notifications push pour une alerte
router.post('/:id/notify',
  authorize('super_admin'),
  param('id').isUUID().withMessage('ID d\'alerte invalide'),
  body('channels')
    .optional()
    .isArray()
    .withMessage('Les canaux doivent être un tableau'),
  body('channels.*')
    .optional()
    .isIn(['push', 'email', 'sms'])
    .withMessage('Canal de notification invalide'),
  alertController.sendAlertNotifications
);

module.exports = router;