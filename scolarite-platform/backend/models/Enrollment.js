/**
 * Modèle Enrollment
 * Gère les opérations CRUD pour la table enrollments
 */

const db = require('../config/database');

class Enrollment {
    constructor(data) {
        this.id = data.id;
        this.student_id = data.student_id;
        this.course_id = data.course_id;
        this.academic_year = data.academic_year;
        this.enrollment_date = data.enrollment_date;
        this.status = data.status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer une nouvelle inscription
     * @param {Object} enrollmentData - Données de l'inscription
     * @returns {Promise<Object>} - Inscription créée
     */
    static async create(enrollmentData) {
        try {
            const query = `
                INSERT INTO enrollments (
                    student_id, course_id, academic_year, enrollment_date, status
                ) VALUES (?, ?, ?, ?, ?)
            `;
            
            const values = [
                enrollmentData.student_id,
                enrollmentData.course_id,
                enrollmentData.academic_year,
                enrollmentData.enrollment_date || new Date(),
                enrollmentData.status || 'enrolled'
            ];

            const [result] = await db.execute(query, values);
            
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création de l'inscription: ${error.message}`);
        }
    }

    /**
     * Trouver une inscription par ID
     * @param {number} id - ID de l'inscription
     * @returns {Promise<Object|null>} - Inscription trouvée ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT e.*, 
                       s.student_number, u.first_name as student_first_name, u.last_name as student_last_name,
                       c.code as course_code, c.name as course_name, c.level, c.semester
                FROM enrollments e
                JOIN students s ON e.student_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN courses c ON e.course_id = c.id
                WHERE e.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Enrollment(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'inscription: ${error.message}`);
        }
    }

    /**
     * Vérifier si une inscription existe
     * @param {number} studentId - ID de l'étudiant
     * @param {number} courseId - ID du cours
     * @param {string} academicYear - Année académique
     * @returns {Promise<Object|null>} - Inscription trouvée ou null
     */
    static async findByStudentAndCourse(studentId, courseId, academicYear) {
        try {
            const query = `
                SELECT e.*, 
                       s.student_number, u.first_name as student_first_name, u.last_name as student_last_name,
                       c.code as course_code, c.name as course_name, c.level, c.semester
                FROM enrollments e
                JOIN students s ON e.student_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN courses c ON e.course_id = c.id
                WHERE e.student_id = ? AND e.course_id = ? AND e.academic_year = ?
            `;
            const [rows] = await db.execute(query, [studentId, courseId, academicYear]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Enrollment(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'inscription: ${error.message}`);
        }
    }

    /**
     * Obtenir toutes les inscriptions avec pagination et filtrage
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des inscriptions
     */
    static async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                student_id = null,
                course_id = null,
                academic_year = null,
                status = null,
                search = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT e.*, 
                       s.student_number, u.first_name as student_first_name, u.last_name as student_last_name,
                       c.code as course_code, c.name as course_name, c.level, c.semester
                FROM enrollments e
                JOIN students s ON e.student_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN courses c ON e.course_id = c.id
                WHERE 1=1
            `;
            let countQuery = `
                SELECT COUNT(*) as total
                FROM enrollments e
                JOIN students s ON e.student_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN courses c ON e.course_id = c.id
                WHERE 1=1
            `;
            const params = [];

            // Filtrage par étudiant
            if (student_id) {
                query += ' AND e.student_id = ?';
                countQuery += ' AND e.student_id = ?';
                params.push(student_id);
            }

            // Filtrage par cours
            if (course_id) {
                query += ' AND e.course_id = ?';
                countQuery += ' AND e.course_id = ?';
                params.push(course_id);
            }

            // Filtrage par année académique
            if (academic_year) {
                query += ' AND e.academic_year = ?';
                countQuery += ' AND e.academic_year = ?';
                params.push(academic_year);
            }

            // Filtrage par statut
            if (status) {
                query += ' AND e.status = ?';
                countQuery += ' AND e.status = ?';
                params.push(status);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR s.student_number LIKE ? OR c.name LIKE ?)';
                countQuery += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR s.student_number LIKE ? OR c.name LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const enrollments = rows.map(row => new Enrollment(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                enrollments,
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
            throw new Error(`Erreur lors de la récupération des inscriptions: ${error.message}`);
        }
    }

    /**
     * Mettre à jour une inscription
     * @param {number} id - ID de l'inscription
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Inscription mise à jour
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
                UPDATE enrollments 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'inscription: ${error.message}`);
        }
    }

