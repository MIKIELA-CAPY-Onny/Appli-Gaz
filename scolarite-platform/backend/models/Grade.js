/**
 * Modèle Grade
 * Gère les opérations CRUD pour la table grades
 */

const db = require('../config/database');

class Grade {
    constructor(data) {
        this.id = data.id;
        this.student_id = data.student_id;
        this.module_id = data.module_id;
        this.grade_type = data.grade_type;
        this.grade = data.grade;
        this.max_grade = data.max_grade;
        this.coefficient = data.coefficient;
        this.exam_date = data.exam_date;
        this.comments = data.comments;
        this.created_by = data.created_by;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer une nouvelle note
     * @param {Object} gradeData - Données de la note
     * @returns {Promise<Object>} - Note créée
     */
    static async create(gradeData) {
        try {
            const query = `
                INSERT INTO grades (
                    student_id, module_id, grade_type, grade, max_grade,
                    coefficient, exam_date, comments, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                gradeData.student_id,
                gradeData.module_id,
                gradeData.grade_type,
                gradeData.grade,
                gradeData.max_grade || 20.00,
                gradeData.coefficient || 1.00,
                gradeData.exam_date || null,
                gradeData.comments || null,
                gradeData.created_by
            ];

            const [result] = await db.execute(query, values);
            
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création de la note: ${error.message}`);
        }
    }

