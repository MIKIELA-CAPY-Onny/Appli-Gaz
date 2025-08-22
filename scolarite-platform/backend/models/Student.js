/**
 * Modèle Student
 * Gère les opérations CRUD pour la table students
 */

const db = require('../config/database');

class Student {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.student_number = data.student_number;
        this.birth_date = data.birth_date;
        this.birth_place = data.birth_place;
        this.nationality = data.nationality;
        this.level = data.level;
        this.academic_year = data.academic_year;
        this.enrollment_date = data.enrollment_date;
        this.status = data.status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer un nouvel étudiant
     * @param {Object} studentData - Données de l'étudiant
     * @returns {Promise<Object>} - Étudiant créé
     */
    static async create(studentData) {
        try {
            const query = `
                INSERT INTO students (
                    user_id, student_number, birth_date, birth_place, 
                    nationality, level, academic_year, enrollment_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                studentData.user_id,
                studentData.student_number,
                studentData.birth_date || null,
                studentData.birth_place || null,
                studentData.nationality || null,
                studentData.level,
                studentData.academic_year,
                studentData.enrollment_date,
                studentData.status || 'active'
            ];

            const [result] = await db.execute(query, values);
            
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création de l'étudiant: ${error.message}`);
        }
    }

    /**
     * Trouver un étudiant par ID
     * @param {number} id - ID de l'étudiant
     * @returns {Promise<Object|null>} - Étudiant trouvé ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE s.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Student(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'étudiant: ${error.message}`);
        }
    }

    /**
     * Trouver un étudiant par numéro étudiant
     * @param {string} studentNumber - Numéro de l'étudiant
     * @returns {Promise<Object|null>} - Étudiant trouvé ou null
     */
    static async findByStudentNumber(studentNumber) {
        try {
            const query = `
                SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE s.student_number = ?
            `;
            const [rows] = await db.execute(query, [studentNumber]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Student(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'étudiant: ${error.message}`);
        }
    }

    /**
     * Trouver un étudiant par user_id
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object|null>} - Étudiant trouvé ou null
     */
    static async findByUserId(userId) {
        try {
            const query = `
                SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE s.user_id = ?
            `;
            const [rows] = await db.execute(query, [userId]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Student(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'étudiant: ${error.message}`);
        }
    }

    /**
     * Obtenir tous les étudiants avec pagination et filtrage
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des étudiants
     */
    static async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                level = null,
                academic_year = null,
                status = null,
                search = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE 1=1
            `;
            let countQuery = `
                SELECT COUNT(*) as total
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE 1=1
            `;
            const params = [];

            // Filtrage par niveau
            if (level) {
                query += ' AND s.level = ?';
                countQuery += ' AND s.level = ?';
                params.push(level);
            }

            // Filtrage par année académique
            if (academic_year) {
                query += ' AND s.academic_year = ?';
                countQuery += ' AND s.academic_year = ?';
                params.push(academic_year);
            }

            // Filtrage par statut
            if (status) {
                query += ' AND s.status = ?';
                countQuery += ' AND s.status = ?';
                params.push(status);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR s.student_number LIKE ?)';
                countQuery += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR s.student_number LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const students = rows.map(row => new Student(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                students,
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
            throw new Error(`Erreur lors de la récupération des étudiants: ${error.message}`);
        }
    }

    /**
     * Mettre à jour un étudiant
     * @param {number} id - ID de l'étudiant
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Étudiant mis à jour
     */
    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            // Construire la requête dynamiquement
            Object.keys(updateData).forEach(key => {
                if (key !== 'id' && key !== 'created_at' && key !== 'user_id') {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);

            const query = `
                UPDATE students 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'étudiant: ${error.message}`);
        }
    }

    /**
     * Supprimer un étudiant
     * @param {number} id - ID de l'étudiant
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM students WHERE id = ?';
            const [result] = await db.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'étudiant: ${error.message}`);
        }
    }

    /**
     * Obtenir les étudiants par niveau
     * @param {string} level - Niveau recherché
     * @param {string} academicYear - Année académique
     * @returns {Promise<Array>} - Liste des étudiants
     */
    static async findByLevel(level, academicYear = null) {
        try {
            let query = `
                SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE s.level = ? AND s.status = 'active'
            `;
            const params = [level];

            if (academicYear) {
                query += ' AND s.academic_year = ?';
                params.push(academicYear);
            }

            query += ' ORDER BY u.first_name, u.last_name';

            const [rows] = await db.execute(query, params);
            
            return rows.map(row => new Student(row));
        } catch (error) {
            throw new Error(`Erreur lors de la recherche par niveau: ${error.message}`);
        }
    }

    /**
     * Obtenir les inscriptions d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @returns {Promise<Array>} - Liste des inscriptions
     */
    static async getEnrollments(studentId) {
        try {
            const query = `
                SELECT e.*, c.code, c.name as course_name, c.credits, c.level, c.semester
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                WHERE e.student_id = ?
                ORDER BY e.academic_year DESC, c.semester, c.name
            `;
            const [rows] = await db.execute(query, [studentId]);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des inscriptions: ${error.message}`);
        }
    }

    /**
     * Obtenir les notes d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @param {string} academicYear - Année académique (optionnel)
     * @returns {Promise<Array>} - Liste des notes
     */
    static async getGrades(studentId, academicYear = null) {
        try {
            let query = `
                SELECT g.*, m.name as module_name, m.coefficient as module_coefficient,
                       c.code as course_code, c.name as course_name
                FROM grades g
                JOIN modules m ON g.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                WHERE g.student_id = ?
            `;
            const params = [studentId];

            if (academicYear) {
                query += ' AND c.academic_year = ?';
                params.push(academicYear);
            }

            query += ' ORDER BY g.created_at DESC';

            const [rows] = await db.execute(query, params);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des notes: ${error.message}`);
        }
    }

    /**
     * Obtenir les absences d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @param {Object} options - Options de filtrage
     * @returns {Promise<Array>} - Liste des absences
     */
    static async getAbsences(studentId, options = {}) {
        try {
            const { startDate = null, endDate = null, moduleId = null } = options;

            let query = `
                SELECT a.*, m.name as module_name, c.code as course_code, c.name as course_name
                FROM absences a
                JOIN modules m ON a.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                WHERE a.student_id = ?
            `;
            const params = [studentId];

            if (startDate) {
                query += ' AND a.absence_date >= ?';
                params.push(startDate);
            }

            if (endDate) {
                query += ' AND a.absence_date <= ?';
                params.push(endDate);
            }

            if (moduleId) {
                query += ' AND a.module_id = ?';
                params.push(moduleId);
            }

            query += ' ORDER BY a.absence_date DESC';

            const [rows] = await db.execute(query, params);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des absences: ${error.message}`);
        }
    }

    /**
     * Générer un numéro étudiant unique
     * @param {string} year - Année (format: 2024)
     * @returns {Promise<string>} - Numéro étudiant généré
     */
    static async generateStudentNumber(year) {
        try {
            const query = `
                SELECT student_number 
                FROM students 
                WHERE student_number LIKE ?
                ORDER BY student_number DESC 
                LIMIT 1
            `;
            const [rows] = await db.execute(query, [`ETU${year}%`]);

            let nextNumber = 1;
            if (rows.length > 0) {
                const lastNumber = rows[0].student_number;
                const numberPart = parseInt(lastNumber.substring(7)); // ETU2024001 -> 001
                nextNumber = numberPart + 1;
            }

            return `ETU${year}${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            throw new Error(`Erreur lors de la génération du numéro étudiant: ${error.message}`);
        }
    }

    /**
     * Calculer la moyenne générale d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @param {string} academicYear - Année académique
     * @returns {Promise<Object>} - Moyenne et détails
     */
    static async calculateGPA(studentId, academicYear) {
        try {
            const query = `
                SELECT 
                    AVG(g.grade * g.coefficient / g.max_grade * 20) as average,
                    SUM(g.coefficient) as total_coefficient,
                    COUNT(g.id) as total_grades
                FROM grades g
                JOIN modules m ON g.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                WHERE g.student_id = ? AND c.academic_year = ?
            `;
            const [rows] = await db.execute(query, [studentId, academicYear]);

            const result = rows[0];
            return {
                average: result.average ? parseFloat(result.average.toFixed(2)) : null,
                totalCoefficient: result.total_coefficient || 0,
                totalGrades: result.total_grades || 0
            };
        } catch (error) {
            throw new Error(`Erreur lors du calcul de la moyenne: ${error.message}`);
        }
    }
}

module.exports = Student;