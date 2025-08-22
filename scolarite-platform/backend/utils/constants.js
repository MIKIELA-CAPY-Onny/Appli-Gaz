/**
 * Constantes de l'application
 * Centralise toutes les valeurs constantes utilisées dans l'application
 */

/**
 * Rôles utilisateur
 */
const USER_ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student'
};

/**
 * Niveaux d'études
 */
const ACADEMIC_LEVELS = {
    L1: 'L1',
    L2: 'L2',
    L3: 'L3',
    M1: 'M1',
    M2: 'M2'
};

/**
 * Semestres
 */
const SEMESTERS = {
    S1: 'S1',
    S2: 'S2'
};

/**
 * Statuts des étudiants
 */
const STUDENT_STATUS = {
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    GRADUATED: 'graduated',
    DROPPED: 'dropped'
};

/**
 * Statuts des enseignants
 */
const TEACHER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    RETIRED: 'retired'
};

/**
 * Statuts des administrateurs
 */
const ADMIN_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

/**
 * Types de notes
 */
const GRADE_TYPES = {
    CC: 'cc',           // Contrôle continu
    EXAM: 'exam',       // Examen
    TP: 'tp',          // Travaux pratiques
    PROJECT: 'project'  // Projet
};

/**
 * Types d'évaluation des modules
 */
const EVALUATION_TYPES = {
    EXAM: 'exam',
    CONTINUOUS: 'continuous',
    MIXED: 'mixed'
};

/**
 * Types d'absences
 */
const ABSENCE_TYPES = {
    ABSENCE: 'absence',
    LATE: 'late',
    EARLY_LEAVE: 'early_leave'
};

/**
 * Statuts des inscriptions
 */
const ENROLLMENT_STATUS = {
    ENROLLED: 'enrolled',
    COMPLETED: 'completed',
    FAILED: 'failed',
    WITHDRAWN: 'withdrawn'
};

/**
 * Départements
 */
const DEPARTMENTS = {
    INFORMATIQUE: 'Informatique',
    MATHEMATIQUES: 'Mathématiques',
    PHYSIQUE: 'Physique',
    CHIMIE: 'Chimie',
    BIOLOGIE: 'Biologie',
    ADMINISTRATION: 'Administration Générale',
    SCOLARITE: 'Scolarité'
};

/**
 * Permissions administrateur
 */
const ADMIN_PERMISSIONS = {
    USERS: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete'
    },
    STUDENTS: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete'
    },
    TEACHERS: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete'
    },
    COURSES: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete'
    },
    MODULES: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete'
    },
    GRADES: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete'
    },
    ABSENCES: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete'
    },
    ENROLLMENTS: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete'
    },
    REPORTS: {
        GENERATE: 'generate',
        EXPORT: 'export'
    }
};

/**
 * Codes de réponse HTTP
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503
};

/**
 * Messages d'erreur standardisés
 */
const ERROR_MESSAGES = {
    // Authentification
    INVALID_CREDENTIALS: 'Identifiants invalides',
    TOKEN_EXPIRED: 'Token expiré',
    TOKEN_INVALID: 'Token invalide',
    ACCESS_DENIED: 'Accès refusé',
    ACCOUNT_DISABLED: 'Compte désactivé',
    
    // Validation
    REQUIRED_FIELD: 'Champ requis',
    INVALID_FORMAT: 'Format invalide',
    INVALID_EMAIL: 'Email invalide',
    WEAK_PASSWORD: 'Mot de passe trop faible',
    
    // Ressources
    NOT_FOUND: 'Ressource non trouvée',
    ALREADY_EXISTS: 'Cette donnée existe déjà',
    CANNOT_DELETE: 'Impossible de supprimer cette ressource',
    
    // Données
    INVALID_GRADE: 'Note invalide',
    INVALID_DATE: 'Date invalide',
    INVALID_LEVEL: 'Niveau d\'études invalide',
    INVALID_SEMESTER: 'Semestre invalide',
    
    // Système
    INTERNAL_ERROR: 'Erreur interne du serveur',
    DATABASE_ERROR: 'Erreur de base de données',
    NETWORK_ERROR: 'Erreur réseau'
};

/**
 * Messages de succès standardisés
 */
const SUCCESS_MESSAGES = {
    // CRUD
    CREATED: 'Créé avec succès',
    UPDATED: 'Mis à jour avec succès',
    DELETED: 'Supprimé avec succès',
    RETRIEVED: 'Récupéré avec succès',
    
    // Authentification
    LOGIN_SUCCESS: 'Connexion réussie',
    LOGOUT_SUCCESS: 'Déconnexion réussie',
    PASSWORD_CHANGED: 'Mot de passe changé avec succès',
    PASSWORD_RESET: 'Mot de passe réinitialisé avec succès',
    
    // Actions spécifiques
    ENROLLED: 'Inscription réussie',
    GRADE_ADDED: 'Note ajoutée avec succès',
    ABSENCE_RECORDED: 'Absence enregistrée avec succès',
    ABSENCE_JUSTIFIED: 'Absence justifiée avec succès'
};

/**
 * Configuration de pagination
 */
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1
};

/**
 * Configuration des fichiers
 */
const FILE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    UPLOAD_PATH: './uploads',
    TEMP_PATH: './temp'
};

/**
 * Configuration de sécurité
 */
const SECURITY_CONFIG = {
    JWT_EXPIRES_IN: '15m',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    PASSWORD_RESET_EXPIRES_IN: '1h',
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    BCRYPT_ROUNDS: 12
};

/**
 * Configuration de rate limiting
 */
const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_REQUESTS: 5, // Pour les tentatives de connexion
    SKIP_SUCCESSFUL_REQUESTS: true
};