    /**
     * Supprimer une inscription
     * @param {number} id - ID de l'inscription
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM enrollments WHERE id = ?';
            const [result] = await db.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'inscription: ${error.message}`);
        }
    }

    /**
     * Obtenir les inscriptions d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @param {string} academicYear - Année académique (optionnel)
     * @returns {Promise<Array>} - Liste des inscriptions
     */
    static async findByStudent(studentId, academicYear = null) {
        try {
            let query = `
                SELECT e.*, c.code as course_code, c.name as course_name, 
                       c.level, c.semester, c.credits
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                WHERE e.student_id = ?
            `;
            const params = [studentId];

            if (academicYear) {
                query += ' AND e.academic_year = ?';
                params.push(academicYear);
            }

            query += ' ORDER BY e.academic_year DESC, c.semester, c.name';

            const [rows] = await db.execute(query, params);
            
            return rows.map(row => new Enrollment(row));
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des inscriptions: ${error.message}`);
        }
    }

    /**
     * Obtenir les inscriptions d'un cours
     * @param {number} courseId - ID du cours
     * @param {string} academicYear - Année académique
     * @returns {Promise<Array>} - Liste des inscriptions
     */
    static async findByCourse(courseId, academicYear) {
        try {
            const query = `
                SELECT e.*, s.student_number, u.first_name, u.last_name, u.email
                FROM enrollments e
                JOIN students s ON e.student_id = s.id
                JOIN users u ON s.user_id = u.id
                WHERE e.course_id = ? AND e.academic_year = ?
                ORDER BY u.first_name, u.last_name
            `;
            const [rows] = await db.execute(query, [courseId, academicYear]);
            
            return rows.map(row => new Enrollment(row));
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des inscriptions: ${error.message}`);
        }
    }

    /**
     * Inscrire en masse des étudiants à un cours
     * @param {Array} studentIds - IDs des étudiants
     * @param {number} courseId - ID du cours
     * @param {string} academicYear - Année académique
     * @returns {Promise<Array>} - Liste des inscriptions créées
     */
    static async bulkEnroll(studentIds, courseId, academicYear) {
        try {
            const enrollments = [];
            const errors = [];

            for (const studentId of studentIds) {
                try {
                    // Vérifier si l'inscription existe déjà
                    const existing = await this.findByStudentAndCourse(studentId, courseId, academicYear);
                    if (existing) {
                        errors.push(`Étudiant ${studentId} déjà inscrit`);
                        continue;
                    }

                    const enrollment = await this.create({
                        student_id: studentId,
                        course_id: courseId,
                        academic_year: academicYear,
                        enrollment_date: new Date(),
                        status: 'enrolled'
                    });

                    enrollments.push(enrollment);
                } catch (error) {
                    errors.push(`Erreur pour l'étudiant ${studentId}: ${error.message}`);
                }
            }

            return { enrollments, errors };
        } catch (error) {
            throw new Error(`Erreur lors de l'inscription en masse: ${error.message}`);
        }
    }

    /**
     * Obtenir les statistiques d'inscription
     * @param {Object} filters - Filtres
     * @returns {Promise<Object>} - Statistiques
     */
    static async getStatistics(filters = {}) {
        try {
            const { academic_year = null, course_id = null } = filters;

            // Nombre total d'inscriptions
            let totalQuery = 'SELECT COUNT(*) as total FROM enrollments WHERE 1=1';
            const totalParams = [];

            if (academic_year) {
                totalQuery += ' AND academic_year = ?';
                totalParams.push(academic_year);
            }

            if (course_id) {
                totalQuery += ' AND course_id = ?';
                totalParams.push(course_id);
            }

            const [totalResult] = await db.execute(totalQuery, totalParams);

            // Inscriptions par statut
            let statusQuery = `
                SELECT status, COUNT(*) as count 
                FROM enrollments 
                WHERE 1=1
            `;
            const statusParams = [];

            if (academic_year) {
                statusQuery += ' AND academic_year = ?';
                statusParams.push(academic_year);
            }

            if (course_id) {
                statusQuery += ' AND course_id = ?';
                statusParams.push(course_id);
            }

            statusQuery += ' GROUP BY status';

            const [statusResult] = await db.execute(statusQuery, statusParams);

            // Inscriptions par niveau
            let levelQuery = `
                SELECT c.level, COUNT(*) as count 
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                WHERE 1=1
            `;
            const levelParams = [];

            if (academic_year) {
                levelQuery += ' AND e.academic_year = ?';
                levelParams.push(academic_year);
            }

            if (course_id) {
                levelQuery += ' AND e.course_id = ?';
                levelParams.push(course_id);
            }

            levelQuery += ' GROUP BY c.level ORDER BY c.level';

            const [levelResult] = await db.execute(levelQuery, levelParams);

            return {
                total: totalResult[0].total,
                byStatus: statusResult,
                byLevel: levelResult
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }

    /**
     * Changer le statut d'une inscription
     * @param {number} id - ID de l'inscription
     * @param {string} status - Nouveau statut
     * @returns {Promise<Object|null>} - Inscription mise à jour
     */
    static async updateStatus(id, status) {
        return await this.update(id, { status });
    }

    /**
     * Obtenir les inscriptions expirées ou à renouveler
     * @param {string} academicYear - Année académique
     * @returns {Promise<Array>} - Liste des inscriptions
     */
    static async findExpiring(academicYear) {
        try {
            const query = `
                SELECT e.*, s.student_number, u.first_name, u.last_name, u.email,
                       c.code as course_code, c.name as course_name
                FROM enrollments e
                JOIN students s ON e.student_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN courses c ON e.course_id = c.id
                WHERE e.academic_year = ? AND e.status = 'enrolled'
                ORDER BY c.level, u.first_name, u.last_name
            `;
            const [rows] = await db.execute(query, [academicYear]);
            
            return rows.map(row => new Enrollment(row));
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des inscriptions expirantes: ${error.message}`);
        }
    }
}

module.exports = Enrollment;