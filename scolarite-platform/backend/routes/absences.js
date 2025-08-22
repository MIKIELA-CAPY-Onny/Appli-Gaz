/**
 * Routes des absences
 * Gère tous les endpoints pour les absences
 */

const express = require('express');
const router = express.Router();

// Contrôleurs
const AbsenceController = require('../controllers/absenceController');

// Middleware
const { requireAdmin, requireAdminOrTeacher, requireTeacher, requireAnyRole } = require('../middleware/auth');
const { 
    validateAbsenceCreation,
    validateId,
    validatePagination,
    validateAcademicYear,
    validateBusinessRules
} = require('../middleware/validation');
const { 
    checkStudentSelfAccess,
    checkTeacherModuleAccess
} = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/v1/absences
 * @desc    Obtenir toutes les absences avec pagination et filtrage
 * @access  Private (Admin, Teacher)
 */
router.get('/', 
    requireAdminOrTeacher,
    validatePagination,
    asyncHandler(AbsenceController.getAll)
);

/**
 * @route   GET /api/v1/absences/my
 * @desc    Obtenir les absences enregistrées par l'enseignant connecté
 * @access  Private (Teacher only)
 */
router.get('/my', 
    requireTeacher,
    validatePagination,
    asyncHandler(AbsenceController.getMyAbsences)
);

/**
 * @route   GET /api/v1/absences/unjustified
 * @desc    Obtenir les absences non justifiées
 * @access  Private (Admin, Teacher)
 */
router.get('/unjustified', 
    requireAdminOrTeacher,
    asyncHandler(AbsenceController.getUnjustified)
);

/**
 * @route   GET /api/v1/absences/statistics
 * @desc    Obtenir les statistiques générales d'absences
 * @access  Private (Admin, Teacher)
 */
router.get('/statistics', 
    requireAdminOrTeacher,
    validateAcademicYear,
    asyncHandler(AbsenceController.getStatistics)
);

/**
 * @route   GET /api/v1/absences/student/:student_id
 * @desc    Obtenir les absences d'un étudiant
 * @access  Private (Admin, Teacher, Student - ses propres absences)
 */
router.get('/student/:student_id', 
    requireAnyRole,
    validateId,
    checkStudentSelfAccess('student_id'),
    asyncHandler(AbsenceController.getByStudent)
);

/**
 * @route   GET /api/v1/absences/student/:student_id/statistics
 * @desc    Obtenir les statistiques d'absence d'un étudiant
 * @access  Private (Admin, Teacher, Student - ses propres statistiques)
 */
router.get('/student/:student_id/statistics', 
    requireAnyRole,
    validateId,
    validateAcademicYear,
    checkStudentSelfAccess('student_id'),
    asyncHandler(AbsenceController.getStudentStats)
);

/**
 * @route   GET /api/v1/absences/module/:module_id
 * @desc    Obtenir les absences d'un module
 * @access  Private (Admin, Teacher - ses modules)
 */
router.get('/module/:module_id', 
    requireAdminOrTeacher,
    validateId,
    checkTeacherModuleAccess('module_id'),
    asyncHandler(AbsenceController.getByModule)
);

/**
 * @route   GET /api/v1/absences/:id
 * @desc    Obtenir une absence par ID
 * @access  Private (Admin, Teacher)
 */
router.get('/:id', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(AbsenceController.getById)
);

/**
 * @route   POST /api/v1/absences
 * @desc    Enregistrer une nouvelle absence
 * @access  Private (Admin, Teacher)
 */
router.post('/', 
    requireAdminOrTeacher,
    validateAbsenceCreation,
    validateBusinessRules.absenceDateNotFuture,
    asyncHandler(AbsenceController.create)
);

/**
 * @route   POST /api/v1/absences/bulk
 * @desc    Enregistrer des absences en masse
 * @access  Private (Admin, Teacher)
 */
router.post('/bulk', 
    requireAdminOrTeacher,
    asyncHandler(AbsenceController.bulkCreate)
);

/**
 * @route   PUT /api/v1/absences/:id
 * @desc    Mettre à jour une absence
 * @access  Private (Admin, Teacher - ses propres enregistrements)
 */
router.put('/:id', 
    requireAdminOrTeacher,
    validateId,
    validateBusinessRules.absenceDateNotFuture,
    asyncHandler(AbsenceController.update)
);

/**
 * @route   DELETE /api/v1/absences/:id
 * @desc    Supprimer une absence
 * @access  Private (Admin, Teacher - ses propres enregistrements)
 */
router.delete('/:id', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(AbsenceController.delete)
);

/**
 * @route   POST /api/v1/absences/:id/justify
 * @desc    Justifier une absence
 * @access  Private (Admin, Teacher)
 */
router.post('/:id/justify', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(AbsenceController.justify)
);

/**
 * @route   POST /api/v1/absences/:id/unjustify
 * @desc    Annuler la justification d'une absence
 * @access  Private (Admin, Teacher)
 */
router.post('/:id/unjustify', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(AbsenceController.unjustify)
);

module.exports = router;