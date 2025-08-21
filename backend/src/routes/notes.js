const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../config/database');
const { checkRole } = require('../middleware/auth');

const router = express.Router();

// Récupérer toutes les notes (avec filtres)
router.get('/', async (req, res) => {
  try {
    const { etudiant_id, module_id, promotion_id, type_evaluation, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT n.id, n.note, n.type_evaluation, n.coefficient, n.commentaire, n.date_evaluation, n.date_saisie,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom,
             m.id as module_id, m.code as module_code, m.nom as module_nom,
             p.id as promotion_id, p.nom as promotion_nom
      FROM notes n
      JOIN utilisateurs u ON n.etudiant_id = u.id
      JOIN modules m ON n.module_id = m.id
      JOIN promotions p ON n.promotion_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (etudiant_id) {
      query += ` AND n.etudiant_id = ?`;
      params.push(etudiant_id);
    }
    
    if (module_id) {
      query += ` AND n.module_id = ?`;
      params.push(module_id);
    }
    
    if (promotion_id) {
      query += ` AND n.promotion_id = ?`;
      params.push(promotion_id);
    }
    
    if (type_evaluation) {
      query += ` AND n.type_evaluation = ?`;
      params.push(type_evaluation);
    }
    
    query += ` ORDER BY n.date_evaluation DESC, u.nom, u.prenom LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM notes n
      WHERE 1=1
    `;
    
    const countParams = [];
    if (etudiant_id) {
      countQuery += ` AND n.etudiant_id = ?`;
      countParams.push(etudiant_id);
    }
    
    if (module_id) {
      countQuery += ` AND n.module_id = ?`;
      countParams.push(module_id);
    }
    
    if (promotion_id) {
      countQuery += ` AND n.promotion_id = ?`;
      countParams.push(promotion_id);
    }
    
    if (type_evaluation) {
      countQuery += ` AND n.type_evaluation = ?`;
      countParams.push(type_evaluation);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      notes: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération des notes' 
    });
  }
});

// Récupérer une note par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT n.id, n.note, n.type_evaluation, n.coefficient, n.commentaire, n.date_evaluation, n.date_saisie,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom,
             m.id as module_id, m.code as module_code, m.nom as module_nom,
             p.id as promotion_id, p.nom as promotion_nom
      FROM notes n
      JOIN utilisateurs u ON n.etudiant_id = u.id
      JOIN modules m ON n.module_id = m.id
      JOIN promotions p ON n.promotion_id = p.id
      WHERE n.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Note non trouvée' 
      });
    }
    
    res.json(rows[0]);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la note:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération de la note' 
    });
  }
});

// Créer une nouvelle note (enseignants et admin)
router.post('/', checkRole(['admin', 'enseignant']), [
  body('etudiant_id').isInt().withMessage('ID étudiant invalide'),
  body('module_id').isInt().withMessage('ID module invalide'),
  body('promotion_id').isInt().withMessage('ID promotion invalide'),
  body('note').isFloat({ min: 0, max: 20 }).withMessage('Note doit être entre 0 et 20'),
  body('type_evaluation').isIn(['controle', 'examen', 'tp', 'projet']).withMessage('Type d\'évaluation invalide'),
  body('date_evaluation').isISO8601().toDate().withMessage('Date d\'évaluation invalide'),
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

    const { etudiant_id, module_id, promotion_id, note, type_evaluation, coefficient, commentaire, date_evaluation } = req.body;

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

    // Vérifier que l'enseignant a le droit de noter ce module (sauf pour les admins)
    if (req.user.role === 'enseignant') {
      const [enseignantModules] = await pool.execute(
        'SELECT id FROM modules WHERE id = ? AND enseignant_id = ?',
        [module_id, req.user.id]
      );

      if (enseignantModules.length === 0) {
        return res.status(403).json({ 
          error: 'Accès interdit', 
          message: 'Vous ne pouvez noter que les modules que vous enseignez' 
        });
      }
    }

    // Insérer la nouvelle note
    const [result] = await pool.execute(
      `INSERT INTO notes (etudiant_id, module_id, promotion_id, note, type_evaluation, coefficient, commentaire, date_evaluation) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [etudiant_id, module_id, promotion_id, note, type_evaluation, coefficient || 1.0, commentaire, date_evaluation]
    );

    // Récupérer la note créée
    const [newNote] = await pool.execute(`
      SELECT n.id, n.note, n.type_evaluation, n.coefficient, n.commentaire, n.date_evaluation, n.date_saisie,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom,
             m.id as module_id, m.code as module_code, m.nom as module_nom,
             p.id as promotion_id, p.nom as promotion_nom
      FROM notes n
      JOIN utilisateurs u ON n.etudiant_id = u.id
      JOIN modules m ON n.module_id = m.id
      JOIN promotions p ON n.promotion_id = p.id
      WHERE n.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Note créée avec succès',
      note: newNote[0]
    });

  } catch (error) {
    console.error('Erreur lors de la création de la note:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la création de la note' 
    });
  }
});

