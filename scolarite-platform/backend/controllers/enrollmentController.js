/**
 * Contrôleur des inscriptions
 * Gère toutes les opérations CRUD pour les inscriptions
 */

const { Enrollment, Student, Course } = require('../models');

class EnrollmentController {
    /**
     * Obtenir toutes les inscriptions avec pagination et filtrage
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                student_id,
                course_id,
                academic_year,
                status,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                student_id,
                course_id,
                academic_year,
                status,
                search
            };

            const result = await Enrollment.findAll(options);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des inscriptions:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir une inscription par ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const enrollment = await Enrollment.findById(id);

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscription non trouvée'
                });
            }

            res.json({
                success: true,
                data: enrollment
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Créer une nouvelle inscription
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async create(req, res) {
        try {
            const {
                student_id,
                course_id,
                academic_year,
                enrollment_date
            } = req.body;

            // Validation des données requises
            if (!student_id || !course_id || !academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Champs requis manquants'
                });
            }

            // Vérifier que l'étudiant existe
            const student = await Student.findById(student_id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Étudiant non trouvé'
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

            // Vérifier que l'inscription n'existe pas déjà
            const existingEnrollment = await Enrollment.findByStudentAndCourse(
                student_id, 
                course_id, 
                academic_year
            );
            
            if (existingEnrollment) {
                return res.status(400).json({
                    success: false,
                    message: 'L\'étudiant est déjà inscrit à ce cours pour cette année'
                });
            }

            const enrollmentData = {
                student_id,
                course_id,
                academic_year,
                enrollment_date: enrollment_date || new Date(),
                status: 'enrolled'
            };

            const enrollment = await Enrollment.create(enrollmentData);

            res.status(201).json({
                success: true,
                message: 'Inscription créée avec succès',
                data: enrollment
            });

        } catch (error) {
            console.error('Erreur lors de la création de l\'inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour une inscription
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
            delete updateData.student_id;
            delete updateData.course_id;
            delete updateData.academic_year;

            const updatedEnrollment = await Enrollment.update(id, updateData);

            if (!updatedEnrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscription non trouvée'
                });
            }

            res.json({
                success: true,
                message: 'Inscription mise à jour avec succès',
                data: updatedEnrollment
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer une inscription
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            const deleted = await Enrollment.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscription non trouvée'
                });
            }

            res.json({
                success: true,
                message: 'Inscription supprimée avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression de l\'inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les inscriptions d'un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const { academic_year } = req.query;

            // Vérifier les permissions - un étudiant ne peut voir que ses propres inscriptions
            if (req.user.role === 'student') {
                const student = await Student.findByUserId(req.user.id);
                if (student.id !== parseInt(student_id)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez consulter que vos propres inscriptions'
                    });
                }
            }

            const enrollments = await Enrollment.findByStudent(student_id, academic_year);

            res.json({
                success: true,
                data: enrollments
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des inscriptions de l\'étudiant:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les inscriptions d'un cours
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getByCourse(req, res) {
        try {
            const { course_id } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            const enrollments = await Enrollment.findByCourse(course_id, academic_year);

            res.json({
                success: true,
                data: enrollments
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des inscriptions du cours:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Inscrire des étudiants en masse à un cours
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async bulkEnroll(req, res) {
        try {
            const { student_ids, course_id, academic_year } = req.body;

            // Validation
            if (!Array.isArray(student_ids) || student_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Liste d\'étudiants requise'
                });
            }

            if (!course_id || !academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Cours et année académique requis'
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

            const result = await Enrollment.bulkEnroll(student_ids, course_id, academic_year);

            res.status(201).json({
                success: true,
                message: `${result.enrollments.length} inscriptions créées avec succès`,
                data: {
                    enrollments: result.enrollments,
                    errors: result.errors
                }
            });

        } catch (error) {
            console.error('Erreur lors de l\'inscription en masse:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Changer le statut d'une inscription
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['enrolled', 'completed', 'failed', 'withdrawn'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }

            const updatedEnrollment = await Enrollment.updateStatus(id, status);

            if (!updatedEnrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscription non trouvée'
                });
            }

            res.json({
                success: true,
                message: 'Statut d\'inscription mis à jour avec succès',
                data: updatedEnrollment
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
     * Obtenir les statistiques d'inscription
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStatistics(req, res) {
        try {
            const { academic_year, course_id } = req.query;

            const statistics = await Enrollment.getStatistics({
                academic_year,
                course_id
            });

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
     * Obtenir les inscriptions expirées ou à renouveler
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getExpiring(req, res) {
        try {
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            const enrollments = await Enrollment.findExpiring(academic_year);

            res.json({
                success: true,
                data: enrollments
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des inscriptions expirantes:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Vérifier l'éligibilité d'un étudiant pour un cours
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async checkEligibility(req, res) {
        try {
            const { student_id, course_id, academic_year } = req.query;

            if (!student_id || !course_id || !academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Paramètres requis manquants'
                });
            }

            // Vérifier que l'étudiant existe
            const student = await Student.findById(student_id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Étudiant non trouvé'
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

            // Vérifier si déjà inscrit
            const existingEnrollment = await Enrollment.findByStudentAndCourse(
                student_id, 
                course_id, 
                academic_year
            );

            const isEligible = !existingEnrollment && 
                             student.status === 'active' && 
                             course.is_active &&
                             student.level === course.level;

            const reasons = [];
            if (existingEnrollment) {
                reasons.push('Déjà inscrit à ce cours');
            }
            if (student.status !== 'active') {
                reasons.push('Étudiant non actif');
            }
            if (!course.is_active) {
                reasons.push('Cours non actif');
            }
            if (student.level !== course.level) {
                reasons.push('Niveau de l\'étudiant incompatible avec le cours');
            }

            res.json({
                success: true,
                data: {
                    eligible: isEligible,
                    reasons: reasons,
                    student: {
                        id: student.id,
                        name: `${student.first_name} ${student.last_name}`,
                        level: student.level,
                        status: student.status
                    },
                    course: {
                        id: course.id,
                        name: course.name,
                        code: course.code,
                        level: course.level,
                        is_active: course.is_active
                    }
                }
            });

        } catch (error) {
            console.error('Erreur lors de la vérification d\'éligibilité:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les inscriptions d'un étudiant connecté
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getMyEnrollments(req, res) {
        try {
            if (req.user.role !== 'student') {
                return res.status(403).json({
                    success: false,
                    message: 'Accessible uniquement aux étudiants'
                });
            }

            const student = await Student.findByUserId(req.user.id);
            const { academic_year } = req.query;

            const enrollments = await Enrollment.findByStudent(student.id, academic_year);

            res.json({
                success: true,
                data: enrollments
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des inscriptions:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

module.exports = EnrollmentController;