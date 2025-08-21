const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema({
  // Références
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  
  // Informations de la session
  sessionDate: {
    type: Date,
    required: true
  },
  sessionType: {
    type: String,
    required: true,
    enum: ['cours', 'td', 'tp', 'examen', 'autre']
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)']
  },
  
  // Statut de présence
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late', 'excused', 'partial']
  },
  
  // Informations académiques
  academicYear: {
    type: Number,
    required: true,
    min: [2000, 'L\'année académique doit être supérieure à 2000']
  },
  semester: {
    type: Number,
    required: true,
    min: [1, 'Le semestre doit être au moins 1'],
    max: [10, 'Le semestre ne peut pas dépasser 10']
  },
  week: {
    type: Number,
    min: [1, 'La semaine doit être au moins 1'],
    max: [52, 'La semaine ne peut pas dépasser 52']
  },
  
  // Détails de l'absence
  absenceType: {
    type: String,
    enum: ['non_justifiée', 'justifiée', 'médicale', 'familiale', 'professionnelle', 'autre']
  },
  justification: {
    type: String,
    trim: true,
    maxlength: [500, 'La justification ne peut pas dépasser 500 caractères']
  },
  supportingDocuments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['certificat_médical', 'justificatif_familial', 'attestation_professionnelle', 'autre']
    },
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Justification et validation
  isJustified: {
    type: Boolean,
    default: false
  },
  justificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  reviewDate: Date,
  reviewComments: String,
  
  // Retard
  lateMinutes: {
    type: Number,
    min: 0,
    default: 0
  },
  lateReason: {
    type: String,
    trim: true
  },
  
  // Présence partielle
  partialAttendance: {
    isPartial: {
      type: Boolean,
      default: false
    },
    arrivedAt: String,
    leftAt: String,
    duration: {
      type: Number,
      min: 0
    },
    reason: String
  },
  
  // Impact académique
  academicImpact: {
    missedTopics: [String],
    missedAssignments: [String],
    catchUpRequired: {
      type: Boolean,
      default: false
    },
    catchUpPlan: String,
    catchUpDeadline: Date
  },
  
  // Communication
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'app', 'letter']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipient: {
      type: String,
      enum: ['student', 'parent', 'guardian', 'admin']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed']
    },
    content: String
  }],
  
  // Suivi et actions
  followUp: {
    isRequired: {
      type: Boolean,
      default: false
    },
    followUpType: {
      type: String,
      enum: ['meeting', 'call', 'email', 'letter', 'other']
    },
    followUpDate: Date,
    followUpNotes: String,
    followUpCompleted: {
      type: Boolean,
      default: false
    }
  },
  
  // Sanctions et mesures
  sanctions: [{
    type: {
      type: String,
      enum: ['avertissement', 'retenue', 'exclusion_temporaire', 'exclusion_définitive', 'autre']
    },
    description: String,
    duration: String,
    imposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    imposedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Historique des modifications
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'justified', 'reviewed', 'sanctioned']
    },
    previousStatus: String,
    newStatus: String,
    reason: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
absenceSchema.index({ student: 1, course: 1, sessionDate: 1 });
absenceSchema.index({ student: 1, academicYear: 1, semester: 1 });
absenceSchema.index({ course: 1, sessionDate: 1 });
absenceSchema.index({ teacher: 1, sessionDate: 1 });
absenceSchema.index({ status: 1, isJustified: 1 });
absenceSchema.index({ sessionDate: 1 });

// Virtual pour la durée de la session
absenceSchema.virtual('sessionDuration').get(function() {
  if (!this.startTime || !this.endTime) return 0;
  
  const start = new Date(`2000-01-01T${this.startTime}:00`);
  const end = new Date(`2000-01-01T${this.endTime}:00`);
  const diffMs = end - start;
  
  return Math.round(diffMs / (1000 * 60)); // Durée en minutes
});

// Virtual pour le statut de la session
absenceSchema.virtual('sessionStatus').get(function() {
  const now = new Date();
  const sessionDate = new Date(this.sessionDate);
  
  if (sessionDate > now) return 'à_venir';
  if (sessionDate < now) return 'passée';
  return 'en_cours';
});

