const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../config/database');
const { checkRole } = require('../middleware/auth');

const router = express.Router();

// Récupérer toutes les absences (avec filtres)
router.get('/', async (req, res) => {
  try {
    const { etudiant_id, module_id, promotion_id, type, date_debut, date_fin, justifiee, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT a.id, a.date_absence, a.type, a.duree_retard_minutes, a.motif, a.justifiee, a.justificatif, a.date_saisie,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom,
             m.id as module_id, m.code as module_code, m.nom as module_nom,
             p.id as promotion_id, p.nom as promotion_nom
      FROM absences a
      JOIN utilisateurs u ON a.etudiant_id = u.id
      JOIN modules m ON a.module_id = m.id
      JOIN promotions p ON a.promotion_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (etudiant_id) {
      query += ` AND a.etudiant_id = ?`;
      params.push(etudiant_id);
    }
    
    if (module_id) {
      query += ` AND a.module_id = ?`;
      params.push(module_id);
    }
    
    if (promotion_id) {
      query += ` AND a.promotion_id = ?`;
      params.push(promotion_id);
    }
    
    if (type) {
      query += ` AND a.type = ?`;
      params.push(type);
    }
    
    if (date_debut) {
      query += ` AND a.date_absence >= ?`;
      params.push(date_debut);
    }
    
    if (date_fin) {
      query += ` AND a.date_absence <= ?`;
      params.push(date_fin);
    }
    
    if (justifiee !== undefined) {
      query += ` AND a.justifiee = ?`;
      params.push(justifiee === 'true');
    }
    
    query += ` ORDER BY a.date_absence DESC, u.nom, u.prenom LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM absences a
      WHERE 1=1
    `;
    
    const countParams = [];
    if (etudiant_id) {
      countQuery += ` AND a.etudiant_id = ?`;
      countParams.push(etudiant_id);
    }
    
    if (module_id) {
      countQuery += ` AND a.module_id = ?`;
      countParams.push(module_id);
    }
    
    if (promotion_id) {
      countQuery += ` AND a.promotion_id = ?`;
      countParams.push(promotion_id);
    }
    
    if (type) {
      countQuery += ` AND a.type = ?`;
      countParams.push(type);
    }
    
    if (date_debut) {
      countQuery += ` AND a.date_absence >= ?`;
      countParams.push(date_debut);
    }
    
    if (date_fin) {
      countQuery += ` AND a.date_absence <= ?`;
      countParams.push(date_fin);
    }
    
    if (justifiee !== undefined) {
      countQuery += ` AND a.justifiee = ?`;
      countParams.push(justifiee === 'true');
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      absences: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération des absences' 
    });
  }
});

// Récupérer une absence par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT a.id, a.date_absence, a.type, a.duree_retard_minutes, a.motif, a.justifiee, a.justificatif, a.date_saisie,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom,
             m.id as module_id, m.code as module_code, m.nom as module_nom,
             p.id as promotion_id, p.nom as promotion_nom
      FROM absences a
      JOIN utilisateurs u ON a.etudiant_id = u.id
      JOIN modules m ON a.module_id = m.id
      JOIN promotions p ON a.promotion_id = p.id
      WHERE a.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Absence non trouvée' 
      });
    }
    
    res.json(rows[0]);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'absence:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération de l\'absence' 
    });
  }
});

