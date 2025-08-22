/**
 * Middleware de vérification des rôles et permissions
 * Gère les autorisations avancées selon les rôles utilisateur
 */

const { Admin, Student, Teacher } = require('../models');

/**
 * Vérifier les permissions d'un administrateur
 * @param {string} resource - Ressource (ex: 'users', 'students')
 * @param {string} action - Action (ex: 'create', 'read', 'update', 'delete')
 */
const checkAdminPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Accès réservé aux administrateurs'
                });
            }

            // Récupérer les permissions de l'administrateur
            const admin = await Admin.findByUserId(req.user.id);
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil administrateur non trouvé'
                });
            }

            // Vérifier la permission
            if (!admin.hasPermission(resource, action)) {
                return res.status(403).json({
                    success: false,
                    message: `Permission insuffisante pour ${action} sur ${resource}`
                });
            }

            req.adminProfile = admin;
            next();

        } catch (error) {
            console.error('Erreur de vérification des permissions admin:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    };
};

/**
 * Vérifier que l'enseignant peut accéder à un module
 * @param {string} moduleIdParam - Nom du paramètre contenant l'ID du module
 */
const checkTeacherModuleAccess = (moduleIdParam = 'module_id') => {
    return async (req, res, next) => {
        try {
            if (req.user.role !== 'teacher') {
                return next(); // Laisser passer si ce n'est pas un enseignant
            }

            const moduleId = req.params[moduleIdParam] || req.body[moduleIdParam] || req.query[moduleIdParam];
            
            if (!moduleId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID du module requis'
                });
            }

            // Récupérer le profil enseignant
            const teacher = await Teacher.findByUserId(req.user.id);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil enseignant non trouvé'
                });
            }

            // Vérifier que l'enseignant enseigne ce module
            const { Module } = require('../models');
            const module = await Module.findById(moduleId);
            
            if (!module) {
                return res.status(404).json({
                    success: false,
                    message: 'Module non trouvé'
                });
            }

            if (module.teacher_id !== teacher.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé à ce module'
                });
            }

            req.teacherProfile = teacher;
            req.moduleAccess = module;
            next();

        } catch (error) {
            console.error('Erreur de vérification d\'accès au module:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    };
};

/**
 * Vérifier que l'étudiant peut accéder à ses propres données
 * @param {string} studentIdParam - Nom du paramètre contenant l'ID de l'étudiant
 */
const checkStudentSelfAccess = (studentIdParam = 'student_id') => {
    return async (req, res, next) => {
        try {
            if (req.user.role !== 'student') {
                return next(); // Laisser passer si ce n'est pas un étudiant
            }

            const studentId = req.params[studentIdParam] || req.body[studentIdParam] || req.query[studentIdParam];
            
            if (!studentId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de l\'étudiant requis'
                });
            }

            // Récupérer le profil étudiant
            const student = await Student.findByUserId(req.user.id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil étudiant non trouvé'
                });
            }

            // Vérifier que l'étudiant accède à ses propres données
            if (student.id !== parseInt(studentId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès limité à vos propres données'
                });
            }

            req.studentProfile = student;
            next();

        } catch (error) {
            console.error('Erreur de vérification d\'accès étudiant:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    };
};

/**
 * Middleware de vérification hiérarchique des rôles
 * Admin > Teacher > Student
 */
const checkRoleHierarchy = (requiredLevel) => {
    const hierarchy = {
        'student': 1,
        'teacher': 2,
        'admin': 3
    };

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        const userLevel = hierarchy[req.user.role];
        const requiredLevelValue = hierarchy[requiredLevel];

        if (userLevel < requiredLevelValue) {
            return res.status(403).json({
                success: false,
                message: 'Niveau d\'autorisation insuffisant'
            });
        }

        next();
    };
};

/**
 * Middleware pour vérifier l'accès en lecture seule
 * Permet la lecture mais bloque les modifications
 */
const readOnlyAccess = (allowedRoles = ['admin', 'teacher', 'student']) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        // Bloquer les méthodes de modification pour certains rôles
        const restrictedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const restrictedRoles = ['student'];

        if (restrictedRoles.includes(req.user.role) && restrictedMethods.includes(req.method)) {
            return res.status(403).json({
                success: false,
                message: 'Accès en lecture seule'
            });
        }

        next();
    };
};

/**
 * Middleware pour vérifier l'accès aux données académiques
 * Contrôle l'accès selon l'année académique et le niveau
 */
const checkAcademicAccess = () => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentification requise'
                });
            }

            // Les admins ont accès à tout
            if (req.user.role === 'admin') {
                return next();
            }

            const { academic_year, level } = req.query;

            // Pour les étudiants, vérifier le niveau et l'année
            if (req.user.role === 'student') {
                const student = await Student.findByUserId(req.user.id);
                
                if (level && student.level !== level) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès limité à votre niveau d\'études'
                    });
                }

                if (academic_year && student.academic_year !== academic_year) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès limité à votre année académique'
                    });
                }

                req.studentProfile = student;
            }

            // Pour les enseignants, pas de restriction particulière ici
            // (les restrictions spécifiques aux modules sont gérées ailleurs)
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                req.teacherProfile = teacher;
            }

            next();

        } catch (error) {
            console.error('Erreur de vérification d\'accès académique:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    };
};

/**
 * Middleware pour vérifier l'accès aux données sensibles
 * Limite l'accès aux informations personnelles
 */
const checkSensitiveDataAccess = () => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        // Supprimer les champs sensibles pour les non-admins
        if (req.user.role !== 'admin') {
            // Middleware pour filtrer la réponse
            const originalJson = res.json;
            res.json = function(data) {
                if (data && data.data) {
                    // Supprimer les champs sensibles selon le rôle
                    if (Array.isArray(data.data)) {
                        data.data = data.data.map(item => filterSensitiveData(item, req.user.role));
                    } else {
                        data.data = filterSensitiveData(data.data, req.user.role);
                    }
                }
                return originalJson.call(this, data);
            };
        }

        next();
    };
};

/**
 * Filtrer les données sensibles selon le rôle
 * @param {Object} data - Données à filtrer
 * @param {string} userRole - Rôle de l'utilisateur
 * @returns {Object} - Données filtrées
 */
function filterSensitiveData(data, userRole) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const filtered = { ...data };

    // Supprimer les mots de passe
    delete filtered.password;

    // Filtrage selon le rôle
    switch (userRole) {
        case 'student':
            // Les étudiants ne voient pas les informations personnelles des autres
            delete filtered.phone;
            delete filtered.address;
            delete filtered.employee_number;
            delete filtered.hire_date;
            delete filtered.permissions;
            break;
            
        case 'teacher':
            // Les enseignants voient plus d'informations mais pas tout
            delete filtered.permissions;
            break;
            
        case 'admin':
            // Les admins voient tout (pas de filtrage)
            break;
    }

    return filtered;
}

/**
 * Middleware pour logger les accès selon les rôles
 */
const logRoleAccess = (req, res, next) => {
    if (req.user) {
        const logData = {
            userId: req.user.id,
            role: req.user.role,
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };

        // En production, envoyer vers un service de logging
        console.log('🔐 Accès role:', JSON.stringify(logData));
    }

    next();
};

module.exports = {
    checkAdminPermission,
    checkTeacherModuleAccess,
    checkStudentSelfAccess,
    checkRoleHierarchy,
    readOnlyAccess,
    checkAcademicAccess,
    checkSensitiveDataAccess,
    logRoleAccess,
    filterSensitiveData
};