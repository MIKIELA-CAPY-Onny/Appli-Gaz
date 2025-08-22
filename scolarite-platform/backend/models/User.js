/**
 * Modèle User
 * Gère les opérations CRUD pour la table users
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.password = data.password;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.phone = data.phone;
        this.address = data.address;
        this.role = data.role;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Créer un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<Object>} - Utilisateur créé
     */
    static async create(userData) {
        try {
            // Hacher le mot de passe
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            const query = `
                INSERT INTO users (email, password, first_name, last_name, phone, address, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                userData.email,
                hashedPassword,
                userData.first_name,
                userData.last_name,
                userData.phone || null,
                userData.address || null,
                userData.role,
                userData.is_active !== undefined ? userData.is_active : true
            ];

            const [result] = await db.execute(query, values);
            
            // Récupérer l'utilisateur créé
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        }
    }

    /**
     * Trouver un utilisateur par ID
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<Object|null>} - Utilisateur trouvé ou null
     */
    static async findById(id) {
        try {
            const query = 'SELECT * FROM users WHERE id = ?';
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new User(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'utilisateur: ${error.message}`);
        }
    }

    /**
     * Trouver un utilisateur par email
     * @param {string} email - Email de l'utilisateur
     * @returns {Promise<Object|null>} - Utilisateur trouvé ou null
     */
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await db.execute(query, [email]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new User(rows[0]);
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'utilisateur: ${error.message}`);
        }
    }

    /**
     * Obtenir tous les utilisateurs avec pagination
     * @param {Object} options - Options de pagination et filtrage
     * @returns {Promise<Object>} - Liste paginée des utilisateurs
     */
    static async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                role = null,
                is_active = null,
                search = null
            } = options;

            const offset = (page - 1) * limit;
            let query = 'SELECT * FROM users WHERE 1=1';
            let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
            const params = [];

            // Filtrage par rôle
            if (role) {
                query += ' AND role = ?';
                countQuery += ' AND role = ?';
                params.push(role);
            }

            // Filtrage par statut actif
            if (is_active !== null) {
                query += ' AND is_active = ?';
                countQuery += ' AND is_active = ?';
                params.push(is_active);
            }

            // Recherche textuelle
            if (search) {
                query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
                countQuery += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
                const searchParam = `%${search}%`;
                params.push(searchParam, searchParam, searchParam);
            }

            // Pagination
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Exécuter les requêtes
            const [rows] = await db.execute(query, params);
            const [countResult] = await db.execute(countQuery, params.slice(0, -2));

            const users = rows.map(row => new User(row));
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                users,
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
            throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
        }
    }

    /**
     * Mettre à jour un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @param {Object} updateData - Données à mettre à jour
     * @returns {Promise<Object|null>} - Utilisateur mis à jour
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

            // Hacher le mot de passe si présent
            if (updateData.password) {
                const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
                const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
                const passwordIndex = fields.findIndex(field => field.includes('password'));
                values[passwordIndex] = hashedPassword;
            }

            values.push(id);

            const query = `
                UPDATE users 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
        }
    }

    /**
     * Supprimer un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<boolean>} - Succès de la suppression
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM users WHERE id = ?';
            const [result] = await db.execute(query, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
        }
    }

    /**
     * Vérifier le mot de passe
     * @param {string} password - Mot de passe en clair
     * @returns {Promise<boolean>} - Résultat de la vérification
     */
    async verifyPassword(password) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            throw new Error(`Erreur lors de la vérification du mot de passe: ${error.message}`);
        }
    }

    /**
     * Désactiver un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<Object|null>} - Utilisateur mis à jour
     */
    static async deactivate(id) {
        return await this.update(id, { is_active: false });
    }

    /**
     * Activer un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<Object|null>} - Utilisateur mis à jour
     */
    static async activate(id) {
        return await this.update(id, { is_active: true });
    }

    /**
     * Obtenir les utilisateurs par rôle
     * @param {string} role - Rôle recherché
     * @returns {Promise<Array>} - Liste des utilisateurs
     */
    static async findByRole(role) {
        try {
            const query = 'SELECT * FROM users WHERE role = ? AND is_active = TRUE ORDER BY first_name, last_name';
            const [rows] = await db.execute(query, [role]);
            
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error(`Erreur lors de la recherche par rôle: ${error.message}`);
        }
    }

    /**
     * Convertir en objet JSON (sans le mot de passe)
     * @returns {Object} - Objet utilisateur sans mot de passe
     */
    toJSON() {
        const user = { ...this };
        delete user.password;
        return user;
    }
}

module.exports = User;