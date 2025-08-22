/**
 * Routes des inscriptions
 * Gère tous les endpoints pour les inscriptions
 */

const express = require('express');
const router = express.Router();

// Contrôleurs
const EnrollmentController = require('../controllers/enrollmentController');

// Middleware
const { requireAdmin, requireAdminOrTeacher, requireStudent, requireAnyRole } = require('../middleware/auth');
const { 
    validateEnrollmentCreation,
    validateId,
    validatePagination,
    validateAcademicYear
} = require('../middleware/validation');
const { 
    checkStudentSelfAccess,
    checkAcademicAccess
} = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/v1/enrollments
 * @desc    Obtenir toutes les inscriptions avec pagination et filtrage
 * @access  Private (Admin, Teacher)
 */
router.get('/', 
    requireAdminOrTeacher,
    validatePagination,
    validateAcademicYear,
    asyncHandler(EnrollmentController.getAll)
);

/**
 * @route   GET /api/v1/enrollments/my
 * @desc    Obtenir les inscriptions de l'étudiant connecté
 * @access  Private (Student only)
 */
router.get('/my', 
    requireStudent,
    validateAcademicYear,
    asyncHandler(EnrollmentController.getMyEnrollments)
);

/**
 * @route   GET /api/v1/enrollments/statistics
 * @desc    Obtenir les statistiques d'inscription
 * @access  Private (Admin, Teacher)
 */
router.get('/statistics', 
    requireAdminOrTeacher,
    validateAcademicYear,
    asyncHandler(EnrollmentController.getStatistics)
);

/**
 * @route   GET /api/v1/enrollments/expiring
 * @desc    Obtenir les inscriptions expirées ou à renouveler
 * @access  Private (Admin only)
 */
router.get('/expiring', 
    requireAdmin,
    validateAcademicYear,
    asyncHandler(EnrollmentController.getExpiring)
);

/**
 * @route   GET /api/v1/enrollments/check-eligibility
 * @desc    Vérifier l'éligibilité d'un étudiant pour un cours
 * @access  Private (Admin, Teacher)
 */
router.get('/check-eligibility', 
    requireAdminOrTeacher,
    asyncHandler(EnrollmentController.checkEligibility)
);

/**
 * @route   GET /api/v1/enrollments/student/:student_id
 * @desc    Obtenir les inscriptions d'un étudiant
 * @access  Private (Admin, Teacher, Student - ses propres inscriptions)
 */
router.get('/student/:student_id', 
    requireAnyRole,
    validateId,
    validateAcademicYear,
    checkStudentSelfAccess('student_id'),
    asyncHandler(EnrollmentController.getByStudent)
);

/**
 * @route   GET /api/v1/enrollments/course/:course_id
 * @desc    Obtenir les inscriptions d'un cours
 * @access  Private (Admin, Teacher)
 */
router.get('/course/:course_id', 
    requireAdminOrTeacher,
    validateId,
    validateAcademicYear,
    asyncHandler(EnrollmentController.getByCourse)
);

/**
 * @route   GET /api/v1/enrollments/:id
 * @desc    Obtenir une inscription par ID
 * @access  Private (Admin, Teacher)
 */
router.get('/:id', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(EnrollmentController.getById)
);

/**
 * @route   POST /api/v1/enrollments
 * @desc    Créer une nouvelle inscription
 * @access  Private (Admin only)
 */
router.post('/', 
    requireAdmin,
    validateEnrollmentCreation,
    asyncHandler(EnrollmentController.create)
);

/**
 * @route   POST /api/v1/enrollments/bulk
 * @desc    Inscrire des étudiants en masse à un cours
 * @access  Private (Admin only)
 */
router.post('/bulk', 
    requireAdmin,
    asyncHandler(EnrollmentController.bulkEnroll)
);

/**
 * @route   PUT /api/v1/enrollments/:id
 * @desc    Mettre à jour une inscription
 * @access  Private (Admin only)
 */
router.put('/:id', 
    requireAdmin,
    validateId,
    asyncHandler(EnrollmentController.update)
);

/**
 * @route   DELETE /api/v1/enrollments/:id
 * @desc    Supprimer une inscription
 * @access  Private (Admin only)
 */
router.delete('/:id', 
    requireAdmin,
    validateId,
    asyncHandler(EnrollmentController.delete)
);

/**
 * @route   POST /api/v1/enrollments/:id/status
 * @desc    Changer le statut d'une inscription
 * @access  Private (Admin only)
 */
router.post('/:id/status', 
    requireAdmin,
    validateId,
    asyncHandler(EnrollmentController.updateStatus)
);

module.exports = router;