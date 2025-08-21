/**
 * Constantes de l'application
 */

// Rôles utilisateurs
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

// Statuts académiques des étudiants
const ACADEMIC_STATUS = {
  ACTIVE: 'actif',
  INACTIVE: 'inactif',
  SUSPENDED: 'suspendu',
  GRADUATED: 'diplômé',
  DROPPED: 'abandon'
};

// Niveaux académiques
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

// Statuts des cours
const COURSE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
};

// Types de sessions
const SESSION_TYPES = {
  COURS: 'cours',
  TD: 'td',
  TP: 'tp',
  EXAM: 'examen',
  OTHER: 'autre'
};

// Statuts de présence
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  PARTIAL: 'partial'
};

// Types d'évaluation
const EVALUATION_TYPES = {
  FINAL_EXAM: 'examen_final',
  MIDTERM_EXAM: 'examen_partiel',
  PRACTICAL: 'tp',
  PROJECT: 'projet',
  PARTICIPATION: 'participation',
  ASSIGNMENT: 'devoir',
  ORAL: 'oral',
  OTHER: 'autre'
};

// Statuts des notes
const GRADE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  DISPUTED: 'disputed'
};

// Statuts des inscriptions
const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  WITHDRAWN: 'withdrawn',
  FAILED: 'failed',
  SUSPENDED: 'suspended'
};

// Types d'inscription
const ENROLLMENT_TYPES = {
  REGULAR: 'regular',
  AUDIT: 'audit',
  CREDIT_TRANSFER: 'credit_transfer',
  MAKEUP: 'makeup',
  OTHER: 'other'
};

// Statuts de paiement
const PAYMENT_STATUS = {
  PAID: 'à jour',
  OVERDUE: 'en retard',
  EXEMPTED: 'exonéré'
};

// Types de contrats
const CONTRACT_TYPES = {
  CDI: 'CDI',
  CDD: 'CDD',
  VACATAIRE: 'vacataire',
  STAGIAIRE: 'stagiaire',
  OTHER: 'autre'
};

// Positions des enseignants
const TEACHER_POSITIONS = {
  PROFESSOR: 'professeur',
  ASSOCIATE_PROFESSOR: 'maître_de_conférences',
  LECTURER: 'chargé_de_cours',
  ASSISTANT: 'assistant',
  RESEARCHER: 'chercheur',
  OTHER: 'autre'
};

// Rangs académiques
const ACADEMIC_RANKS = {
  PHD_STUDENT: 'doctorant',
  PHD: 'docteur',
  ASSOCIATE_PROFESSOR: 'maître_de_conférences',
  PROFESSOR: 'professeur',
  EMERITUS: 'professeur_émérite'
};

// Positions administratives
const ADMIN_POSITIONS = {
  DIRECTOR: 'directeur',
  DEPUTY_DIRECTOR: 'directeur_adjoint',
  HEAD_OF_SERVICE: 'chef_service',
  MANAGER: 'responsable',
  ASSISTANT: 'assistant',
  OTHER: 'autre'
};

// Rôles administratifs
const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ACADEMIC_ADMIN: 'academic_admin',
  FINANCIAL_ADMIN: 'financial_admin',
  STUDENT_AFFAIRS_ADMIN: 'student_affairs_admin',
  FACULTY_ADMIN: 'faculty_admin',
  SYSTEM_ADMIN: 'system_admin'
};

// Permissions
const PERMISSIONS = {
  USER_MANAGEMENT: 'userManagement',
  STUDENT_MANAGEMENT: 'studentManagement',
  TEACHER_MANAGEMENT: 'teacherManagement',
  COURSE_MANAGEMENT: 'courseManagement',
  GRADE_MANAGEMENT: 'gradeManagement',
  FINANCIAL_MANAGEMENT: 'financialManagement',
  REPORT_GENERATION: 'reportGeneration',
  SYSTEM_CONFIGURATION: 'systemConfiguration'
};

// Types de documents
const DOCUMENT_TYPES = {
  STUDENT_CARD: 'carte_etudiant',
  ENROLLMENT_CERTIFICATE: 'certificat_scolarite',
  GRADE_REPORT: 'releve_notes',
  INTERNSHIP_CERTIFICATE: 'attestation_stage',
  OTHER: 'autre'
};

// Types de ressources
const RESOURCE_TYPES = {
  DOCUMENT: 'document',
  LINK: 'lien',
  VIDEO: 'video',
  AUDIO: 'audio',
  SOFTWARE: 'logiciel',
  OTHER: 'autre'
};

// Types de publications
const PUBLICATION_TYPES = {
  ARTICLE: 'article',
  BOOK: 'livre',
  CHAPTER: 'chapitre',
  CONFERENCE: 'conférence',
  THESIS: 'thèse',
  OTHER: 'autre'
};

