const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  // Référence vers le modèle User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Informations professionnelles
  adminId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  employeeNumber: {
    type: String,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    enum: ['directeur', 'directeur_adjoint', 'chef_service', 'responsable', 'assistant', 'autre']
  },
  
  // Informations de carrière
  hireDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'La date d\'embauche ne peut pas être dans le futur'
    }
  },
  contractType: {
    type: String,
    required: true,
    enum: ['CDI', 'CDD', 'stagiaire', 'autre']
  },
  isFullTime: {
    type: Boolean,
    default: true
  },
  
  // Permissions et rôles
  permissions: {
    userManagement: {
      type: Boolean,
      default: false
    },
    studentManagement: {
      type: Boolean,
      default: false
    },
    teacherManagement: {
      type: Boolean,
      default: false
    },
    courseManagement: {
      type: Boolean,
      default: false
    },
    gradeManagement: {
      type: Boolean,
      default: false
    },
    financialManagement: {
      type: Boolean,
      default: false
    },
    reportGeneration: {
      type: Boolean,
      default: false
    },
    systemConfiguration: {
      type: Boolean,
      default: false
    }
  },
  
  // Rôles spécifiques
  roles: [{
    type: String,
    enum: [
      'super_admin',
      'academic_admin',
      'financial_admin',
      'student_affairs_admin',
      'faculty_admin',
      'system_admin'
    ]
  }],
  
  // Informations de contact professionnel
  officeLocation: {
    building: String,
    room: String,
    floor: String
  },
  officeHours: [{
    day: {
      type: String,
      enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    },
    startTime: String,
    endTime: String
  }],
  
  // Responsabilités
  responsibilities: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    department: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Accès aux systèmes
  systemAccess: [{
    system: {
      type: String,
      required: true,
      trim: true
    },
    accessLevel: {
      type: String,
      enum: ['lecture', 'écriture', 'administration', 'plein_accès']
    },
    grantedDate: {
      type: Date,
      default: Date.now
    },
    expiresDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Journal d'activité
  activityLog: [{
    action: {
      type: String,
      required: true,
      trim: true
    },
    target: {
      type: String,
      trim: true
    },
    details: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  
  // Notifications et alertes
  notifications: [{
    type: {
      type: String,
      enum: ['info', 'warning', 'error', 'success']
    },
    title: {
      type: String,
      required: true
    },
    message: String,
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  
  // Statut et disponibilité
  isActive: {
    type: Boolean,
    default: true
  },
  isOnDuty: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
adminSchema.index({ adminId: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ position: 1 });
adminSchema.index({ 'user.email': 1 });
adminSchema.index({ 'permissions.userManagement': 1 });

// Virtual pour l'ancienneté
adminSchema.virtual('seniority').get(function() {
  if (!this.hireDate) return 0;
  const today = new Date();
  const hireDate = new Date(this.hireDate);
  const diffTime = Math.abs(today - hireDate);
  const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
});

// Virtual pour le niveau d'accès
adminSchema.virtual('accessLevel').get(function() {
  if (this.roles.includes('super_admin')) return 'super_admin';
  if (this.roles.includes('system_admin')) return 'system_admin';
  if (this.permissions.systemConfiguration) return 'high';
  if (this.permissions.userManagement) return 'medium';
  return 'low';
});

// Middleware pre-save pour générer un ID admin si non fourni
adminSchema.pre('save', function(next) {
  if (!this.adminId) {
    const year = this.hireDate ? this.hireDate.getFullYear() : new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.adminId = `ADM${year}${random}`;
  }
  next();
});

// Méthode pour vérifier les permissions
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Méthode pour vérifier les rôles
adminSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Méthode pour ajouter une activité au journal
adminSchema.methods.logActivity = function(action, target, details, ipAddress, userAgent) {
  const logEntry = {
    action,
    target,
    details,
    ipAddress,
    userAgent
  };
  
  this.activityLog.push(logEntry);
  
  // Limiter la taille du journal (garder les 1000 dernières entrées)
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Méthode pour ajouter une notification
adminSchema.methods.addNotification = function(type, title, message, expiresAt = null) {
  const notification = {
    type,
    title,
    message,
    expiresAt
  };
  
  this.notifications.push(notification);
  return this.save();
};

// Méthode pour marquer une notification comme lue
adminSchema.methods.markNotificationAsRead = function(notificationId) {
  const notification = this.notifications.id(notificationId);
  if (notification) {
    notification.isRead = true;
    return this.save();
  }
  return false;
};

// Méthode pour nettoyer les notifications expirées
adminSchema.methods.cleanExpiredNotifications = function() {
  const now = new Date();
  this.notifications = this.notifications.filter(notification => {
    return !notification.expiresAt || notification.expiresAt > now;
  });
  return this.save();
};

module.exports = mongoose.model('Admin', adminSchema);