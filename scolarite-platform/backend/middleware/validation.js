const Joi = require('joi');

/**
 * Middleware de validation générique avec Joi
 * @param {Object} schema - Schéma Joi pour la validation
 * @param {string} property - Propriété de la requête à valider ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        error: 'VALIDATION_ERROR',
        details: errorDetails
      });
    }

    // Remplacer les données validées
    req[property] = value;
    next();
  };
};

/**
 * Schémas de validation pour l'authentification
 */
const authSchemas = {
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Format d\'email invalide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'any.required': 'Le mot de passe est requis'
      })
  }),

  register: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Le prénom doit contenir au moins 2 caractères',
        'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
        'any.required': 'Le prénom est requis'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Le nom de famille doit contenir au moins 2 caractères',
        'string.max': 'Le nom de famille ne peut pas dépasser 50 caractères',
        'any.required': 'Le nom de famille est requis'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Format d\'email invalide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'string.max': 'Le mot de passe ne peut pas dépasser 128 caractères',
        'any.required': 'Le mot de passe est requis'
      }),
    role: Joi.string()
      .valid('student', 'teacher', 'admin')
      .required()
      .messages({
        'any.only': 'Le rôle doit être student, teacher ou admin',
        'any.required': 'Le rôle est requis'
      }),
    phone: Joi.string()
      .pattern(/^(\+33|0)[1-9](\d{8})$/)
      .optional()
      .messages({
        'string.pattern.base': 'Format de numéro de téléphone invalide'
      }),
    dateOfBirth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'La date de naissance ne peut pas être dans le futur'
      }),
    gender: Joi.string()
      .valid('homme', 'femme', 'autre', 'non-précisé')
      .optional()
  })
};

/**
 * Schémas de validation pour les étudiants
 */
const studentSchemas = {
  create: Joi.object({
    level: Joi.string()
      .valid('L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3')
      .required()
      .messages({
        'any.only': 'Niveau académique invalide',
        'any.required': 'Le niveau académique est requis'
      }),
    field: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Le domaine d\'étude doit contenir au moins 2 caractères',
        'string.max': 'Le domaine d\'étude ne peut pas dépasser 100 caractères',
        'any.required': 'Le domaine d\'étude est requis'
      }),
    specialization: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'La spécialisation ne peut pas dépasser 100 caractères'
      }),
    enrollmentYear: Joi.number()
      .integer()
      .min(2000)
      .max(new Date().getFullYear() + 1)
      .required()
      .messages({
        'number.base': 'L\'année d\'inscription doit être un nombre',
        'number.integer': 'L\'année d\'inscription doit être un entier',
        'number.min': 'L\'année d\'inscription doit être supérieure à 2000',
        'number.max': 'L\'année d\'inscription ne peut pas être dans le futur',
        'any.required': 'L\'année d\'inscription est requise'
      }),
    currentSemester: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'Le semestre actuel doit être un nombre',
        'number.integer': 'Le semestre actuel doit être un entier',
        'number.min': 'Le semestre doit être au moins 1',
        'number.max': 'Le semestre ne peut pas dépasser 10',
        'any.required': 'Le semestre actuel est requis'
      }),
    totalCredits: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Le total des crédits doit être un nombre',
        'number.integer': 'Le total des crédits doit être un entier',
        'number.min': 'Le total des crédits ne peut pas être négatif',
        'any.required': 'Le total des crédits est requis'
      }),
    emergencyContact: Joi.object({
      name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': 'Le nom du contact d\'urgence doit contenir au moins 2 caractères',
          'string.max': 'Le nom du contact d\'urgence ne peut pas dépasser 100 caractères',
          'any.required': 'Le nom du contact d\'urgence est requis'
        }),
      relationship: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'La relation doit contenir au moins 2 caractères',
          'string.max': 'La relation ne peut pas dépasser 50 caractères',
          'any.required': 'La relation est requise'
        }),
      phone: Joi.string()
        .pattern(/^(\+33|0)[1-9](\d{8})$/)
        .required()
        .messages({
          'string.pattern.base': 'Format de numéro de téléphone invalide',
          'any.required': 'Le numéro de téléphone du contact d\'urgence est requis'
        }),
      email: Joi.string()
        .email()
        .optional()
        .messages({
          'string.email': 'Format d\'email invalide'
        })
    }).required()
  }),

  update: Joi.object({
    level: Joi.string()
      .valid('L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3')
      .optional(),
    field: Joi.string()
      .min(2)
      .max(100)
      .optional(),
    specialization: Joi.string()
      .max(100)
      .optional(),
    currentSemester: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .optional(),
    academicStatus: Joi.string()
      .valid('actif', 'inactif', 'suspendu', 'diplômé', 'abandon')
      .optional(),
    tuitionStatus: Joi.string()
      .valid('à jour', 'en retard', 'exonéré')
      .optional()
  })
};

