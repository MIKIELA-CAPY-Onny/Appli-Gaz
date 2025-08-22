/**
 * Contrôleur des enseignants
 * Gère toutes les opérations CRUD pour les enseignants
 */

const { User, Teacher, Module, Grade, Absence } = require('../models');
const db = require('../config/database');

class TeacherController {
    /**
     * Obtenir tous les enseignants avec pagination et filtrage
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                department,
                status,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                department,
                status,
                search
            };

            const result = await Teacher.findAll(options);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des enseignants:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir un enseignant par ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const teacher = await Teacher.findById(id);

            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Enseignant non trouvé'
                });
            }

            res.json({
                success: true,
                data: teacher
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'enseignant:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Créer un nouvel enseignant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async create(req, res) {
        try {
            const {
                // Données utilisateur
                email,
                password,
                first_name,
                last_name,
                phone,
                address,
                // Données enseignant
                department,
                specialization,
                hire_date
            } = req.body;

            // Validation des données requises
            if (!email || !password || !first_name || !last_name || !department || !hire_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Champs requis manquants'
                });
            }

            // Utiliser une transaction
            const result = await db.transaction(async (connection) => {
                // Créer l'utilisateur
                const userData = {
                    email,
                    password,
                    first_name,
                    last_name,
                    phone,
                    address,
                    role: 'teacher',
                    is_active: true
                };

                const user = await User.create(userData);

                // Générer le numéro d'employé
                const employee_number = await Teacher.generateEmployeeNumber('PROF');

                // Créer l'enseignant
                const teacherData = {
                    user_id: user.id,
                    employee_number,
                    department,
                    specialization,
                    hire_date,
                    status: 'active'
                };

                const teacher = await Teacher.create(teacherData);

                return { user, teacher };
            });

            res.status(201).json({
                success: true,
                message: 'Enseignant créé avec succès',
                data: result.teacher
            });

        } catch (error) {
            console.error('Erreur lors de la création de l\'enseignant:', error);
            
            if (error.message.includes('Duplicate entry')) {
                return res.status(400).json({
                    success: false,
                    message: 'Email déjà utilisé'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour un enseignant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Séparer les données utilisateur et enseignant
            const {
                first_name,
                last_name,
                phone,
                address,
                ...teacherData
            } = updateData;

            // Utiliser une transaction
            const result = await db.transaction(async (connection) => {
                // Trouver l'enseignant
                const teacher = await Teacher.findById(id);
                if (!teacher) {
                    throw new Error('Enseignant non trouvé');
                }

                // Mettre à jour les données utilisateur si présentes
                if (first_name || last_name || phone || address) {
                    const userData = {};
                    if (first_name) userData.first_name = first_name;
                    if (last_name) userData.last_name = last_name;
                    if (phone) userData.phone = phone;
                    if (address) userData.address = address;

                    await User.update(teacher.user_id, userData);
                }

                // Mettre à jour les données enseignant
                const updatedTeacher = await Teacher.update(id, teacherData);
                
                return updatedTeacher;
            });

            res.json({
                success: true,
                message: 'Enseignant mis à jour avec succès',
                data: result
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
            
            if (error.message === 'Enseignant non trouvé') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer un enseignant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Vérifier s'il y a des modules assignés
            const modules = await Teacher.getModules(id);
            if (modules.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de supprimer un enseignant ayant des modules assignés'
                });
            }

            // Utiliser une transaction
            const result = await db.transaction(async (connection) => {
                // Trouver l'enseignant
                const teacher = await Teacher.findById(id);
                if (!teacher) {
                    throw new Error('Enseignant non trouvé');
                }

                // Supprimer l'enseignant
                const deleted = await Teacher.delete(id);
                if (!deleted) {
                    throw new Error('Échec de la suppression');
                }

                // Supprimer l'utilisateur
                await User.delete(teacher.user_id);

                return true;
            });

            res.json({
                success: true,
                message: 'Enseignant supprimé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression de l\'enseignant:', error);
            
            if (error.message === 'Enseignant non trouvé') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les modules d'un enseignant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getModules(req, res) {
        try {
            const { id } = req.params;
            const { academic_year } = req.query;

            const modules = await Teacher.getModules(id, academic_year);

            res.json({
                success: true,
                data: modules
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des modules:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les étudiants d'un enseignant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStudents(req, res) {
        try {
            const { id } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            const students = await Teacher.getStudents(id, academic_year);

            res.json({
                success: true,
                data: students
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des étudiants:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les statistiques d'un enseignant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStatistics(req, res) {
        try {
            const { id } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            const statistics = await Teacher.getStatistics(id, academic_year);

            res.json({
                success: true,
                data: statistics
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les enseignants par département
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getByDepartment(req, res) {
        try {
            const { department } = req.params;

            const teachers = await Teacher.findByDepartment(department);

            res.json({
                success: true,
                data: teachers
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des enseignants par département:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Changer le statut d'un enseignant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'inactive', 'retired'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }

            const updatedTeacher = await Teacher.update(id, { status });

            if (!updatedTeacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Enseignant non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Statut mis à jour avec succès',
                data: updatedTeacher
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Rechercher des enseignants
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async search(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'La recherche doit contenir au moins 2 caractères'
                });
            }

            const options = {
                page: 1,
                limit: 20,
                search: q
            };

            const result = await Teacher.findAll(options);

            res.json({
                success: true,
                data: result.teachers
            });

        } catch (error) {
            console.error('Erreur lors de la recherche d\'enseignants:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir le planning d'un enseignant (modules avec horaires)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getSchedule(req, res) {
        try {
            const { id } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            // Obtenir les modules avec informations détaillées
            const modules = await Teacher.getModules(id, academic_year);

            // Grouper par semestre et niveau
            const schedule = modules.reduce((acc, module) => {
                const key = `${module.level}-${module.semester}`;
                if (!acc[key]) {
                    acc[key] = {
                        level: module.level,
                        semester: module.semester,
                        modules: []
                    };
                }
                acc[key].modules.push(module);
                return acc;
            }, {});

            res.json({
                success: true,
                data: Object.values(schedule)
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du planning:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

module.exports = TeacherController;