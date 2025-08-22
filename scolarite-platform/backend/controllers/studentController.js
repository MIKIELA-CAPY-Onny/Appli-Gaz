/**
 * Contrôleur des étudiants
 * Gère toutes les opérations CRUD pour les étudiants
 */

const { User, Student, Grade, Absence, Enrollment } = require('../models');
const db = require('../config/database');

class StudentController {
    /**
     * Obtenir tous les étudiants avec pagination et filtrage
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                level,
                academic_year,
                status,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                level,
                academic_year,
                status,
                search
            };

            const result = await Student.findAll(options);

            res.json({
                success: true,
                data: result
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
     * Obtenir un étudiant par ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const student = await Student.findById(id);

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Étudiant non trouvé'
                });
            }

            res.json({
                success: true,
                data: student
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'étudiant:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Créer un nouvel étudiant
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
                // Données étudiant
                birth_date,
                birth_place,
                nationality,
                level,
                academic_year,
                enrollment_date
            } = req.body;

            // Validation des données requises
            if (!email || !password || !first_name || !last_name || !level || !academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Champs requis manquants'
                });
            }

            // Utiliser une transaction pour créer l'utilisateur et l'étudiant
            const result = await db.transaction(async (connection) => {
                // Créer l'utilisateur
                const userData = {
                    email,
                    password,
                    first_name,
                    last_name,
                    phone,
                    address,
                    role: 'student',
                    is_active: true
                };

                const user = await User.create(userData);

                // Générer le numéro étudiant
                const currentYear = new Date().getFullYear();
                const student_number = await Student.generateStudentNumber(currentYear);

                // Créer l'étudiant
                const studentData = {
                    user_id: user.id,
                    student_number,
                    birth_date,
                    birth_place,
                    nationality,
                    level,
                    academic_year,
                    enrollment_date: enrollment_date || new Date(),
                    status: 'active'
                };

                const student = await Student.create(studentData);

                return { user, student };
            });

            res.status(201).json({
                success: true,
                message: 'Étudiant créé avec succès',
                data: result.student
            });

        } catch (error) {
            console.error('Erreur lors de la création de l\'étudiant:', error);
            
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
     * Mettre à jour un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Séparer les données utilisateur et étudiant
            const {
                first_name,
                last_name,
                phone,
                address,
                ...studentData
            } = updateData;

            // Utiliser une transaction
            const result = await db.transaction(async (connection) => {
                // Trouver l'étudiant
                const student = await Student.findById(id);
                if (!student) {
                    throw new Error('Étudiant non trouvé');
                }

                // Mettre à jour les données utilisateur si présentes
                if (first_name || last_name || phone || address) {
                    const userData = {};
                    if (first_name) userData.first_name = first_name;
                    if (last_name) userData.last_name = last_name;
                    if (phone) userData.phone = phone;
                    if (address) userData.address = address;

                    await User.update(student.user_id, userData);
                }

                // Mettre à jour les données étudiant
                const updatedStudent = await Student.update(id, studentData);
                
                return updatedStudent;
            });

            res.json({
                success: true,
                message: 'Étudiant mis à jour avec succès',
                data: result
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
            
            if (error.message === 'Étudiant non trouvé') {
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
     * Supprimer un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Utiliser une transaction
            const result = await db.transaction(async (connection) => {
                // Trouver l'étudiant
                const student = await Student.findById(id);
                if (!student) {
                    throw new Error('Étudiant non trouvé');
                }

                // Supprimer l'étudiant (cascade supprimera les données liées)
                const deleted = await Student.delete(id);
                if (!deleted) {
                    throw new Error('Échec de la suppression');
                }

                // Supprimer l'utilisateur
                await User.delete(student.user_id);

                return true;
            });

            res.json({
                success: true,
                message: 'Étudiant supprimé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression de l\'étudiant:', error);
            
            if (error.message === 'Étudiant non trouvé') {
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
     * Obtenir les notes d'un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getGrades(req, res) {
        try {
            const { id } = req.params;
            const { academic_year, module_id, grade_type } = req.query;

            const grades = await Student.getGrades(id, {
                academic_year,
                module_id,
                grade_type
            });

            res.json({
                success: true,
                data: grades
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des notes:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les absences d'un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAbsences(req, res) {
        try {
            const { id } = req.params;
            const { start_date, end_date, module_id } = req.query;

            const absences = await Student.getAbsences(id, {
                startDate: start_date,
                endDate: end_date,
                moduleId: module_id
            });

            res.json({
                success: true,
                data: absences
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des absences:', error);
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
    static async getEnrollments(req, res) {
        try {
            const { id } = req.params;
            const { academic_year } = req.query;

            const enrollments = await Student.getEnrollments(id, academic_year);

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

    /**
     * Obtenir le bulletin d'un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getReport(req, res) {
        try {
            const { id } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            // Vérifier que l'étudiant existe
            const student = await Student.findById(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Étudiant non trouvé'
                });
            }

            // Générer le bulletin
            const report = await Grade.getStudentReport(id, academic_year);

            // Calculer les statistiques d'absence
            const absenceStats = await Absence.getStudentAbsenceStats(id, academic_year);

            res.json({
                success: true,
                data: {
                    student,
                    report,
                    absenceStats
                }
            });

        } catch (error) {
            console.error('Erreur lors de la génération du bulletin:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les étudiants par niveau
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getByLevel(req, res) {
        try {
            const { level } = req.params;
            const { academic_year } = req.query;

            const students = await Student.findByLevel(level, academic_year);

            res.json({
                success: true,
                data: students
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des étudiants par niveau:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Calculer la moyenne générale d'un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async calculateGPA(req, res) {
        try {
            const { id } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            const gpa = await Student.calculateGPA(id, academic_year);

            res.json({
                success: true,
                data: gpa
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
     * Activer/Désactiver un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'suspended', 'graduated', 'dropped'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }

            const updatedStudent = await Student.update(id, { status });

            if (!updatedStudent) {
                return res.status(404).json({
                    success: false,
                    message: 'Étudiant non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Statut mis à jour avec succès',
                data: updatedStudent
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
     * Rechercher des étudiants
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

            const result = await Student.findAll(options);

            res.json({
                success: true,
                data: result.students
            });

        } catch (error) {
            console.error('Erreur lors de la recherche d\'étudiants:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

module.exports = StudentController;