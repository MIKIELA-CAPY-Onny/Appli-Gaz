/**
 * Modèle Absence
 * Gère les opérations CRUD pour la table absences
 */

const db = require('../config/database');

class Absence {
    constructor(data) {
        this.id = data.id;
        this.student_id = data.student_id;
        this.module_id = data.module_id;
        this.absence_date = data.absence_date;
        this.absence_time = data.absence_time;
        this.duration_hours = data.duration_hours;
        this.type = data.type;
        this.is_justified = data.is_justified;
        this.justification_document = data.justification_document;
        this.reason = data.reason;
        this.recorded_by = data.recorded_by;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer une nouvelle absence
     * @param {Object} absenceData - Données de l'absence
     * @returns {Promise<Object>} - Absence créée
     */
    static async create(absenceData) {
        try {
            const query = `
                INSERT INTO absences (
                    student_id, module_id, absence_date, absence_time, duration_hours,
                    type, is_justified, justification_document, reason, recorded_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                absenceData.student_id,
                absenceData.module_id,
                absenceData.absence_date,
                absenceData.absence_time || null,
                absenceData.duration_hours || 1.0,
                absenceData.type,
                absenceData.is_justified || false,
                absenceData.justification_document || null,
                absenceData.reason || null,
                absenceData.recorded_by
            ];

            const [result] = await db.execute(query, values);
            
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création de l'absence: ${error.message}`);
        }
    }

