/**
 * Routes des cours
 * Gère tous les endpoints pour les cours
 */

const express = require('express');
const router = express.Router();

// Contrôleurs
const CourseController = require('../controllers/courseController');

// Middleware
const { requireAdmin, requireAdminOrTeacher } = require('../middleware/auth');
const { 
    validateCourseCreation,
    validateId,
    validateLevel,
    validateSemester,
    validatePagination,
    validateAcademicYear,
    validateBusinessRules
} = require('../middleware/validation');
const { checkAcademicAccess } = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/v1/courses
 * @desc    Obtenir tous les cours avec pagination et filtrage
 * @access  Private (Admin, Teacher)
 */
router.get('/', 
    requireAdminOrTeacher,
    validatePagination,
    validateAcademicYear,
    checkAcademicAccess(),
    asyncHandler(CourseController.getAll)
);

/**
 * @route   GET /api/v1/courses/search
 * @desc    Rechercher des cours
 * @access  Private (Admin, Teacher)
 */
router.get('/search', 
    requireAdminOrTeacher,
    asyncHandler(CourseController.search)
);

/**
 * @route   GET /api/v1/courses/academic-years
 * @desc    Obtenir les années académiques disponibles
 * @access  Private (Admin, Teacher)
 */
router.get('/academic-years', 
    requireAdminOrTeacher,
    asyncHandler(CourseController.getAcademicYears)
);

/**
 * @route   GET /api/v1/courses/level/:level/semester/:semester
 * @desc    Obtenir les cours par niveau et semestre
 * @access  Private (Admin, Teacher)
 */
router.get('/level/:level/semester/:semester', 
    requireAdminOrTeacher,
    validateLevel,
    validateSemester,
    validateAcademicYear,
    asyncHandler(CourseController.getByLevelAndSemester)
);

/**
 * @route   GET /api/v1/courses/:id
 * @desc    Obtenir un cours par ID
 * @access  Private (Admin, Teacher)
 */
router.get('/:id', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(CourseController.getById)
);

/**
 * @route   POST /api/v1/courses
 * @desc    Créer un nouveau cours
 * @access  Private (Admin only)
 */
router.post('/', 
    requireAdmin,
    validateCourseCreation,
    validateBusinessRules.academicYearValid,
    asyncHandler(CourseController.create)
);

/**
 * @route   PUT /api/v1/courses/:id
 * @desc    Mettre à jour un cours
 * @access  Private (Admin only)
 */
router.put('/:id', 
    requireAdmin,
    validateId,
    validateBusinessRules.academicYearValid,
    asyncHandler(CourseController.update)
);

/**
 * @route   DELETE /api/v1/courses/:id
 * @desc    Supprimer un cours
 * @access  Private (Admin only)
 */
router.delete('/:id', 
    requireAdmin,
    validateId,
    asyncHandler(CourseController.delete)
);

/**
 * @route   GET /api/v1/courses/:id/modules
 * @desc    Obtenir les modules d'un cours
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/modules', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(CourseController.getModules)
);

/**
 * @route   GET /api/v1/courses/:id/students
 * @desc    Obtenir les étudiants inscrits à un cours
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/students', 
    requireAdminOrTeacher,
    validateId,
    validateAcademicYear,
    asyncHandler(CourseController.getEnrolledStudents)
);

/**
 * @route   GET /api/v1/courses/:id/statistics
 * @desc    Obtenir les statistiques d'un cours
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/statistics', 
    requireAdminOrTeacher,
    validateId,
    validateAcademicYear,
    asyncHandler(CourseController.getStatistics)
);

/**
 * @route   POST /api/v1/courses/:id/duplicate
 * @desc    Dupliquer un cours pour une nouvelle année académique
 * @access  Private (Admin only)
 */
router.post('/:id/duplicate', 
    requireAdmin,
    validateId,
    validateBusinessRules.academicYearValid,
    asyncHandler(CourseController.duplicate)
);

/**
 * @route   POST /api/v1/courses/:id/status
 * @desc    Changer le statut d'un cours (actif/inactif)
 * @access  Private (Admin only)
 */
router.post('/:id/status', 
    requireAdmin,
    validateId,
    asyncHandler(CourseController.toggleStatus)
);

module.exports = router;