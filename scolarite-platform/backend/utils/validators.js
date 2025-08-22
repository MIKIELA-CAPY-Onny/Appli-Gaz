/**
 * Validateurs personnalisés
 * Contient des fonctions de validation spécifiques au domaine métier
 */

/**
 * Validateurs pour les données utilisateur
 */
const userValidators = {
    /**
     * Valider un email universitaire
     * @param {string} email - Email à valider
     * @returns {boolean} - True si valide
     */
    isUniversityEmail(email) {
        if (!email) return false;
        
        const universityDomains = [
            'university.com',
            'univ.fr',
            'edu.fr',
            'ac.fr'
        ];
        
        const domain = email.split('@')[1]?.toLowerCase();
        return universityDomains.some(uniDomain => 
            domain === uniDomain || domain?.endsWith('.' + uniDomain)
        );
    },

    /**
     * Valider la force d'un mot de passe
     * @param {string} password - Mot de passe à valider
     * @returns {Object} - Résultat de validation avec score
     */
    validatePasswordStrength(password) {
        if (!password) {
            return { isValid: false, score: 0, message: 'Mot de passe requis' };
        }

        let score = 0;
        const feedback = [];

        // Longueur minimale
        if (password.length >= 8) {
            score += 2;
        } else {
            feedback.push('Au moins 8 caractères');
        }

        // Majuscules
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Au moins une majuscule');
        }

        // Minuscules
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Au moins une minuscule');
        }

        // Chiffres
        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('Au moins un chiffre');
        }

        // Caractères spéciaux
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Au moins un caractère spécial');
        }

        // Pas de séquences communes
        const commonSequences = ['123', 'abc', 'qwerty', 'password', 'admin'];
        const hasCommonSequence = commonSequences.some(seq => 
            password.toLowerCase().includes(seq)
        );
        
        if (hasCommonSequence) {
            score -= 2;
            feedback.push('Éviter les séquences communes');
        }

        const strength = score >= 5 ? 'Fort' : score >= 3 ? 'Moyen' : 'Faible';
        
        return {
            isValid: score >= 3,
            score,
            strength,
            feedback,
            message: feedback.length > 0 ? feedback.join(', ') : 'Mot de passe valide'
        };
    },

    /**
     * Valider un nom (prénom ou nom de famille)
     * @param {string} name - Nom à valider
     * @returns {Object} - Résultat de validation
     */
    validateName(name) {
        if (!name || typeof name !== 'string') {
            return { isValid: false, message: 'Nom requis' };
        }

        const trimmed = name.trim();
        
        if (trimmed.length < 2) {
            return { isValid: false, message: 'Nom trop court (min 2 caractères)' };
        }

        if (trimmed.length > 100) {
            return { isValid: false, message: 'Nom trop long (max 100 caractères)' };
        }

        // Autoriser lettres, espaces, tirets et apostrophes
        if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmed)) {
            return { isValid: false, message: 'Nom contient des caractères invalides' };
        }

        return { isValid: true, message: 'Nom valide' };
    }
};

/**
 * Validateurs pour les données académiques
 */
