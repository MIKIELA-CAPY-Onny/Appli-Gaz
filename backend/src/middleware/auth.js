const jwt = require('jsonwebtoken');
const pool = require('../../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Accès refusé', 
        message: 'Token d\'authentification manquant' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours en base
    const [rows] = await pool.execute(
      'SELECT id, matricule, nom, prenom, email, role FROM utilisateurs WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        error: 'Token invalide', 
        message: 'Utilisateur non trouvé' 
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token invalide', 
        message: 'Token d\'authentification invalide' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré', 
        message: 'Votre session a expiré, veuillez vous reconnecter' 
      });
    }

    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ 
      error: 'Erreur d\'authentification', 
      message: 'Erreur lors de la vérification du token' 
    });
  }
};

// Middleware pour vérifier les rôles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Non authentifié', 
        message: 'Utilisateur non authentifié' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Accès interdit', 
        message: 'Vous n\'avez pas les permissions nécessaires pour cette action' 
      });
    }

    next();
  };
};

module.exports = { authMiddleware, checkRole };