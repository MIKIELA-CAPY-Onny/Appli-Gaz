const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../config/database');
const { checkRole } = require('../middleware/auth');

const router = express.Router();

// Récupérer toutes les inscriptions (avec filtres)
router.get('/', async (req, res) => {
  try {
    const { etudiant_id, module_id, promotion_id, statut, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT i.id, i.date_inscription, i.statut,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom, u.email as etudiant_email,
             m.id as module_id, m.code as module_code, m.nom as module_nom, m.credits, m.coefficient,
             p.id as promotion_id, p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM inscriptions i
      JOIN utilisateurs u ON i.etudiant_id = u.id
      JOIN modules m ON i.module_id = m.id
      JOIN promotions p ON i.promotion_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (etudiant_id) {
      query += ` AND i.etudiant_id = ?`;
      params.push(etudiant_id);
    }
    
    if (module_id) {
      query += ` AND i.module_id = ?`;
      params.push(module_id);
    }
    
    if (promotion_id) {
      query += ` AND i.promotion_id = ?`;
      params.push(promotion_id);
    }
    
    if (statut) {
      query += ` AND i.statut = ?`;
      params.push(statut);
    }
    
    query += ` ORDER BY p.annee_debut DESC, m.nom, u.nom, u.prenom LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM inscriptions i
      WHERE 1=1
    `;
    
    const countParams = [];
    if (etudiant_id) {
      countQuery += ` AND i.etudiant_id = ?`;
      countParams.push(etudiant_id);
    }
    
    if (module_id) {
      countQuery += ` AND i.module_id = ?`;
      countParams.push(module_id);
    }
    
    if (promotion_id) {
      countQuery += ` AND i.promotion_id = ?`;
      countParams.push(promotion_id);
    }
    
    if (statut) {
      countQuery += ` AND i.statut = ?`;
      countParams.push(statut);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      inscriptions: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération des inscriptions' 
    });
  }
});

// Récupérer une inscription par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT i.id, i.date_inscription, i.statut,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom, u.email as etudiant_email,
             m.id as module_id, m.code as module_code, m.nom as module_nom, m.credits, m.coefficient,
             p.id as promotion_id, p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM inscriptions i
      JOIN utilisateurs u ON i.etudiant_id = u.id
      JOIN modules m ON i.module_id = m.id
      JOIN promotions p ON i.promotion_id = p.id
      WHERE i.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Inscription non trouvée' 
      });
    }
    
    res.json(rows[0]);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inscription:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération de l\'inscription' 
    });
  }
});

