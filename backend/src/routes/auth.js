const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../../config/database');

const router = express.Router();

// Connexion utilisateur
router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe requis')
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

    const { email, mot_de_passe } = req.body;

    // Rechercher l'utilisateur
    const [rows] = await pool.execute(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        error: 'Authentification échouée', 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const user = rows[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Authentification échouée', 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retourner les informations utilisateur (sans le mot de passe)
    const { mot_de_passe: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Connexion réussie',
      user: userWithoutPassword,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la connexion' 
    });
  }
});

// Inscription d'un nouvel utilisateur (admin seulement)
router.post('/register', [
  body('matricule').notEmpty().withMessage('Matricule requis'),
  body('nom').notEmpty().withMessage('Nom requis'),
  body('prenom').notEmpty().withMessage('Prénom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Mot de passe doit contenir au moins 6 caractères'),
  body('role').isIn(['admin', 'enseignant', 'etudiant']).withMessage('Rôle invalide')
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

    const { matricule, nom, prenom, email, mot_de_passe, role, date_naissance, telephone, adresse } = req.body;

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
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // Insérer le nouvel utilisateur
    const [result] = await pool.execute(
      `INSERT INTO utilisateurs (matricule, nom, prenom, email, mot_de_passe, role, date_naissance, telephone, adresse) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [matricule, nom, prenom, email, hashedPassword, role, date_naissance, telephone, adresse]
    );

    // Récupérer l'utilisateur créé
    const [newUser] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, role, date_naissance, telephone, adresse, date_creation FROM utilisateurs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: newUser[0]
    });

  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de l\'inscription' 
    });
  }
});

// Vérifier le token (pour vérifier si l'utilisateur est toujours connecté)
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token manquant', 
        message: 'Token d\'authentification requis' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer les informations utilisateur
    const [rows] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, role, date_naissance, telephone, adresse FROM utilisateurs WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé', 
        message: 'Token invalide' 
      });
    }

    res.json({
      valid: true,
      user: rows[0]
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        valid: false,
        error: 'Token invalide ou expiré' 
      });
    }

    console.error('Erreur de vérification:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors de la vérification du token' 
    });
  }
});

// Changer le mot de passe
router.post('/change-password', [
  body('ancien_mot_de_passe').notEmpty().withMessage('Ancien mot de passe requis'),
  body('nouveau_mot_de_passe').isLength({ min: 6 }).withMessage('Nouveau mot de passe doit contenir au moins 6 caractères')
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

    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    const userId = req.user.id;

    // Récupérer l'utilisateur
    const [rows] = await pool.execute(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await bcrypt.compare(ancien_mot_de_passe, rows[0].mot_de_passe);
    if (!isOldPasswordValid) {
      return res.status(400).json({ 
        error: 'Mot de passe incorrect', 
        message: 'L\'ancien mot de passe est incorrect' 
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(nouveau_mot_de_passe, saltRounds);

    // Mettre à jour le mot de passe
    await pool.execute(
      'UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur de changement de mot de passe:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      message: 'Erreur lors du changement de mot de passe' 
    });
  }
});

module.exports = router;