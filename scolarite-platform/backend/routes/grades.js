/**
 * Routes des notes
 * Gère tous les endpoints pour les notes
 */

const express = require('express');
const router = express.Router();

// Contrôleurs
const GradeController = require('../controllers/gradeController');

// Middleware
const { requireAdmin, requireAdminOrTeacher, requireTeacher, requireAnyRole } = require('../middleware/auth');
const { 
    validateGradeCreation,
    validateId,
    validatePagination,
    validateAcademicYear,
    validateBusinessRules
} = require('../middleware/validation');
const { 
    checkStudentSelfAccess,
    checkTeacherModuleAccess,
    readOnlyAccess
} = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/v1/grades
 * @desc    Obtenir toutes les notes avec pagination et filtrage
 * @access  Private (Admin, Teacher)
 */
router.get('/', 
    requireAdminOrTeacher,
    validatePagination,
    asyncHandler(GradeController.getAll)
);

/**
 * @route   GET /api/v1/grades/my
 * @desc    Obtenir les notes créées par l'enseignant connecté
 * @access  Private (Teacher only)
 */
router.get('/my', 
    requireTeacher,
    validatePagination,
    asyncHandler(GradeController.getMyGrades)
);

/**
 * @route   GET /api/v1/grades/statistics
 * @desc    Obtenir les statistiques des notes
 * @access  Private (Admin, Teacher)
 */
router.get('/statistics', 
    requireAdminOrTeacher,
    validateAcademicYear,
    asyncHandler(GradeController.getStatistics)
);

/**
 * @route   GET /api/v1/grades/student/:student_id
 * @desc    Obtenir les notes d'un étudiant
 * @access  Private (Admin, Teacher, Student - ses propres notes)
 */
router.get('/student/:student_id', 
    requireAnyRole,
    validateId,
    validateAcademicYear,
    checkStudentSelfAccess('student_id'),
    asyncHandler(GradeController.getByStudent)
);

/**
 * @route   GET /api/v1/grades/module/:module_id
 * @desc    Obtenir les notes d'un module
 * @access  Private (Admin, Teacher - ses modules)
 */
router.get('/module/:module_id', 
    requireAdminOrTeacher,
    validateId,
    checkTeacherModuleAccess('module_id'),
    asyncHandler(GradeController.getByModule)
);

/**
 * @route   GET /api/v1/grades/student/:student_id/module/:module_id/average
 * @desc    Calculer la moyenne d'un étudiant pour un module
 * @access  Private (Admin, Teacher, Student - sa propre moyenne)
 */
router.get('/student/:student_id/module/:module_id/average', 
    requireAnyRole,
    validateId,
    checkStudentSelfAccess('student_id'),
    asyncHandler(GradeController.calculateModuleAverage)
);

/**
 * @route   GET /api/v1/grades/student/:student_id/report
 * @desc    Obtenir le bulletin complet d'un étudiant
 * @access  Private (Admin, Teacher, Student - son propre bulletin)
 */
router.get('/student/:student_id/report', 
    requireAnyRole,
    validateId,
    validateAcademicYear,
    checkStudentSelfAccess('student_id'),
    asyncHandler(GradeController.getStudentReport)
);

/**
 * @route   GET /api/v1/grades/:id
 * @desc    Obtenir une note par ID
 * @access  Private (Admin, Teacher)
 */
router.get('/:id', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(GradeController.getById)
);

/**
 * @route   POST /api/v1/grades
 * @desc    Créer une nouvelle note
 * @access  Private (Admin, Teacher)
 */
router.post('/', 
    requireAdminOrTeacher,
    validateGradeCreation,
    validateBusinessRules.gradeInRange,
    asyncHandler(GradeController.create)
);

/**
 * @route   POST /api/v1/grades/bulk
 * @desc    Saisir des notes en masse
 * @access  Private (Admin, Teacher)
 */
router.post('/bulk', 
    requireAdminOrTeacher,
    asyncHandler(GradeController.bulkCreate)
);

/**
 * @route   PUT /api/v1/grades/:id
 * @desc    Mettre à jour une note
 * @access  Private (Admin, Teacher - ses propres notes)
 */
router.put('/:id', 
    requireAdminOrTeacher,
    validateId,
    validateBusinessRules.gradeInRange,
    asyncHandler(GradeController.update)
);

/**
 * @route   DELETE /api/v1/grades/:id
 * @desc    Supprimer une note
 * @access  Private (Admin, Teacher - ses propres notes)
 */
router.delete('/:id', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(GradeController.delete)
);

module.exports = router;