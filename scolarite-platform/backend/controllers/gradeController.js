/**
 * Contrôleur des notes
 * Gère toutes les opérations CRUD pour les notes
 */

const { Grade, Student, Module, Teacher } = require('../models');

class GradeController {
    /**
     * Obtenir toutes les notes avec pagination et filtrage
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                student_id,
                module_id,
                grade_type,
                created_by,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                student_id,
                module_id,
                grade_type,
                created_by,
                search
            };

            const result = await Grade.findAll(options);

            res.json({
                success: true,
                data: result
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
     * Obtenir une note par ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const grade = await Grade.findById(id);

            if (!grade) {
                return res.status(404).json({
                    success: false,
                    message: 'Note non trouvée'
                });
            }

            res.json({
                success: true,
                data: grade
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de la note:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Créer une nouvelle note
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async create(req, res) {
        try {
            const {
                student_id,
                module_id,
                grade_type,
                grade,
                max_grade,
                coefficient,
                exam_date,
                comments
            } = req.body;

            // Validation des données requises
            if (!student_id || !module_id || !grade_type || grade === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Champs requis manquants'
                });
            }

            // Vérifier que l'utilisateur connecté est un enseignant
            if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Seuls les enseignants peuvent créer des notes'
                });
            }

            // Pour les enseignants, vérifier qu'ils enseignent ce module
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                if (!teacher) {
                    return res.status(404).json({
                        success: false,
                        message: 'Profil enseignant non trouvé'
                    });
                }

                const module = await Module.findById(module_id);
                if (!module || module.teacher_id !== teacher.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez créer des notes que pour vos modules'
                    });
                }
            }

            const gradeData = {
                student_id,
                module_id,
                grade_type,
                grade: parseFloat(grade),
                max_grade: max_grade ? parseFloat(max_grade) : 20.00,
                coefficient: coefficient ? parseFloat(coefficient) : 1.00,
                exam_date,
                comments,
                created_by: req.user.role === 'teacher' 
                    ? (await Teacher.findByUserId(req.user.id)).id
                    : req.body.created_by
            };

            const newGrade = await Grade.create(gradeData);

            res.status(201).json({
                success: true,
                message: 'Note créée avec succès',
                data: newGrade
            });

        } catch (error) {
            console.error('Erreur lors de la création de la note:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour une note
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Vérifier que la note existe
            const existingGrade = await Grade.findById(id);
            if (!existingGrade) {
                return res.status(404).json({
                    success: false,
                    message: 'Note non trouvée'
                });
            }

            // Vérifier les permissions
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                if (existingGrade.created_by !== teacher.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez modifier que vos propres notes'
                    });
                }
            }

            // Supprimer les champs non modifiables
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.created_by;

            // Convertir les valeurs numériques
            if (updateData.grade !== undefined) {
                updateData.grade = parseFloat(updateData.grade);
            }
            if (updateData.max_grade !== undefined) {
                updateData.max_grade = parseFloat(updateData.max_grade);
            }
            if (updateData.coefficient !== undefined) {
                updateData.coefficient = parseFloat(updateData.coefficient);
            }

            const updatedGrade = await Grade.update(id, updateData);

            res.json({
                success: true,
                message: 'Note mise à jour avec succès',
                data: updatedGrade
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de la note:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer une note
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Vérifier que la note existe
            const existingGrade = await Grade.findById(id);
            if (!existingGrade) {
                return res.status(404).json({
                    success: false,
                    message: 'Note non trouvée'
                });
            }

            // Vérifier les permissions
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                if (existingGrade.created_by !== teacher.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez supprimer que vos propres notes'
                    });
                }
            }

            const deleted = await Grade.delete(id);

            res.json({
                success: true,
                message: 'Note supprimée avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression de la note:', error);
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
    static async getByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const { academic_year, module_id, grade_type } = req.query;

            // Vérifier les permissions - un étudiant ne peut voir que ses propres notes
            if (req.user.role === 'student') {
                const student = await Student.findByUserId(req.user.id);
                if (student.id !== parseInt(student_id)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez consulter que vos propres notes'
                    });
                }
            }

            const grades = await Grade.findByStudent(student_id, {
                academic_year,
                module_id,
                grade_type
            });

            res.json({
                success: true,
                data: grades
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des notes de l\'étudiant:', error);
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
    static async getByModule(req, res) {
        try {
            const { module_id } = req.params;
            const { student_id, grade_type } = req.query;

            // Vérifier les permissions pour les enseignants
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                const module = await Module.findById(module_id);
                
                if (!module || module.teacher_id !== teacher.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez consulter que les notes de vos modules'
                    });
                }
            }

            const grades = await Grade.findByModule(module_id, {
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
     * Obtenir le bulletin d'un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStudentReport(req, res) {
        try {
            const { student_id } = req.params;
            const { academic_year } = req.query;

            if (!academic_year) {
                return res.status(400).json({
                    success: false,
                    message: 'Année académique requise'
                });
            }

            // Vérifier les permissions
            if (req.user.role === 'student') {
                const student = await Student.findByUserId(req.user.id);
                if (student.id !== parseInt(student_id)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez consulter que votre propre bulletin'
                    });
                }
            }

            const report = await Grade.getStudentReport(student_id, academic_year);

            res.json({
                success: true,
                data: report
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
     * Saisir des notes en masse
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async bulkCreate(req, res) {
        try {
            const { grades } = req.body;

            if (!Array.isArray(grades) || grades.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Liste de notes requise'
                });
            }

            // Vérifier les permissions pour les enseignants
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                
                // Vérifier que toutes les notes concernent les modules de l'enseignant
                const moduleIds = [...new Set(grades.map(g => g.module_id))];
                for (const moduleId of moduleIds) {
                    const module = await Module.findById(moduleId);
                    if (!module || module.teacher_id !== teacher.id) {
                        return res.status(403).json({
                            success: false,
                            message: 'Vous ne pouvez créer des notes que pour vos modules'
                        });
                    }
                }

                // Ajouter l'ID de l'enseignant à toutes les notes
                grades.forEach(grade => {
                    grade.created_by = teacher.id;
                });
            }

            const result = await Grade.bulkCreate(grades);

            res.status(201).json({
                success: true,
                message: `${result.createdGrades.length} notes créées avec succès`,
                data: {
                    created: result.createdGrades,
                    errors: result.errors
                }
            });

        } catch (error) {
            console.error('Erreur lors de la saisie en masse:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Calculer la moyenne d'un étudiant pour un module
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async calculateModuleAverage(req, res) {
        try {
            const { student_id, module_id } = req.params;

            const average = await Grade.calculateStudentModuleAverage(student_id, module_id);

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
     * Obtenir les statistiques des notes
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStatistics(req, res) {
        try {
            const { academic_year, module_id, teacher_id } = req.query;

            // Pour les enseignants, limiter aux leurs propres statistiques
            let actualTeacherId = teacher_id;
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                actualTeacherId = teacher.id;
            }

            const statistics = await Grade.getStatistics({
                academic_year,
                module_id,
                teacher_id: actualTeacherId
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
     * Obtenir les notes créées par l'enseignant connecté
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getMyGrades(req, res) {
        try {
            if (req.user.role !== 'teacher') {
                return res.status(403).json({
                    success: false,
                    message: 'Accessible uniquement aux enseignants'
                });
            }

            const teacher = await Teacher.findByUserId(req.user.id);
            const {
                page = 1,
                limit = 10,
                module_id,
                grade_type,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                created_by: teacher.id,
                module_id,
                grade_type,
                search
            };

            const result = await Grade.findAll(options);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des notes:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

module.exports = GradeController;