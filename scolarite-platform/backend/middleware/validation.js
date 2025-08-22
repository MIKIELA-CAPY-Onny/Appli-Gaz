/**
 * Middleware de validation
 * Utilise express-validator pour valider les données d'entrée
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware pour gérer les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Erreurs de validation',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    
    next();
};

/**
 * Validations pour l'authentification
 */
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Email valide requis')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mot de passe requis (min 6 caractères)'),
    handleValidationErrors
];

const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mot de passe actuel requis'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Nouveau mot de passe requis (min 6 caractères)'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Les mots de passe ne correspondent pas');
            }
            return true;
        }),
    handleValidationErrors
];

const validatePasswordReset = [
    body('token')
        .notEmpty()
        .withMessage('Token de réinitialisation requis'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Nouveau mot de passe requis (min 6 caractères)'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Les mots de passe ne correspondent pas');
            }
            return true;
        }),
    handleValidationErrors
];

/**
 * Validations pour les utilisateurs
 */
const validateUserCreation = [
    body('email')
        .isEmail()
        .withMessage('Email valide requis')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mot de passe requis (min 6 caractères)'),
    body('first_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Prénom requis (2-100 caractères)')
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage('Prénom invalide'),
    body('last_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nom requis (2-100 caractères)')
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage('Nom invalide'),
    body('phone')
        .optional()
        .isMobilePhone('fr-FR')
        .withMessage('Numéro de téléphone invalide'),
    body('role')
        .isIn(['admin', 'teacher', 'student'])
        .withMessage('Rôle invalide'),
    handleValidationErrors
];

const validateUserUpdate = [
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email valide requis')
        .normalizeEmail(),
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Prénom invalide (2-100 caractères)')
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage('Prénom invalide'),
    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nom invalide (2-100 caractères)')
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage('Nom invalide'),
    body('phone')
        .optional()
        .isMobilePhone('fr-FR')
        .withMessage('Numéro de téléphone invalide'),
    handleValidationErrors
];

/**
 * Validations pour les étudiants
 */
const validateStudentCreation = [
    ...validateUserCreation,
    body('birth_date')
        .optional()
        .isISO8601()
        .withMessage('Date de naissance invalide'),
    body('level')
        .isIn(['L1', 'L2', 'L3', 'M1', 'M2'])
        .withMessage('Niveau invalide'),
    body('academic_year')
        .matches(/^\d{4}-\d{4}$/)
        .withMessage('Année académique invalide (format: 2023-2024)'),
    body('enrollment_date')
        .optional()
        .isISO8601()
        .withMessage('Date d\'inscription invalide'),
    handleValidationErrors
];

/**
 * Validations pour les enseignants
 */
const validateTeacherCreation = [
    ...validateUserCreation,
    body('department')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Département requis (2-100 caractères)'),
    body('specialization')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Spécialisation trop longue (max 100 caractères)'),
    body('hire_date')
        .isISO8601()
        .withMessage('Date d\'embauche invalide'),
    handleValidationErrors
];

/**
 * Validations pour les cours
 */
const validateCourseCreation = [
    body('code')
        .trim()
        .isLength({ min: 3, max: 10 })
        .withMessage('Code cours requis (3-10 caractères)')
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Code cours invalide (lettres majuscules et chiffres uniquement)'),
    body('name')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Nom du cours requis (3-200 caractères)'),
    body('credits')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Crédits invalides (1-20)'),
    body('level')
        .isIn(['L1', 'L2', 'L3', 'M1', 'M2'])
        .withMessage('Niveau invalide'),
    body('semester')
        .isIn(['S1', 'S2'])
        .withMessage('Semestre invalide'),
    body('academic_year')
        .matches(/^\d{4}-\d{4}$/)
        .withMessage('Année académique invalide (format: 2023-2024)'),
    handleValidationErrors
];

/**
 * Validations pour les modules
 */
const validateModuleCreation = [
    body('course_id')
        .isInt({ min: 1 })
        .withMessage('ID cours invalide'),
    body('teacher_id')
        .isInt({ min: 1 })
        .withMessage('ID enseignant invalide'),
    body('name')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Nom du module requis (3-200 caractères)'),
    body('coefficient')
        .optional()
        .isFloat({ min: 0.1, max: 10 })
        .withMessage('Coefficient invalide (0.1-10)'),
    body('hours_total')
        .isInt({ min: 1, max: 200 })
        .withMessage('Heures totales invalides (1-200)'),
    body('hours_cm')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Heures CM invalides'),
    body('hours_td')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Heures TD invalides'),
    body('hours_tp')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Heures TP invalides'),
    body('evaluation_type')
        .optional()
        .isIn(['exam', 'continuous', 'mixed'])
        .withMessage('Type d\'évaluation invalide'),
    handleValidationErrors
];

/**
 * Validations pour les notes
 */
const validateGradeCreation = [
    body('student_id')
        .isInt({ min: 1 })
        .withMessage('ID étudiant invalide'),
    body('module_id')
        .isInt({ min: 1 })
        .withMessage('ID module invalide'),
    body('grade_type')
        .isIn(['cc', 'exam', 'tp', 'project'])
        .withMessage('Type de note invalide'),
    body('grade')
        .isFloat({ min: 0 })
        .withMessage('Note invalide (doit être positive)'),
    body('max_grade')
        .optional()
        .isFloat({ min: 1 })
        .withMessage('Note maximale invalide'),
    body('coefficient')
        .optional()
        .isFloat({ min: 0.1, max: 10 })
        .withMessage('Coefficient invalide (0.1-10)'),
    body('exam_date')
        .optional()
        .isISO8601()
        .withMessage('Date d\'examen invalide'),
    handleValidationErrors
];

/**
 * Validations pour les absences
 */