// Mettre à jour une note (enseignants et admin)
router.put('/:id', checkRole(['admin', 'enseignant']), [
  body('note').optional().isFloat({ min: 0, max: 20 }).withMessage('Note doit être entre 0 et 20'),
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
    const { note, coefficient, commentaire, date_evaluation } = req.body;

    // Vérifier que la note existe
    const [existingNote] = await pool.execute(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );

    if (existingNote.length === 0) {
      return res.status(404).json({ 
        error: 'Note non trouvée' 
      });
    }

    // Vérifier que l'enseignant a le droit de modifier cette note (sauf pour les admins)
    if (req.user.role === 'enseignant') {
      const [enseignantModules] = await pool.execute(
        'SELECT id FROM modules WHERE id = ? AND enseignant_id = ?',
        [existingNote[0].module_id, req.user.id]
      );

      if (enseignantModules.length === 0) {
        return res.status(403).json({ 
          error: 'Accès interdit', 
          message: 'Vous ne pouvez modifier que les notes des modules que vous enseignez' 
        });
      }
    }

    // Construire la requête de mise à jour
    const updateFields = [];
    const params = [];
    
    if (note !== undefined) {
      updateFields.push('note = ?');
      params.push(note);
    }
    if (coefficient !== undefined) {
      updateFields.push('coefficient = ?');
      params.push(coefficient);
    }
    if (commentaire !== undefined) {
      updateFields.push('commentaire = ?');
      params.push(commentaire);
    }
    if (date_evaluation !== undefined) {
      updateFields.push('date_evaluation = ?');
      params.push(date_evaluation);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'Aucune donnée à mettre à jour' 
      });
    }

    params.push(id);

    // Mettre à jour la note
    await pool.execute(
      `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer la note mise à jour
    const [updatedNote] = await pool.execute(`
      SELECT n.id, n.note, n.type_evaluation, n.coefficient, n.commentaire, n.date_evaluation, n.date_saisie,
             u.id as etudiant_id, u.matricule, u.nom as etudiant_nom, u.prenom as etudiant_prenom,
             m.id as module_id, m.code as module_code, m.nom as module_nom,
             p.id as promotion_id, p.nom as promotion_nom
      FROM notes n
      JOIN utilisateurs u ON n.etudiant_id = u.id
      JOIN modules m ON n.module_id = m.id
      JOIN promotions p ON n.promotion_id = p.id
      WHERE n.id = ?
    `, [id]);

    res.json({
      message: 'Note mise à jour avec succès',
      note: updatedNote[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la mise à jour de la note' 
    });
  }
});

// Supprimer une note (admin seulement)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la note existe
    const [existingNote] = await pool.execute(
      'SELECT id FROM notes WHERE id = ?',
      [id]
    );

    if (existingNote.length === 0) {
      return res.status(404).json({ 
        error: 'Note non trouvée' 
      });
    }

    // Supprimer la note
    await pool.execute('DELETE FROM notes WHERE id = ?', [id]);

    res.json({
      message: 'Note supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la suppression de la note' 
    });
  }
});

// Récupérer les statistiques des notes
router.get('/statistiques/globales', async (req, res) => {
  try {
    const { promotion_id, module_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (promotion_id) {
      whereClause += ' AND n.promotion_id = ?';
      params.push(promotion_id);
    }
    
    if (module_id) {
      whereClause += ' AND n.module_id = ?';
      params.push(module_id);
    }

    // Statistiques générales
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_notes,
        AVG(note) as moyenne_generale,
        MIN(note) as note_min,
        MAX(note) as note_max,
        SUM(CASE WHEN note >= 10 THEN 1 ELSE 0 END) as reussis,
        SUM(CASE WHEN note < 10 THEN 1 ELSE 0 END) as echoues,
        SUM(CASE WHEN note >= 16 THEN 1 ELSE 0 END) as mentions_excellentes,
        SUM(CASE WHEN note >= 14 AND note < 16 THEN 1 ELSE 0 END) as mentions_bien,
        SUM(CASE WHEN note >= 12 AND note < 14 THEN 1 ELSE 0 END) as mentions_assez_bien,
        SUM(CASE WHEN note >= 10 AND note < 12 THEN 1 ELSE 0 END) as mentions_passable
      FROM notes n
      ${whereClause}
    `, params);

    // Répartition par type d'évaluation
    const [repartitionTypes] = await pool.execute(`
      SELECT 
        type_evaluation,
        COUNT(*) as nombre,
        AVG(note) as moyenne
      FROM notes n
      ${whereClause}
      GROUP BY type_evaluation
      ORDER BY type_evaluation
    `, params);

    // Top 10 des meilleures notes
    const [topNotes] = await pool.execute(`
      SELECT 
        n.note, n.type_evaluation, n.date_evaluation,
        u.nom as etudiant_nom, u.prenom as etudiant_prenom,
        m.nom as module_nom
      FROM notes n
      JOIN utilisateurs u ON n.etudiant_id = u.id
      JOIN modules m ON n.module_id = m.id
      ${whereClause}
      ORDER BY n.note DESC
      LIMIT 10
    `, params);

    const statistiques = {
      generales: {
        total_notes: stats[0].total_notes,
        moyenne_generale: stats[0].moyenne_generale ? parseFloat(stats[0].moyenne_generale).toFixed(2) : 0,
        note_min: stats[0].note_min,
        note_max: stats[0].note_max,
        reussis: stats[0].reussis,
        echoues: stats[0].echoues,
        taux_reussite: stats[0].total_notes > 0 
          ? ((stats[0].reussis / stats[0].total_notes) * 100).toFixed(2)
          : 0
      },
      mentions: {
        excellentes: stats[0].mentions_excellentes,
        bien: stats[0].mentions_bien,
        assez_bien: stats[0].mentions_assez_bien,
        passable: stats[0].mentions_passable
      },
      par_type_evaluation: repartitionTypes,
      top_notes: topNotes
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