/**
 * Schémas de validation pour les cours
 */
const courseSchemas = {
  create: Joi.object({
    courseCode: Joi.string()
      .min(3)
      .max(20)
      .required()
      .messages({
        'string.min': 'Le code du cours doit contenir au moins 3 caractères',
        'string.max': 'Le code du cours ne peut pas dépasser 20 caractères',
        'any.required': 'Le code du cours est requis'
      }),
    title: Joi.string()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.min': 'Le titre doit contenir au moins 5 caractères',
        'string.max': 'Le titre ne peut pas dépasser 200 caractères',
        'any.required': 'Le titre est requis'
      }),
    description: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'La description doit contenir au moins 10 caractères',
        'string.max': 'La description ne peut pas dépasser 1000 caractères',
        'any.required': 'La description est requise'
      }),
    credits: Joi.number()
      .integer()
      .min(1)
      .max(30)
      .required()
      .messages({
        'number.base': 'Les crédits doivent être un nombre',
        'number.integer': 'Les crédits doivent être un entier',
        'number.min': 'Un cours doit avoir au moins 1 crédit',
        'number.max': 'Un cours ne peut pas avoir plus de 30 crédits',
        'any.required': 'Les crédits sont requis'
      }),
    level: Joi.string()
      .valid('L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3')
      .required()
      .messages({
        'any.only': 'Niveau académique invalide',
        'any.required': 'Le niveau académique est requis'
      }),
    field: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Le domaine d\'étude doit contenir au moins 2 caractères',
        'string.max': 'Le domaine d\'étude ne peut pas dépasser 100 caractères',
        'any.required': 'Le domaine d\'étude est requis'
      }),
    semester: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'Le semestre doit être un nombre',
        'number.integer': 'Le semestre doit être un entier',
        'number.min': 'Le semestre doit être au moins 1',
        'number.max': 'Le semestre ne peut pas dépasser 10',
        'any.required': 'Le semestre est requis'
      }),
    academicYear: Joi.number()
      .integer()
      .min(2000)
      .required()
      .messages({
        'number.base': 'L\'année académique doit être un nombre',
        'number.integer': 'L\'année académique doit être un entier',
        'number.min': 'L\'année académique doit être supérieure à 2000',
        'any.required': 'L\'année académique est requise'
      }),
    maxStudents: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Le nombre maximum d\'étudiants doit être un nombre',
        'number.integer': 'Le nombre maximum d\'étudiants doit être un entier',
        'number.min': 'La capacité doit être d\'au moins 1 étudiant'
      })
  }),

  update: Joi.object({
    title: Joi.string()
      .min(5)
      .max(200)
      .optional(),
    description: Joi.string()
      .min(10)
      .max(1000)
      .optional(),
    credits: Joi.number()
      .integer()
      .min(1)
      .max(30)
      .optional(),
    status: Joi.string()
      .valid('draft', 'active', 'inactive', 'archived')
      .optional(),
    isVisible: Joi.boolean()
      .optional()
  })
};

/**
 * Schémas de validation pour les notes
 */
