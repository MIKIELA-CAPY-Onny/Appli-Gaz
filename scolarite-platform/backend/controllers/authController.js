/**
 * Contrôleur d'authentification
 * Gère la connexion, déconnexion et gestion des tokens
 */

const { User, Student, Teacher, Admin } = require('../models');
const { generateTokenPair, verifyToken, generatePasswordResetToken } = require('../config/auth');

class AuthController {
    /**
     * Connexion d'un utilisateur
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validation des données
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe requis'
                });
            }

            // Rechercher l'utilisateur
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Identifiants invalides'
                });
            }

            // Vérifier si l'utilisateur est actif
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Compte désactivé'
                });
            }

            // Vérifier le mot de passe
            const isPasswordValid = await user.verifyPassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Identifiants invalides'
                });
            }

            // Obtenir les informations spécifiques selon le rôle
            let roleData = null;
            switch (user.role) {
                case 'student':
                    roleData = await Student.findByUserId(user.id);
                    break;
                case 'teacher':
                    roleData = await Teacher.findByUserId(user.id);
                    break;
                case 'admin':
                    roleData = await Admin.findByUserId(user.id);
                    break;
            }

            // Générer les tokens
            const tokens = generateTokenPair(user);

            // Réponse de succès
            res.json({
                success: true,
                message: 'Connexion réussie',
                data: {
                    user: user.toJSON(),
                    roleData,
                    ...tokens
                }
            });

        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Rafraîchir le token d'accès
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Token de rafraîchissement requis'
                });
            }

            // Vérifier le token de rafraîchissement
            const decoded = verifyToken(refreshToken);
            
            if (decoded.type !== 'refresh') {
                return res.status(401).json({
                    success: false,
                    message: 'Type de token invalide'
                });
            }

            // Rechercher l'utilisateur
            const user = await User.findById(decoded.id);
            if (!user || !user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Utilisateur non trouvé ou désactivé'
                });
            }

            // Générer de nouveaux tokens
            const tokens = generateTokenPair(user);

            res.json({
                success: true,
                message: 'Token rafraîchi avec succès',
                data: tokens
            });

        } catch (error) {
            console.error('Erreur lors du rafraîchissement:', error);
            res.status(401).json({
                success: false,
                message: 'Token de rafraîchissement invalide'
            });
        }
    }

    /**
     * Déconnexion (côté client principalement)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async logout(req, res) {
        try {
            // Dans une implémentation plus avancée, on pourrait invalider le token
            // en le stockant dans une blacklist ou en utilisant Redis

            res.json({
                success: true,
                message: 'Déconnexion réussie'
            });

        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Obtenir les informations de l'utilisateur connecté
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;

            // Rechercher l'utilisateur
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Obtenir les informations spécifiques selon le rôle
            let roleData = null;
            switch (user.role) {
                case 'student':
                    roleData = await Student.findByUserId(user.id);
                    break;
                case 'teacher':
                    roleData = await Teacher.findByUserId(user.id);
                    break;
                case 'admin':
                    roleData = await Admin.findByUserId(user.id);
                    break;
            }

            res.json({
                success: true,
                data: {
                    user: user.toJSON(),
                    roleData
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Mettre à jour le profil de l'utilisateur connecté
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            // Supprimer les champs sensibles
            delete updateData.id;
            delete updateData.role;
            delete updateData.is_active;
            delete updateData.created_at;
            delete updateData.updated_at;

            // Mettre à jour l'utilisateur
            const updatedUser = await User.update(userId, updateData);
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Profil mis à jour avec succès',
                data: {
                    user: updatedUser.toJSON()
                }
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Changer le mot de passe
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Tous les champs sont requis'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Les nouveaux mots de passe ne correspondent pas'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
                });
            }

            // Rechercher l'utilisateur
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Vérifier le mot de passe actuel
            const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Mot de passe actuel incorrect'
                });
            }

            // Mettre à jour le mot de passe
            await User.update(userId, { password: newPassword });

            res.json({
                success: true,
                message: 'Mot de passe changé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Demande de réinitialisation de mot de passe
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email requis'
                });
            }

            // Rechercher l'utilisateur
            const user = await User.findByEmail(email);
            if (!user) {
                // Pour des raisons de sécurité, on ne révèle pas si l'email existe
                return res.json({
                    success: true,
                    message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
                });
            }

            // Générer le token de réinitialisation
            const resetToken = generatePasswordResetToken(user);

            // Dans une vraie application, on enverrait un email ici
            // Pour le moment, on retourne le token (à des fins de test uniquement)
            console.log(`Token de réinitialisation pour ${email}: ${resetToken}`);

            res.json({
                success: true,
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
                // En production, ne pas retourner le token
                ...(process.env.NODE_ENV === 'development' && { resetToken })
            });

        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }

    /**
     * Réinitialisation du mot de passe avec token
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async resetPassword(req, res) {
        try {
            const { token, newPassword, confirmPassword } = req.body;

            if (!token || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Tous les champs sont requis'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Les mots de passe ne correspondent pas'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Le mot de passe doit contenir au moins 6 caractères'
                });
            }

            // Vérifier le token
            const decoded = verifyToken(token);
            
            if (decoded.type !== 'password_reset') {
                return res.status(400).json({
                    success: false,
                    message: 'Token invalide'
                });
            }

            // Rechercher l'utilisateur
            const user = await User.findById(decoded.id);
            if (!user || user.email !== decoded.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Token invalide'
                });
            }

            // Mettre à jour le mot de passe
            await User.update(user.id, { password: newPassword });

            res.json({
                success: true,
                message: 'Mot de passe réinitialisé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            res.status(400).json({
                success: false,
                message: 'Token invalide ou expiré'
            });
        }
    }

    /**
     * Vérifier la validité d'un token
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async verifyToken(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token requis'
                });
            }

            const decoded = verifyToken(token);

            res.json({
                success: true,
                message: 'Token valide',
                data: {
                    valid: true,
                    decoded: {
                        id: decoded.id,
                        email: decoded.email,
                        role: decoded.role,
                        type: decoded.type,
                        exp: decoded.exp
                    }
                }
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token invalide',
                data: {
                    valid: false
                }
            });
        }
    }
}

module.exports = AuthController;