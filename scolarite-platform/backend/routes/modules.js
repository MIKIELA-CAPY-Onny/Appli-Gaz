/**
 * Routes des modules
 * Gère tous les endpoints pour les modules
 */

const express = require('express');
const router = express.Router();

// Contrôleurs
const ModuleController = require('../controllers/moduleController');

// Middleware
const { requireAdmin, requireAdminOrTeacher, requireTeacher } = require('../middleware/auth');
const { 
    validateModuleCreation,
    validateId,
    validatePagination,
    validateBusinessRules
} = require('../middleware/validation');
const { checkTeacherModuleAccess } = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/v1/modules
 * @desc    Obtenir tous les modules avec pagination et filtrage
 * @access  Private (Admin, Teacher)
 */
router.get('/', 
    requireAdminOrTeacher,
    validatePagination,
    asyncHandler(ModuleController.getAll)
);

/**
 * @route   GET /api/v1/modules/my
 * @desc    Obtenir les modules de l'enseignant connecté
 * @access  Private (Teacher only)
 */
router.get('/my', 
    requireTeacher,
    asyncHandler(ModuleController.getMyModules)
);

/**
 * @route   GET /api/v1/modules/:id
 * @desc    Obtenir un module par ID
 * @access  Private (Admin, Teacher)
 */
router.get('/:id', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(ModuleController.getById)
);

/**
 * @route   POST /api/v1/modules
 * @desc    Créer un nouveau module
 * @access  Private (Admin only)
 */
router.post('/', 
    requireAdmin,
    validateModuleCreation,
    validateBusinessRules.hoursDistributionValid,
    asyncHandler(ModuleController.create)
);

/**
 * @route   PUT /api/v1/modules/:id
 * @desc    Mettre à jour un module
 * @access  Private (Admin only)
 */
router.put('/:id', 
    requireAdmin,
    validateId,
    validateBusinessRules.hoursDistributionValid,
    asyncHandler(ModuleController.update)
);

/**
 * @route   DELETE /api/v1/modules/:id
 * @desc    Supprimer un module
 * @access  Private (Admin only)
 */
router.delete('/:id', 
    requireAdmin,
    validateId,
    asyncHandler(ModuleController.delete)
);

/**
 * @route   GET /api/v1/modules/:id/students
 * @desc    Obtenir les étudiants inscrits à un module
 * @access  Private (Admin, Teacher - ses modules)
 */
router.get('/:id/students', 
    requireAdminOrTeacher,
    validateId,
    checkTeacherModuleAccess('id'),
    asyncHandler(ModuleController.getEnrolledStudents)
);

/**
 * @route   GET /api/v1/modules/:id/grades
 * @desc    Obtenir les notes d'un module
 * @access  Private (Admin, Teacher - ses modules)
 */
router.get('/:id/grades', 
    requireAdminOrTeacher,
    validateId,
    checkTeacherModuleAccess('id'),
    asyncHandler(ModuleController.getGrades)
);

/**
 * @route   GET /api/v1/modules/:id/absences
 * @desc    Obtenir les absences d'un module
 * @access  Private (Admin, Teacher - ses modules)
 */
router.get('/:id/absences', 
    requireAdminOrTeacher,
    validateId,
    checkTeacherModuleAccess('id'),
    asyncHandler(ModuleController.getAbsences)
);

/**
 * @route   GET /api/v1/modules/:id/average
 * @desc    Calculer la moyenne d'un module
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/average', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(ModuleController.calculateAverage)
);

/**
 * @route   GET /api/v1/modules/:id/statistics
 * @desc    Obtenir les statistiques d'un module
 * @access  Private (Admin, Teacher)
 */
router.get('/:id/statistics', 
    requireAdminOrTeacher,
    validateId,
    asyncHandler(ModuleController.getStatistics)
);

/**
 * @route   POST /api/v1/modules/:id/status
 * @desc    Changer le statut d'un module (actif/inactif)
 * @access  Private (Admin only)
 */
router.post('/:id/status', 
    requireAdmin,
    validateId,
    asyncHandler(ModuleController.toggleStatus)
);

module.exports = router;