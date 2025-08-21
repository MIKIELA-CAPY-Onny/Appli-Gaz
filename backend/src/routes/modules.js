const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../config/database');
const { checkRole } = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les modules
router.get('/', async (req, res) => {
  try {
    const { search, promotion_id, enseignant_id, statut, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT m.id, m.code, m.nom, m.description, m.credits, m.coefficient, m.statut, m.date_creation,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM modules m
      LEFT JOIN utilisateurs u ON m.enseignant_id = u.id
      LEFT JOIN promotions p ON m.promotion_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (m.nom LIKE ? OR m.code LIKE ? OR m.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (promotion_id) {
      query += ` AND m.promotion_id = ?`;
      params.push(promotion_id);
    }
    
    if (enseignant_id) {
      query += ` AND m.enseignant_id = ?`;
      params.push(enseignant_id);
    }
    
    if (statut) {
      query += ` AND m.statut = ?`;
      params.push(statut);
    }
    
    query += ` ORDER BY p.annee_debut DESC, m.nom LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM modules m
      WHERE 1=1
    `;
    
    const countParams = [];
    if (search) {
      countQuery += ` AND (m.nom LIKE ? OR m.code LIKE ? OR m.description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (promotion_id) {
      countQuery += ` AND m.promotion_id = ?`;
      countParams.push(promotion_id);
    }
    
    if (enseignant_id) {
      countQuery += ` AND m.enseignant_id = ?`;
      countParams.push(enseignant_id);
    }
    
    if (statut) {
      countQuery += ` AND m.statut = ?`;
      countParams.push(statut);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      modules: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération des modules' 
    });
  }
});

// Récupérer un module par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT m.id, m.code, m.nom, m.description, m.credits, m.coefficient, m.statut, m.date_creation,
             u.id as enseignant_id, u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             p.id as promotion_id, p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM modules m
      LEFT JOIN utilisateurs u ON m.enseignant_id = u.id
      LEFT JOIN promotions p ON m.promotion_id = p.id
      WHERE m.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Module non trouvé' 
      });
    }
    
    const module = rows[0];
    
    // Récupérer les étudiants inscrits à ce module
    const [inscriptions] = await pool.execute(`
      SELECT i.id, i.date_inscription, i.statut,
             u.id as etudiant_id, u.matricule, u.nom, u.prenom, u.email
      FROM inscriptions i
      JOIN utilisateurs u ON i.etudiant_id = u.id
      WHERE i.module_id = ?
      ORDER BY u.nom, u.prenom
    `, [id]);
    
    // Récupérer les notes pour ce module
    const [notes] = await pool.execute(`
      SELECT n.id, n.note, n.type_evaluation, n.coefficient, n.commentaire, n.date_evaluation,
             u.id as etudiant_id, u.matricule, u.nom, u.prenom
      FROM notes n
      JOIN utilisateurs u ON n.etudiant_id = u.id
      WHERE n.module_id = ?
      ORDER BY u.nom, u.prenom, n.date_evaluation DESC
    `, [id]);
    
    // Récupérer les absences pour ce module
    const [absences] = await pool.execute(`
      SELECT a.id, a.date_absence, a.type, a.duree_retard_minutes, a.motif, a.justifiee,
             u.id as etudiant_id, u.matricule, u.nom, u.prenom
      FROM absences a
      JOIN utilisateurs u ON a.etudiant_id = u.id
      WHERE a.module_id = ?
      ORDER BY a.date_absence DESC
    `, [id]);
    
    module.inscriptions = inscriptions;
    module.notes = notes;
    module.absences = absences;
    
    res.json(module);
    
  } catch (error) {
    console.error('Erreur lors de la récupération du module:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération du module' 
    });
  }
});

// Créer un nouveau module (admin seulement)
router.post('/', checkRole(['admin']), [
  body('code').notEmpty().withMessage('Code du module requis'),
  body('nom').notEmpty().withMessage('Nom du module requis'),
  body('promotion_id').isInt().withMessage('ID de promotion invalide'),
  body('credits').optional().isInt({ min: 0 }).withMessage('Crédits doit être un entier positif'),
  body('coefficient').optional().isFloat({ min: 0 }).withMessage('Coefficient doit être un nombre positif')
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

    const { code, nom, description, credits, coefficient, enseignant_id, promotion_id } = req.body;

    // Vérifier si le code du module existe déjà
    const [existingModules] = await pool.execute(
      'SELECT id FROM modules WHERE code = ?',
      [code]
    );

    if (existingModules.length > 0) {
      return res.status(400).json({ 
        error: 'Module existant', 
        message: 'Un module avec ce code existe déjà' 
      });
    }

    // Vérifier que la promotion existe
    const [promotions] = await pool.execute(
      'SELECT id FROM promotions WHERE id = ?',
      [promotion_id]
    );

    if (promotions.length === 0) {
      return res.status(400).json({ 
        error: 'Promotion invalide', 
        message: 'La promotion spécifiée n\'existe pas' 
      });
    }

    // Vérifier que l'enseignant existe et a le bon rôle
    if (enseignant_id) {
      const [enseignants] = await pool.execute(
        'SELECT id FROM utilisateurs WHERE id = ? AND role = "enseignant"',
        [enseignant_id]
      );

      if (enseignants.length === 0) {
        return res.status(400).json({ 
          error: 'Enseignant invalide', 
          message: 'L\'enseignant spécifié n\'existe pas ou n\'a pas le bon rôle' 
        });
      }
    }

    // Insérer le nouveau module
    const [result] = await pool.execute(
      `INSERT INTO modules (code, nom, description, credits, coefficient, enseignant_id, promotion_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, nom, description, credits || 0, coefficient || 1.0, enseignant_id, promotion_id]
    );

    // Récupérer le module créé
    const [newModule] = await pool.execute(`
      SELECT m.id, m.code, m.nom, m.description, m.credits, m.coefficient, m.statut, m.date_creation,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM modules m
      LEFT JOIN utilisateurs u ON m.enseignant_id = u.id
      LEFT JOIN promotions p ON m.promotion_id = p.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Module créé avec succès',
      module: newModule[0]
    });

  } catch (error) {
    console.error('Erreur lors de la création du module:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la création du module' 
    });
  }
});

// Mettre à jour un module (admin seulement)
router.put('/:id', checkRole(['admin']), [
  body('nom').optional().notEmpty().withMessage('Nom ne peut pas être vide'),
  body('credits').optional().isInt({ min: 0 }).withMessage('Crédits doit être un entier positif'),
  body('coefficient').optional().isFloat({ min: 0 }).withMessage('Coefficient doit être un nombre positif')
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
    const { nom, description, credits, coefficient, enseignant_id, promotion_id, statut } = req.body;

    // Vérifier que le module existe
    const [existingModule] = await pool.execute(
      'SELECT id FROM modules WHERE id = ?',
      [id]
    );

    if (existingModule.length === 0) {
      return res.status(404).json({ 
        error: 'Module non trouvé' 
      });
    }

    // Vérifier que la promotion existe si elle est fournie
    if (promotion_id) {
      const [promotions] = await pool.execute(
        'SELECT id FROM promotions WHERE id = ?',
        [promotion_id]
      );

      if (promotions.length === 0) {
        return res.status(400).json({ 
          error: 'Promotion invalide', 
          message: 'La promotion spécifiée n\'existe pas' 
        });
      }
    }

    // Vérifier que l'enseignant existe et a le bon rôle si il est fourni
    if (enseignant_id) {
      const [enseignants] = await pool.execute(
        'SELECT id FROM utilisateurs WHERE id = ? AND role = "enseignant"',
        [enseignant_id]
      );

      if (enseignants.length === 0) {
        return res.status(400).json({ 
          error: 'Enseignant invalide', 
          message: 'L\'enseignant spécifié n\'existe pas ou n\'a pas le bon rôle' 
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
    if (description !== undefined) {
      updateFields.push('description = ?');
      params.push(description);
    }
    if (credits !== undefined) {
      updateFields.push('credits = ?');
      params.push(credits);
    }
    if (coefficient !== undefined) {
      updateFields.push('coefficient = ?');
      params.push(coefficient);
    }
    if (enseignant_id !== undefined) {
      updateFields.push('enseignant_id = ?');
      params.push(enseignant_id);
    }
    if (promotion_id !== undefined) {
      updateFields.push('promotion_id = ?');
      params.push(promotion_id);
    }
    if (statut !== undefined) {
      updateFields.push('statut = ?');
      params.push(statut);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Aucune donnée à mettre à jour' 
      });
    }

    params.push(id);

    // Mettre à jour le module
    await pool.execute(
      `UPDATE modules SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer le module mis à jour
    const [updatedModule] = await pool.execute(`
      SELECT m.id, m.code, m.nom, m.description, m.credits, m.coefficient, m.statut, m.date_creation,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM modules m
      LEFT JOIN utilisateurs u ON m.enseignant_id = u.id
      LEFT JOIN promotions p ON m.promotion_id = p.id
      WHERE m.id = ?
    `, [id]);

    res.json({
      message: 'Module mis à jour avec succès',
      module: updatedModule[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du module:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la mise à jour du module' 
    });
  }
});

// Supprimer un module (admin seulement)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le module existe
    const [existingModule] = await pool.execute(
      'SELECT id FROM modules WHERE id = ?',
      [id]
    );

    if (existingModule.length === 0) {
      return res.status(404).json({ 
        error: 'Module non trouvé' 
      });
    }

    // Vérifier s'il y a des inscriptions actives
    const [inscriptions] = await pool.execute(
      'SELECT COUNT(*) as count FROM inscriptions WHERE module_id = ? AND statut = "inscrit"',
      [id]
    );

    if (inscriptions[0].count > 0) {
      return res.status(400).json({ 
        error: 'Module non supprimable', 
        message: 'Ce module ne peut pas être supprimé car il a des étudiants inscrits' 
      });
    }

    // Supprimer le module
    await pool.execute('DELETE FROM modules WHERE id = ?', [id]);

    res.json({
      message: 'Module supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la suppression du module' 
    });
  }
});

// Récupérer les statistiques d'un module
router.get('/:id/statistiques', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le module existe
    const [module] = await pool.execute(
      'SELECT id, nom FROM modules WHERE id = ?',
      [id]
    );

    if (module.length === 0) {
      return res.status(404).json({ 
        error: 'Module non trouvé' 
      });
    }

    // Compter les étudiants inscrits
    const [inscriptionsCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM inscriptions WHERE module_id = ? AND statut = "inscrit"',
      [id]
    );

    // Calculer les statistiques des notes
    const [notesStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_notes,
        AVG(note) as moyenne,
        MIN(note) as note_min,
        MAX(note) as note_max,
        SUM(CASE WHEN note >= 10 THEN 1 ELSE 0 END) as reussis,
        SUM(CASE WHEN note < 10 THEN 1 ELSE 0 END) as echoues
      FROM notes 
      WHERE module_id = ?
    `, [id]);

    // Compter les absences
    const [absencesCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM absences WHERE module_id = ?',
      [id]
    );

    // Compter les retards
    const [retardsCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM absences WHERE module_id = ? AND type = "retard"',
      [id]
    );

    const statistiques = {
      module: module[0],
      inscriptions: inscriptionsCount[0].total,
      notes: {
        total: notesStats[0].total_notes,
        moyenne: notesStats[0].moyenne ? parseFloat(notesStats[0].moyenne).toFixed(2) : 0,
        note_min: notesStats[0].note_min,
        note_max: notesStats[0].note_max,
        reussis: notesStats[0].reussis,
        echoues: notesStats[0].echoues,
        taux_reussite: notesStats[0].total_notes > 0 
          ? ((notesStats[0].reussis / notesStats[0].total_notes) * 100).toFixed(2)
          : 0
      },
      absences: absencesCount[0].total,
      retards: retardsCount[0].total
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