const academicValidators = {
    /**
     * Valider un niveau d'études
     * @param {string} level - Niveau à valider
     * @returns {boolean} - True si valide
     */
    isValidLevel(level) {
        const validLevels = ['L1', 'L2', 'L3', 'M1', 'M2'];
        return validLevels.includes(level);
    },

    /**
     * Valider un semestre
     * @param {string} semester - Semestre à valider
     * @returns {boolean} - True si valide
     */
    isValidSemester(semester) {
        const validSemesters = ['S1', 'S2'];
        return validSemesters.includes(semester);
    },

    /**
     * Valider une année académique
     * @param {string} academicYear - Année académique
     * @returns {Object} - Résultat de validation
     */
    validateAcademicYear(academicYear) {
        if (!academicYear) {
            return { isValid: false, message: 'Année académique requise' };
        }

        const pattern = /^\d{4}-\d{4}$/;
        if (!pattern.test(academicYear)) {
            return { 
                isValid: false, 
                message: 'Format d\'année académique invalide (attendu: YYYY-YYYY)' 
            };
        }

        const [startYear, endYear] = academicYear.split('-').map(Number);
        
        if (endYear !== startYear + 1) {
            return { 
                isValid: false, 
                message: 'L\'année de fin doit être consécutive à l\'année de début' 
            };
        }

        const currentYear = new Date().getFullYear();
        if (startYear < currentYear - 10 || startYear > currentYear + 5) {
            return { 
                isValid: false, 
                message: 'Année académique hors de la plage autorisée' 
            };
        }

        return { isValid: true, message: 'Année académique valide' };
    },

    /**
     * Valider un code de cours
     * @param {string} courseCode - Code du cours
     * @returns {Object} - Résultat de validation
     */
    validateCourseCode(courseCode) {
        if (!courseCode) {
            return { isValid: false, message: 'Code de cours requis' };
        }

        const trimmed = courseCode.trim().toUpperCase();
        
        if (trimmed.length < 3 || trimmed.length > 10) {
            return { 
                isValid: false, 
                message: 'Code de cours invalide (3-10 caractères)' 
            };
        }

        if (!/^[A-Z0-9]+$/.test(trimmed)) {
            return { 
                isValid: false, 
                message: 'Code de cours invalide (lettres majuscules et chiffres uniquement)' 
            };
        }

        return { isValid: true, message: 'Code de cours valide', cleaned: trimmed };
    },

    /**
     * Valider une note
     * @param {number} grade - Note à valider
     * @param {number} maxGrade - Note maximale
     * @returns {Object} - Résultat de validation
     */
    validateGrade(grade, maxGrade = 20) {
        if (grade === null || grade === undefined) {
            return { isValid: false, message: 'Note requise' };
        }

        const numGrade = parseFloat(grade);
        const numMaxGrade = parseFloat(maxGrade);

        if (isNaN(numGrade)) {
            return { isValid: false, message: 'Note doit être un nombre' };
        }

        if (isNaN(numMaxGrade) || numMaxGrade <= 0) {
            return { isValid: false, message: 'Note maximale invalide' };
        }

        if (numGrade < 0) {
            return { isValid: false, message: 'Note ne peut pas être négative' };
        }

        if (numGrade > numMaxGrade) {
            return { 
                isValid: false, 
                message: `Note ne peut pas dépasser ${numMaxGrade}` 
            };
        }

        return { 
            isValid: true, 
            message: 'Note valide',
            normalized: parseFloat(((numGrade / numMaxGrade) * 20).toFixed(2))
        };
    },

    /**
     * Valider un coefficient
     * @param {number} coefficient - Coefficient à valider
     * @returns {Object} - Résultat de validation
     */
    validateCoefficient(coefficient) {
        if (coefficient === null || coefficient === undefined) {
            return { isValid: true, message: 'Coefficient par défaut (1.0)', value: 1.0 };
        }

        const numCoeff = parseFloat(coefficient);

        if (isNaN(numCoeff)) {
            return { isValid: false, message: 'Coefficient doit être un nombre' };
        }

        if (numCoeff <= 0 || numCoeff > 10) {
            return { isValid: false, message: 'Coefficient invalide (0.1-10)' };
        }

        return { 
            isValid: true, 
            message: 'Coefficient valide',
            value: parseFloat(numCoeff.toFixed(2))
        };
    }
};

/**
 * Validateurs pour les données temporelles
 */
const dateValidators = {
    /**
     * Valider une date de naissance
     * @param {string|Date} birthDate - Date de naissance
     * @returns {Object} - Résultat de validation
     */
    validateBirthDate(birthDate) {
        if (!birthDate) {
            return { isValid: true, message: 'Date de naissance optionnelle' };
        }

        const date = new Date(birthDate);
        
        if (isNaN(date.getTime())) {
            return { isValid: false, message: 'Date de naissance invalide' };
        }

        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();

        if (date > today) {
            return { isValid: false, message: 'Date de naissance ne peut pas être dans le futur' };
        }

        if (age < 15 || age > 100) {
            return { 
                isValid: false, 
                message: 'Âge invalide (doit être entre 15 et 100 ans)' 
            };
        }

        return { 
            isValid: true, 
            message: 'Date de naissance valide',
            age 
        };
    },

    /**
     * Valider une date d'inscription
     * @param {string|Date} enrollmentDate - Date d'inscription
     * @returns {Object} - Résultat de validation
     */
    validateEnrollmentDate(enrollmentDate) {
        if (!enrollmentDate) {
            return { isValid: true, message: 'Date d\'inscription par défaut (aujourd\'hui)' };
        }

        const date = new Date(enrollmentDate);
        
        if (isNaN(date.getTime())) {
            return { isValid: false, message: 'Date d\'inscription invalide' };
        }

        const today = new Date();
        const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
        const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

        if (date < fiveYearsAgo || date > oneYearFromNow) {
            return { 
                isValid: false, 
                message: 'Date d\'inscription hors de la plage autorisée (5 ans passés - 1 an futur)' 
            };
        }

        return { isValid: true, message: 'Date d\'inscription valide' };
    },

    /**
     * Valider une date d'absence
     * @param {string|Date} absenceDate - Date d'absence
     * @returns {Object} - Résultat de validation
     */
    validateAbsenceDate(absenceDate) {
        if (!absenceDate) {
            return { isValid: false, message: 'Date d\'absence requise' };
        }

        const date = new Date(absenceDate);
        
        if (isNaN(date.getTime())) {
            return { isValid: false, message: 'Date d\'absence invalide' };
        }

        const today = new Date();
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

        if (date > today) {
            return { isValid: false, message: 'Date d\'absence ne peut pas être dans le futur' };
        }

        if (date < threeMonthsAgo) {
            return { 
                isValid: false, 
                message: 'Date d\'absence trop ancienne (max 3 mois)' 
            };
        }

        return { isValid: true, message: 'Date d\'absence valide' };
    }
};

