/**
 * Fonctions utilitaires pour l'application
 */

/**
 * Génère un ID unique
 * @param {string} prefix - Préfixe pour l'ID
 * @param {number} length - Longueur de la partie aléatoire
 * @returns {string} ID unique
 */
const generateUniqueId = (prefix = 'ID', length = 8) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

/**
 * Formate une date en format lisible
 * @param {Date|string} date - Date à formater
 * @param {string} locale - Locale pour le formatage
 * @returns {string} Date formatée
 */
const formatDate = (date, locale = 'fr-FR') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate un nombre en format français
 * @param {number} number - Nombre à formater
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Nombre formaté
 */
const formatNumber = (number, decimals = 2) => {
  if (typeof number !== 'number' || isNaN(number)) return '0';
  
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param {Date|string} birthDate - Date de naissance
 * @returns {number} Âge calculé
 */
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) return null;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Vérifie si une chaîne est un email valide
 * @param {string} email - Email à vérifier
 * @returns {boolean} True si l'email est valide
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Vérifie si une chaîne est un numéro de téléphone français valide
 * @param {string} phone - Numéro de téléphone à vérifier
 * @returns {boolean} True si le numéro est valide
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  return phoneRegex.test(phone);
};

/**
 * Nettoie et normalise une chaîne de caractères
 * @param {string} str - Chaîne à nettoyer
 * @returns {string} Chaîne nettoyée
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .replace(/[<>]/g, '') // Supprimer les caractères potentiellement dangereux
    .normalize('NFD') // Normaliser les caractères accentués
    .replace(/[\u0300-\u036f]/g, ''); // Supprimer les diacritiques
};

/**
 * Génère un slug à partir d'une chaîne
 * @param {string} str - Chaîne à convertir en slug
 * @returns {string} Slug généré
 */
const generateSlug = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Pagine un tableau de résultats
 * @param {Array} data - Données à paginer
 * @param {number} page - Numéro de page
 * @param {number} limit - Nombre d'éléments par page
 * @returns {Object} Objet avec les données paginées et les métadonnées
 */
const paginateResults = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const results = data.slice(startIndex, endIndex);
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    results,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
};

/**
 * Trie un tableau d'objets selon un critère
 * @param {Array} data - Données à trier
 * @param {string} sortBy - Champ de tri
 * @param {string} order - Ordre de tri ('asc' ou 'desc')
 * @returns {Array} Tableau trié
 */
const sortResults = (data, sortBy = 'createdAt', order = 'asc') => {
  if (!Array.isArray(data) || data.length === 0) return data;
  
  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Gérer les valeurs nulles/undefined
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    // Gérer les dates
    if (aValue instanceof Date) aValue = aValue.getTime();
    if (bValue instanceof Date) bValue = bValue.getTime();
    
    // Gérer les chaînes
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (order === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });
  
  return sortedData;
};

/**
 * Filtre un tableau d'objets selon des critères
 * @param {Array} data - Données à filtrer
 * @param {Object} filters - Critères de filtrage
 * @returns {Array} Tableau filtré
 */
const filterResults = (data, filters = {}) => {
  if (!Array.isArray(data) || data.length === 0) return data;
  
  return data.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key];
      const itemValue = item[key];
      
      // Si le filtre est vide, ignorer
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        return true;
      }
      
      // Filtre de recherche textuelle
      if (typeof filterValue === 'string' && filterValue.length > 0) {
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(filterValue.toLowerCase());
        }
        return false;
      }
      
      // Filtre exact
      return itemValue === filterValue;
    });
  });
};

/**
 * Calcule la moyenne d'un tableau de nombres
 * @param {Array} numbers - Tableau de nombres
 * @returns {number} Moyenne calculée
 */
const calculateAverage = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  
  const sum = validNumbers.reduce((acc, num) => acc + num, 0);
  return sum / validNumbers.length;
};

/**
 * Calcule le pourcentage de réussite
 * @param {number} passed - Nombre de réussites
 * @param {number} total - Nombre total
 * @returns {number} Pourcentage de réussite
 */
const calculatePassRate = (passed, total) => {
  if (total === 0) return 0;
  return Math.round((passed / total) * 100);
};

/**
 * Vérifie si une date est dans le passé
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} True si la date est dans le passé
 */
const isPastDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  return dateObj < new Date();
};

/**
 * Vérifie si une date est dans le futur
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} True si la date est dans le futur
 */
const isFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  return dateObj > new Date();
};

/**
 * Calcule la différence entre deux dates en jours
 * @param {Date|string} date1 - Première date
 * @param {Date|string} date2 - Deuxième date
 * @returns {number} Différence en jours
 */
const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Génère un nom de fichier sécurisé
 * @param {string} originalName - Nom original du fichier
 * @param {string} extension - Extension du fichier
 * @returns {string} Nom de fichier sécurisé
 */
const generateSecureFileName = (originalName, extension) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const sanitizedName = sanitizeString(originalName)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);
  
  return `${sanitizedName}_${timestamp}_${random}.${extension}`;
};

/**
 * Valide un code postal français
 * @param {string} postalCode - Code postal à valider
 * @returns {boolean} True si le code postal est valide
 */
const isValidFrenchPostalCode = (postalCode) => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Formate un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à formater
 * @returns {string} Numéro formaté
 */
const formatFrenchPhone = (phone) => {
  if (!phone) return '';
  
  // Nettoyer le numéro
  const cleaned = phone.replace(/\D/g, '');
  
  // Vérifier la longueur
  if (cleaned.length !== 10 && cleaned.length !== 11) return phone;
  
  // Formater selon la longueur
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else {
    return cleaned.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5 $6');
  }
};

/**
 * Vérifie si une chaîne contient des caractères spéciaux
 * @param {string} str - Chaîne à vérifier
 * @returns {boolean} True si la chaîne contient des caractères spéciaux
 */
const containsSpecialCharacters = (str) => {
  if (typeof str !== 'string') return false;
  
  const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  return specialCharsRegex.test(str);
};

/**
 * Limite la longueur d'une chaîne et ajoute des points de suspension
 * @param {string} str - Chaîne à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Chaîne tronquée
 */
const truncateString = (str, maxLength = 100) => {
  if (!str || typeof str !== 'string') return '';
  
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength - 3) + '...';
};

module.exports = {
  generateUniqueId,
  formatDate,
  formatNumber,
  calculateAge,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  generateSlug,
  paginateResults,
  sortResults,
  filterResults,
  calculateAverage,
  calculatePassRate,
  isPastDate,
  isFutureDate,
  getDaysDifference,
  generateSecureFileName,
  isValidFrenchPostalCode,
  formatFrenchPhone,
  containsSpecialCharacters,
  truncateString
};