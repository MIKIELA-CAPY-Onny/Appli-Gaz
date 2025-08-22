/**
 * Fonctions utilitaires générales
 * Contient des helpers pour diverses opérations
 */

/**
 * Formater une date au format français
 * @param {Date|string} date - Date à formater
 * @param {Object} options - Options de formatage
 * @returns {string} - Date formatée
 */
function formatDate(date, options = {}) {
    const {
        locale = 'fr-FR',
        dateStyle = 'medium',
        timeStyle = null,
        includeTime = false
    } = options;

    if (!date) return '';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Date invalide';

    const formatOptions = { dateStyle };
    if (includeTime || timeStyle) {
        formatOptions.timeStyle = timeStyle || 'short';
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Formater un nom complet
 * @param {string} firstName - Prénom
 * @param {string} lastName - Nom
 * @param {Object} options - Options de formatage
 * @returns {string} - Nom formaté
 */
function formatFullName(firstName, lastName, options = {}) {
    const {
        order = 'first-last', // 'first-last' ou 'last-first'
        uppercase = false,
        separator = ' '
    } = options;

    if (!firstName && !lastName) return '';

    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';

    let fullName = order === 'last-first' 
        ? `${last}${separator}${first}`
        : `${first}${separator}${last}`;

    return uppercase ? fullName.toUpperCase() : fullName;
}

/**
 * Générer un mot de passe aléatoire
 * @param {number} length - Longueur du mot de passe
 * @param {Object} options - Options de génération
 * @returns {string} - Mot de passe généré
 */
function generatePassword(length = 12, options = {}) {
    const {
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSymbols = false,
        excludeSimilar = true
    } = options;

    let charset = '';
    
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
        charset = charset.replace(/[0oO1lI]/g, '');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
}

/**
 * Calculer l'âge à partir d'une date de naissance
 * @param {Date|string} birthDate - Date de naissance
 * @returns {number} - Âge en années
 */
function calculateAge(birthDate) {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const today = new Date();
    
    if (isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Générer une année académique
 * @param {number} startYear - Année de début (optionnel, par défaut année actuelle)
 * @returns {string} - Année académique (format: 2023-2024)
 */
function generateAcademicYear(startYear = null) {
    const year = startYear || new Date().getFullYear();
    return `${year}-${year + 1}`;
}

/**
 * Vérifier si une année académique est valide
 * @param {string} academicYear - Année académique à vérifier
 * @returns {boolean} - True si valide
 */
function isValidAcademicYear(academicYear) {
    if (!academicYear || typeof academicYear !== 'string') return false;

    const pattern = /^\d{4}-\d{4}$/;
    if (!pattern.test(academicYear)) return false;

    const [startYear, endYear] = academicYear.split('-').map(Number);
    return endYear === startYear + 1;
}

/**
 * Obtenir l'année académique actuelle
 * @returns {string} - Année académique actuelle
 */
function getCurrentAcademicYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() retourne 0-11

    // Si on est entre janvier et août, on est dans la deuxième partie de l'année académique
    if (currentMonth <= 8) {
        return `${currentYear - 1}-${currentYear}`;
    } else {
        return `${currentYear}-${currentYear + 1}`;
    }
}

/**
 * Formater une note avec mention
 * @param {number} grade - Note sur 20
 * @returns {Object} - Note formatée avec mention
 */
function formatGradeWithMention(grade) {
    if (grade === null || grade === undefined) {
        return { grade: null, mention: null, status: 'Non noté' };
    }

    const numGrade = parseFloat(grade);
    let mention, status;

    if (numGrade >= 16) {
        mention = 'Très Bien';
        status = 'Validé';
    } else if (numGrade >= 14) {
        mention = 'Bien';
        status = 'Validé';
    } else if (numGrade >= 12) {
        mention = 'Assez Bien';
        status = 'Validé';
    } else if (numGrade >= 10) {
        mention = 'Passable';
        status = 'Validé';
    } else {
        mention = 'Insuffisant';
        status = 'Non validé';
    }

    return {
        grade: numGrade.toFixed(2),
        mention,
        status
    };
}

/**
 * Calculer la moyenne pondérée
 * @param {Array} grades - Tableau de notes avec coefficients
 * @returns {number} - Moyenne pondérée
 */
function calculateWeightedAverage(grades) {
    if (!Array.isArray(grades) || grades.length === 0) return null;

    let totalPoints = 0;
    let totalCoefficients = 0;

    grades.forEach(grade => {
        const coefficient = grade.coefficient || 1;
        totalPoints += (grade.grade * coefficient);
        totalCoefficients += coefficient;
    });

    if (totalCoefficients === 0) return null;

    return parseFloat((totalPoints / totalCoefficients).toFixed(2));
}

/**
 * Paginer un tableau
 * @param {Array} array - Tableau à paginer
 * @param {number} page - Numéro de page (1-based)
 * @param {number} limit - Nombre d'éléments par page
 * @returns {Object} - Résultat paginé
 */
function paginate(array, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const paginatedItems = array.slice(offset, offset + limit);
    const total = array.length;
    const totalPages = Math.ceil(total / limit);

    return {
        data: paginatedItems,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
}

/**
 * Slugifier une chaîne de caractères
 * @param {string} text - Texte à slugifier
 * @returns {string} - Slug généré
 */
function slugify(text) {
    if (!text) return '';

    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-') // Remplacer espaces et caractères spéciaux par des tirets
        .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
}

/**
 * Générer un code unique
 * @param {string} prefix - Préfixe du code
 * @param {number} length - Longueur de la partie numérique
 * @returns {string} - Code généré
 */
function generateUniqueCode(prefix = 'CODE', length = 6) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substr(2, length - 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si valide
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valider un numéro de téléphone français
 * @param {string} phone - Numéro à valider
 * @returns {boolean} - True si valide
 */
function isValidFrenchPhone(phone) {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
}

/**
 * Nettoyer et formater un numéro de téléphone
 * @param {string} phone - Numéro à nettoyer
 * @returns {string} - Numéro formaté
 */
function cleanPhoneNumber(phone) {
    if (!phone) return '';

    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Convertir format international vers format local
    if (cleaned.startsWith('+33')) {
        cleaned = '0' + cleaned.slice(3);
    } else if (cleaned.startsWith('0033')) {
        cleaned = '0' + cleaned.slice(4);
    }

    return cleaned;
}

/**
 * Capitaliser la première lettre de chaque mot
 * @param {string} text - Texte à capitaliser
 * @returns {string} - Texte capitalisé
 */
function capitalizeWords(text) {
    if (!text) return '';

    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Générer un résumé de texte
 * @param {string} text - Texte à résumer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} - Résumé
 */
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;

    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Convertir des octets en format lisible
 * @param {number} bytes - Nombre d'octets
 * @param {number} decimals - Nombre de décimales
 * @returns {string} - Taille formatée
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Générer une couleur aléatoire (hex)
 * @returns {string} - Couleur hex
 */
function generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Vérifier si une date est un jour ouvrable
 * @param {Date} date - Date à vérifier
 * @returns {boolean} - True si jour ouvrable
 */
function isWorkingDay(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = dimanche, 6 = samedi
}

/**
 * Calculer le nombre de jours ouvrables entre deux dates
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {number} - Nombre de jours ouvrables
 */
function countWorkingDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
        if (isWorkingDay(current)) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    
    return count;
}

/**
 * Générer des initiales à partir d'un nom
 * @param {string} firstName - Prénom
 * @param {string} lastName - Nom
 * @returns {string} - Initiales
 */
function generateInitials(firstName, lastName) {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
}

/**
 * Valider et nettoyer les données de pagination
 * @param {Object} query - Paramètres de requête
 * @returns {Object} - Paramètres nettoyés
 */
function cleanPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    
    return { page, limit };
}

/**
 * Créer une réponse API standardisée
 * @param {boolean} success - Succès de l'opération
 * @param {any} data - Données à retourner
 * @param {string} message - Message descriptif
 * @param {Object} meta - Métadonnées supplémentaires
 * @returns {Object} - Réponse formatée
 */
function createApiResponse(success, data = null, message = '', meta = {}) {
    const response = {
        success,
        timestamp: new Date().toISOString(),
        ...meta
    };

    if (message) {
        response.message = message;
    }

    if (data !== null) {
        response.data = data;
    }

    return response;
}

/**
 * Convertir une chaîne en nombre sécurisé
 * @param {any} value - Valeur à convertir
 * @param {number} defaultValue - Valeur par défaut
 * @returns {number} - Nombre converti
 */
function safeParseInt(value, defaultValue = 0) {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Convertir une chaîne en nombre décimal sécurisé
 * @param {any} value - Valeur à convertir
 * @param {number} defaultValue - Valeur par défaut
 * @returns {number} - Nombre converti
 */
function safeParseFloat(value, defaultValue = 0.0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Générer un hash simple pour les caches
 * @param {string} input - Chaîne à hasher
 * @returns {string} - Hash généré
 */
function simpleHash(input) {
    let hash = 0;
    if (input.length === 0) return hash.toString();
    
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir en 32bit integer
    }
    
    return Math.abs(hash).toString(36);
}

/**
 * Débounce une fonction
 * @param {Function} func - Fonction à débouncer
 * @param {number} wait - Délai en millisecondes
 * @returns {Function} - Fonction débouncée
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Grouper un tableau par une propriété
 * @param {Array} array - Tableau à grouper
 * @param {string|Function} key - Clé ou fonction de groupement
 * @returns {Object} - Objet groupé
 */
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = typeof key === 'function' ? key(item) : item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
}

/**
 * Retirer les doublons d'un tableau
 * @param {Array} array - Tableau avec doublons
 * @param {string} key - Clé pour identifier les doublons (optionnel)
 * @returns {Array} - Tableau sans doublons
 */
function removeDuplicates(array, key = null) {
    if (!key) {
        return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

/**
 * Attendre un délai (pour les tests ou rate limiting)
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise} - Promise qui se résout après le délai
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Vérifier si un objet est vide
 * @param {Object} obj - Objet à vérifier
 * @returns {boolean} - True si vide
 */
function isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    return Object.keys(obj).length === 0;
}

/**
 * Fusionner des objets de manière profonde
 * @param {Object} target - Objet cible
 * @param {...Object} sources - Objets sources
 * @returns {Object} - Objet fusionné
 */
function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

/**
 * Vérifier si une valeur est un objet
 * @param {any} item - Valeur à vérifier
 * @returns {boolean} - True si objet
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

module.exports = {
    // Formatage
    formatDate,
    formatFullName,
    formatGradeWithMention,
    formatBytes,
    
    // Génération
    generatePassword,
    generateAcademicYear,
    generateUniqueCode,
    generateRandomColor,
    generateInitials,
    
    // Validation
    isValidEmail,
    isValidFrenchPhone,
    isValidAcademicYear,
    
    // Calculs
    calculateAge,
    calculateWeightedAverage,
    countWorkingDays,
    
    // Utilitaires de date
    getCurrentAcademicYear,
    isWorkingDay,
    
    // Utilitaires de chaîne
    capitalizeWords,
    truncateText,
    slugify,
    cleanPhoneNumber,
    
    // Utilitaires de tableau/objet
    paginate,
    groupBy,
    removeDuplicates,
    isEmpty,
    deepMerge,
    isObject,
    
    // Utilitaires numériques
    safeParseInt,
    safeParseFloat,
    
    // Utilitaires API
    createApiResponse,
    cleanPaginationParams,
    
    // Utilitaires système
    sleep,
    debounce,
    simpleHash
};