const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../config/database');
const { checkRole } = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les utilisateurs (admin seulement)
router.get('/', checkRole(['admin']), async (req, res) => {
  try {
    const { search, role, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT id, matricule, nom, prenom, email, role, date_naissance, telephone, adresse, date_creation, date_modification
      FROM utilisateurs
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (nom LIKE ? OR prenom LIKE ? OR matricule LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }
    
    query += ` ORDER BY nom, prenom LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM utilisateurs
      WHERE 1=1
    `;
    
    const countParams = [];
    if (search) {
      countQuery += ` AND (nom LIKE ? OR prenom LIKE ? OR matricule LIKE ? OR email LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (role) {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      utilisateurs: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération des utilisateurs' 
    });
  }
});

// Récupérer un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur peut accéder à ces informations
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        error: 'Accès interdit', 
        message: 'Vous ne pouvez accéder qu\'à vos propres informations' 
      });
    }
    
    const [rows] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, role, date_naissance, telephone, adresse, date_creation, date_modification FROM utilisateurs WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    const utilisateur = rows[0];
    
    // Si c'est un enseignant, récupérer ses modules
    if (utilisateur.role === 'enseignant') {
      const [modules] = await pool.execute(`
        SELECT m.id, m.code, m.nom, m.description, m.credits, m.coefficient,
               p.nom as promotion_nom, p.annee_debut, p.annee_fin
        FROM modules m
        JOIN promotions p ON m.promotion_id = p.id
        WHERE m.enseignant_id = ?
        ORDER BY p.annee_debut DESC, m.nom
      `, [id]);
      
      utilisateur.modules = modules;
    }
    
    // Si c'est un étudiant, récupérer ses inscriptions
    if (utilisateur.role === 'etudiant') {
      const [inscriptions] = await pool.execute(`
        SELECT i.id, i.date_inscription, i.statut,
               m.code, m.nom as module_nom, m.credits, m.coefficient,
               p.nom as promotion_nom, p.annee_debut, p.annee_fin
        FROM inscriptions i
        JOIN modules m ON i.module_id = m.id
        JOIN promotions p ON i.promotion_id = p.id
        WHERE i.etudiant_id = ?
        ORDER BY p.annee_debut DESC, m.nom
      `, [id]);
      
      utilisateur.inscriptions = inscriptions;
    }
    
    res.json(utilisateur);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération de l\'utilisateur' 
    });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', [
  body('nom').optional().notEmpty().withMessage('Nom ne peut pas être vide'),
  body('prenom').optional().notEmpty().withMessage('Prénom ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { nom, prenom, email, date_naissance, telephone, adresse } = req.body;

    // Vérifier que l'utilisateur peut modifier ces informations
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        error: 'Accès interdit', 
        message: 'Vous ne pouvez modifier que vos propres informations' 
      });
    }

    // Vérifier que l'utilisateur existe
    const [existingUser] = await pool.execute(
      'SELECT id FROM utilisateurs WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM utilisateurs WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          error: 'Email déjà utilisé', 
          message: 'Cet email est déjà utilisé par un autre utilisateur' 
        });
      }
    }

    // Construire la requête de mise à jour
    const updateFields = [];
    const params = [];
    
    if (nom !== undefined) {
      updateFields.push('nom = ?');
      params.push(nom);
    }
    if (prenom !== undefined) {
      updateFields.push('prenom = ?');
      params.push(prenom);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (date_naissance !== undefined) {
      updateFields.push('date_naissance = ?');
      params.push(date_naissance);
    }
    if (telephone !== undefined) {
      updateFields.push('telephone = ?');
      params.push(telephone);
    }
    if (adresse !== undefined) {
      updateFields.push('adresse = ?');
      params.push(adresse);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Aucune donnée à mettre à jour' 
      });
    }

    updateFields.push('date_modification = CURRENT_TIMESTAMP');
    params.push(id);

    // Mettre à jour l'utilisateur
    await pool.execute(
      `UPDATE utilisateurs SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer l'utilisateur mis à jour
    const [updatedUser] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, role, date_naissance, telephone, adresse, date_creation, date_modification FROM utilisateurs WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      utilisateur: updatedUser[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la mise à jour de l\'utilisateur' 
    });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const [existingUser] = await pool.execute(
      'SELECT id, role FROM utilisateurs WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier qu'il ne s'agit pas de l'utilisateur connecté
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        error: 'Suppression impossible', 
        message: 'Vous ne pouvez pas supprimer votre propre compte' 
      });
    }

    // Vérifier qu'il n'y a pas de dépendances pour les enseignants
    if (existingUser[0].role === 'enseignant') {
      const [modules] = await pool.execute(
        'SELECT COUNT(*) as count FROM modules WHERE enseignant_id = ?',
        [id]
      );

      if (modules[0].count > 0) {
        return res.status(400).json({ 
          error: 'Enseignant non supprimable', 
          message: 'Cet enseignant ne peut pas être supprimé car il a des modules assignés' 
        });
      }
    }

    // Vérifier qu'il n'y a pas de dépendances pour les étudiants
    if (existingUser[0].role === 'etudiant') {
      const [inscriptions] = await pool.execute(
        'SELECT COUNT(*) as count FROM inscriptions WHERE etudiant_id = ?',
        [id]
      );

      if (inscriptions[0].count > 0) {
        return res.status(400).json({ 
          error: 'Étudiant non supprimable', 
          message: 'Cet étudiant ne peut pas être supprimé car il a des inscriptions' 
        });
      }
    }

    // Supprimer l'utilisateur
    await pool.execute('DELETE FROM utilisateurs WHERE id = ?', [id]);

    res.json({
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la suppression de l\'utilisateur' 
    });
  }
});

