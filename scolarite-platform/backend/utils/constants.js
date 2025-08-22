// Constantes de l'application

// Statuts des utilisateurs
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Rôles des utilisateurs
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Niveaux d'étude
const ACADEMIC_LEVELS = {
  L1: 'L1',
  L2: 'L2',
  L3: 'L3',
  M1: 'M1',
  M2: 'M2',
  D1: 'D1',
  D2: 'D2',
  D3: 'D3'
};

// Semestres
const SEMESTERS = {
  S1: 'S1',
  S2: 'S2',
  S3: 'S3',
  S4: 'S4',
  S5: 'S5',
  S6: 'S6',
  S7: 'S7',
  S8: 'S8',
  S9: 'S9',
  S10: 'S10'
};

// Statuts des étudiants
const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  SUSPENDED: 'suspended',
  WITHDRAWN: 'withdrawn'
};

// Positions des enseignants
const TEACHER_POSITIONS = {
  PROFESSOR: 'professor',
  ASSOCIATE_PROFESSOR: 'associate_professor',
  ASSISTANT_PROFESSOR: 'assistant_professor',
  LECTURER: 'lecturer',
  INSTRUCTOR: 'instructor'
};

// Statuts des enseignants
const TEACHER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
  RETIRED: 'retired'
};

// Rôles des administrateurs
const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support'
};

// Statuts des cours
const COURSE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Statuts des modules
const MODULE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed'
};

// Statuts des inscriptions
const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  WITHDRAWN: 'withdrawn',
  FAILED: 'failed',
  AUDIT: 'audit'
};

// Types d'évaluation
const ASSESSMENT_TYPES = {
  EXAM: 'exam',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  PROJECT: 'project',
  PARTICIPATION: 'participation',
  MIDTERM: 'midterm',
  FINAL: 'final'
};

// Statuts des notes
const GRADE_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  LATE: 'late',
  MISSING: 'missing'
};

// Types d'absences
const ABSENCE_TYPES = {
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  UNEXCUSED: 'unexcused',
  MEDICAL: 'medical',
  OTHER: 'other'
};

// Impact des absences sur les notes
const ABSENCE_IMPACT = {
  NONE: 'none',
  MINOR: 'minor',
  MODERATE: 'moderate',
  MAJOR: 'major'
};

// Codes de réponse HTTP
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
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Messages d'erreur communs
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Accès non autorisé',
  FORBIDDEN: 'Accès interdit',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation',
  INTERNAL_ERROR: 'Erreur interne du serveur',
  DATABASE_ERROR: 'Erreur de base de données',
  NETWORK_ERROR: 'Erreur de réseau',
  TIMEOUT_ERROR: 'Délai d\'attente dépassé'
};

// Messages de succès communs
const SUCCESS_MESSAGES = {
  CREATED: 'Ressource créée avec succès',
  UPDATED: 'Ressource mise à jour avec succès',
  DELETED: 'Ressource supprimée avec succès',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
  EMAIL_SENT: 'Email envoyé avec succès'
};

// Limites de pagination
const PAGINATION_LIMITS = {
  MIN_PAGE: 1,
  MAX_PAGE: 1000,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 10
};

// Limites de taille de fichiers
const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILENAME_LENGTH: 255
};

// Configuration des tokens JWT
const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

// Configuration des mots de passe
const PASSWORD_CONFIG = {
  MIN_LENGTH: 6,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: false
};

// Configuration des emails
const EMAIL_CONFIG = {
  FROM_NAME: 'Plateforme de Scolarité',
  FROM_EMAIL: 'noreply@scolarite.com',
  SUBJECTS: {
    WELCOME: 'Bienvenue sur la Plateforme de Scolarité',
    PASSWORD_RESET: 'Réinitialisation de votre mot de passe',
    EMAIL_VERIFICATION: 'Vérification de votre adresse email',
    GRADE_UPDATE: 'Mise à jour de vos notes',
    COURSE_ENROLLMENT: 'Confirmation d\'inscription au cours'
  }
};

// Configuration des notifications
const NOTIFICATION_CONFIG = {
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  },
  CHANNELS: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app'
  }
};

// Configuration des rapports
const REPORT_CONFIG = {
  FORMATS: {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
    JSON: 'json'
  },
  TYPES: {
    ACADEMIC_PERFORMANCE: 'academic_performance',
    ATTENDANCE: 'attendance',
    GRADES: 'grades',
    ENROLLMENT: 'enrollment',
    FINANCIAL: 'financial'
  }
};

// Configuration des exports
const EXPORT_CONFIG = {
  MAX_RECORDS: 10000,
  CHUNK_SIZE: 1000,
  TIMEOUT: 300000 // 5 minutes
};

// Configuration des logs
const LOG_CONFIG = {
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },
  MAX_SIZE: '20m',
  MAX_FILES: '14d'
};

// Configuration des sessions
const SESSION_CONFIG = {
  SECRET: process.env.SESSION_SECRET || 'scolarite_session_secret',
  RESAVE: false,
  SAVE_UNINITIALIZED: false,
  COOKIE: {
    SECURE: process.env.NODE_ENV === 'production',
    HTTPONLY: true,
    MAX_AGE: 24 * 60 * 60 * 1000 // 24 heures
  }
};

module.exports = {
  USER_STATUS,
  USER_ROLES,
  ACADEMIC_LEVELS,
  SEMESTERS,
  STUDENT_STATUS,
  TEACHER_POSITIONS,
  TEACHER_STATUS,
  ADMIN_ROLES,
  COURSE_STATUS,
  MODULE_STATUS,
  ENROLLMENT_STATUS,
  ASSESSMENT_TYPES,
  GRADE_STATUS,
  ABSENCE_TYPES,
  ABSENCE_IMPACT,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION_LIMITS,
  FILE_LIMITS,
  JWT_CONFIG,
  PASSWORD_CONFIG,
  EMAIL_CONFIG,
  NOTIFICATION_CONFIG,
  REPORT_CONFIG,
  EXPORT_CONFIG,
  LOG_CONFIG,
  SESSION_CONFIG
};