const gradeSchemas = {
  create: Joi.object({
    evaluationType: Joi.string()
      .valid('examen_final', 'examen_partiel', 'tp', 'projet', 'participation', 'devoir', 'oral', 'autre')
      .required()
      .messages({
        'any.only': 'Type d\'évaluation invalide',
        'any.required': 'Le type d\'évaluation est requis'
      }),
    title: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Le titre doit contenir au moins 3 caractères',
        'string.max': 'Le titre ne peut pas dépasser 200 caractères',
        'any.required': 'Le titre est requis'
      }),
    grade: Joi.number()
      .min(0)
      .max(20)
      .required()
      .messages({
        'number.base': 'La note doit être un nombre',
        'number.min': 'La note ne peut pas être négative',
        'number.max': 'La note ne peut pas dépasser 20',
        'any.required': 'La note est requise'
      }),
    maxGrade: Joi.number()
      .min(1)
      .optional()
      .messages({
        'number.base': 'La note maximale doit être un nombre',
        'number.min': 'La note maximale doit être au moins 1'
      }),
    weight: Joi.number()
      .min(0)
      .max(100)
      .required()
      .messages({
        'number.base': 'Le poids doit être un nombre',
        'number.min': 'Le poids ne peut pas être négatif',
        'number.max': 'Le poids ne peut pas dépasser 100%',
        'any.required': 'Le poids est requis'
      }),
    evaluationDate: Joi.date()
      .required()
      .messages({
        'date.base': 'La date d\'évaluation doit être une date valide',
        'any.required': 'La date d\'évaluation est requise'
      }),
    academicYear: Joi.number()
      .integer()
      .min(2000)
      .required()
      .messages({
        'number.base': 'L\'année académique doit être un nombre',
        'number.integer': 'L\'année académique doit être un entier',
        'number.min': 'L\'année académique doit être supérieure à 2000',
        'any.required': 'L\'année académique est requise'
      }),
    semester: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'Le semestre doit être un nombre',
        'number.integer': 'Le semestre doit être un entier',
        'number.min': 'Le semestre doit être au moins 1',
        'number.max': 'Le semestre ne peut pas dépasser 10',
        'any.required': 'Le semestre est requis'
      })
  })
};

/**
 * Schémas de validation pour les présences
 */
const absenceSchemas = {
  create: Joi.object({
    sessionDate: Joi.date()
      .required()
      .messages({
        'date.base': 'La date de session doit être une date valide',
        'any.required': 'La date de session est requise'
      }),
    sessionType: Joi.string()
      .valid('cours', 'td', 'tp', 'examen', 'autre')
      .required()
      .messages({
        'any.only': 'Type de session invalide',
        'any.required': 'Le type de session est requis'
      }),
    startTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Format d\'heure invalide (HH:MM)',
        'any.required': 'L\'heure de début est requise'
      }),
    endTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Format d\'heure invalide (HH:MM)',
        'any.required': 'L\'heure de fin est requise'
      }),
    status: Joi.string()
      .valid('present', 'absent', 'late', 'excused', 'partial')
      .required()
      .messages({
        'any.only': 'Statut de présence invalide',
        'any.required': 'Le statut de présence est requis'
      }),
    academicYear: Joi.number()
      .integer()
      .min(2000)
      .required()
      .messages({
        'number.base': 'L\'année académique doit être un nombre',
        'number.integer': 'L\'année académique doit être un entier',
        'number.min': 'L\'année académique doit être supérieure à 2000',
        'any.required': 'L\'année académique est requise'
      }),
    semester: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'Le semestre doit être un nombre',
        'number.integer': 'Le semestre doit être un entier',
        'number.min': 'Le semestre doit être au moins 1',
        'number.max': 'Le semestre ne peut pas dépasser 10',
        'any.required': 'Le semestre est requis'
      })
  })
};

/**
 * Schémas de validation pour les paramètres de requête
 */
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Le numéro de page doit être un nombre',
        'number.integer': 'Le numéro de page doit être un entier',
        'number.min': 'Le numéro de page doit être au moins 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'La limite doit être un nombre',
        'number.integer': 'La limite doit être un entier',
        'number.min': 'La limite doit être au moins 1',
        'number.max': 'La limite ne peut pas dépasser 100'
      }),
    sort: Joi.string()
      .optional(),
    order: Joi.string()
      .valid('asc', 'desc')
      .default('asc')
      .messages({
        'any.only': 'L\'ordre doit être asc ou desc'
      })
  }),

  search: Joi.object({
    q: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Le terme de recherche doit contenir au moins 2 caractères',
        'string.max': 'Le terme de recherche ne peut pas dépasser 100 caractères'
      }),
    field: Joi.string()
      .optional(),
    level: Joi.string()
      .valid('L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3')
      .optional(),
    status: Joi.string()
      .optional(),
    academicYear: Joi.number()
      .integer()
      .min(2000)
      .optional()
  })
};

module.exports = {
  validate,
  authSchemas,
  studentSchemas,
  courseSchemas,
  gradeSchemas,
  absenceSchemas,
  querySchemas
};