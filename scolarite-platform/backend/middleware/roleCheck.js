const { User, Student, Teacher, Admin } = require('../models');

// Middleware de vérification du rôle étudiant
const isStudent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!student) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Cette ressource est réservée aux étudiants'
      });
    }

    req.student = student;
    next();
  } catch (error) {
    console.error('Erreur de vérification du rôle étudiant:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de vérifier votre rôle'
    });
  }
};

// Middleware de vérification du rôle enseignant
const isTeacher = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!teacher) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Cette ressource est réservée aux enseignants'
      });
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    console.error('Erreur de vérification du rôle enseignant:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de vérifier votre rôle'
    });
  }
};

// Middleware de vérification du rôle administrateur
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    const admin = await Admin.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!admin) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Cette ressource est réservée aux administrateurs'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Erreur de vérification du rôle administrateur:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de vérifier votre rôle'
    });
  }
};

// Middleware de vérification du rôle super administrateur
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    const admin = await Admin.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!admin || admin.role !== 'super_admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Cette ressource est réservée aux super administrateurs'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Erreur de vérification du rôle super administrateur:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de vérifier votre rôle'
    });
  }
};

// Middleware de vérification des permissions sur les ressources
const canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentification requise',
          message: 'Vous devez être connecté pour accéder à cette ressource'
        });
      }

      // Super admin a accès à tout
      if (req.userRole === 'admin' && req.user.admin && req.user.admin.isSuperAdmin()) {
        return next();
      }

      // Vérifier les permissions selon le type de ressource
      switch (resourceType) {
        case 'student':
          if (req.userRole === 'student' && req.user.student) {
            // Un étudiant peut accéder à ses propres données
            if (req.params.id && parseInt(req.params.id) === req.user.student.id) {
              return next();
            }
          }
          // Les enseignants et admins peuvent accéder aux données des étudiants
          if (['teacher', 'admin'].includes(req.userRole)) {
            return next();
          }
          break;

        case 'teacher':
          if (req.userRole === 'teacher' && req.user.teacher) {
            // Un enseignant peut accéder à ses propres données
            if (req.params.id && parseInt(req.params.id) === req.user.teacher.id) {
              return next();
            }
          }
          // Seuls les admins peuvent accéder aux données des enseignants
          if (req.userRole === 'admin') {
            return next();
          }
          break;

        case 'course':
          if (req.userRole === 'teacher' && req.user.teacher) {
            // Un enseignant peut accéder à ses propres cours
            if (req.params.id) {
              const course = await req.app.locals.models.Course.findByPk(req.params.id);
              if (course && course.teacher_id === req.user.teacher.id) {
                return next();
              }
            }
          }
          // Les étudiants peuvent voir les cours
          if (req.userRole === 'student' && req.method === 'GET') {
            return next();
          }
          // Les admins ont accès à tous les cours
          if (req.userRole === 'admin') {
            return next();
          }
          break;

        case 'grade':
          if (req.userRole === 'student' && req.user.student) {
            // Un étudiant peut voir ses propres notes
            if (req.params.id && parseInt(req.params.id) === req.user.student.id) {
              return next();
            }
          }
          if (req.userRole === 'teacher' && req.user.teacher) {
            // Un enseignant peut gérer les notes de ses cours
            return next();
          }
          if (req.userRole === 'admin') {
            return next();
          }
          break;

        default:
          // Pour les autres types de ressources, vérifier les permissions générales
          if (['teacher', 'admin'].includes(req.userRole)) {
            return next();
          }
      }

      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource'
      });

    } catch (error) {
      console.error('Erreur de vérification des permissions:', error);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de vérifier vos permissions'
      });
    }
  };
};

// Middleware de vérification de la propriété de la ressource
const isResourceOwner = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentification requise',
          message: 'Vous devez être connecté pour accéder à cette ressource'
        });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          error: 'ID manquant',
          message: 'L\'ID de la ressource est requis'
        });
      }

      let isOwner = false;

      switch (resourceType) {
        case 'student':
          if (req.userRole === 'student' && req.user.student) {
            isOwner = req.user.student.id === parseInt(resourceId);
          }
          break;

        case 'teacher':
          if (req.userRole === 'teacher' && req.user.teacher) {
            isOwner = req.user.teacher.id === parseInt(resourceId);
          }
          break;

        case 'course':
          if (req.userRole === 'teacher' && req.user.teacher) {
            const course = await req.app.locals.models.Course.findByPk(resourceId);
            isOwner = course && course.teacher_id === req.user.teacher.id;
          }
          break;
      }

      // Les admins peuvent accéder à toutes les ressources
      if (req.userRole === 'admin') {
        isOwner = true;
      }

      if (!isOwner) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous ne pouvez accéder qu\'à vos propres ressources'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification de propriété:', error);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de vérifier la propriété de la ressource'
      });
    }
  };
};

module.exports = {
  isStudent,
  isTeacher,
  isAdmin,
  isSuperAdmin,
  canAccessResource,
  isResourceOwner
};