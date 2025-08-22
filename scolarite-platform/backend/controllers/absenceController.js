/**
 * Contrôleur des absences
 * Gère toutes les opérations CRUD pour les absences
 */

const { Absence, Student, Module, Teacher } = require('../models');

class AbsenceController {
    /**
     * Obtenir toutes les absences avec pagination et filtrage
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
                type,
                is_justified,
                start_date,
                end_date,
                recorded_by,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                student_id,
                module_id,
                type,
                is_justified: is_justified === 'true' ? true : is_justified === 'false' ? false : null,
                start_date,
                end_date,
                recorded_by,
                search
            };

            const result = await Absence.findAll(options);

            res.json({
                success: true,
                data: result
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
     * Obtenir une absence par ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const absence = await Absence.findById(id);

            if (!absence) {
                return res.status(404).json({
                    success: false,
                    message: 'Absence non trouvée'
                });
            }

            res.json({
                success: true,
                data: absence
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'absence:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Enregistrer une nouvelle absence
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async create(req, res) {
        try {
            const {
                student_id,
                module_id,
                absence_date,
                absence_time,
                duration_hours,
                type,
                is_justified,
                justification_document,
                reason
            } = req.body;

            // Validation des données requises
            if (!student_id || !module_id || !absence_date || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Champs requis manquants'
                });
            }

            // Vérifier que l'utilisateur connecté est un enseignant
            if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Seuls les enseignants peuvent enregistrer des absences'
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
                        message: 'Vous ne pouvez enregistrer des absences que pour vos modules'
                    });
                }
            }

            const absenceData = {
                student_id,
                module_id,
                absence_date,
                absence_time,
                duration_hours: duration_hours || 1.0,
                type,
                is_justified: is_justified || false,
                justification_document,
                reason,
                recorded_by: req.user.role === 'teacher' 
                    ? (await Teacher.findByUserId(req.user.id)).id
                    : req.body.recorded_by
            };

            const newAbsence = await Absence.create(absenceData);

            res.status(201).json({
                success: true,
                message: 'Absence enregistrée avec succès',
                data: newAbsence
            });

        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour une absence
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Vérifier que l'absence existe
            const existingAbsence = await Absence.findById(id);
            if (!existingAbsence) {
                return res.status(404).json({
                    success: false,
                    message: 'Absence non trouvée'
                });
            }

            // Vérifier les permissions
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                if (existingAbsence.recorded_by !== teacher.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez modifier que vos propres enregistrements'
                    });
                }
            }

            // Supprimer les champs non modifiables
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.recorded_by;

            // Convertir les valeurs numériques
            if (updateData.duration_hours !== undefined) {
                updateData.duration_hours = parseFloat(updateData.duration_hours);
            }

            const updatedAbsence = await Absence.update(id, updateData);

            res.json({
                success: true,
                message: 'Absence mise à jour avec succès',
                data: updatedAbsence
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'absence:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Supprimer une absence
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Vérifier que l'absence existe
            const existingAbsence = await Absence.findById(id);
            if (!existingAbsence) {
                return res.status(404).json({
                    success: false,
                    message: 'Absence non trouvée'
                });
            }

            // Vérifier les permissions
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                if (existingAbsence.recorded_by !== teacher.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez supprimer que vos propres enregistrements'
                    });
                }
            }

            const deleted = await Absence.delete(id);

            res.json({
                success: true,
                message: 'Absence supprimée avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression de l\'absence:', error);
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
    static async getByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const { start_date, end_date, module_id, type, academic_year } = req.query;

            // Vérifier les permissions - un étudiant ne peut voir que ses propres absences
            if (req.user.role === 'student') {
                const student = await Student.findByUserId(req.user.id);
                if (student.id !== parseInt(student_id)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez consulter que vos propres absences'
                    });
                }
            }

            const absences = await Absence.findByStudent(student_id, {
                start_date,
                end_date,
                module_id,
                type,
                academic_year
            });

            res.json({
                success: true,
                data: absences
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des absences de l\'étudiant:', error);
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
    static async getByModule(req, res) {
        try {
            const { module_id } = req.params;
            const { start_date, end_date, student_id, type } = req.query;

            // Vérifier les permissions pour les enseignants
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                const module = await Module.findById(module_id);
                
                if (!module || module.teacher_id !== teacher.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez consulter que les absences de vos modules'
                    });
                }
            }

            const absences = await Absence.findByModule(module_id, {
                start_date,
                end_date,
                student_id,
                type
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
     * Justifier une absence
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async justify(req, res) {
        try {
            const { id } = req.params;
            const { justification_document, reason } = req.body;

            const updatedAbsence = await Absence.justify(id, justification_document, reason);

            if (!updatedAbsence) {
                return res.status(404).json({
                    success: false,
                    message: 'Absence non trouvée'
                });
            }

            res.json({
                success: true,
                message: 'Absence justifiée avec succès',
                data: updatedAbsence
            });

        } catch (error) {
            console.error('Erreur lors de la justification de l\'absence:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Annuler la justification d'une absence
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async unjustify(req, res) {
        try {
            const { id } = req.params;

            const updatedAbsence = await Absence.unjustify(id);

            if (!updatedAbsence) {
                return res.status(404).json({
                    success: false,
                    message: 'Absence non trouvée'
                });
            }

            res.json({
                success: true,
                message: 'Justification annulée avec succès',
                data: updatedAbsence
            });

        } catch (error) {
            console.error('Erreur lors de l\'annulation de la justification:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les absences non justifiées
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getUnjustified(req, res) {
        try {
            const { student_id, module_id, days_limit = 30 } = req.query;

            const filters = {
                student_id,
                module_id,
                days_limit: parseInt(days_limit)
            };

            const absences = await Absence.findUnjustified(filters);

            res.json({
                success: true,
                data: absences
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des absences non justifiées:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les statistiques d'absence d'un étudiant
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getStudentStats(req, res) {
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
                        message: 'Vous ne pouvez consulter que vos propres statistiques'
                    });
                }
            }

            const stats = await Absence.getStudentAbsenceStats(student_id, academic_year);

            res.json({
                success: true,
                data: stats
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
     * Enregistrer des absences en masse
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async bulkCreate(req, res) {
        try {
            const { absences } = req.body;

            if (!Array.isArray(absences) || absences.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Liste d\'absences requise'
                });
            }

            // Vérifier les permissions pour les enseignants
            if (req.user.role === 'teacher') {
                const teacher = await Teacher.findByUserId(req.user.id);
                
                // Vérifier que toutes les absences concernent les modules de l'enseignant
                const moduleIds = [...new Set(absences.map(a => a.module_id))];
                for (const moduleId of moduleIds) {
                    const module = await Module.findById(moduleId);
                    if (!module || module.teacher_id !== teacher.id) {
                        return res.status(403).json({
                            success: false,
                            message: 'Vous ne pouvez enregistrer des absences que pour vos modules'
                        });
                    }
                }

                // Ajouter l'ID de l'enseignant à toutes les absences
                absences.forEach(absence => {
                    absence.recorded_by = teacher.id;
                });
            }

            const result = await Absence.bulkCreate(absences);

            res.status(201).json({
                success: true,
                message: `${result.createdAbsences.length} absences enregistrées avec succès`,
                data: {
                    created: result.createdAbsences,
                    errors: result.errors
                }
            });

        } catch (error) {
            console.error('Erreur lors de l\'enregistrement en masse:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les statistiques générales d'absences
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

            const statistics = await Absence.getStatistics({
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
     * Obtenir les absences enregistrées par l'enseignant connecté
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getMyAbsences(req, res) {
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
                type,
                is_justified,
                start_date,
                end_date,
                search
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                recorded_by: teacher.id,
                module_id,
                type,
                is_justified: is_justified === 'true' ? true : is_justified === 'false' ? false : null,
                start_date,
                end_date,
                search
            };

            const result = await Absence.findAll(options);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des absences:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}

module.exports = AbsenceController;