// Créer une nouvelle inscription (admin seulement)
router.post('/', checkRole(['admin']), [
  body('etudiant_id').isInt().withMessage('ID étudiant invalide'),
  body('module_id').isInt().withMessage('ID module invalide'),
  body('promotion_id').isInt().withMessage('ID promotion invalide'),
  body('statut').optional().isIn(['inscrit', 'abandonne', 'termine']).withMessage('Statut invalide')
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

    const { etudiant_id, module_id, promotion_id, statut = 'inscrit' } = req.body;

    // Vérifier que l'étudiant existe
    const [etudiants] = await pool.execute(
      'SELECT id FROM utilisateurs WHERE id = ? AND role = "etudiant"',
      [etudiant_id]
    );

    if (etudiants.length === 0) {
      return res.status(400).json({ 
        error: 'Étudiant invalide', 
        message: 'L\'étudiant spécifié n\'existe pas' 
      });
    }

    // Vérifier que le module existe
    const [modules] = await pool.execute(
      'SELECT id FROM modules WHERE id = ?',
      [module_id]
    );

    if (modules.length === 0) {
      return res.status(400).json({ 
        error: 'Module invalide', 
        message: 'Le module spécifié n\'existe pas' 
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

    // Vérifier que l'étudiant n'est pas déjà inscrit à ce module dans cette promotion
    const [existingInscriptions] = await pool.execute(
      'SELECT id FROM inscriptions WHERE etudiant_id = ? AND module_id = ? AND promotion_id = ?',
      [etudiant_id, module_id, promotion_id]
    );

    if (existingInscriptions.length > 0) {
      return res.status(400).json({ 
        error: 'Inscription existante', 
        message: 'L\'étudiant est déjà inscrit à ce module dans cette promotion' 
      });
    }

    // Insérer la nouvelle inscription
    const [result] = await pool.execute(
      `INSERT INTO inscriptions (etudiant_id, module_id, promotion_id, statut) 
       VALUES (?, ?, ?, ?)`,
      [etudiant_id, module_id, promotion_id, statut]
    );

    // Récupérer l'inscription créée
    const [newInscription] = await pool.execute(`
      SELECT i.id, i.date_inscription, i.statut,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom, u.email as etudiant_email,
             m.id as module_id, m.code as module_code, m.nom as module_nom, m.credits, m.coefficient,
             p.id as promotion_id, p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM inscriptions i
      JOIN utilisateurs u ON i.etudiant_id = u.id
      JOIN modules m ON i.module_id = m.id
      JOIN promotions p ON i.promotion_id = p.id
      WHERE i.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Inscription créée avec succès',
      inscription: newInscription[0]
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la création de l\'inscription' 
    });
  }
});

// Mettre à jour une inscription (admin seulement)
router.put('/:id', checkRole(['admin']), [
  body('statut').isIn(['inscrit', 'abandonne', 'termine']).withMessage('Statut invalide')
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
    const { statut } = req.body;

    // Vérifier que l'inscription existe
    const [existingInscription] = await pool.execute(
      'SELECT id FROM inscriptions WHERE id = ?',
      [id]
    );

    if (existingInscription.length === 0) {
      return res.status(404).json({ 
        error: 'Inscription non trouvée' 
      });
    }

    // Mettre à jour l'inscription
    await pool.execute(
      'UPDATE inscriptions SET statut = ? WHERE id = ?',
      [statut, id]
    );

    // Récupérer l'inscription mise à jour
    const [updatedInscription] = await pool.execute(`
      SELECT i.id, i.date_inscription, i.statut,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom, u.email as etudiant_email,
             m.id as module_id, m.code as module_code, m.nom as module_nom, m.credits, m.coefficient,
             p.id as promotion_id, p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM inscriptions i
      JOIN utilisateurs u ON i.etudiant_id = u.id
      JOIN modules m ON i.module_id = m.id
      JOIN promotions p ON i.promotion_id = p.id
      WHERE i.id = ?
    `, [id]);

    res.json({
      message: 'Inscription mise à jour avec succès',
      inscription: updatedInscription[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inscription:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la mise à jour de l\'inscription' 
    });
  }
});

// Supprimer une inscription (admin seulement)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'inscription existe
    const [existingInscription] = await pool.execute(
      'SELECT id FROM inscriptions WHERE id = ?',
      [id]
    );

    if (existingInscription.length === 0) {
      return res.status(404).json({ 
        error: 'Inscription non trouvée' 
      });
    }

    // Supprimer l'inscription
    await pool.execute('DELETE FROM inscriptions WHERE id = ?', [id]);

    res.json({
      message: 'Inscription supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'inscription:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la suppression de l\'inscription' 
    });
  }
});

// Inscription en masse (admin seulement)
router.post('/bulk', checkRole(['admin']), [
  body('inscriptions').isArray().withMessage('Inscriptions doit être un tableau'),
  body('inscriptions.*.etudiant_id').isInt().withMessage('ID étudiant invalide'),
  body('inscriptions.*.module_id').isInt().withMessage('ID module invalide'),
  body('inscriptions.*.promotion_id').isInt().withMessage('ID promotion invalide')
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

    const { inscriptions } = req.body;
    const results = [];
    const errors = [];

    for (const inscription of inscriptions) {
      try {
        const { etudiant_id, module_id, promotion_id, statut = 'inscrit' } = inscription;

        // Vérifier que l'étudiant existe
        const [etudiants] = await pool.execute(
          'SELECT id FROM utilisateurs WHERE id = ? AND role = "etudiant"',
          [etudiant_id]
        );

        if (etudiants.length === 0) {
          errors.push({
            etudiant_id,
            module_id,
            promotion_id,
            error: 'Étudiant non trouvé'
          });
          continue;
        }

        // Vérifier que le module existe
        const [modules] = await pool.execute(
          'SELECT id FROM modules WHERE id = ?',
          [module_id]
        );

        if (modules.length === 0) {
          errors.push({
            etudiant_id,
            module_id,
            promotion_id,
            error: 'Module non trouvé'
          });
          continue;
        }

        // Vérifier que la promotion existe
        const [promotions] = await pool.execute(
          'SELECT id FROM promotions WHERE id = ?',
          [promotion_id]
        );

        if (promotions.length === 0) {
          errors.push({
            etudiant_id,
            module_id,
            promotion_id,
            error: 'Promotion non trouvée'
          });
          continue;
        }

        // Vérifier que l'étudiant n'est pas déjà inscrit
        const [existingInscriptions] = await pool.execute(
          'SELECT id FROM inscriptions WHERE etudiant_id = ? AND module_id = ? AND promotion_id = ?',
          [etudiant_id, module_id, promotion_id]
        );

        if (existingInscriptions.length > 0) {
          errors.push({
            etudiant_id,
            module_id,
            promotion_id,
            error: 'Inscription déjà existante'
          });
          continue;
        }

        // Insérer l'inscription
        const [result] = await pool.execute(
          `INSERT INTO inscriptions (etudiant_id, module_id, promotion_id, statut) 
           VALUES (?, ?, ?, ?)`,
          [etudiant_id, module_id, promotion_id, statut]
        );

        results.push({
          id: result.insertId,
          etudiant_id,
          module_id,
          promotion_id,
          statut,
          success: true
        });

      } catch (error) {
        errors.push({
          etudiant_id: inscription.etudiant_id,
          module_id: inscription.module_id,
          promotion_id: inscription.promotion_id,
          error: 'Erreur lors de l\'insertion'
        });
      }
    }

    res.json({
      message: 'Traitement des inscriptions terminé',
      resultats: {
        reussies: results.length,
        echecs: errors.length,
        total: inscriptions.length
      },
      reussies: results,
      echecs: errors
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription en masse:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de l\'inscription en masse' 
    });
  }
});

module.exports = router;