// Récupérer le profil de l'utilisateur connecté
router.get('/profile/me', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [rows] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, role, date_naissance, telephone, adresse, date_creation, date_modification FROM utilisateurs WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    const utilisateur = rows[0];
    
    // Récupérer des informations supplémentaires selon le rôle
    if (utilisateur.role === 'enseignant') {
      const [modules] = await pool.execute(`
        SELECT m.id, m.code, m.nom, m.description, m.credits, m.coefficient,
               p.nom as promotion_nom, p.annee_debut, p.annee_fin
        FROM modules m
        JOIN promotions p ON m.promotion_id = p.id
        WHERE m.enseignant_id = ?
        ORDER BY p.annee_debut DESC, m.nom
      `, [userId]);
      
      utilisateur.modules = modules;
    }
    
    if (utilisateur.role === 'etudiant') {
      const [inscriptions] = await pool.execute(`
        SELECT i.id, i.date_inscription, i.statut,
               m.code, m.nom as module_nom, m.credits, m.coefficient,
               p.nom as promotion_nom, p.annee_debut, p.annee_fin
        FROM inscriptions i
        JOIN modules m ON i.module_id = m.id
        JOIN promotions p ON i.promotion_id = p.id
        WHERE i.etudiant_id = ?
        ORDER BY p.annee_debut DESC, m.nom
      `, [userId]);
      
      utilisateur.inscriptions = inscriptions;
    }
    
    res.json(utilisateur);
    
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération du profil' 
    });
  }
});

// Mettre à jour le profil de l'utilisateur connecté
router.put('/profile/me', [
  body('nom').optional().notEmpty().withMessage('Nom ne peut pas être vide'),
  body('prenom').optional().notEmpty().withMessage('Prénom ne peut pas être vide'),
  body('email').optional().isEmail().withMessage('Email invalide')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { nom, prenom, email, date_naissance, telephone, adresse } = req.body;
    const userId = req.user.id;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM utilisateurs WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          error: 'Email déjà utilisé', 
          message: 'Cet email est déjà utilisé par un autre utilisateur' 
        });
      }
    }

    // Construire la requête de mise à jour
    const updateFields = [];
    const params = [];
    
    if (nom !== undefined) {
      updateFields.push('nom = ?');
      params.push(nom);
    }
    if (prenom !== undefined) {
      updateFields.push('prenom = ?');
      params.push(prenom);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (date_naissance !== undefined) {
      updateFields.push('date_naissance = ?');
      params.push(date_naissance);
    }
    if (telephone !== undefined) {
      updateFields.push('telephone = ?');
      params.push(telephone);
    }
    if (adresse !== undefined) {
      updateFields.push('adresse = ?');
      params.push(adresse);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Aucune donnée à mettre à jour' 
      });
    }

    updateFields.push('date_modification = CURRENT_TIMESTAMP');
    params.push(userId);

    // Mettre à jour l'utilisateur
    await pool.execute(
      `UPDATE utilisateurs SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer l'utilisateur mis à jour
    const [updatedUser] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, role, date_naissance, telephone, adresse, date_creation, date_modification FROM utilisateurs WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profil mis à jour avec succès',
      utilisateur: updatedUser[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la mise à jour du profil' 
    });
  }
});

// Récupérer les statistiques des utilisateurs (admin seulement)
router.get('/statistiques/globales', checkRole(['admin']), async (req, res) => {
  try {
    // Compter les utilisateurs par rôle
    const [repartitionRoles] = await pool.execute(`
      SELECT 
        role,
        COUNT(*) as nombre
      FROM utilisateurs
      GROUP BY role
      ORDER BY role
    `);

    // Compter les utilisateurs par année de création
    const [evolutionAnnuelle] = await pool.execute(`
      SELECT 
        YEAR(date_creation) as annee,
        COUNT(*) as nombre
      FROM utilisateurs
      GROUP BY YEAR(date_creation)
      ORDER BY annee DESC
      LIMIT 5
    `);

    // Top 10 des utilisateurs les plus récents
    const [utilisateursRecents] = await pool.execute(`
      SELECT 
        matricule, nom, prenom, email, role, date_creation
      FROM utilisateurs
      ORDER BY date_creation DESC
      LIMIT 10
    `);

    const statistiques = {
      repartition_par_role: repartitionRoles,
      evolution_annuelle: evolutionAnnuelle,
      utilisateurs_recents: utilisateursRecents
    };

    res.json(statistiques);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération des statistiques' 
    });
  }
});

module.exports = router;