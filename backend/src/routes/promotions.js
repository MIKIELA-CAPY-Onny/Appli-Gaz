const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../config/database');
const { checkRole } = require('../middleware/auth');

const router = express.Router();

// Récupérer toutes les promotions
router.get('/', async (req, res) => {
  try {
    const { statut, annee, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT id, nom, annee_debut, annee_fin, statut, date_creation
      FROM promotions
      WHERE 1=1
    `;
    
    const params = [];
    
    if (statut) {
      query += ` AND statut = ?`;
      params.push(statut);
    }
    
    if (annee) {
      query += ` AND (annee_debut = ? OR annee_fin = ?)`;
      params.push(annee, annee);
    }
    
    query += ` ORDER BY annee_debut DESC, nom LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM promotions
      WHERE 1=1
    `;
    
    const countParams = [];
    if (statut) {
      countQuery += ` AND statut = ?`;
      countParams.push(statut);
    }
    
    if (annee) {
      countQuery += ` AND (annee_debut = ? OR annee_fin = ?)`;
      countParams.push(annee, annee);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      promotions: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération des promotions' 
    });
  }
});

// Récupérer une promotion par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT id, nom, annee_debut, annee_fin, statut, date_creation FROM promotions WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Promotion non trouvée' 
      });
    }
    
    const promotion = rows[0];
    
    // Récupérer les modules de cette promotion
    const [modules] = await pool.execute(`
      SELECT m.id, m.code, m.nom, m.description, m.credits, m.coefficient, m.statut,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom
      FROM modules m
      LEFT JOIN utilisateurs u ON m.enseignant_id = u.id
      WHERE m.promotion_id = ?
      ORDER BY m.nom
    `, [id]);
    
    // Récupérer les étudiants inscrits à cette promotion
    const [etudiants] = await pool.execute(`
      SELECT DISTINCT u.id, u.matricule, u.nom, u.prenom, u.email
      FROM utilisateurs u
      JOIN inscriptions i ON u.id = i.etudiant_id
      WHERE i.promotion_id = ?
      ORDER BY u.nom, u.prenom
    `, [id]);
    
    // Compter les inscriptions par module
    const [inscriptionsCount] = await pool.execute(`
      SELECT m.id as module_id, m.nom as module_nom, COUNT(i.id) as nombre_inscriptions
      FROM modules m
      LEFT JOIN inscriptions i ON m.id = i.module_id AND i.promotion_id = ?
      WHERE m.promotion_id = ?
      GROUP BY m.id, m.nom
      ORDER BY m.nom
    `, [id, id]);
    
    promotion.modules = modules;
    promotion.etudiants = etudiants;
    promotion.inscriptions_par_module = inscriptionsCount;
    
    res.json(promotion);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la promotion:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération de la promotion' 
    });
  }
});

// Créer une nouvelle promotion (admin seulement)
router.post('/', checkRole(['admin']), [
  body('nom').notEmpty().withMessage('Nom de la promotion requis'),
  body('annee_debut').isInt({ min: 2000, max: 2100 }).withMessage('Année de début invalide'),
  body('annee_fin').isInt({ min: 2000, max: 2100 }).withMessage('Année de fin invalide'),
  body('statut').optional().isIn(['active', 'terminee', 'preparation']).withMessage('Statut invalide')
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

    const { nom, annee_debut, annee_fin, statut = 'preparation' } = req.body;

    // Vérifier que l'année de fin est supérieure à l'année de début
    if (annee_fin <= annee_debut) {
      return res.status(400).json({ 
        error: 'Années invalides', 
        message: 'L\'année de fin doit être supérieure à l\'année de début' 
      });
    }

    // Vérifier qu'il n'y a pas de chevauchement avec d'autres promotions
    const [overlappingPromotions] = await pool.execute(
      'SELECT id FROM promotions WHERE (annee_debut <= ? AND annee_fin >= ?) OR (annee_debut <= ? AND annee_fin >= ?)',
      [annee_fin, annee_debut, annee_fin, annee_debut]
    );

    if (overlappingPromotions.length > 0) {
      return res.status(400).json({ 
        error: 'Chevauchement d\'années', 
        message: 'Cette promotion chevauche avec une autre promotion existante' 
      });
    }

    // Insérer la nouvelle promotion
    const [result] = await pool.execute(
      `INSERT INTO promotions (nom, annee_debut, annee_fin, statut) 
       VALUES (?, ?, ?, ?)`,
      [nom, annee_debut, annee_fin, statut]
    );

    // Récupérer la promotion créée
    const [newPromotion] = await pool.execute(
      'SELECT id, nom, annee_debut, annee_fin, statut, date_creation FROM promotions WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Promotion créée avec succès',
      promotion: newPromotion[0]
    });

  } catch (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la création de la promotion' 
    });
  }
});

// Mettre à jour une promotion (admin seulement)
router.put('/:id', checkRole(['admin']), [
  body('nom').optional().notEmpty().withMessage('Nom ne peut pas être vide'),
  body('annee_debut').optional().isInt({ min: 2000, max: 2100 }).withMessage('Année de début invalide'),
  body('annee_fin').optional().isInt({ min: 2000, max: 2100 }).withMessage('Année de fin invalide'),
  body('statut').optional().isIn(['active', 'terminee', 'preparation']).withMessage('Statut invalide')
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
    const { nom, annee_debut, annee_fin, statut } = req.body;

    // Vérifier que la promotion existe
    const [existingPromotion] = await pool.execute(
      'SELECT * FROM promotions WHERE id = ?',
      [id]
    );

    if (existingPromotion.length === 0) {
      return res.status(404).json({ 
        error: 'Promotion non trouvée' 
      });
    }

    // Vérifier que l'année de fin est supérieure à l'année de début si les deux sont fournies
    if (annee_debut !== undefined && annee_fin !== undefined && annee_fin <= annee_debut) {
      return res.status(400).json({ 
        error: 'Années invalides', 
        message: 'L\'année de fin doit être supérieure à l\'année de début' 
      });
    }

    // Vérifier qu'il n'y a pas de chevauchement avec d'autres promotions
    if (annee_debut !== undefined || annee_fin !== undefined) {
      const finalAnneeDebut = annee_debut !== undefined ? annee_debut : existingPromotion[0].annee_debut;
      const finalAnneeFin = annee_fin !== undefined ? annee_fin : existingPromotion[0].annee_fin;

      const [overlappingPromotions] = await pool.execute(
        'SELECT id FROM promotions WHERE id != ? AND ((annee_debut <= ? AND annee_fin >= ?) OR (annee_debut <= ? AND annee_fin >= ?))',
        [id, finalAnneeFin, finalAnneeDebut, finalAnneeFin, finalAnneeDebut]
      );

      if (overlappingPromotions.length > 0) {
        return res.status(400).json({ 
          error: 'Chevauchement d\'années', 
          message: 'Cette promotion chevauche avec une autre promotion existante' 
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
    if (annee_debut !== undefined) {
      updateFields.push('annee_debut = ?');
      params.push(annee_debut);
    }
    if (annee_fin !== undefined) {
      updateFields.push('annee_fin = ?');
      params.push(annee_fin);
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

    // Mettre à jour la promotion
    await pool.execute(
      `UPDATE promotions SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer la promotion mise à jour
    const [updatedPromotion] = await pool.execute(
      'SELECT id, nom, annee_debut, annee_fin, statut, date_creation FROM promotions WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Promotion mise à jour avec succès',
      promotion: updatedPromotion[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la promotion:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la mise à jour de la promotion' 
    });
  }
});

// Supprimer une promotion (admin seulement)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la promotion existe
    const [existingPromotion] = await pool.execute(
      'SELECT id FROM promotions WHERE id = ?',
      [id]
    );

    if (existingPromotion.length === 0) {
      return res.status(404).json({ 
        error: 'Promotion non trouvée' 
      });
    }

    // Vérifier qu'il n'y a pas d'inscriptions actives
    const [inscriptions] = await pool.execute(
      'SELECT COUNT(*) as count FROM inscriptions WHERE promotion_id = ? AND statut = "inscrit"',
      [id]
    );

    if (inscriptions[0].count > 0) {
      return res.status(400).json({ 
        error: 'Promotion non supprimable', 
        message: 'Cette promotion ne peut pas être supprimée car elle a des étudiants inscrits' 
      });
    }

    // Supprimer la promotion
    await pool.execute('DELETE FROM promotions WHERE id = ?', [id]);

    res.json({
      message: 'Promotion supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la promotion:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la suppression de la promotion' 
    });
  }
});

