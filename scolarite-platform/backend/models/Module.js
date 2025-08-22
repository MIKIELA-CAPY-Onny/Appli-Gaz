/**
 * Modèle Module
 * Gère les opérations CRUD pour la table modules
 */

const db = require('../config/database');

class Module {
    constructor(data) {
        this.id = data.id;
        this.course_id = data.course_id;
        this.teacher_id = data.teacher_id;
        this.name = data.name;
        this.description = data.description;
        this.coefficient = data.coefficient;
        this.hours_total = data.hours_total;
        this.hours_cm = data.hours_cm;
        this.hours_td = data.hours_td;
        this.hours_tp = data.hours_tp;
        this.evaluation_type = data.evaluation_type;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer un nouveau module
     * @param {Object} moduleData - Données du module
     * @returns {Promise<Object>} - Module créé
     */
    static async create(moduleData) {
        try {
            const query = `
                INSERT INTO modules (
                    course_id, teacher_id, name, description, coefficient,
                    hours_total, hours_cm, hours_td, hours_tp, evaluation_type, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                moduleData.course_id,
                moduleData.teacher_id,
                moduleData.name,
                moduleData.description || null,
                moduleData.coefficient || 1.00,
                moduleData.hours_total,
                moduleData.hours_cm || 0,
                moduleData.hours_td || 0,
                moduleData.hours_tp || 0,
                moduleData.evaluation_type || 'mixed',
                moduleData.is_active !== undefined ? moduleData.is_active : true
            ];

            const [result] = await db.execute(query, values);
            
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création du module: ${error.message}`);
        }
    }

