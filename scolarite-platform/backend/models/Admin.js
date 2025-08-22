/**
 * Modèle Admin
 * Gère les opérations CRUD pour la table admins
 */

const db = require('../config/database');

class Admin {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.employee_number = data.employee_number;
        this.department = data.department;
        this.permissions = typeof data.permissions === 'string' ? JSON.parse(data.permissions) : data.permissions;
        this.hire_date = data.hire_date;
        this.status = data.status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer un nouvel administrateur
     * @param {Object} adminData - Données de l'administrateur
     * @returns {Promise<Object>} - Administrateur créé
     */
    static async create(adminData) {
        try {
            const query = `
                INSERT INTO admins (
                    user_id, employee_number, department, permissions, 
                    hire_date, status
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                adminData.user_id,
                adminData.employee_number,
                adminData.department,
                JSON.stringify(adminData.permissions || {}),
                adminData.hire_date,
                adminData.status || 'active'
            ];

            const [result] = await db.execute(query, values);
            
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création de l'administrateur: ${error.message}`);
        }
    }

    /**
     * Trouver un administrateur par ID
     * @param {number} id - ID de l'administrateur
     * @returns {Promise<Object|null>} - Administrateur trouvé ou null
     */
    static async findById(id) {
        try {
            const query = `
                SELECT a.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM admins a
                JOIN users u ON a.user_id = u.id
                WHERE a.id = ?
            `;
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Admin(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'administrateur: ${error.message}`);
        }
    }

    /**
     * Trouver un administrateur par user_id
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object|null>} - Administrateur trouvé ou null
     */
    static async findByUserId(userId) {
        try {
            const query = `
                SELECT a.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM admins a
                JOIN users u ON a.user_id = u.id
                WHERE a.user_id = ?
            `;
            const [rows] = await db.execute(query, [userId]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Admin(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'administrateur: ${error.message}`);
        }
    }

    /**
     * Obtenir tous les administrateurs
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des administrateurs
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
                SELECT a.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
                FROM admins a
                JOIN users u ON a.user_id = u.id
                WHERE 1=1
            `;
            let countQuery = `
                SELECT COUNT(*) as total
                FROM admins a
                JOIN users u ON a.user_id = u.id
                WHERE 1=1
            `;
            const params = [];

            // Filtrage par département
            if (department) {
                query += ' AND a.department = ?';
                countQuery += ' AND a.department = ?';
                params.push(department);
            }

            // Filtrage par statut
            if (status) {
                query += ' AND a.status = ?';
                countQuery += ' AND a.status = ?';
                params.push(status);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR a.employee_number LIKE ?)';
                countQuery += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR a.employee_number LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const admins = rows.map(row => new Admin(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                admins,
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
            throw new Error(`Erreur lors de la récupération des administrateurs: ${error.message}`);
        }
    }

    /**
     * Mettre à jour un administrateur
     * @param {number} id - ID de l'administrateur
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Administrateur mis à jour
     */
    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            // Construire la requête dynamiquement
            Object.keys(updateData).forEach(key => {
                if (key !== 'id' && key !== 'created_at' && key !== 'user_id') {
                    if (key === 'permissions') {
                        fields.push(`${key} = ?`);
                        values.push(JSON.stringify(updateData[key]));
                    } else {
                        fields.push(`${key} = ?`);
                        values.push(updateData[key]);
                    }
                }
            });

            if (fields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(id);

            const query = `
                UPDATE admins 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'administrateur: ${error.message}`);
        }
    }

    /**
     * Vérifier si un administrateur a une permission
     * @param {string} resource - Ressource (ex: 'users', 'students')
     * @param {string} action - Action (ex: 'create', 'read', 'update', 'delete')
     * @returns {boolean} - True si autorisé
     */
    hasPermission(resource, action) {
        if (!this.permissions || !this.permissions[resource]) {
            return false;
        }
        
        return this.permissions[resource].includes(action);
    }

    /**
     * Ajouter une permission
     * @param {number} adminId - ID de l'administrateur
     * @param {string} resource - Ressource
     * @param {string} action - Action
     * @returns {Promise<Object|null>} - Administrateur mis à jour
     */
    static async addPermission(adminId, resource, action) {
        try {
            const admin = await this.findById(adminId);
            if (!admin) {
                return null;
            }

            const permissions = admin.permissions || {};
            if (!permissions[resource]) {
                permissions[resource] = [];
            }

            if (!permissions[resource].includes(action)) {
                permissions[resource].push(action);
            }

            return await this.update(adminId, { permissions });
        } catch (error) {
            throw new Error(`Erreur lors de l'ajout de permission: ${error.message}`);
        }
    }

    /**
     * Retirer une permission
     * @param {number} adminId - ID de l'administrateur
     * @param {string} resource - Ressource
     * @param {string} action - Action
     * @returns {Promise<Object|null>} - Administrateur mis à jour
     */
    static async removePermission(adminId, resource, action) {
        try {
            const admin = await this.findById(adminId);
            if (!admin) {
                return null;
            }

            const permissions = admin.permissions || {};
            if (permissions[resource]) {
                permissions[resource] = permissions[resource].filter(a => a !== action);
                if (permissions[resource].length === 0) {
                    delete permissions[resource];
                }
            }

            return await this.update(adminId, { permissions });
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de permission: ${error.message}`);
        }
    }

    /**
     * Générer un numéro d'employé unique pour admin
     * @param {string} prefix - Préfixe (ex: ADM)
     * @returns {Promise<string>} - Numéro d'employé généré
     */
    static async generateEmployeeNumber(prefix = 'ADM') {
        try {
            const query = `
                SELECT employee_number 
                FROM admins 
                WHERE employee_number LIKE ?
                ORDER BY employee_number DESC 
                LIMIT 1
            `;
            const [rows] = await db.execute(query, [`${prefix}%`]);

            let nextNumber = 1;
            if (rows.length > 0) {
                const lastNumber = rows[0].employee_number;
                const numberPart = parseInt(lastNumber.substring(prefix.length)); // ADM001 -> 001
                nextNumber = numberPart + 1;
            }

            return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            throw new Error(`Erreur lors de la génération du numéro d'employé: ${error.message}`);
        }
    }
}

module.exports = Admin;