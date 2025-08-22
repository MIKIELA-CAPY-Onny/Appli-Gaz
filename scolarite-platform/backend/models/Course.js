/**
 * Modèle Course
 * Gère les opérations CRUD pour la table courses
 */

const db = require('../config/database');

class Course {
    constructor(data) {
        this.id = data.id;
        this.code = data.code;
        this.name = data.name;
        this.description = data.description;
        this.credits = data.credits;
        this.level = data.level;
        this.semester = data.semester;
        this.academic_year = data.academic_year;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer un nouveau cours
     * @param {Object} courseData - Données du cours
     * @returns {Promise<Object>} - Cours créé
     */
    static async create(courseData) {
        try {
            const query = `
                INSERT INTO courses (
                    code, name, description, credits, level, 
                    semester, academic_year, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                courseData.code,
                courseData.name,
                courseData.description || null,
                courseData.credits || 3,
                courseData.level,
                courseData.semester,
                courseData.academic_year,
                courseData.is_active !== undefined ? courseData.is_active : true
            ];

            const [result] = await db.execute(query, values);
            
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création du cours: ${error.message}`);
        }
    }

    /**
     * Trouver un cours par ID
     * @param {number} id - ID du cours
     * @returns {Promise<Object|null>} - Cours trouvé ou null
     */
    static async findById(id) {
        try {
            const query = 'SELECT * FROM courses WHERE id = ?';
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Course(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche du cours: ${error.message}`);
        }
    }

    /**
     * Trouver un cours par code
     * @param {string} code - Code du cours
     * @returns {Promise<Object|null>} - Cours trouvé ou null
     */
    static async findByCode(code) {
        try {
            const query = 'SELECT * FROM courses WHERE code = ?';
            const [rows] = await db.execute(query, [code]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Course(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche du cours: ${error.message}`);
        }
    }

