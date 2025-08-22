/**
 * Routes des étudiants
 * Gère tous les endpoints pour les étudiants
 */

const express = require('express');
const router = express.Router();

// Contrôleurs
const StudentController = require('../controllers/studentController');

// Middleware
const { requireAdmin, requireAdminOrTeacher, requireAnyRole } = require('../middleware/auth');
const { 
    validateStudentCreation,
    validateId,
    validateLevel,
    validatePagination,
    validateAcademicYear
} = require('../middleware/validation');
const { 
    checkStudentSelfAccess,
    checkAcademicAccess,
    readOnlyAccess
} = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/v1/students
 * @desc    Obtenir tous les étudiants avec pagination et filtrage
 * @access  Private (Admin, Teacher)
 */
router.get('/', 
    requireAdminOrTeacher,
    validatePagination,
    validateAcademicYear,
    checkAcademicAccess(),
    asyncHandler(StudentController.getAll)
);

/**
 * @route   GET /api/v1/students/search
 * @desc    Rechercher des étudiants
 * @access  Private (Admin, Teacher)
 */
router.get('/search', 
    requireAdminOrTeacher,
    asyncHandler(StudentController.search)
);

/**
 * @route   GET /api/v1/students/level/:level
 * @desc    Obtenir les étudiants par niveau
 * @access  Private (Admin, Teacher)
 */
router.get('/level/:level', 
    requireAdminOrTeacher,
    validateLevel,
    validateAcademicYear,
    asyncHandler(StudentController.getByLevel)
);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Obtenir un étudiant par ID
 * @access  Private (Admin, Teacher, Student - ses propres données)
 */
router.get('/:id', 
    validateId,
    checkStudentSelfAccess('id'),
    asyncHandler(StudentController.getById)
);

/**
 * @route   POST /api/v1/students
 * @desc    Créer un nouvel étudiant
 * @access  Private (Admin only)
 */
router.post('/', 
    requireAdmin,
    validateStudentCreation,
    asyncHandler(StudentController.create)
);

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Mettre à jour un étudiant
 * @access  Private (Admin only)
 */
router.put('/:id', 
    requireAdmin,
    validateId,
    asyncHandler(StudentController.update)
);

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Supprimer un étudiant
 * @access  Private (Admin only)
 */
router.delete('/:id', 
    requireAdmin,
    validateId,
    asyncHandler(StudentController.delete)
);

/**
 * @route   GET /api/v1/students/:id/grades
 * @desc    Obtenir les notes d'un étudiant
 * @access  Private (Admin, Teacher, Student - ses propres notes)
 */
router.get('/:id/grades', 
    validateId,
    validateAcademicYear,
    checkStudentSelfAccess('id'),
    asyncHandler(StudentController.getGrades)
);

/**
 * @route   GET /api/v1/students/:id/absences
 * @desc    Obtenir les absences d'un étudiant
 * @access  Private (Admin, Teacher, Student - ses propres absences)
 */
router.get('/:id/absences', 
    validateId,
    checkStudentSelfAccess('id'),
    asyncHandler(StudentController.getAbsences)
);

/**
 * @route   GET /api/v1/students/:id/enrollments
 * @desc    Obtenir les inscriptions d'un étudiant
 * @access  Private (Admin, Teacher, Student - ses propres inscriptions)
 */
router.get('/:id/enrollments', 
    validateId,
    validateAcademicYear,
    checkStudentSelfAccess('id'),
    asyncHandler(StudentController.getEnrollments)
);

/**
 * @route   GET /api/v1/students/:id/report
 * @desc    Obtenir le bulletin d'un étudiant
 * @access  Private (Admin, Teacher, Student - son propre bulletin)
 */
router.get('/:id/report', 
    validateId,
    validateAcademicYear,
    checkStudentSelfAccess('id'),
    asyncHandler(StudentController.getReport)
);

/**
 * @route   GET /api/v1/students/:id/gpa
 * @desc    Calculer la moyenne générale d'un étudiant
 * @access  Private (Admin, Teacher, Student - sa propre moyenne)
 */
router.get('/:id/gpa', 
    validateId,
    validateAcademicYear,
    checkStudentSelfAccess('id'),
    asyncHandler(StudentController.calculateGPA)
);

/**
 * @route   POST /api/v1/students/:id/status
 * @desc    Changer le statut d'un étudiant
 * @access  Private (Admin only)
 */
router.post('/:id/status', 
    requireAdmin,
    validateId,
    asyncHandler(StudentController.toggleStatus)
);

module.exports = router;