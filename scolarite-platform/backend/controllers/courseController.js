/**
 * Contrôleur des cours
 * Gère toutes les opérations CRUD pour les cours
 */

const { Course, Module, Enrollment } = require('../models');

class CourseController {
    /**
     * Obtenir tous les cours avec pagination et filtrage
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                level,
                semester,
                academic_year,
                is_active,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                level,
                semester,
                academic_year,
                is_active: is_active === 'true' ? true : is_active === 'false' ? false : null,
                search
            };

            const result = await Course.findAll(options);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des cours:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir un cours par ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const course = await Course.findById(id);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            res.json({
                success: true,
                data: course
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du cours:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Créer un nouveau cours
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async create(req, res) {
        try {
            const {
                code,
                name,
                description,
                credits,
                level,
                semester,
                academic_year
            } = req.body;

            // Validation des données requises
            if (!code || !name || !level || !semester || !academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Champs requis manquants'
                });
            }

            // Vérifier l'unicité du code
            const existingCourse = await Course.findByCode(code);
            if (existingCourse) {
                return res.status(400).json({
                    success: false,
                    message: 'Un cours avec ce code existe déjà'
                });
            }

            const courseData = {
                code,
                name,
                description,
                credits: credits || 3,
                level,
                semester,
                academic_year,
                is_active: true
            };

            const course = await Course.create(courseData);

            res.status(201).json({
                success: true,
                message: 'Cours créé avec succès',
                data: course
            });

        } catch (error) {
            console.error('Erreur lors de la création du cours:', error);
            
            if (error.message.includes('Duplicate entry')) {
                return res.status(400).json({
                    success: false,
                    message: 'Code de cours déjà utilisé'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour un cours
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

            const updatedCourse = await Course.update(id, updateData);

            if (!updatedCourse) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Cours mis à jour avec succès',
                data: updatedCourse
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour du cours:', error);
            
            if (error.message.includes('Duplicate entry')) {
                return res.status(400).json({
                    success: false,
                    message: 'Code de cours déjà utilisé'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer un cours
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Vérifier s'il y a des inscriptions
            const enrollments = await Course.getEnrolledStudents(id, new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
            if (enrollments.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de supprimer un cours ayant des étudiants inscrits'
                });
            }

            const deleted = await Course.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Cours supprimé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression du cours:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les cours par niveau et semestre
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getByLevelAndSemester(req, res) {
        try {
            const { level, semester } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            const courses = await Course.findByLevelAndSemester(level, semester, academic_year);

            res.json({
                success: true,
                data: courses
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des cours:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les modules d'un cours
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getModules(req, res) {
        try {
            const { id } = req.params;

            const modules = await Course.getModules(id);

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
     * Obtenir les étudiants inscrits à un cours
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getEnrolledStudents(req, res) {
        try {
            const { id } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            const students = await Course.getEnrolledStudents(id, academic_year);

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
     * Obtenir les statistiques d'un cours
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

            const statistics = await Course.getStatistics(id, academic_year);

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
     * Obtenir les années académiques disponibles
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAcademicYears(req, res) {
        try {
            const academicYears = await Course.getAcademicYears();

            res.json({
                success: true,
                data: academicYears
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des années académiques:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Activer/Désactiver un cours
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

            const updatedCourse = is_active 
                ? await Course.activate(id)
                : await Course.deactivate(id);

            if (!updatedCourse) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            res.json({
                success: true,
                message: `Cours ${is_active ? 'activé' : 'désactivé'} avec succès`,
                data: updatedCourse
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
     * Rechercher des cours
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
                search: q,
                is_active: true
            };

            const result = await Course.findAll(options);

            res.json({
                success: true,
                data: result.courses
            });

        } catch (error) {
            console.error('Erreur lors de la recherche de cours:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Dupliquer un cours pour une nouvelle année académique
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async duplicate(req, res) {
        try {
            const { id } = req.params;
            const { academic_year, new_code } = req.body;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            // Trouver le cours original
            const originalCourse = await Course.findById(id);
            if (!originalCourse) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Créer le nouveau cours
            const newCourseData = {
                code: new_code || `${originalCourse.code}_${academic_year.split('-')[0]}`,
                name: originalCourse.name,
                description: originalCourse.description,
                credits: originalCourse.credits,
                level: originalCourse.level,
                semester: originalCourse.semester,
                academic_year,
                is_active: true
            };

            const newCourse = await Course.create(newCourseData);

            res.status(201).json({
                success: true,
                message: 'Cours dupliqué avec succès',
                data: newCourse
            });

        } catch (error) {
            console.error('Erreur lors de la duplication du cours:', error);
            
            if (error.message.includes('Duplicate entry')) {
                return res.status(400).json({
                    success: false,
                    message: 'Code de cours déjà utilisé'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

module.exports = CourseController;