// Types de sanctions
const SANCTION_TYPES = {
  WARNING: 'avertissement',
  DETENTION: 'retenue',
  TEMPORARY_EXCLUSION: 'exclusion_temporaire',
  PERMANENT_EXCLUSION: 'exclusion_définitive',
  OTHER: 'autre'
};

// Types de suivi
const FOLLOW_UP_TYPES = {
  MEETING: 'meeting',
  CALL: 'call',
  EMAIL: 'email',
  LETTER: 'letter',
  OTHER: 'other'
};

// Types de notifications
const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
};

// Types de communication
const COMMUNICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  APP: 'app',
  LETTER: 'letter'
};

// Statuts de contestation
const DISPUTE_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
};

// Statuts de modération
const MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under_review'
};

// Codes d'erreur HTTP
const HTTP_STATUS_CODES = {
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
  SERVICE_UNAVAILABLE: 503
};

// Messages d'erreur
const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Données de validation invalides',
  AUTHENTICATION_REQUIRED: 'Authentification requise',
  INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes',
  RESOURCE_NOT_FOUND: 'Ressource non trouvée',
  DUPLICATE_ENTRY: 'Entrée en double',
  INVALID_CREDENTIALS: 'Identifiants invalides',
  ACCOUNT_LOCKED: 'Compte verrouillé',
  TOKEN_EXPIRED: 'Token expiré',
  INVALID_TOKEN: 'Token invalide',
  RATE_LIMIT_EXCEEDED: 'Limite de taux dépassée',
  DATABASE_ERROR: 'Erreur de base de données',
  FILE_TOO_LARGE: 'Fichier trop volumineux',
  INVALID_FILE_TYPE: 'Type de fichier invalide'
};

// Messages de succès
const SUCCESS_MESSAGES = {
  USER_CREATED: 'Utilisateur créé avec succès',
  USER_UPDATED: 'Utilisateur mis à jour avec succès',
  USER_DELETED: 'Utilisateur supprimé avec succès',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
  COURSE_CREATED: 'Cours créé avec succès',
  COURSE_UPDATED: 'Cours mis à jour avec succès',
  ENROLLMENT_SUCCESS: 'Inscription réussie',
  GRADE_ADDED: 'Note ajoutée avec succès',
  ATTENDANCE_RECORDED: 'Présence enregistrée avec succès'
};

// Limites et contraintes
const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 6,
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TITLE_LENGTH: 200,
  MAX_COMMENT_LENGTH: 1000,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION: 2 * 60 * 60 * 1000, // 2 heures
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 heures
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100
};

// Formats de date
const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DATABASE: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ'
};

// Formats de téléphone
const PHONE_FORMATS = {
  FRENCH: /^(\+33|0)[1-9](\d{8})$/,
  INTERNATIONAL: /^\+[1-9]\d{1,14}$/
};

// Formats d'email
const EMAIL_FORMATS = {
  REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DOMAIN_REGEX: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
};

// Codes de statut de réponse API
const API_RESPONSE_CODES = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// Niveaux de log
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Environnements
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

// Types de recherche
const SEARCH_TYPES = {
  EXACT: 'exact',
  PARTIAL: 'partial',
  FUZZY: 'fuzzy',
  REGEX: 'regex'
};

// Ordres de tri
const SORT_ORDERS = {
  ASCENDING: 'asc',
  DESCENDING: 'desc'
};

// Champs de tri par défaut
const DEFAULT_SORT_FIELDS = {
  USER: 'createdAt',
  STUDENT: 'lastName',
  TEACHER: 'lastName',
  COURSE: 'title',
  GRADE: 'evaluationDate',
  ENROLLMENT: 'enrollmentDate',
  ABSENCE: 'sessionDate'
};

module.exports = {
  USER_ROLES,
  ACADEMIC_STATUS,
  ACADEMIC_LEVELS,
  COURSE_STATUS,
  SESSION_TYPES,
  ATTENDANCE_STATUS,
  EVALUATION_TYPES,
  GRADE_STATUS,
  ENROLLMENT_STATUS,
  ENROLLMENT_TYPES,
  PAYMENT_STATUS,
  CONTRACT_TYPES,
  TEACHER_POSITIONS,
  ACADEMIC_RANKS,
  ADMIN_POSITIONS,
  ADMIN_ROLES,
  PERMISSIONS,
  DOCUMENT_TYPES,
  RESOURCE_TYPES,
  PUBLICATION_TYPES,
  SANCTION_TYPES,
  FOLLOW_UP_TYPES,
  NOTIFICATION_TYPES,
  COMMUNICATION_TYPES,
  DISPUTE_STATUS,
  MODERATION_STATUS,
  HTTP_STATUS_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LIMITS,
  DATE_FORMATS,
  PHONE_FORMATS,
  EMAIL_FORMATS,
  API_RESPONSE_CODES,
  LOG_LEVELS,
  ENVIRONMENTS,
  SEARCH_TYPES,
  SORT_ORDERS,
  DEFAULT_SORT_FIELDS
};