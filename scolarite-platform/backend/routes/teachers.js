/**
 * Routes des enseignants
 * Gère tous les endpoints pour les enseignants
 */

const express = require('express');
const router = express.Router();

// Contrôleurs
const TeacherController = require('../controllers/teacherController');

// Middleware
const { requireAdmin, requireAdminOrTeacher, requireTeacher } = require('../middleware/auth');
const { 
    validateTeacherCreation,
    validateId,
    validatePagination,
    validateAcademicYear
} = require('../middleware/validation');
const { 
    checkAcademicAccess,
    readOnlyAccess
} = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/v1/teachers
 * @desc    Obtenir tous les enseignants avec pagination et filtrage
 * @access  Private (Admin, Teacher)
 */
router.get('/', 
    requireAdminOrTeacher,
    validatePagination,
    asyncHandler(TeacherController.getAll)
);

/**
 * @route   GET /api/v1/teachers/search
 * @desc    Rechercher des enseignants
 * @access  Private (Admin, Teacher)
 */
router.get('/search', 
    requireAdminOrTeacher,
    asyncHandler(TeacherController.search)
);

/**
 * @route   GET /api/v1/teachers/department/:department
 * @desc    Obtenir les enseignants par département
 * @access  Private (Admin, Teacher)
 */
router.get('/department/:department', 
    requireAdminOrTeacher,
    asyncHandler(TeacherController.getByDepartment)
);

/**
 * @route   GET /api/v1/teachers/my/modules
 * @desc    Obtenir les modules de l'enseignant connecté
 * @access  Private (Teacher only)
 */
router.get('/my/modules', 
    requireTeacher,
    validateAcademicYear,
    asyncHandler(TeacherController.getSchedule)
);

/**
 * @route   GET /api/v1/teachers/:id
 * @desc    Obtenir un enseignant par ID
 * @access  Private (Admin, Teacher)
 */
router.get('/:id', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(TeacherController.getById)
);

/**
 * @route   POST /api/v1/teachers
 * @desc    Créer un nouvel enseignant
 * @access  Private (Admin only)
 */
router.post('/', 
    requireAdmin,
    validateTeacherCreation,
    asyncHandler(TeacherController.create)
);

/**
 * @route   PUT /api/v1/teachers/:id
 * @desc    Mettre à jour un enseignant
 * @access  Private (Admin only)
 */
router.put('/:id', 
    requireAdmin,
    validateId,
    asyncHandler(TeacherController.update)
);

/**
 * @route   DELETE /api/v1/teachers/:id
 * @desc    Supprimer un enseignant
 * @access  Private (Admin only)
 */
router.delete('/:id', 
    requireAdmin,
    validateId,
    asyncHandler(TeacherController.delete)
);

/**
 * @route   GET /api/v1/teachers/:id/modules
 * @desc    Obtenir les modules d'un enseignant
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/modules', 
    requireAdminOrTeacher,
    validateId,
    validateAcademicYear,
    asyncHandler(TeacherController.getModules)
);

/**
 * @route   GET /api/v1/teachers/:id/students
 * @desc    Obtenir les étudiants d'un enseignant
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/students', 
    requireAdminOrTeacher,
    validateId,
    validateAcademicYear,
    asyncHandler(TeacherController.getStudents)
);

/**
 * @route   GET /api/v1/teachers/:id/statistics
 * @desc    Obtenir les statistiques d'un enseignant
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/statistics', 
    requireAdminOrTeacher,
    validateId,
    validateAcademicYear,
    asyncHandler(TeacherController.getStatistics)
);

/**
 * @route   GET /api/v1/teachers/:id/schedule
 * @desc    Obtenir le planning d'un enseignant
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/schedule', 
    requireAdminOrTeacher,
    validateId,
    validateAcademicYear,
    asyncHandler(TeacherController.getSchedule)
);

/**
 * @route   POST /api/v1/teachers/:id/status
 * @desc    Changer le statut d'un enseignant
 * @access  Private (Admin only)
 */
router.post('/:id/status', 
    requireAdmin,
    validateId,
    asyncHandler(TeacherController.toggleStatus)
);

module.exports = router;