/**
 * Validateurs pour les données numériques
 */
const numericValidators = {
    /**
     * Valider des crédits ECTS
     * @param {number} credits - Crédits à valider
     * @returns {Object} - Résultat de validation
     */
    validateCredits(credits) {
        if (credits === null || credits === undefined) {
            return { isValid: true, message: 'Crédits par défaut (3)', value: 3 };
        }

        const numCredits = parseInt(credits);

        if (isNaN(numCredits)) {
            return { isValid: false, message: 'Crédits doivent être un nombre entier' };
        }

        if (numCredits < 1 || numCredits > 20) {
            return { isValid: false, message: 'Crédits invalides (1-20)' };
        }

        return { 
            isValid: true, 
            message: 'Crédits valides',
            value: numCredits
        };
    },

    /**
     * Valider des heures d'enseignement
     * @param {number} hours - Heures à valider
     * @param {string} type - Type d'heures (total, cm, td, tp)
     * @returns {Object} - Résultat de validation
     */
    validateHours(hours, type = 'total') {
        if (hours === null || hours === undefined) {
            if (type === 'total') {
                return { isValid: false, message: 'Heures totales requises' };
            }
            return { isValid: true, message: 'Heures optionnelles', value: 0 };
        }

        const numHours = parseInt(hours);

        if (isNaN(numHours)) {
            return { isValid: false, message: 'Heures doivent être un nombre entier' };
        }

        if (numHours < 0) {
            return { isValid: false, message: 'Heures ne peuvent pas être négatives' };
        }

        const maxHours = type === 'total' ? 200 : 100;
        if (numHours > maxHours) {
            return { 
                isValid: false, 
                message: `Heures ${type} trop élevées (max ${maxHours})` 
            };
        }

        return { 
            isValid: true, 
            message: `Heures ${type} valides`,
            value: numHours
        };
    },

    /**
     * Valider la durée d'une absence
     * @param {number} duration - Durée en heures
     * @returns {Object} - Résultat de validation
     */
    validateAbsenceDuration(duration) {
        if (duration === null || duration === undefined) {
            return { isValid: true, message: 'Durée par défaut (1h)', value: 1.0 };
        }

        const numDuration = parseFloat(duration);

        if (isNaN(numDuration)) {
            return { isValid: false, message: 'Durée doit être un nombre' };
        }

        if (numDuration <= 0) {
            return { isValid: false, message: 'Durée doit être positive' };
        }

        if (numDuration > 24) {
            return { isValid: false, message: 'Durée ne peut pas dépasser 24 heures' };
        }

        return { 
            isValid: true, 
            message: 'Durée valide',
            value: parseFloat(numDuration.toFixed(1))
        };
    }
};

/**
 * Validateurs pour les formats spécifiques
 */
const formatValidators = {
    /**
     * Valider un numéro étudiant
     * @param {string} studentNumber - Numéro étudiant
     * @returns {Object} - Résultat de validation
     */
    validateStudentNumber(studentNumber) {
        if (!studentNumber) {
            return { isValid: false, message: 'Numéro étudiant requis' };
        }

        const pattern = /^ETU\d{7}$/; // Format: ETU2024001
        
        if (!pattern.test(studentNumber)) {
            return { 
                isValid: false, 
                message: 'Format de numéro étudiant invalide (attendu: ETUyyyynnn)' 
            };
        }

        return { isValid: true, message: 'Numéro étudiant valide' };
    },

    /**
     * Valider un numéro d'employé
     * @param {string} employeeNumber - Numéro d'employé
     * @returns {Object} - Résultat de validation
     */
    validateEmployeeNumber(employeeNumber) {
        if (!employeeNumber) {
            return { isValid: false, message: 'Numéro d\'employé requis' };
        }

        const patterns = [
            /^PROF\d{3}$/, // Format: PROF001
            /^ADM\d{3}$/   // Format: ADM001
        ];
        
        const isValid = patterns.some(pattern => pattern.test(employeeNumber));
        
        if (!isValid) {
            return { 
                isValid: false, 
                message: 'Format de numéro d\'employé invalide (attendu: PROFnnn ou ADMnnn)' 
            };
        }

        return { isValid: true, message: 'Numéro d\'employé valide' };
    },

    /**
     * Valider une heure (format HH:MM)
     * @param {string} time - Heure à valider
     * @returns {Object} - Résultat de validation
     */
    validateTime(time) {
        if (!time) {
            return { isValid: true, message: 'Heure optionnelle' };
        }

        const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (!timePattern.test(time)) {
            return { 
                isValid: false, 
                message: 'Format d\'heure invalide (attendu: HH:MM)' 
            };
        }

        return { isValid: true, message: 'Heure valide' };
    }
};

