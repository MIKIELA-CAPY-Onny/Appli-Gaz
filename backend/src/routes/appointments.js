const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorize, authorizePatientAccess, checkSubscription } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

// Validation pour la création de rendez-vous
const createAppointmentValidation = [
  body('patientId')
    .isUUID()
    .withMessage('ID patient invalide'),
  body('doctorId')
    .isUUID()
    .withMessage('ID médecin invalide'),
  body('facilityId')
    .isUUID()
    .withMessage('ID structure invalide'),
  body('appointmentDate')
    .isISO8601()
    .toDate()
    .withMessage('Date de rendez-vous invalide'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('Durée invalide (15-240 minutes)'),
  body('type')
    .isIn([
      'consultation', 'follow_up', 'emergency', 'telemedicine',
      'vaccination', 'checkup', 'specialist', 'surgery', 'laboratory', 'radiology'
    ])
    .withMessage('Type de rendez-vous invalide'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motif requis (10-500 caractères)'),
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Les symptômes doivent être un tableau'),
  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('Urgence doit être un booléen'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priorité invalide')
];

// Validation pour la mise à jour de rendez-vous
const updateAppointmentValidation = [
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  body('appointmentDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de rendez-vous invalide'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('Durée invalide (15-240 minutes)'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Motif requis (10-500 caractères)'),
  body('symptoms')
    .optional()
    .isArray()
    .withMessage('Les symptômes doivent être un tableau'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes trop longues (max 1000 caractères)'),
  body('doctorNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes médecin trop longues (max 2000 caractères)')
];

// Validation pour les paramètres de requête
const appointmentQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Numéro de page invalide'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite invalide (1-100)'),
  query('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])
    .withMessage('Statut invalide'),
  query('type')
    .optional()
    .isIn([
      'consultation', 'follow_up', 'emergency', 'telemedicine',
      'vaccination', 'checkup', 'specialist', 'surgery', 'laboratory', 'radiology'
    ])
    .withMessage('Type invalide'),
  query('doctorId')
    .optional()
    .isUUID()
    .withMessage('ID médecin invalide'),
  query('patientId')
    .optional()
    .isUUID()
    .withMessage('ID patient invalide'),
  query('facilityId')
    .optional()
    .isUUID()
    .withMessage('ID structure invalide'),
  query('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de début invalide'),
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de fin invalide'),
  query('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('Urgence doit être un booléen')
];

// Middleware d'authentification pour toutes les routes
router.use(authenticate);

// Routes générales pour les rendez-vous
router.get('/', 
  checkSubscription,
  appointmentQueryValidation, 
  appointmentController.getAppointments
);

router.post('/', 
  checkSubscription,
  createAppointmentValidation, 
  appointmentController.createAppointment
);

router.get('/:id', 
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  appointmentController.getAppointment
);

router.put('/:id', 
  checkSubscription,
  updateAppointmentValidation, 
  appointmentController.updateAppointment
);

// Routes pour la gestion du statut des rendez-vous
router.patch('/:id/confirm',
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  authorize('doctor', 'nurse', 'facility_admin'),
  appointmentController.confirmAppointment
);

router.patch('/:id/start',
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  authorize('doctor', 'nurse'),
  appointmentController.startAppointment
);

router.patch('/:id/complete',
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  authorize('doctor'),
  body('doctorNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes médecin trop longues'),
  body('diagnosis')
    .optional()
    .isArray()
    .withMessage('Diagnostic doit être un tableau'),
  body('followUpRequired')
    .optional()
    .isBoolean()
    .withMessage('Suivi requis doit être un booléen'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de suivi invalide'),
  appointmentController.completeAppointment
);

router.patch('/:id/cancel',
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Raison d\'annulation trop longue'),
  appointmentController.cancelAppointment
);

router.patch('/:id/no-show',
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  authorize('doctor', 'nurse', 'facility_admin'),
  appointmentController.markNoShow
);

// Routes pour la reprogrammation
router.post('/:id/reschedule',
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  body('newDate')
    .isISO8601()
    .toDate()
    .withMessage('Nouvelle date invalide'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Raison de reprogrammation trop longue'),
  appointmentController.rescheduleAppointment
);

// Routes pour les créneaux disponibles
router.get('/slots/available',
  query('doctorId').isUUID().withMessage('ID médecin requis'),
  query('facilityId').isUUID().withMessage('ID structure requis'),
  query('date').isISO8601().toDate().withMessage('Date requise'),
  query('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('Durée invalide'),
  appointmentController.getAvailableSlots
);

// Routes pour les statistiques (médecins et admins)
router.get('/statistics/overview',
  authorize('doctor', 'facility_admin', 'super_admin'),
  query('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de début invalide'),
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de fin invalide'),
  appointmentController.getAppointmentStatistics
);

// Routes pour les patients spécifiques
router.get('/patient/:patientId',
  param('patientId').isUUID().withMessage('ID patient invalide'),
  authorizePatientAccess,
  appointmentQueryValidation,
  appointmentController.getPatientAppointments
);

// Routes pour les médecins spécifiques
router.get('/doctor/:doctorId',
  param('doctorId').isUUID().withMessage('ID médecin invalide'),
  appointmentQueryValidation,
  appointmentController.getDoctorAppointments
);

// Routes pour les rappels
router.post('/:id/send-reminder',
  param('id').isUUID().withMessage('ID rendez-vous invalide'),
  authorize('doctor', 'nurse', 'facility_admin'),
  body('channels')
    .optional()
    .isArray()
    .withMessage('Canaux doivent être un tableau'),
  body('channels.*')
    .optional()
    .isIn(['email', 'sms', 'push'])
    .withMessage('Canal invalide'),
  appointmentController.sendReminder
);

// Route pour obtenir l'agenda d'un médecin
router.get('/calendar/:doctorId',
  param('doctorId').isUUID().withMessage('ID médecin invalide'),
  query('startDate').isISO8601().toDate().withMessage('Date de début requise'),
  query('endDate').isISO8601().toDate().withMessage('Date de fin requise'),
  appointmentController.getDoctorCalendar
);

module.exports = router;