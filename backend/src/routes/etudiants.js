const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../config/database');
const { checkRole } = require('../middleware/auth');

const router = express.Router();

// Récupérer tous les étudiants (admin et enseignants)
router.get('/', async (req, res) => {
  try {
    const { search, promotion_id, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT u.id, u.matricule, u.nom, u.prenom, u.email, u.date_naissance, 
             u.telephone, u.adresse, u.date_creation, u.role
      FROM utilisateurs u 
      WHERE u.role = 'etudiant'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.matricule LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (promotion_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM inscriptions i 
        WHERE i.etudiant_id = u.id AND i.promotion_id = ?
      )`;
      params.push(promotion_id);
    }
    
    query += ` ORDER BY u.nom, u.prenom LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM utilisateurs u 
      WHERE u.role = 'etudiant'
    `;
    
    const countParams = [];
    if (search) {
      countQuery += ` AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.matricule LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (promotion_id) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM inscriptions i 
        WHERE i.etudiant_id = u.id AND i.promotion_id = ?
      )`;
      countParams.push(promotion_id);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      etudiants: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération des étudiants' 
    });
  }
});

// Récupérer un étudiant par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT u.id, u.matricule, u.nom, u.prenom, u.email, u.date_naissance, 
             u.telephone, u.adresse, u.date_creation, u.role
      FROM utilisateurs u 
      WHERE u.id = ? AND u.role = 'etudiant'
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Étudiant non trouvé' 
      });
    }
    
    // Récupérer les inscriptions de l'étudiant
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
    
    // Récupérer les notes de l'étudiant
    const [notes] = await pool.execute(`
      SELECT n.id, n.note, n.type_evaluation, n.coefficient, n.commentaire, n.date_evaluation,
             m.code as module_code, m.nom as module_nom,
             p.nom as promotion_nom
      FROM notes n
      JOIN modules m ON n.module_id = m.id
      JOIN promotions p ON n.promotion_id = p.id
      WHERE n.etudiant_id = ?
      ORDER BY n.date_evaluation DESC
    `, [id]);
    
    // Récupérer les absences de l'étudiant
    const [absences] = await pool.execute(`
      SELECT a.id, a.date_absence, a.type, a.duree_retard_minutes, a.motif, a.justifiee,
             m.code as module_code, m.nom as module_nom,
             p.nom as promotion_nom
      FROM absences a
      JOIN modules m ON a.module_id = m.id
      JOIN promotions p ON a.promotion_id = p.id
      WHERE a.etudiant_id = ?
      ORDER BY a.date_absence DESC
    `, [id]);
    
    const etudiant = rows[0];
    etudiant.inscriptions = inscriptions;
    etudiant.notes = notes;
    etudiant.absences = absences;
    
    res.json(etudiant);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étudiant:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération de l\'étudiant' 
    });
  }
});

// Créer un nouvel étudiant (admin seulement)
router.post('/', checkRole(['admin']), [
  body('matricule').notEmpty().withMessage('Matricule requis'),
  body('nom').notEmpty().withMessage('Nom requis'),
  body('prenom').notEmpty().withMessage('Prénom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Mot de passe doit contenir au moins 6 caractères')
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

    const { matricule, nom, prenom, email, mot_de_passe, date_naissance, telephone, adresse } = req.body;

    // Vérifier si l'email ou le matricule existe déjà
    const [existingUsers] = await pool.execute(
      'SELECT id FROM utilisateurs WHERE email = ? OR matricule = ?',
      [email, matricule]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'Utilisateur existant', 
        message: 'Un utilisateur avec cet email ou matricule existe déjà' 
      });
    }

    // Hasher le mot de passe
    const bcrypt = require('bcryptjs');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // Insérer le nouvel étudiant
    const [result] = await pool.execute(
      `INSERT INTO utilisateurs (matricule, nom, prenom, email, mot_de_passe, role, date_naissance, telephone, adresse) 
       VALUES (?, ?, ?, ?, ?, 'etudiant', ?, ?, ?)`,
      [matricule, nom, prenom, email, hashedPassword, date_naissance, telephone, adresse]
    );

    // Récupérer l'étudiant créé
    const [newEtudiant] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, date_naissance, telephone, adresse, date_creation FROM utilisateurs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Étudiant créé avec succès',
      etudiant: newEtudiant[0]
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'étudiant:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la création de l\'étudiant' 
    });
  }
});

// Mettre à jour un étudiant (admin seulement)
router.put('/:id', checkRole(['admin']), [
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

    // Vérifier que l'étudiant existe
    const [existingEtudiant] = await pool.execute(
      'SELECT id FROM utilisateurs WHERE id = ? AND role = "etudiant"',
      [id]
    );

    if (existingEtudiant.length === 0) {
      return res.status(404).json({ 
        error: 'Étudiant non trouvé' 
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

    // Mettre à jour l'étudiant
    await pool.execute(
      `UPDATE utilisateurs SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer l'étudiant mis à jour
    const [updatedEtudiant] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, date_naissance, telephone, adresse, date_creation, date_modification FROM utilisateurs WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Étudiant mis à jour avec succès',
      etudiant: updatedEtudiant[0]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la mise à jour de l\'étudiant' 
    });
  }
});