    /**
     * Trouver un module par ID
     * @param {number} id - ID du module
     * @returns {Promise<Object|null>} - Module trouvé ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT m.*, c.code as course_code, c.name as course_name, c.level, c.semester,
                       u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM modules m
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON m.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                WHERE m.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Module(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche du module: ${error.message}`);
        }
    }

    /**
     * Obtenir tous les modules avec pagination et filtrage
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des modules
     */
    static async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                course_id = null,
                teacher_id = null,
                is_active = null,
                search = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT m.*, c.code as course_code, c.name as course_name, c.level, c.semester,
                       u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM modules m
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON m.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                WHERE 1=1
            `;
            let countQuery = `
                SELECT COUNT(*) as total
                FROM modules m
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON m.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                WHERE 1=1
            `;
            const params = [];

            // Filtrage par cours
            if (course_id) {
                query += ' AND m.course_id = ?';
                countQuery += ' AND m.course_id = ?';
                params.push(course_id);
            }

            // Filtrage par enseignant
            if (teacher_id) {
                query += ' AND m.teacher_id = ?';
                countQuery += ' AND m.teacher_id = ?';
                params.push(teacher_id);
            }

            // Filtrage par statut actif
            if (is_active !== null) {
                query += ' AND m.is_active = ?';
                countQuery += ' AND m.is_active = ?';
                params.push(is_active);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (m.name LIKE ? OR m.description LIKE ? OR c.name LIKE ?)';
                countQuery += ' AND (m.name LIKE ? OR m.description LIKE ? OR c.name LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY c.level, c.semester, m.name LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const modules = rows.map(row => new Module(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                modules,
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
            throw new Error(`Erreur lors de la récupération des modules: ${error.message}`);
        }
    }

    /**
     * Mettre à jour un module
     * @param {number} id - ID du module
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Module mis à jour
     */
    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            // Construire la requête dynamiquement
            Object.keys(updateData).forEach(key => {
                if (key !== 'id' && key !== 'created_at') {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);

            const query = `
                UPDATE modules 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du module: ${error.message}`);
        }
    }

    /**
     * Supprimer un module
     * @param {number} id - ID du module
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM modules WHERE id = ?';
            const [result] = await db.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du module: ${error.message}`);
        }
    }

    /**
     * Obtenir les étudiants inscrits à un module
     * @param {number} moduleId - ID du module
     * @returns {Promise<Array>} - Liste des étudiants
     */
    static async getEnrolledStudents(moduleId) {
        try {
            const query = `
                SELECT DISTINCT s.*, u.first_name, u.last_name, u.email
                FROM students s
                JOIN users u ON s.user_id = u.id
                JOIN enrollments e ON s.id = e.student_id
                JOIN modules m ON e.course_id = m.course_id
                WHERE m.id = ? AND s.status = 'active'
                ORDER BY u.first_name, u.last_name
            `;
            const [rows] = await db.execute(query, [moduleId]);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des étudiants: ${error.message}`);
        }
    }

    /**
     * Obtenir les notes d'un module
     * @param {number} moduleId - ID du module
     * @param {Object} options - Options de filtrage
     * @returns {Promise<Array>} - Liste des notes
     */
    static async getGrades(moduleId, options = {}) {
        try {
            const { student_id = null, grade_type = null } = options;

            let query = `
                SELECT g.*, s.student_number, u.first_name, u.last_name
                FROM grades g
                JOIN students s ON g.student_id = s.id
                JOIN users u ON s.user_id = u.id
                WHERE g.module_id = ?
            `;
            const params = [moduleId];

            if (student_id) {
                query += ' AND g.student_id = ?';
                params.push(student_id);
            }

            if (grade_type) {
                query += ' AND g.grade_type = ?';
                params.push(grade_type);
            }

            query += ' ORDER BY u.first_name, u.last_name, g.grade_type';

            const [rows] = await db.execute(query, params);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des notes: ${error.message}`);
        }
    }

    /**
     * Obtenir les absences d'un module
     * @param {number} moduleId - ID du module
     * @param {Object} options - Options de filtrage
     * @returns {Promise<Array>} - Liste des absences
     */
    static async getAbsences(moduleId, options = {}) {
        try {
            const { startDate = null, endDate = null, student_id = null } = options;

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

            if (startDate) {
                query += ' AND a.absence_date >= ?';
                params.push(startDate);
            }

            if (endDate) {
                query += ' AND a.absence_date <= ?';
                params.push(endDate);
            }

            query += ' ORDER BY a.absence_date DESC, u.first_name, u.last_name';

            const [rows] = await db.execute(query, params);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des absences: ${error.message}`);
        }
    }

    /**
     * Calculer la moyenne d'un module
     * @param {number} moduleId - ID du module
     * @param {number} studentId - ID de l'étudiant (optionnel)
     * @returns {Promise<Object>} - Statistiques du module
     */
    static async calculateAverage(moduleId, studentId = null) {
        try {
            let query = `
                SELECT 
                    AVG(g.grade * g.coefficient / g.max_grade * 20) as average,
                    COUNT(g.id) as total_grades,
                    MIN(g.grade * g.coefficient / g.max_grade * 20) as min_grade,
                    MAX(g.grade * g.coefficient / g.max_grade * 20) as max_grade
                FROM grades g
                WHERE g.module_id = ?
            `;
            const params = [moduleId];

            if (studentId) {
                query += ' AND g.student_id = ?';
                params.push(studentId);
            }

            const [rows] = await db.execute(query, params);
            const result = rows[0];

            return {
                average: result.average ? parseFloat(result.average.toFixed(2)) : null,
                totalGrades: result.total_grades || 0,
                minGrade: result.min_grade ? parseFloat(result.min_grade.toFixed(2)) : null,
                maxGrade: result.max_grade ? parseFloat(result.max_grade.toFixed(2)) : null
            };
        } catch (error) {
            throw new Error(`Erreur lors du calcul de la moyenne: ${error.message}`);
        }
    }

    /**
     * Obtenir les statistiques d'un module
     * @param {number} moduleId - ID du module
     * @returns {Promise<Object>} - Statistiques complètes
     */
    static async getStatistics(moduleId) {
        try {
            // Nombre d'étudiants inscrits
            const studentsQuery = `
                SELECT COUNT(DISTINCT s.id) as total_students
                FROM students s
                JOIN enrollments e ON s.id = e.student_id
                JOIN modules m ON e.course_id = m.course_id
                WHERE m.id = ? AND s.status = 'active'
            `;
            const [studentsResult] = await db.execute(studentsQuery, [moduleId]);

            // Nombre de notes saisies
            const gradesQuery = `
                SELECT COUNT(*) as total_grades
                FROM grades
                WHERE module_id = ?
            `;
            const [gradesResult] = await db.execute(gradesQuery, [moduleId]);

            // Nombre d'absences
            const absencesQuery = `
                SELECT COUNT(*) as total_absences
                FROM absences
                WHERE module_id = ?
            `;
            const [absencesResult] = await db.execute(absencesQuery, [moduleId]);

            // Moyenne générale
            const averageStats = await this.calculateAverage(moduleId);

            return {
                totalStudents: studentsResult[0].total_students,
                totalGrades: gradesResult[0].total_grades,
                totalAbsences: absencesResult[0].total_absences,
                ...averageStats
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }

    /**
     * Désactiver un module
     * @param {number} id - ID du module
     * @returns {Promise<Object|null>} - Module mis à jour
     */
    static async deactivate(id) {
        return await this.update(id, { is_active: false });
    }

    /**
     * Activer un module
     * @param {number} id - ID du module
     * @returns {Promise<Object|null>} - Module mis à jour
     */
    static async activate(id) {
        return await this.update(id, { is_active: true });
    }
}

module.exports = Module;