// Récupérer les statistiques d'une promotion
router.get('/:id/statistiques', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la promotion existe
    const [promotion] = await pool.execute(
      'SELECT id, nom FROM promotions WHERE id = ?',
      [id]
    );

    if (promotion.length === 0) {
      return res.status(404).json({ 
        error: 'Promotion non trouvée' 
      });
    }

    // Compter les modules
    const [modulesCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM modules WHERE promotion_id = ?',
      [id]
    );

    // Compter les étudiants inscrits
    const [etudiantsCount] = await pool.execute(
      'SELECT COUNT(DISTINCT etudiant_id) as total FROM inscriptions WHERE promotion_id = ? AND statut = "inscrit"',
      [id]
    );

    // Compter les inscriptions totales
    const [inscriptionsCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM inscriptions WHERE promotion_id = ?',
      [id]
    );

    // Compter les notes
    const [notesCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM notes WHERE promotion_id = ?',
      [id]
    );

    // Compter les absences
    const [absencesCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM absences WHERE promotion_id = ?',
      [id]
    );

    // Calculer la moyenne générale des notes
    const [moyenneGenerale] = await pool.execute(
      'SELECT AVG(note) as moyenne FROM notes WHERE promotion_id = ?',
      [id]
    );

    const statistiques = {
      promotion: promotion[0],
      modules: modulesCount[0].total,
      etudiants: etudiantsCount[0].total,
      inscriptions: inscriptionsCount[0].total,
      notes: notesCount[0].total,
      absences: absencesCount[0].total,
      moyenne_generale: moyenneGenerale[0].moyenne ? parseFloat(moyenneGenerale[0].moyenne).toFixed(2) : 0
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