    /**
     * Trouver une absence par ID
     * @param {number} id - ID de l'absence
     * @returns {Promise<Object|null>} - Absence trouvée ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT a.*, 
                       s.student_number, u1.first_name as student_first_name, u1.last_name as student_last_name,
                       m.name as module_name, c.code as course_code, c.name as course_name,
                       u2.first_name as teacher_first_name, u2.last_name as teacher_last_name
                FROM absences a
                JOIN students s ON a.student_id = s.id
                JOIN users u1 ON s.user_id = u1.id
                JOIN modules m ON a.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON a.recorded_by = t.id
                JOIN users u2 ON t.user_id = u2.id
                WHERE a.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Absence(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'absence: ${error.message}`);
        }
    }

    /**
     * Obtenir toutes les absences avec pagination et filtrage
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des absences
     */
    static async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                student_id = null,
                module_id = null,
                type = null,
                is_justified = null,
                start_date = null,
                end_date = null,
                recorded_by = null,
                search = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT a.*, 
                       s.student_number, u1.first_name as student_first_name, u1.last_name as student_last_name,
                       m.name as module_name, c.code as course_code, c.name as course_name,
                       u2.first_name as teacher_first_name, u2.last_name as teacher_last_name
                FROM absences a
                JOIN students s ON a.student_id = s.id
                JOIN users u1 ON s.user_id = u1.id
                JOIN modules m ON a.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON a.recorded_by = t.id
                JOIN users u2 ON t.user_id = u2.id
                WHERE 1=1
            `;
            let countQuery = `
                SELECT COUNT(*) as total
                FROM absences a
                JOIN students s ON a.student_id = s.id
                JOIN users u1 ON s.user_id = u1.id
                JOIN modules m ON a.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON a.recorded_by = t.id
                JOIN users u2 ON t.user_id = u2.id
                WHERE 1=1
            `;
            const params = [];

            // Filtrage par étudiant
            if (student_id) {
                query += ' AND a.student_id = ?';
                countQuery += ' AND a.student_id = ?';
                params.push(student_id);
            }

            // Filtrage par module
            if (module_id) {
                query += ' AND a.module_id = ?';
                countQuery += ' AND a.module_id = ?';
                params.push(module_id);
            }

            // Filtrage par type
            if (type) {
                query += ' AND a.type = ?';
                countQuery += ' AND a.type = ?';
                params.push(type);
            }

            // Filtrage par justification
            if (is_justified !== null) {
                query += ' AND a.is_justified = ?';
                countQuery += ' AND a.is_justified = ?';
                params.push(is_justified);
            }

            // Filtrage par date de début
            if (start_date) {
                query += ' AND a.absence_date >= ?';
                countQuery += ' AND a.absence_date >= ?';
                params.push(start_date);
            }

            // Filtrage par date de fin
            if (end_date) {
                query += ' AND a.absence_date <= ?';
                countQuery += ' AND a.absence_date <= ?';
                params.push(end_date);
            }

            // Filtrage par enseignant enregistreur
            if (recorded_by) {
                query += ' AND a.recorded_by = ?';
                countQuery += ' AND a.recorded_by = ?';
                params.push(recorded_by);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (u1.first_name LIKE ? OR u1.last_name LIKE ? OR s.student_number LIKE ? OR m.name LIKE ?)';
                countQuery += ' AND (u1.first_name LIKE ? OR u1.last_name LIKE ? OR s.student_number LIKE ? OR m.name LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY a.absence_date DESC, a.absence_time DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const absences = rows.map(row => new Absence(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                absences,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des absences: ${error.message}`);
        }
    }

    /**
     * Mettre à jour une absence
     * @param {number} id - ID de l'absence
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Absence mise à jour
     */
    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            // Construire la requête dynamiquement
            Object.keys(updateData).forEach(key => {
                if (key !== 'id' && key !== 'created_at' && key !== 'recorded_by') {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);

            const query = `
                UPDATE absences 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'absence: ${error.message}`);
        }
    }

    /**
     * Supprimer une absence
     * @param {number} id - ID de l'absence
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM absences WHERE id = ?';
            const [result] = await db.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'absence: ${error.message}`);
        }
    }

    /**
     * Obtenir les absences d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @param {Object} options - Options de filtrage
     * @returns {Promise<Array>} - Liste des absences
     */
    static async findByStudent(studentId, options = {}) {
        try {
            const { 
                start_date = null, 
                end_date = null, 
                module_id = null, 
                type = null,
                academic_year = null 
            } = options;

            let query = `
                SELECT a.*, m.name as module_name, c.code as course_code, c.name as course_name,
                       c.level, c.semester, c.academic_year,
                       u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM absences a
                JOIN modules m ON a.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON a.recorded_by = t.id
                JOIN users u ON t.user_id = u.id
                WHERE a.student_id = ?
            `;
            const params = [studentId];

            if (start_date) {
                query += ' AND a.absence_date >= ?';
                params.push(start_date);
            }

            if (end_date) {
                query += ' AND a.absence_date <= ?';
                params.push(end_date);
            }

            if (module_id) {
                query += ' AND a.module_id = ?';
                params.push(module_id);
            }

            if (type) {
                query += ' AND a.type = ?';
                params.push(type);
            }

            if (academic_year) {
                query += ' AND c.academic_year = ?';
                params.push(academic_year);
            }

            query += ' ORDER BY a.absence_date DESC, a.absence_time DESC';

            const [rows] = await db.execute(query, params);
            
            return rows.map(row => new Absence(row));
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des absences de l'étudiant: ${error.message}`);
        }
    }

    /**
     * Obtenir les absences d'un module
     * @param {number} moduleId - ID du module
     * @param {Object} options - Options de filtrage
     * @returns {Promise<Array>} - Liste des absences
     */
    static async findByModule(moduleId, options = {}) {
        try {
            const { 
                start_date = null, 
                end_date = null, 
                student_id = null, 
                type = null 
            } = options;

            let query = `
                SELECT a.*, s.student_number, u.first_name, u.last_name
                FROM absences a
                JOIN students s ON a.student_id = s.id
                JOIN users u ON s.user_id = u.id
                WHERE a.module_id = ?
            `;
            const params = [moduleId];

            if (student_id) {
                query += ' AND a.student_id = ?';
                params.push(student_id);
            }

            if (start_date) {
                query += ' AND a.absence_date >= ?';
                params.push(start_date);
            }

            if (end_date) {
                query += ' AND a.absence_date <= ?';
                params.push(end_date);
            }

            if (type) {
                query += ' AND a.type = ?';
                params.push(type);
            }

            query += ' ORDER BY a.absence_date DESC, u.first_name, u.last_name';

            const [rows] = await db.execute(query, params);
            
            return rows.map(row => new Absence(row));
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des absences du module: ${error.message}`);
        }
    }

    /**
     * Calculer les statistiques d'absence d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @param {string} academicYear - Année académique
     * @returns {Promise<Object>} - Statistiques d'absence
     */
    static async getStudentAbsenceStats(studentId, academicYear) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_absences,
                    SUM(a.duration_hours) as total_hours,
                    SUM(CASE WHEN a.type = 'absence' THEN 1 ELSE 0 END) as total_absences_count,
                    SUM(CASE WHEN a.type = 'late' THEN 1 ELSE 0 END) as total_lates,
                    SUM(CASE WHEN a.type = 'early_leave' THEN 1 ELSE 0 END) as total_early_leaves,
                    SUM(CASE WHEN a.is_justified = TRUE THEN 1 ELSE 0 END) as justified_count,
                    SUM(CASE WHEN a.is_justified = FALSE THEN 1 ELSE 0 END) as unjustified_count
                FROM absences a
                JOIN modules m ON a.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                WHERE a.student_id = ? AND c.academic_year = ?
            `;
            const [rows] = await db.execute(query, [studentId, academicYear]);

            const result = rows[0];
            return {
                totalAbsences: result.total_absences || 0,
                totalHours: result.total_hours || 0,
                totalAbsencesCount: result.total_absences_count || 0,
                totalLates: result.total_lates || 0,
                totalEarlyLeaves: result.total_early_leaves || 0,
                justifiedCount: result.justified_count || 0,
                unjustifiedCount: result.unjustified_count || 0,
                justificationRate: result.total_absences > 0 ? 
                    parseFloat(((result.justified_count / result.total_absences) * 100).toFixed(2)) : 0
            };
        } catch (error) {
            throw new Error(`Erreur lors du calcul des statistiques d'absence: ${error.message}`);
        }
    }

    /**
     * Enregistrer des absences en masse
     * @param {Array} absencesData - Tableau des données d'absences
     * @returns {Promise<Object>} - Résultat de l'enregistrement en masse
     */
    static async bulkCreate(absencesData) {
        try {
            const createdAbsences = [];
            const errors = [];

            for (const absenceData of absencesData) {
                try {
                    const absence = await this.create(absenceData);
                    createdAbsences.push(absence);
                } catch (error) {
                    errors.push({
                        data: absenceData,
                        error: error.message
                    });
                }
            }

            return { createdAbsences, errors };
        } catch (error) {
            throw new Error(`Erreur lors de l'enregistrement en masse: ${error.message}`);
        }
    }

    /**
     * Justifier une absence
     * @param {number} id - ID de l'absence
     * @param {string} justificationDocument - Document de justification
     * @param {string} reason - Raison de l'absence
     * @returns {Promise<Object|null>} - Absence mise à jour
     */
    static async justify(id, justificationDocument = null, reason = null) {
        return await this.update(id, {
            is_justified: true,
            justification_document: justificationDocument,
            reason: reason
        });
    }

    /**
     * Annuler la justification d'une absence
     * @param {number} id - ID de l'absence
     * @returns {Promise<Object|null>} - Absence mise à jour
     */
    static async unjustify(id) {
        return await this.update(id, {
            is_justified: false,
            justification_document: null,
            reason: null
        });
    }

    /**
     * Obtenir les absences non justifiées
     * @param {Object} filters - Filtres
     * @returns {Promise<Array>} - Liste des absences non justifiées
     */
    static async findUnjustified(filters = {}) {
        try {
            const { student_id = null, module_id = null, days_limit = 30 } = filters;

            let query = `
                SELECT a.*, 
                       s.student_number, u1.first_name as student_first_name, u1.last_name as student_last_name,
                       m.name as module_name, c.code as course_code, c.name as course_name
                FROM absences a
                JOIN students s ON a.student_id = s.id
                JOIN users u1 ON s.user_id = u1.id
                JOIN modules m ON a.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                WHERE a.is_justified = FALSE AND a.absence_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            `;
            const params = [days_limit];

            if (student_id) {
                query += ' AND a.student_id = ?';
                params.push(student_id);
            }

            if (module_id) {
                query += ' AND a.module_id = ?';
                params.push(module_id);
            }

            query += ' ORDER BY a.absence_date DESC';

            const [rows] = await db.execute(query, params);
            
            return rows.map(row => new Absence(row));
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des absences non justifiées: ${error.message}`);
        }
    }

    /**
     * Obtenir les statistiques générales d'absences
     * @param {Object} filters - Filtres
     * @returns {Promise<Object>} - Statistiques
     */
    static async getStatistics(filters = {}) {
        try {
            const { academic_year = null, module_id = null, teacher_id = null } = filters;

            // Nombre total d'absences
            let totalQuery = 'SELECT COUNT(*) as total FROM absences a';
            let totalParams = [];
            let joins = '';

            if (academic_year || teacher_id) {
                joins += ' JOIN modules m ON a.module_id = m.id JOIN courses c ON m.course_id = c.id';
            }

            totalQuery += joins + ' WHERE 1=1';

            if (academic_year) {
                totalQuery += ' AND c.academic_year = ?';
                totalParams.push(academic_year);
            }

            if (module_id) {
                totalQuery += ' AND a.module_id = ?';
                totalParams.push(module_id);
            }

            if (teacher_id) {
                totalQuery += ' AND a.recorded_by = ?';
                totalParams.push(teacher_id);
            }

            const [totalResult] = await db.execute(totalQuery, totalParams);

            // Absences par type
            let typeQuery = 'SELECT a.type, COUNT(*) as count FROM absences a';
            typeQuery += joins + ' WHERE 1=1';

            if (totalParams.length > 0) {
                typeQuery += totalQuery.split('WHERE 1=1')[1];
            }

            typeQuery += ' GROUP BY a.type';

            const [typeResult] = await db.execute(typeQuery, totalParams);

            // Taux de justification
            let justificationQuery = 'SELECT a.is_justified, COUNT(*) as count FROM absences a';
            justificationQuery += joins + ' WHERE 1=1';

            if (totalParams.length > 0) {
                justificationQuery += totalQuery.split('WHERE 1=1')[1];
            }

            justificationQuery += ' GROUP BY a.is_justified';

            const [justificationResult] = await db.execute(justificationQuery, totalParams);

            return {
                total: totalResult[0].total,
                byType: typeResult,
                byJustification: justificationResult
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }

    /**
     * Vérifier si l'absence est récente (moins de 7 jours)
     * @returns {boolean} - True si récente
     */
    isRecent() {
        const today = new Date();
        const absenceDate = new Date(this.absence_date);
        const diffTime = Math.abs(today - absenceDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 7;
    }

    /**
     * Obtenir le statut de l'absence
     * @returns {string} - Statut
     */
    getStatus() {
        if (this.is_justified) {
            return 'Justifiée';
        } else if (this.isRecent()) {
            return 'En attente';
        } else {
            return 'Non justifiée';
        }
    }
}

module.exports = Absence;