/**
 * Validateurs composés pour les entités complètes
 */
const entityValidators = {
    /**
     * Valider les données complètes d'un étudiant
     * @param {Object} studentData - Données de l'étudiant
     * @returns {Object} - Résultat de validation
     */
    validateStudentData(studentData) {
        const errors = [];
        const warnings = [];

        // Validation du nom
        const nameValidation = userValidators.validateName(studentData.first_name);
        if (!nameValidation.isValid) {
            errors.push(`Prénom: ${nameValidation.message}`);
        }

        const lastNameValidation = userValidators.validateName(studentData.last_name);
        if (!lastNameValidation.isValid) {
            errors.push(`Nom: ${lastNameValidation.message}`);
        }

        // Validation de l'email
        if (!studentData.email || !userValidators.isUniversityEmail(studentData.email)) {
            warnings.push('Email non universitaire détecté');
        }

        // Validation du niveau
        if (!academicValidators.isValidLevel(studentData.level)) {
            errors.push('Niveau d\'études invalide');
        }

        // Validation de l'année académique
        const academicYearValidation = academicValidators.validateAcademicYear(studentData.academic_year);
        if (!academicYearValidation.isValid) {
            errors.push(`Année académique: ${academicYearValidation.message}`);
        }

        // Validation de la date de naissance
        if (studentData.birth_date) {
            const birthDateValidation = dateValidators.validateBirthDate(studentData.birth_date);
            if (!birthDateValidation.isValid) {
                errors.push(`Date de naissance: ${birthDateValidation.message}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            message: errors.length > 0 ? 'Données étudiants invalides' : 'Données étudiants valides'
        };
    },

    /**
     * Valider les données complètes d'un cours
     * @param {Object} courseData - Données du cours
     * @returns {Object} - Résultat de validation
     */
    validateCourseData(courseData) {
        const errors = [];

        // Validation du code
        const codeValidation = formatValidators.validateCourseCode(courseData.code);
        if (!codeValidation.isValid) {
            errors.push(`Code: ${codeValidation.message}`);
        }

        // Validation du nom
        if (!courseData.name || courseData.name.trim().length < 3) {
            errors.push('Nom du cours requis (min 3 caractères)');
        }

        // Validation des crédits
        const creditsValidation = numericValidators.validateCredits(courseData.credits);
        if (!creditsValidation.isValid) {
            errors.push(`Crédits: ${creditsValidation.message}`);
        }

        // Validation du niveau
        if (!academicValidators.isValidLevel(courseData.level)) {
            errors.push('Niveau invalide');
        }

        // Validation du semestre
        if (!academicValidators.isValidSemester(courseData.semester)) {
            errors.push('Semestre invalide');
        }

        // Validation de l'année académique
        const academicYearValidation = academicValidators.validateAcademicYear(courseData.academic_year);
        if (!academicYearValidation.isValid) {
            errors.push(`Année académique: ${academicYearValidation.message}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            message: errors.length > 0 ? 'Données cours invalides' : 'Données cours valides'
        };
    }
};

/**
 * Validateur de fichiers uploadés
 */
const fileValidators = {
    /**
     * Valider un fichier uploadé
     * @param {Object} file - Fichier multer
     * @param {Object} options - Options de validation
     * @returns {Object} - Résultat de validation
     */
    validateUploadedFile(file, options = {}) {
        const {
            maxSize = 5 * 1024 * 1024, // 5MB par défaut
            allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
            allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
        } = options;

        if (!file) {
            return { isValid: false, message: 'Fichier requis' };
        }

        // Vérifier la taille
        if (file.size > maxSize) {
            return { 
                isValid: false, 
                message: `Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)}MB)` 
            };
        }

        // Vérifier le type MIME
        if (!allowedTypes.includes(file.mimetype)) {
            return { 
                isValid: false, 
                message: `Type de fichier non autorisé (autorisés: ${allowedTypes.join(', ')})` 
            };
        }

        // Vérifier l'extension
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (!allowedExtensions.includes(fileExtension)) {
            return { 
                isValid: false, 
                message: `Extension non autorisée (autorisées: ${allowedExtensions.join(', ')})` 
            };
        }

        return { isValid: true, message: 'Fichier valide' };
    }
};

module.exports = {
    userValidators,
    academicValidators,
    dateValidators,
    numericValidators,
    formatValidators,
    entityValidators,
    fileValidators
};