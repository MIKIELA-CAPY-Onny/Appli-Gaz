/**
 * Contrôleur des modules
 * Gère toutes les opérations CRUD pour les modules
 */

const { Module, Course, Teacher } = require('../models');

class ModuleController {
    /**
     * Obtenir tous les modules avec pagination et filtrage
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                course_id,
                teacher_id,
                is_active,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                course_id,
                teacher_id,
                is_active: is_active === 'true' ? true : is_active === 'false' ? false : null,
                search
            };

            const result = await Module.findAll(options);

            res.json({
                success: true,
                data: result
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
     * Obtenir un module par ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const module = await Module.findById(id);

            if (!module) {
                return res.status(404).json({
                    success: false,
                    message: 'Module non trouvé'
                });
            }

            res.json({
                success: true,
                data: module
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du module:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Créer un nouveau module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async create(req, res) {
        try {
            const {
                course_id,
                teacher_id,
                name,
                description,
                coefficient,
                hours_total,
                hours_cm,
                hours_td,
                hours_tp,
                evaluation_type
            } = req.body;

            // Validation des données requises
            if (!course_id || !teacher_id || !name || !hours_total) {
                return res.status(400).json({
                    success: false,
                    message: 'Champs requis manquants'
                });
            }

            // Vérifier que le cours existe
            const course = await Course.findById(course_id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier que l'enseignant existe
            const teacher = await Teacher.findById(teacher_id);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Enseignant non trouvé'
                });
            }

            const moduleData = {
                course_id,
                teacher_id,
                name,
                description,
                coefficient: coefficient || 1.00,
                hours_total,
                hours_cm: hours_cm || 0,
                hours_td: hours_td || 0,
                hours_tp: hours_tp || 0,
                evaluation_type: evaluation_type || 'mixed',
                is_active: true
            };

            const module = await Module.create(moduleData);

            res.status(201).json({
                success: true,
                message: 'Module créé avec succès',
                data: module
            });

        } catch (error) {
            console.error('Erreur lors de la création du module:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Supprimer les champs non modifiables
            delete updateData.id;
            delete updateData.created_at;

            // Convertir les valeurs numériques
            if (updateData.coefficient !== undefined) {
                updateData.coefficient = parseFloat(updateData.coefficient);
            }
            if (updateData.hours_total !== undefined) {
                updateData.hours_total = parseInt(updateData.hours_total);
            }
            if (updateData.hours_cm !== undefined) {
                updateData.hours_cm = parseInt(updateData.hours_cm);
            }
            if (updateData.hours_td !== undefined) {
                updateData.hours_td = parseInt(updateData.hours_td);
            }
            if (updateData.hours_tp !== undefined) {
                updateData.hours_tp = parseInt(updateData.hours_tp);
            }

            const updatedModule = await Module.update(id, updateData);

            if (!updatedModule) {
                return res.status(404).json({
                    success: false,
                    message: 'Module non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Module mis à jour avec succès',
                data: updatedModule
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour du module:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Vérifier s'il y a des notes ou absences liées
            const grades = await Module.getGrades(id);
            const absences = await Module.getAbsences(id);

            if (grades.length > 0 || absences.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de supprimer un module ayant des notes ou absences enregistrées'
                });
            }

            const deleted = await Module.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Module non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Module supprimé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression du module:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les étudiants inscrits à un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getEnrolledStudents(req, res) {
        try {
            const { id } = req.params;

            const students = await Module.getEnrolledStudents(id);

            res.json({
                success: true,
                data: students
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des étudiants inscrits:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les notes d'un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getGrades(req, res) {
        try {
            const { id } = req.params;
            const { student_id, grade_type } = req.query;

            const grades = await Module.getGrades(id, {
                student_id,
                grade_type
            });

            res.json({
                success: true,
                data: grades
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des notes du module:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les absences d'un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAbsences(req, res) {
        try {
            const { id } = req.params;
            const { start_date, end_date, student_id } = req.query;

            const absences = await Module.getAbsences(id, {
                startDate: start_date,
                endDate: end_date,
                student_id
            });

            res.json({
                success: true,
                data: absences
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des absences du module:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Calculer la moyenne d'un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async calculateAverage(req, res) {
        try {
            const { id } = req.params;
            const { student_id } = req.query;

            const average = await Module.calculateAverage(id, student_id);

            res.json({
                success: true,
                data: average
            });

        } catch (error) {
            console.error('Erreur lors du calcul de la moyenne:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les statistiques d'un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStatistics(req, res) {
        try {
            const { id } = req.params;

            const statistics = await Module.getStatistics(id);

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
     * Activer/Désactiver un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;

            if (typeof is_active !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }

            const updatedModule = is_active 
                ? await Module.activate(id)
                : await Module.deactivate(id);

            if (!updatedModule) {
                return res.status(404).json({
                    success: false,
                    message: 'Module non trouvé'
                });
            }

            res.json({
                success: true,
                message: `Module ${is_active ? 'activé' : 'désactivé'} avec succès`,
                data: updatedModule
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
     * Obtenir les modules d'un enseignant connecté
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getMyModules(req, res) {
        try {
            if (req.user.role !== 'teacher') {
                return res.status(403).json({
                    success: false,
                    message: 'Accessible uniquement aux enseignants'
                });
            }

            const teacher = await Teacher.findByUserId(req.user.id);
            const { academic_year } = req.query;

            const modules = await Teacher.getModules(teacher.id, academic_year);

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
}

module.exports = ModuleController;