const validateAbsenceCreation = [
    body('student_id')
        .isInt({ min: 1 })
        .withMessage('ID étudiant invalide'),
    body('module_id')
        .isInt({ min: 1 })
        .withMessage('ID module invalide'),
    body('absence_date')
        .isISO8601()
        .withMessage('Date d\'absence invalide'),
    body('absence_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Heure d\'absence invalide (format HH:MM)'),
    body('duration_hours')
        .optional()
        .isFloat({ min: 0.1, max: 24 })
        .withMessage('Durée invalide (0.1-24 heures)'),
    body('type')
        .isIn(['absence', 'late', 'early_leave'])
        .withMessage('Type d\'absence invalide'),
    handleValidationErrors
];

/**
 * Validations pour les inscriptions
 */
const validateEnrollmentCreation = [
    body('student_id')
        .isInt({ min: 1 })
        .withMessage('ID étudiant invalide'),
    body('course_id')
        .isInt({ min: 1 })
        .withMessage('ID cours invalide'),
    body('academic_year')
        .matches(/^\d{4}-\d{4}$/)
        .withMessage('Année académique invalide (format: 2023-2024)'),
    body('enrollment_date')
        .optional()
        .isISO8601()
        .withMessage('Date d\'inscription invalide'),
    handleValidationErrors
];

/**
 * Validations pour les paramètres d'URL
 */
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID invalide'),
    handleValidationErrors
];

const validateLevel = [
    param('level')
        .isIn(['L1', 'L2', 'L3', 'M1', 'M2'])
        .withMessage('Niveau invalide'),
    handleValidationErrors
];

const validateSemester = [
    param('semester')
        .isIn(['S1', 'S2'])
        .withMessage('Semestre invalide'),
    handleValidationErrors
];

/**
 * Validations pour les paramètres de requête
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Numéro de page invalide'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite invalide (1-100)'),
    handleValidationErrors
];

const validateAcademicYear = [
    query('academic_year')
        .optional()
        .matches(/^\d{4}-\d{4}$/)
        .withMessage('Année académique invalide (format: 2023-2024)'),
    handleValidationErrors
];

/**
 * Validation personnalisée pour vérifier les contraintes métier
 */
const validateBusinessRules = {
    /**
     * Vérifier que la note est dans la plage autorisée
     */
    gradeInRange: (req, res, next) => {
        const { grade, max_grade = 20 } = req.body;
        
        if (parseFloat(grade) > parseFloat(max_grade)) {
            return res.status(400).json({
                success: false,
                message: 'La note ne peut pas dépasser la note maximale'
            });
        }
        
        next();
    },

    /**
     * Vérifier que la date d'absence n'est pas dans le futur
     */
    absenceDateNotFuture: (req, res, next) => {
        const { absence_date } = req.body;
        
        if (new Date(absence_date) > new Date()) {
            return res.status(400).json({
                success: false,
                message: 'La date d\'absence ne peut pas être dans le futur'
            });
        }
        
        next();
    },

    /**
     * Vérifier que l'année académique est cohérente
     */
    academicYearValid: (req, res, next) => {
        const { academic_year } = req.body;
        
        if (academic_year) {
            const [startYear, endYear] = academic_year.split('-').map(Number);
            
            if (endYear !== startYear + 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique invalide (doit être consécutive)'
                });
            }
        }
        
        next();
    },

    /**
     * Vérifier que la répartition des heures est cohérente
     */
    hoursDistributionValid: (req, res, next) => {
        const { hours_total, hours_cm = 0, hours_td = 0, hours_tp = 0 } = req.body;
        
        const totalDistributed = parseInt(hours_cm) + parseInt(hours_td) + parseInt(hours_tp);
        
        if (totalDistributed > parseInt(hours_total)) {
            return res.status(400).json({
                success: false,
                message: 'La répartition des heures dépasse le total'
            });
        }
        
        next();
    }
};

/**
 * Sanitisation des données
 */
const sanitizeInput = {
    /**
     * Nettoyer les chaînes de caractères
     */
    cleanStrings: (req, res, next) => {
        const cleanString = (str) => {
            if (typeof str === 'string') {
                return str.trim().replace(/\s+/g, ' ');
            }
            return str;
        };

        // Nettoyer récursivement l'objet body
        const cleanObject = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = cleanString(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    cleanObject(obj[key]);
                }
            }
        };

        if (req.body) {
            cleanObject(req.body);
        }

        next();
    },

    /**
     * Convertir les booléens
     */
    convertBooleans: (req, res, next) => {
        const convertBoolean = (value) => {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return false;
            return value;
        };

        // Convertir dans body
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (key.includes('is_') || key.includes('_active')) {
                    req.body[key] = convertBoolean(req.body[key]);
                }
            });
        }

        // Convertir dans query
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (key.includes('is_') || key.includes('_active')) {
                    req.query[key] = convertBoolean(req.query[key]);
                }
            });
        }

        next();
    }
};

module.exports = {
    // Gestion des erreurs
    handleValidationErrors,

    // Authentification
    validateLogin,
    validatePasswordChange,
    validatePasswordReset,

    // Utilisateurs
    validateUserCreation,
    validateUserUpdate,

    // Étudiants
    validateStudentCreation,

    // Enseignants
    validateTeacherCreation,

    // Cours
    validateCourseCreation,

    // Modules
    validateModuleCreation,

    // Notes
    validateGradeCreation,

    // Absences
    validateAbsenceCreation,

    // Inscriptions
    validateEnrollmentCreation,

    // Paramètres
    validateId,
    validateLevel,
    validateSemester,
    validatePagination,
    validateAcademicYear,

    // Règles métier
    validateBusinessRules,

    // Sanitisation
    sanitizeInput
};