    /**
     * Obtenir tous les cours avec pagination et filtrage
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des cours
     */
    static async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                level = null,
                semester = null,
                academic_year = null,
                is_active = null,
                search = null
            } = options;

            const offset = (page - 1) * limit;
            let query = 'SELECT * FROM courses WHERE 1=1';
            let countQuery = 'SELECT COUNT(*) as total FROM courses WHERE 1=1';
            const params = [];

            // Filtrage par niveau
            if (level) {
                query += ' AND level = ?';
                countQuery += ' AND level = ?';
                params.push(level);
            }

            // Filtrage par semestre
            if (semester) {
                query += ' AND semester = ?';
                countQuery += ' AND semester = ?';
                params.push(semester);
            }

            // Filtrage par année académique
            if (academic_year) {
                query += ' AND academic_year = ?';
                countQuery += ' AND academic_year = ?';
                params.push(academic_year);
            }

            // Filtrage par statut actif
            if (is_active !== null) {
                query += ' AND is_active = ?';
                countQuery += ' AND is_active = ?';
                params.push(is_active);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (code LIKE ? OR name LIKE ? OR description LIKE ?)';
                countQuery += ' AND (code LIKE ? OR name LIKE ? OR description LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY level, semester, name LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const courses = rows.map(row => new Course(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                courses,
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
            throw new Error(`Erreur lors de la récupération des cours: ${error.message}`);
        }
    }

    /**
     * Mettre à jour un cours
     * @param {number} id - ID du cours
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Cours mis à jour
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
                UPDATE courses 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du cours: ${error.message}`);
        }
    }

    /**
     * Supprimer un cours
     * @param {number} id - ID du cours
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM courses WHERE id = ?';
            const [result] = await db.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du cours: ${error.message}`);
        }
    }

    /**
     * Obtenir les cours par niveau et semestre
     * @param {string} level - Niveau
     * @param {string} semester - Semestre
     * @param {string} academicYear - Année académique
     * @returns {Promise<Array>} - Liste des cours
     */
    static async findByLevelAndSemester(level, semester, academicYear) {
        try {
            const query = `
                SELECT * FROM courses 
                WHERE level = ? AND semester = ? AND academic_year = ? AND is_active = TRUE
                ORDER BY name
            `;
            const [rows] = await db.execute(query, [level, semester, academicYear]);
            
            return rows.map(row => new Course(row));
        } catch (error) {
            throw new Error(`Erreur lors de la recherche des cours: ${error.message}`);
        }
    }

    /**
     * Obtenir les modules d'un cours
     * @param {number} courseId - ID du cours
     * @returns {Promise<Array>} - Liste des modules
     */
    static async getModules(courseId) {
        try {
            const query = `
                SELECT m.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name
                FROM modules m
                JOIN teachers te ON m.teacher_id = te.id
                JOIN users t ON te.user_id = t.id
                WHERE m.course_id = ? AND m.is_active = TRUE
                ORDER BY m.name
            `;
            const [rows] = await db.execute(query, [courseId]);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des modules: ${error.message}`);
        }
    }

    /**
     * Obtenir les étudiants inscrits à un cours
     * @param {number} courseId - ID du cours
     * @param {string} academicYear - Année académique
     * @returns {Promise<Array>} - Liste des étudiants
     */
    static async getEnrolledStudents(courseId, academicYear) {
        try {
            const query = `
                SELECT s.*, u.first_name, u.last_name, u.email, e.enrollment_date, e.status as enrollment_status
                FROM students s
                JOIN users u ON s.user_id = u.id
                JOIN enrollments e ON s.id = e.student_id
                WHERE e.course_id = ? AND e.academic_year = ?
                ORDER BY u.first_name, u.last_name
            `;
            const [rows] = await db.execute(query, [courseId, academicYear]);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des étudiants inscrits: ${error.message}`);
        }
    }

    /**
     * Obtenir les statistiques d'un cours
     * @param {number} courseId - ID du cours
     * @param {string} academicYear - Année académique
     * @returns {Promise<Object>} - Statistiques du cours
     */
    static async getStatistics(courseId, academicYear) {
        try {
            // Nombre d'étudiants inscrits
            const enrollmentsQuery = `
                SELECT COUNT(*) as total_enrollments
                FROM enrollments
                WHERE course_id = ? AND academic_year = ?
            `;
            const [enrollmentsResult] = await db.execute(enrollmentsQuery, [courseId, academicYear]);

            // Nombre de modules
            const modulesQuery = `
                SELECT COUNT(*) as total_modules
                FROM modules
                WHERE course_id = ? AND is_active = TRUE
            `;
            const [modulesResult] = await db.execute(modulesQuery, [courseId]);

            // Moyenne générale du cours
            const averageQuery = `
                SELECT AVG(g.grade * g.coefficient / g.max_grade * 20) as average_grade
                FROM grades g
                JOIN modules m ON g.module_id = m.id
                WHERE m.course_id = ?
            `;
            const [averageResult] = await db.execute(averageQuery, [courseId]);

            return {
                totalEnrollments: enrollmentsResult[0].total_enrollments,
                totalModules: modulesResult[0].total_modules,
                averageGrade: averageResult[0].average_grade ? parseFloat(averageResult[0].average_grade.toFixed(2)) : null
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }

    /**
     * Obtenir les années académiques disponibles
     * @returns {Promise<Array>} - Liste des années académiques
     */
    static async getAcademicYears() {
        try {
            const query = `
                SELECT DISTINCT academic_year 
                FROM courses 
                ORDER BY academic_year DESC
            `;
            const [rows] = await db.execute(query);
            
            return rows.map(row => row.academic_year);
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des années académiques: ${error.message}`);
        }
    }

    /**
     * Désactiver un cours
     * @param {number} id - ID du cours
     * @returns {Promise<Object|null>} - Cours mis à jour
     */
    static async deactivate(id) {
        return await this.update(id, { is_active: false });
    }

    /**
     * Activer un cours
     * @param {number} id - ID du cours
     * @returns {Promise<Object|null>} - Cours mis à jour
     */
    static async activate(id) {
        return await this.update(id, { is_active: true });
    }
}

module.exports = Course;