/**
 * Modèle Teacher
 * Gère les opérations CRUD pour la table teachers
 */

const db = require('../config/database');

class Teacher {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.employee_number = data.employee_number;
        this.department = data.department;
        this.specialization = data.specialization;
        this.hire_date = data.hire_date;
        this.status = data.status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer un nouvel enseignant
     * @param {Object} teacherData - Données de l'enseignant
     * @returns {Promise<Object>} - Enseignant créé
     */
    static async create(teacherData) {
        try {
            const query = `
                INSERT INTO teachers (
                    user_id, employee_number, department, specialization, 
                    hire_date, status
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                teacherData.user_id,
                teacherData.employee_number,
                teacherData.department,
                teacherData.specialization || null,
                teacherData.hire_date,
                teacherData.status || 'active'
            ];

            const [result] = await db.execute(query, values);
            
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création de l'enseignant: ${error.message}`);
        }
    }

    /**
     * Trouver un enseignant par ID
     * @param {number} id - ID de l'enseignant
     * @returns {Promise<Object|null>} - Enseignant trouvé ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                WHERE t.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Teacher(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'enseignant: ${error.message}`);
        }
    }

    /**
     * Trouver un enseignant par numéro d'employé
     * @param {string} employeeNumber - Numéro d'employé
     * @returns {Promise<Object|null>} - Enseignant trouvé ou null
     */
    static async findByEmployeeNumber(employeeNumber) {
        try {
            const query = `
                SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                WHERE t.employee_number = ?
            `;
            const [rows] = await db.execute(query, [employeeNumber]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Teacher(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'enseignant: ${error.message}`);
        }
    }

    /**
     * Trouver un enseignant par user_id
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object|null>} - Enseignant trouvé ou null
     */
    static async findByUserId(userId) {
        try {
            const query = `
                SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                WHERE t.user_id = ?
            `;
            const [rows] = await db.execute(query, [userId]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Teacher(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'enseignant: ${error.message}`);
        }
    }

    /**
     * Obtenir tous les enseignants avec pagination et filtrage
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des enseignants
     */
    static async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                department = null,
                status = null,
                search = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                WHERE 1=1
            `;
            let countQuery = `
                SELECT COUNT(*) as total
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                WHERE 1=1
            `;
            const params = [];

            // Filtrage par département
            if (department) {
                query += ' AND t.department = ?';
                countQuery += ' AND t.department = ?';
                params.push(department);
            }

            // Filtrage par statut
            if (status) {
                query += ' AND t.status = ?';
                countQuery += ' AND t.status = ?';
                params.push(status);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR t.employee_number LIKE ? OR t.department LIKE ?)';
                countQuery += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR t.employee_number LIKE ? OR t.department LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const teachers = rows.map(row => new Teacher(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                teachers,
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
            throw new Error(`Erreur lors de la récupération des enseignants: ${error.message}`);
        }
    }

    /**
     * Mettre à jour un enseignant
     * @param {number} id - ID de l'enseignant
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Enseignant mis à jour
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
                UPDATE teachers 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'enseignant: ${error.message}`);
        }
    }

    /**
     * Supprimer un enseignant
     * @param {number} id - ID de l'enseignant
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM teachers WHERE id = ?';
            const [result] = await db.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'enseignant: ${error.message}`);
        }
    }

    /**
     * Obtenir les enseignants par département
     * @param {string} department - Département recherché
     * @returns {Promise<Array>} - Liste des enseignants
     */
    static async findByDepartment(department) {
        try {
            const query = `
                SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM teachers t
                JOIN users u ON t.user_id = u.id
                WHERE t.department = ? AND t.status = 'active'
                ORDER BY u.first_name, u.last_name
            `;
            const [rows] = await db.execute(query, [department]);
            
            return rows.map(row => new Teacher(row));
        } catch (error) {
            throw new Error(`Erreur lors de la recherche par département: ${error.message}`);
        }
    }

    /**
     * Obtenir les modules enseignés par un enseignant
     * @param {number} teacherId - ID de l'enseignant
     * @param {string} academicYear - Année académique (optionnel)
     * @returns {Promise<Array>} - Liste des modules
     */
    static async getModules(teacherId, academicYear = null) {
        try {
            let query = `
                SELECT m.*, c.code as course_code, c.name as course_name, 
                       c.level, c.semester, c.academic_year
                FROM modules m
                JOIN courses c ON m.course_id = c.id
                WHERE m.teacher_id = ? AND m.is_active = TRUE
            `;
            const params = [teacherId];

            if (academicYear) {
                query += ' AND c.academic_year = ?';
                params.push(academicYear);
            }

            query += ' ORDER BY c.level, c.semester, c.name';

            const [rows] = await db.execute(query, params);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des modules: ${error.message}`);
        }
    }

    /**
     * Obtenir les étudiants d'un enseignant (via ses modules)
     * @param {number} teacherId - ID de l'enseignant
     * @param {string} academicYear - Année académique
     * @returns {Promise<Array>} - Liste des étudiants
     */
    static async getStudents(teacherId, academicYear) {
        try {
            const query = `
                SELECT DISTINCT s.*, u.first_name, u.last_name, u.email, u.phone
                FROM students s
                JOIN users u ON s.user_id = u.id
                JOIN enrollments e ON s.id = e.student_id
                JOIN courses c ON e.course_id = c.id
                JOIN modules m ON c.id = m.course_id
                WHERE m.teacher_id = ? AND c.academic_year = ? AND s.status = 'active'
                ORDER BY u.first_name, u.last_name
            `;
            const [rows] = await db.execute(query, [teacherId, academicYear]);
            
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des étudiants: ${error.message}`);
        }
    }

    /**
     * Générer un numéro d'employé unique
     * @param {string} prefix - Préfixe (ex: PROF)
     * @returns {Promise<string>} - Numéro d'employé généré
     */
    static async generateEmployeeNumber(prefix = 'PROF') {
        try {
            const query = `
                SELECT employee_number 
                FROM teachers 
                WHERE employee_number LIKE ?
                ORDER BY employee_number DESC 
                LIMIT 1
            `;
            const [rows] = await db.execute(query, [`${prefix}%`]);

            let nextNumber = 1;
            if (rows.length > 0) {
                const lastNumber = rows[0].employee_number;
                const numberPart = parseInt(lastNumber.substring(prefix.length)); // PROF001 -> 001
                nextNumber = numberPart + 1;
            }

            return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            throw new Error(`Erreur lors de la génération du numéro d'employé: ${error.message}`);
        }
    }

    /**
     * Obtenir les statistiques d'un enseignant
     * @param {number} teacherId - ID de l'enseignant
     * @param {string} academicYear - Année académique
     * @returns {Promise<Object>} - Statistiques
     */
    static async getStatistics(teacherId, academicYear) {
        try {
            // Nombre de modules
            const modulesQuery = `
                SELECT COUNT(*) as total_modules
                FROM modules m
                JOIN courses c ON m.course_id = c.id
                WHERE m.teacher_id = ? AND c.academic_year = ? AND m.is_active = TRUE
            `;
            const [modulesResult] = await db.execute(modulesQuery, [teacherId, academicYear]);

            // Nombre d'étudiants uniques
            const studentsQuery = `
                SELECT COUNT(DISTINCT s.id) as total_students
                FROM students s
                JOIN enrollments e ON s.id = e.student_id
                JOIN courses c ON e.course_id = c.id
                JOIN modules m ON c.id = m.course_id
                WHERE m.teacher_id = ? AND c.academic_year = ? AND s.status = 'active'
            `;
            const [studentsResult] = await db.execute(studentsQuery, [teacherId, academicYear]);

            // Nombre de notes saisies
            const gradesQuery = `
                SELECT COUNT(*) as total_grades
                FROM grades g
                JOIN modules m ON g.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                WHERE g.created_by = ? AND c.academic_year = ?
            `;
            const [gradesResult] = await db.execute(gradesQuery, [teacherId, academicYear]);

            // Nombre d'absences enregistrées
            const absencesQuery = `
                SELECT COUNT(*) as total_absences
                FROM absences a
                JOIN modules m ON a.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                WHERE a.recorded_by = ? AND c.academic_year = ?
            `;
            const [absencesResult] = await db.execute(absencesQuery, [teacherId, academicYear]);

            return {
                totalModules: modulesResult[0].total_modules,
                totalStudents: studentsResult[0].total_students,
                totalGrades: gradesResult[0].total_grades,
                totalAbsences: absencesResult[0].total_absences
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }
}

module.exports = Teacher;