/**
 * Regex patterns utiles
 */
const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_FR: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    ACADEMIC_YEAR: /^\d{4}-\d{4}$/,
    COURSE_CODE: /^[A-Z0-9]{3,10}$/,
    STUDENT_NUMBER: /^ETU\d{7}$/,
    EMPLOYEE_NUMBER: /^(PROF|ADM)\d{3}$/,
    TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    NAME: /^[a-zA-ZÀ-ÿ\s\-']+$/,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

/**
 * Configuration de l'application
 */
const APP_CONFIG = {
    NAME: 'GestiScolarité',
    VERSION: '1.0.0',
    DESCRIPTION: 'Plateforme de gestion de scolarité universitaire',
    AUTHOR: 'Équipe de développement',
    LICENSE: 'MIT',
    SUPPORT_EMAIL: 'support@university.com',
    DEFAULT_TIMEZONE: 'Europe/Paris',
    DEFAULT_LOCALE: 'fr-FR',
    DEFAULT_CURRENCY: 'EUR'
};

/**
 * Configuration de l'environnement
 */
const ENVIRONMENT = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
    STAGING: 'staging'
};

/**
 * URLs et endpoints
 */
const API_ENDPOINTS = {
    BASE: '/api/v1',
    AUTH: '/auth',
    USERS: '/users',
    STUDENTS: '/students',
    TEACHERS: '/teachers',
    COURSES: '/courses',
    MODULES: '/modules',
    GRADES: '/grades',
    ABSENCES: '/absences',
    ENROLLMENTS: '/enrollments',
    REPORTS: '/reports'
};

/**
 * Configuration des logs
 */
const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};

/**
 * Types de notifications
 */
const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
};

/**
 * Mentions selon les notes
 */
const GRADE_MENTIONS = {
    EXCELLENT: { min: 16, label: 'Très Bien', color: '#28a745' },
    GOOD: { min: 14, label: 'Bien', color: '#17a2b8' },
    FAIR: { min: 12, label: 'Assez Bien', color: '#ffc107' },
    PASS: { min: 10, label: 'Passable', color: '#fd7e14' },
    FAIL: { min: 0, label: 'Insuffisant', color: '#dc3545' }
};

/**
 * Configuration des exports
 */
const EXPORT_CONFIG = {
    FORMATS: ['pdf', 'excel', 'csv'],
    MAX_RECORDS: 10000,
    TIMEOUT: 30000 // 30 secondes
};

/**
 * Fonctions utilitaires pour les constantes
 */
const constants = {
    /**
     * Obtenir tous les rôles sous forme de tableau
     * @returns {Array} - Liste des rôles
     */
    getAllRoles() {
        return Object.values(USER_ROLES);
    },

    /**
     * Obtenir tous les niveaux sous forme de tableau
     * @returns {Array} - Liste des niveaux
     */
    getAllLevels() {
        return Object.values(ACADEMIC_LEVELS);
    },

    /**
     * Obtenir tous les semestres sous forme de tableau
     * @returns {Array} - Liste des semestres
     */
    getAllSemesters() {
        return Object.values(SEMESTERS);
    },

    /**
     * Obtenir la mention selon une note
     * @param {number} grade - Note sur 20
     * @returns {Object} - Mention avec couleur
     */
    getGradeMention(grade) {
        if (grade >= GRADE_MENTIONS.EXCELLENT.min) return GRADE_MENTIONS.EXCELLENT;
        if (grade >= GRADE_MENTIONS.GOOD.min) return GRADE_MENTIONS.GOOD;
        if (grade >= GRADE_MENTIONS.FAIR.min) return GRADE_MENTIONS.FAIR;
        if (grade >= GRADE_MENTIONS.PASS.min) return GRADE_MENTIONS.PASS;
        return GRADE_MENTIONS.FAIL;
    },

    /**
     * Vérifier si un rôle est valide
     * @param {string} role - Rôle à vérifier
     * @returns {boolean} - True si valide
     */
    isValidRole(role) {
        return Object.values(USER_ROLES).includes(role);
    },

    /**
     * Vérifier si un niveau est valide
     * @param {string} level - Niveau à vérifier
     * @returns {boolean} - True si valide
     */
    isValidLevel(level) {
        return Object.values(ACADEMIC_LEVELS).includes(level);
    },

    /**
     * Vérifier si un semestre est valide
     * @param {string} semester - Semestre à vérifier
     * @returns {boolean} - True si valide
     */
    isValidSemester(semester) {
        return Object.values(SEMESTERS).includes(semester);
    },

    /**
     * Obtenir l'endpoint API complet
     * @param {string} endpoint - Endpoint relatif
     * @returns {string} - Endpoint complet
     */
    getApiEndpoint(endpoint) {
        return API_ENDPOINTS.BASE + endpoint;
    }
};

module.exports = {
    // Énumérations
    USER_ROLES,
    ACADEMIC_LEVELS,
    SEMESTERS,
    STUDENT_STATUS,
    TEACHER_STATUS,
    ADMIN_STATUS,
    GRADE_TYPES,
    EVALUATION_TYPES,
    ABSENCE_TYPES,
    ENROLLMENT_STATUS,
    DEPARTMENTS,
    ADMIN_PERMISSIONS,
    
    // Configuration
    HTTP_STATUS,
    PAGINATION,
    FILE_CONFIG,
    SECURITY_CONFIG,
    RATE_LIMIT,
    APP_CONFIG,
    ENVIRONMENT,
    API_ENDPOINTS,
    LOG_LEVELS,
    NOTIFICATION_TYPES,
    GRADE_MENTIONS,
    EXPORT_CONFIG,
    
    // Messages
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    
    // Patterns
    REGEX_PATTERNS,
    
    // Utilitaires
    constants
};