// Créer une nouvelle absence (enseignants et admin)
router.post('/', checkRole(['admin', 'enseignant']), [
  body('etudiant_id').isInt().withMessage('ID étudiant invalide'),
  body('module_id').isInt().withMessage('ID module invalide'),
  body('promotion_id').isInt().withMessage('ID promotion invalide'),
  body('date_absence').isISO8601().toDate().withMessage('Date d\'absence invalide'),
  body('type').isIn(['absence', 'retard']).withMessage('Type invalide'),
  body('duree_retard_minutes').optional().isInt({ min: 0 }).withMessage('Durée du retard doit être un entier positif'),
  body('motif').optional().notEmpty().withMessage('Motif ne peut pas être vide')
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

    const { etudiant_id, module_id, promotion_id, date_absence, type, duree_retard_minutes, motif, justificatif } = req.body;

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

    // Vérifier que l'étudiant est inscrit au module
    const [inscriptions] = await pool.execute(
      'SELECT id FROM inscriptions WHERE etudiant_id = ? AND module_id = ? AND promotion_id = ?',
      [etudiant_id, module_id, promotion_id]
    );

    if (inscriptions.length === 0) {
      return res.status(400).json({ 
        error: 'Inscription invalide', 
        message: 'L\'étudiant n\'est pas inscrit à ce module dans cette promotion' 
      });
    }

    // Vérifier que l'enseignant a le droit de saisir les absences pour ce module (sauf pour les admins)
    if (req.user.role === 'enseignant') {
      const [enseignantModules] = await pool.execute(
        'SELECT id FROM modules WHERE id = ? AND enseignant_id = ?',
        [module_id, req.user.id]
      );

      if (enseignantModules.length === 0) {
        return res.status(403).json({ 
          error: 'Accès interdit', 
          message: 'Vous ne pouvez saisir les absences que pour les modules que vous enseignez' 
        });
      }
    }

    // Vérifier qu'il n'y a pas déjà une absence pour cet étudiant, ce module et cette date
    const [existingAbsences] = await pool.execute(
      'SELECT id FROM absences WHERE etudiant_id = ? AND module_id = ? AND date_absence = ?',
      [etudiant_id, module_id, date_absence]
    );

    if (existingAbsences.length > 0) {
      return res.status(400).json({ 
        error: 'Absence déjà enregistrée', 
        message: 'Une absence pour cet étudiant, ce module et cette date existe déjà' 
      });
    }

    // Insérer la nouvelle absence
    const [result] = await pool.execute(
      `INSERT INTO absences (etudiant_id, module_id, promotion_id, date_absence, type, duree_retard_minutes, motif, justificatif) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [etudiant_id, module_id, promotion_id, date_absence, type, duree_retard_minutes || 0, motif, justificatif]
    );

    // Récupérer l'absence créée
    const [newAbsence] = await pool.execute(`
      SELECT a.id, a.date_absence, a.type, a.duree_retard_minutes, a.motif, a.justifiee, a.justificatif, a.date_saisie,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom,
             m.id as module_id, m.code as module_code, m.nom as module_nom,
             p.id as promotion_id, p.nom as promotion_nom
      FROM absences a
      JOIN utilisateurs u ON a.etudiant_id = u.id
      JOIN modules m ON a.module_id = m.id
      JOIN promotions p ON a.promotion_id = p.id
      WHERE a.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Absence enregistrée avec succès',
      absence: newAbsence[0]
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'absence:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la création de l\'absence' 
    });
  }
});

