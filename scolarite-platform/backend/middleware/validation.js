const { validationResult } = require('express-validator');

// Middleware de validation des résultats
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      error: 'Données invalides',
      message: 'Veuillez corriger les erreurs de validation',
      details: errorMessages
    });
  }

  next();
};

// Middleware de validation des IDs
const validateId = (req, res, next) => {
  const id = req.params.id || req.body.id;
  
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({
      error: 'ID invalide',
      message: 'L\'ID doit être un nombre entier positif'
    });
  }

  req.validatedId = parseInt(id);
  next();
};

// Middleware de validation des paginations
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'Paramètres de pagination invalides',
      message: 'La page doit être >= 1 et la limite entre 1 et 100'
    });
  }

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };
  
  next();
};

// Middleware de validation des filtres
const validateFilters = (req, res, next) => {
  const filters = {};
  const allowedFilters = ['status', 'level', 'semester', 'academic_year', 'department', 'type'];
  
  // Filtrer les paramètres de requête autorisés
  Object.keys(req.query).forEach(key => {
    if (allowedFilters.includes(key) && req.query[key]) {
      filters[key] = req.query[key];
    }
  });

  req.filters = filters;
  next();
};

// Middleware de validation des dates
const validateDateRange = (req, res, next) => {
  const { start_date, end_date } = req.body;
  
  if (start_date && end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Dates invalides',
        message: 'Les dates doivent être au format YYYY-MM-DD'
      });
    }
    
    if (start >= end) {
      return res.status(400).json({
        error: 'Plage de dates invalide',
        message: 'La date de début doit être antérieure à la date de fin'
      });
    }
  }
  
  next();
};

// Middleware de validation des fichiers
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'Fichier manquant',
        message: 'Veuillez sélectionner un fichier à télécharger'
      });
    }

    // Vérifier le type de fichier
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Type de fichier non autorisé',
        message: `Types autorisés: ${allowedTypes.join(', ')}`
      });
    }

    // Vérifier la taille du fichier
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'Fichier trop volumineux',
        message: `La taille maximale autorisée est de ${Math.round(maxSize / (1024 * 1024))} MB`
      });
    }

    next();
  };
};

// Middleware de validation des emails
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email invalide',
        message: 'Veuillez fournir une adresse email valide'
      });
    }
  }
  
  next();
};

// Middleware de validation des mots de passe
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }
    
    // Vérifier la complexité du mot de passe
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({
        error: 'Mot de passe insuffisamment complexe',
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      });
    }
  }
  
  next();
};

module.exports = {
  validate,
  validateId,
  validatePagination,
  validateFilters,
  validateDateRange,
  validateFileUpload,
  validateEmail,
  validatePassword
};