// Virtual pour le pourcentage de présence
absenceSchema.virtual('attendancePercentage').get(function() {
  if (this.status === 'present') return 100;
  if (this.status === 'late') return 75;
  if (this.status === 'partial') return 50;
  if (this.status === 'excused') return 0;
  if (this.status === 'absent') return 0;
  return 0;
});

// Virtual pour le niveau de gravité
absenceSchema.virtual('severityLevel').get(function() {
  if (this.status === 'present') return 'aucune';
  if (this.status === 'late') return 'faible';
  if (this.status === 'partial') return 'modérée';
  if (this.status === 'excused') return 'justifiée';
  if (this.status === 'absent') return 'élevée';
  return 'inconnue';
});

// Middleware pre-save pour la validation
absenceSchema.pre('save', function(next) {
  // Vérifier que les horaires sont cohérents
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}:00`);
    const end = new Date(`2000-01-01T${this.endTime}:00`);
    
    if (start >= end) {
      return next(new Error('L\'heure de fin doit être après l\'heure de début'));
    }
  }
  
  // Calculer la durée de présence partielle
  if (this.partialAttendance && this.partialAttendance.isPartial) {
    if (this.partialAttendance.arrivedAt && this.partialAttendance.leftAt) {
      const arrived = new Date(`2000-01-01T${this.partialAttendance.arrivedAt}:00`);
      const left = new Date(`2000-01-01T${this.partialAttendance.leftAt}:00`);
      const diffMs = left - arrived;
      this.partialAttendance.duration = Math.round(diffMs / (1000 * 60));
    }
  }
  
  // Ajouter à l'historique si c'est une modification
  if (this.isModified('status') && !this.isNew) {
    const historyEntry = {
      action: 'updated',
      previousStatus: this._original.status,
      newStatus: this.status,
      reason: 'Modification du statut de présence',
      modifiedBy: this.lastModifiedBy
    };
    this.history.push(historyEntry);
  }
  
  next();
});

// Méthode pour justifier une absence
absenceSchema.methods.justify = function(justification, documents = []) {
  this.justification = justification;
  this.isJustified = true;
  this.justificationStatus = 'pending';
  
  if (documents && documents.length > 0) {
    this.supportingDocuments = documents;
  }
  
  const historyEntry = {
    action: 'justified',
    reason: justification
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour approuver une justification
absenceSchema.methods.approveJustification = function(reviewedBy, comments = '') {
  this.justificationStatus = 'approved';
  this.reviewedBy = reviewedBy;
  this.reviewDate = new Date();
  this.reviewComments = comments;
  
  const historyEntry = {
    action: 'reviewed',
    reason: `Justification approuvée: ${comments}`
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour rejeter une justification
absenceSchema.methods.rejectJustification = function(reviewedBy, comments = '') {
  this.justificationStatus = 'rejected';
  this.reviewedBy = reviewedBy;
  this.reviewDate = new Date();
  this.reviewComments = comments;
  this.isJustified = false;
  
  const historyEntry = {
    action: 'reviewed',
    reason: `Justification rejetée: ${comments}`
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour ajouter une sanction
absenceSchema.methods.addSanction = function(type, description, duration, imposedBy) {
  const sanction = {
    type,
    description,
    duration,
    imposedBy
  };
  
  this.sanctions.push(sanction);
  
  const historyEntry = {
    action: 'sanctioned',
    reason: `Sanction ajoutée: ${type} - ${description}`
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour envoyer une notification
absenceSchema.methods.sendNotification = function(type, recipient, content) {
  const notification = {
    type,
    recipient,
    content
  };
  
  this.notifications.push(notification);
  return this.save();
};

// Méthode pour planifier un suivi
absenceSchema.methods.scheduleFollowUp = function(type, date, notes = '') {
  this.followUp.isRequired = true;
  this.followUp.followUpType = type;
  this.followUp.followUpDate = date;
  this.followUp.followUpNotes = notes;
  
  return this.save();
};

// Méthode pour compléter un suivi
absenceSchema.methods.completeFollowUp = function() {
  this.followUp.followUpCompleted = true;
  return this.save();
};

module.exports = mongoose.model('Absence', absenceSchema);