    /**
     * Trouver une note par ID
     * @param {number} id - ID de la note
     * @returns {Promise<Object|null>} - Note trouvée ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT g.*, 
                       s.student_number, u1.first_name as student_first_name, u1.last_name as student_last_name,
                       m.name as module_name, c.code as course_code, c.name as course_name,
                       u2.first_name as teacher_first_name, u2.last_name as teacher_last_name
                FROM grades g
                JOIN students s ON g.student_id = s.id
                JOIN users u1 ON s.user_id = u1.id
                JOIN modules m ON g.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON g.created_by = t.id
                JOIN users u2 ON t.user_id = u2.id
                WHERE g.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Grade(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de la note: ${error.message}`);
        }
    }

    /**
     * Obtenir toutes les notes avec pagination et filtrage
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des notes
     */
    static async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                student_id = null,
                module_id = null,
                grade_type = null,
                created_by = null,
                search = null
            } = options;

            const offset = (page - 1) * limit;
            let query = `
                SELECT g.*, 
                       s.student_number, u1.first_name as student_first_name, u1.last_name as student_last_name,
                       m.name as module_name, c.code as course_code, c.name as course_name,
                       u2.first_name as teacher_first_name, u2.last_name as teacher_last_name
                FROM grades g
                JOIN students s ON g.student_id = s.id
                JOIN users u1 ON s.user_id = u1.id
                JOIN modules m ON g.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON g.created_by = t.id
                JOIN users u2 ON t.user_id = u2.id
                WHERE 1=1
            `;
            let countQuery = `
                SELECT COUNT(*) as total
                FROM grades g
                JOIN students s ON g.student_id = s.id
                JOIN users u1 ON s.user_id = u1.id
                JOIN modules m ON g.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON g.created_by = t.id
                JOIN users u2 ON t.user_id = u2.id
                WHERE 1=1
            `;
            const params = [];

            // Filtrage par étudiant
            if (student_id) {
                query += ' AND g.student_id = ?';
                countQuery += ' AND g.student_id = ?';
                params.push(student_id);
            }

            // Filtrage par module
            if (module_id) {
                query += ' AND g.module_id = ?';
                countQuery += ' AND g.module_id = ?';
                params.push(module_id);
            }

            // Filtrage par type de note
            if (grade_type) {
                query += ' AND g.grade_type = ?';
                countQuery += ' AND g.grade_type = ?';
                params.push(grade_type);
            }

            // Filtrage par enseignant créateur
            if (created_by) {
                query += ' AND g.created_by = ?';
                countQuery += ' AND g.created_by = ?';
                params.push(created_by);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (u1.first_name LIKE ? OR u1.last_name LIKE ? OR s.student_number LIKE ? OR m.name LIKE ?)';
                countQuery += ' AND (u1.first_name LIKE ? OR u1.last_name LIKE ? OR s.student_number LIKE ? OR m.name LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY g.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const grades = rows.map(row => new Grade(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                grades,
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
            throw new Error(`Erreur lors de la récupération des notes: ${error.message}`);
        }
    }

    /**
     * Mettre à jour une note
     * @param {number} id - ID de la note
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Note mise à jour
     */
    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            // Construire la requête dynamiquement
            Object.keys(updateData).forEach(key => {
                if (key !== 'id' && key !== 'created_at' && key !== 'created_by') {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);

            const query = `
                UPDATE grades 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de la note: ${error.message}`);
        }
    }

    /**
     * Supprimer une note
     * @param {number} id - ID de la note
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM grades WHERE id = ?';
            const [result] = await db.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de la note: ${error.message}`);
        }
    }

    /**
     * Obtenir les notes d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @param {Object} options - Options de filtrage
     * @returns {Promise<Array>} - Liste des notes
     */
    static async findByStudent(studentId, options = {}) {
        try {
            const { academic_year = null, module_id = null, grade_type = null } = options;

            let query = `
                SELECT g.*, m.name as module_name, m.coefficient as module_coefficient,
                       c.code as course_code, c.name as course_name, c.level, c.semester,
                       u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM grades g
                JOIN modules m ON g.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                JOIN teachers t ON g.created_by = t.id
                JOIN users u ON t.user_id = u.id
                WHERE g.student_id = ?
            `;
            const params = [studentId];

            if (academic_year) {
                query += ' AND c.academic_year = ?';
                params.push(academic_year);
            }

            if (module_id) {
                query += ' AND g.module_id = ?';
                params.push(module_id);
            }

            if (grade_type) {
                query += ' AND g.grade_type = ?';
                params.push(grade_type);
            }

            query += ' ORDER BY c.level, c.semester, m.name, g.grade_type, g.created_at DESC';

            const [rows] = await db.execute(query, params);
            
            return rows.map(row => new Grade(row));
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des notes de l'étudiant: ${error.message}`);
        }
    }

    /**
     * Obtenir les notes d'un module
     * @param {number} moduleId - ID du module
     * @param {Object} options - Options de filtrage
     * @returns {Promise<Array>} - Liste des notes
     */
    static async findByModule(moduleId, options = {}) {
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

            query += ' ORDER BY u.first_name, u.last_name, g.grade_type, g.created_at DESC';

            const [rows] = await db.execute(query, params);
            
            return rows.map(row => new Grade(row));
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des notes du module: ${error.message}`);
        }
    }

    /**
     * Calculer la moyenne d'un étudiant pour un module
     * @param {number} studentId - ID de l'étudiant
     * @param {number} moduleId - ID du module
     * @returns {Promise<Object>} - Moyenne et détails
     */
    static async calculateStudentModuleAverage(studentId, moduleId) {
        try {
            const query = `
                SELECT 
                    AVG(g.grade * g.coefficient / g.max_grade * 20) as average,
                    SUM(g.coefficient) as total_coefficient,
                    COUNT(g.id) as total_grades,
                    MIN(g.grade * g.coefficient / g.max_grade * 20) as min_grade,
                    MAX(g.grade * g.coefficient / g.max_grade * 20) as max_grade
                FROM grades g
                WHERE g.student_id = ? AND g.module_id = ?
            `;
            const [rows] = await db.execute(query, [studentId, moduleId]);

            const result = rows[0];
            return {
                average: result.average ? parseFloat(result.average.toFixed(2)) : null,
                totalCoefficient: result.total_coefficient || 0,
                totalGrades: result.total_grades || 0,
                minGrade: result.min_grade ? parseFloat(result.min_grade.toFixed(2)) : null,
                maxGrade: result.max_grade ? parseFloat(result.max_grade.toFixed(2)) : null
            };
        } catch (error) {
            throw new Error(`Erreur lors du calcul de la moyenne: ${error.message}`);
        }
    }

    /**
     * Obtenir le bulletin d'un étudiant
     * @param {number} studentId - ID de l'étudiant
     * @param {string} academicYear - Année académique
     * @returns {Promise<Object>} - Bulletin complet
     */
    static async getStudentReport(studentId, academicYear) {
        try {
            // Obtenir toutes les notes de l'étudiant pour l'année
            const grades = await this.findByStudent(studentId, { academic_year: academicYear });

            // Grouper par module
            const moduleGrades = {};
            grades.forEach(grade => {
                if (!moduleGrades[grade.module_id]) {
                    moduleGrades[grade.module_id] = {
                        module_name: grade.module_name,
                        course_code: grade.course_code,
                        course_name: grade.course_name,
                        level: grade.level,
                        semester: grade.semester,
                        grades: []
                    };
                }
                moduleGrades[grade.module_id].grades.push(grade);
            });

            // Calculer les moyennes par module
            const moduleAverages = {};
            for (const moduleId in moduleGrades) {
                const average = await this.calculateStudentModuleAverage(studentId, parseInt(moduleId));
                moduleAverages[moduleId] = average;
            }

            // Calculer la moyenne générale
            const generalAverageQuery = `
                SELECT 
                    AVG(g.grade * g.coefficient / g.max_grade * 20) as general_average,
                    SUM(g.coefficient) as total_coefficient,
                    COUNT(DISTINCT g.module_id) as total_modules
                FROM grades g
                JOIN modules m ON g.module_id = m.id
                JOIN courses c ON m.course_id = c.id
                WHERE g.student_id = ? AND c.academic_year = ?
            `;
            const [averageResult] = await db.execute(generalAverageQuery, [studentId, academicYear]);

            const generalAverage = averageResult[0];

            return {
                student_id: studentId,
                academic_year: academicYear,
                modules: moduleGrades,
                module_averages: moduleAverages,
                general_average: {
                    average: generalAverage.general_average ? parseFloat(generalAverage.general_average.toFixed(2)) : null,
                    totalCoefficient: generalAverage.total_coefficient || 0,
                    totalModules: generalAverage.total_modules || 0
                }
            };
        } catch (error) {
            throw new Error(`Erreur lors de la génération du bulletin: ${error.message}`);
        }
    }

    /**
     * Saisir des notes en masse
     * @param {Array} gradesData - Tableau des données de notes
     * @returns {Promise<Object>} - Résultat de la saisie en masse
     */
    static async bulkCreate(gradesData) {
        try {
            const createdGrades = [];
            const errors = [];

            for (const gradeData of gradesData) {
                try {
                    const grade = await this.create(gradeData);
                    createdGrades.push(grade);
                } catch (error) {
                    errors.push({
                        data: gradeData,
                        error: error.message
                    });
                }
            }

            return { createdGrades, errors };
        } catch (error) {
            throw new Error(`Erreur lors de la saisie en masse: ${error.message}`);
        }
    }

    /**
     * Obtenir les statistiques des notes
     * @param {Object} filters - Filtres
     * @returns {Promise<Object>} - Statistiques
     */
    static async getStatistics(filters = {}) {
        try {
            const { academic_year = null, module_id = null, teacher_id = null } = filters;

            // Nombre total de notes
            let totalQuery = 'SELECT COUNT(*) as total FROM grades g';
            let totalParams = [];
            let joins = '';

            if (academic_year || teacher_id) {
                joins += ' JOIN modules m ON g.module_id = m.id JOIN courses c ON m.course_id = c.id';
            }

            totalQuery += joins + ' WHERE 1=1';

            if (academic_year) {
                totalQuery += ' AND c.academic_year = ?';
                totalParams.push(academic_year);
            }

            if (module_id) {
                totalQuery += ' AND g.module_id = ?';
                totalParams.push(module_id);
            }

            if (teacher_id) {
                totalQuery += ' AND g.created_by = ?';
                totalParams.push(teacher_id);
            }

            const [totalResult] = await db.execute(totalQuery, totalParams);

            // Moyenne générale
            let averageQuery = 'SELECT AVG(g.grade * g.coefficient / g.max_grade * 20) as average FROM grades g';
            averageQuery += joins + ' WHERE 1=1';

            const [averageResult] = await db.execute(averageQuery + totalParams.length > 0 ? ' AND ' + totalQuery.split('WHERE 1=1')[1] : '', totalParams);

            // Distribution par type de note
            let typeQuery = 'SELECT g.grade_type, COUNT(*) as count FROM grades g';
            typeQuery += joins + ' WHERE 1=1';

            if (totalParams.length > 0) {
                typeQuery += totalQuery.split('WHERE 1=1')[1];
            }

            typeQuery += ' GROUP BY g.grade_type';

            const [typeResult] = await db.execute(typeQuery, totalParams);

            return {
                total: totalResult[0].total,
                average: averageResult[0].average ? parseFloat(averageResult[0].average.toFixed(2)) : null,
                byType: typeResult
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }

    /**
     * Convertir la note sur 20
     * @returns {number} - Note sur 20
     */
    getNormalizedGrade() {
        return parseFloat(((this.grade * this.coefficient / this.max_grade) * 20).toFixed(2));
    }

    /**
     * Vérifier si la note est validante (>= 10/20)
     * @returns {boolean} - True si validante
     */
    isPassing() {
        return this.getNormalizedGrade() >= 10;
    }

    /**
     * Obtenir la mention selon la note
     * @returns {string} - Mention
     */
    getMention() {
        const normalizedGrade = this.getNormalizedGrade();
        
        if (normalizedGrade >= 16) return 'Très Bien';
        if (normalizedGrade >= 14) return 'Bien';
        if (normalizedGrade >= 12) return 'Assez Bien';
        if (normalizedGrade >= 10) return 'Passable';
        return 'Insuffisant';
    }
}

module.exports = Grade;