// Mettre à jour une absence (enseignants et admin)
router.put('/:id', checkRole(['admin', 'enseignant']), [
  body('motif').optional().notEmpty().withMessage('Motif ne peut pas être vide'),
  body('duree_retard_minutes').optional().isInt({ min: 0 }).withMessage('Durée du retard doit être un entier positif')
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
    const { motif, justificatif, justifiee, duree_retard_minutes } = req.body;

    // Vérifier que l'absence existe
    const [existingAbsence] = await pool.execute(
      'SELECT * FROM absences WHERE id = ?',
      [id]
    );

    if (existingAbsence.length === 0) {
      return res.status(404).json({ 
        error: 'Absence non trouvée' 
      });
    }

    // Vérifier que l'enseignant a le droit de modifier cette absence (sauf pour les admins)
    if (req.user.role === 'enseignant') {
      const [enseignantModules] = await pool.execute(
        'SELECT id FROM modules WHERE id = ? AND enseignant_id = ?',
        [existingAbsence[0].module_id, req.user.id]
      );

      if (enseignantModules.length === 0) {
        return res.status(403).json({ 
          error: 'Accès interdit', 
          message: 'Vous ne pouvez modifier que les absences des modules que vous enseignez' 
        });
      }
    }

    // Construire la requête de mise à jour
    const updateFields = [];
    const params = [];
    
    if (motif !== undefined) {
      updateFields.push('motif = ?');
      params.push(motif);
    }
    if (justificatif !== undefined) {
      updateFields.push('justificatif = ?');
      params.push(justificatif);
    }
    if (justifiee !== undefined) {
      updateFields.push('justifiee = ?');
      params.push(justifiee);
    }
    if (duree_retard_minutes !== undefined) {
      updateFields.push('duree_retard_minutes = ?');
      params.push(duree_retard_minutes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Aucune donnée à mettre à jour' 
      });
    }

    params.push(id);

    // Mettre à jour l'absence
    await pool.execute(
      `UPDATE absences SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer l'absence mise à jour
    const [updatedAbsence] = await pool.execute(`
      SELECT a.id, a.date_absence, a.type, a.duree_retard_minutes, a.motif, a.justifiee, a.justificatif, a.date_saisie,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom,
             m.id as module_id, m.code as module_code, m.nom as module_nom,
             p.id as promotion_id, p.nom as promotion_nom
      FROM absences a
      JOIN utilisateurs u ON a.etudiant_id = u.id
      JOIN modules m ON a.module_id = m.id
      JOIN promotions p ON a.promotion_id = p.id
      WHERE a.id = ?
    `, [id]);

    res.json({
      message: 'Absence mise à jour avec succès',
      absence: updatedAbsence[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'absence:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la mise à jour de l\'absence' 
    });
  }
});

// Supprimer une absence (admin seulement)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'absence existe
    const [existingAbsence] = await pool.execute(
      'SELECT id FROM absences WHERE id = ?',
      [id]
    );

    if (existingAbsence.length === 0) {
      return res.status(404).json({ 
        error: 'Absence non trouvée' 
      });
    }

    // Supprimer l'absence
    await pool.execute('DELETE FROM absences WHERE id = ?', [id]);

    res.json({
      message: 'Absence supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'absence:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la suppression de l\'absence' 
    });
  }
});

// Récupérer les statistiques des absences
router.get('/statistiques/globales', async (req, res) => {
  try {
    const { promotion_id, module_id, date_debut, date_fin } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (promotion_id) {
      whereClause += ' AND a.promotion_id = ?';
      params.push(promotion_id);
    }
    
    if (module_id) {
      whereClause += ' AND a.module_id = ?';
      params.push(module_id);
    }
    
    if (date_debut) {
      whereClause += ' AND a.date_absence >= ?';
      params.push(date_debut);
    }
    
    if (date_fin) {
      whereClause += ' AND a.date_absence <= ?';
      params.push(date_fin);
    }

    // Statistiques générales
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_absences,
        SUM(CASE WHEN type = 'absence' THEN 1 ELSE 0 END) as absences_pures,
        SUM(CASE WHEN type = 'retard' THEN 1 ELSE 0 END) as retards,
        SUM(CASE WHEN justifiee = 1 THEN 1 ELSE 0 END) as justifiees,
        SUM(CASE WHEN justifiee = 0 THEN 1 ELSE 0 END) as non_justifiees,
        AVG(CASE WHEN type = 'retard' THEN duree_retard_minutes ELSE NULL END) as duree_moyenne_retards
      FROM absences a
      ${whereClause}
    `, params);

    // Répartition par module
    const [repartitionModules] = await pool.execute(`
      SELECT 
        m.nom as module_nom,
        COUNT(*) as nombre_absences,
        SUM(CASE WHEN a.type = 'absence' THEN 1 ELSE 0 END) as absences_pures,
        SUM(CASE WHEN a.type = 'retard' THEN 1 ELSE 0 END) as retards
      FROM absences a
      JOIN modules m ON a.module_id = m.id
      ${whereClause}
      GROUP BY m.id, m.nom
      ORDER BY nombre_absences DESC
      LIMIT 10
    `, params);

    // Répartition par étudiant
    const [repartitionEtudiants] = await pool.execute(`
      SELECT 
        u.nom, u.prenom,
        COUNT(*) as nombre_absences,
        SUM(CASE WHEN a.type = 'absence' THEN 1 ELSE 0 END) as absences_pures,
        SUM(CASE WHEN a.type = 'retard' THEN 1 ELSE 0 END) as retards
      FROM absences a
      JOIN utilisateurs u ON a.etudiant_id = u.id
      ${whereClause}
      GROUP BY u.id, u.nom, u.prenom
      ORDER BY nombre_absences DESC
      LIMIT 10
    `, params);

    // Évolution mensuelle
    const [evolutionMensuelle] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date_absence, '%Y-%m') as mois,
        COUNT(*) as nombre_absences,
        SUM(CASE WHEN type = 'absence' THEN 1 ELSE 0 END) as absences_pures,
        SUM(CASE WHEN type = 'retard' THEN 1 ELSE 0 END) as retards
      FROM absences a
      ${whereClause}
      GROUP BY DATE_FORMAT(date_absence, '%Y-%m')
      ORDER BY mois DESC
      LIMIT 12
    `, params);

    const statistiques = {
      generales: {
        total_absences: stats[0].total_absences,
        absences_pures: stats[0].absences_pures,
        retards: stats[0].retards,
        justifiees: stats[0].justifiees,
        non_justifiees: stats[0].non_justifiees,
        duree_moyenne_retards: stats[0].duree_moyenne_retards ? parseFloat(stats[0].duree_moyenne_retards).toFixed(2) : 0,
        taux_justification: stats[0].total_absences > 0 
          ? ((stats[0].justifiees / stats[0].total_absences) * 100).toFixed(2)
          : 0
      },
      par_module: repartitionModules,
      par_etudiant: repartitionEtudiants,
      evolution_mensuelle: evolutionMensuelle
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