// Supprimer un étudiant (admin seulement)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'étudiant existe
    const [existingEtudiant] = await pool.execute(
      'SELECT id FROM utilisateurs WHERE id = ? AND role = "etudiant"',
      [id]
    );

    if (existingEtudiant.length === 0) {
      return res.status(404).json({ 
        error: 'Étudiant non trouvé' 
      });
    }

    // Supprimer l'étudiant (les contraintes de clé étrangère supprimeront automatiquement les inscriptions, notes et absences)
    await pool.execute('DELETE FROM utilisateurs WHERE id = ?', [id]);

    res.json({
      message: 'Étudiant supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étudiant:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la suppression de l\'étudiant' 
    });
  }
});

// Récupérer le relevé de notes d'un étudiant
router.get('/:id/releve', async (req, res) => {
  try {
    const { id } = req.params;
    const { promotion_id } = req.query;

    // Vérifier que l'étudiant existe
    const [etudiant] = await pool.execute(
      'SELECT id, matricule, nom, prenom FROM utilisateurs WHERE id = ? AND role = "etudiant"',
      [id]
    );

    if (etudiant.length === 0) {
      return res.status(404).json({ 
        error: 'Étudiant non trouvé' 
      });
    }

    let whereClause = 'WHERE n.etudiant_id = ?';
    const params = [id];

    if (promotion_id) {
      whereClause += ' AND n.promotion_id = ?';
      params.push(promotion_id);
    }

    // Récupérer les notes avec les informations des modules et promotions
    const [notes] = await pool.execute(`
      SELECT n.note, n.type_evaluation, n.coefficient, n.commentaire, n.date_evaluation,
             m.code as module_code, m.nom as module_nom, m.credits,
             p.nom as promotion_nom, p.annee_debut, p.annee_fin
      FROM notes n
      JOIN modules m ON n.module_id = m.id
      JOIN promotions p ON n.promotion_id = p.id
      ${whereClause}
      ORDER BY p.annee_debut DESC, m.nom, n.date_evaluation DESC
    `, params);

    // Calculer les moyennes par module
    const moyennesParModule = {};
    notes.forEach(note => {
      const key = `${note.module_code}_${note.promotion_nom}`;
      if (!moyennesParModule[key]) {
        moyennesParModule[key] = {
          module_code: note.module_code,
          module_nom: note.module_nom,
          promotion_nom: note.promotion_nom,
          annee_debut: note.annee_debut,
          annee_fin: note.annee_fin,
          credits: note.credits,
          notes: [],
          moyenne: 0,
          total_coefficient: 0
        };
      }
      
      moyennesParModule[key].notes.push({
        note: note.note,
        type_evaluation: note.type_evaluation,
        coefficient: note.coefficient,
        date_evaluation: note.date_evaluation,
        commentaire: note.commentaire
      });
      
      moyennesParModule[key].total_coefficient += note.coefficient;
    });

    // Calculer les moyennes
    Object.values(moyennesParModule).forEach(module => {
      const totalNotes = module.notes.reduce((sum, note) => sum + (note.note * note.coefficient), 0);
      module.moyenne = module.total_coefficient > 0 ? (totalNotes / module.total_coefficient).toFixed(2) : 0;
    });

    // Calculer la moyenne générale
    const totalCredits = Object.values(moyennesParModule).reduce((sum, module) => sum + module.credits, 0);
    const moyenneGenerale = totalCredits > 0 
      ? (Object.values(moyennesParModule).reduce((sum, module) => sum + (parseFloat(module.moyenne) * module.credits), 0) / totalCredits).toFixed(2)
      : 0;

    res.json({
      etudiant: etudiant[0],
      modules: Object.values(moyennesParModule),
      moyenne_generale: moyenneGenerale,
      total_credits: totalCredits
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du relevé:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la récupération du relevé' 
    });
  }
});

module.exports = router;