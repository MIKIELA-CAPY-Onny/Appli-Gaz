const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment'
  },
  
  // Informations de l'évaluation
  evaluationType: {
    type: String,
    required: true,
    enum: ['examen_final', 'examen_partiel', 'tp', 'projet', 'participation', 'devoir', 'oral', 'autre']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  
  // Note et évaluation
  grade: {
    type: Number,
    required: true,
    min: [0, 'La note ne peut pas être négative'],
    max: [20, 'La note ne peut pas dépasser 20']
  },
  maxGrade: {
    type: Number,
    default: 20,
    min: [1, 'La note maximale doit être au moins 1']
  },
  weight: {
    type: Number,
    required: true,
    min: [0, 'Le poids ne peut pas être négatif'],
    max: [100, 'Le poids ne peut pas dépasser 100%']
  },
  
  // Informations temporelles
  evaluationDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date
  },
  gradedDate: {
    type: Date,
    default: Date.now
  },
  
  // Académique
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
  
  // Évaluateur
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  
  // Statut et validation
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'disputed'],
    default: 'draft'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isFinal: {
    type: Boolean,
    default: false
  },
  
  // Commentaires et feedback
  comments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Les commentaires ne peuvent pas dépasser 1000 caractères']
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    general: String
  },
  
  // Critères d'évaluation
  criteria: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    maxScore: {
      type: Number,
      min: 0,
      required: true
    },
    score: {
      type: Number,
      min: 0
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    }
  }],
  
  // Modération et révision
  moderation: {
    isModerated: {
      type: Boolean,
      default: false
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    moderationDate: Date,
    moderationComments: String,
    originalGrade: Number,
    moderatedGrade: Number
  },
  
  // Contestation
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    disputeDate: Date,
    disputeReason: String,
    disputeStatus: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'rejected'],
      default: 'pending'
    },
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    resolutionDate: Date
  },
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Historique des modifications
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'published', 'archived', 'moderated', 'disputed']
    },
    previousGrade: Number,
    newGrade: Number,
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
gradeSchema.index({ student: 1, course: 1, evaluationType: 1 });
gradeSchema.index({ student: 1, academicYear: 1, semester: 1 });
gradeSchema.index({ course: 1, academicYear: 1, semester: 1 });
gradeSchema.index({ gradedBy: 1 });
gradeSchema.index({ status: 1, isVisible: 1 });
gradeSchema.index({ evaluationDate: 1 });

// Virtual pour le pourcentage de réussite
gradeSchema.virtual('percentage').get(function() {
  if (this.maxGrade === 0) return 0;
  return Math.round((this.grade / this.maxGrade) * 100);
});

// Virtual pour le statut de réussite
gradeSchema.virtual('isPassed').get(function() {
  const passingGrade = this.maxGrade * 0.5; // 50% par défaut
  return this.grade >= passingGrade;
});

// Virtual pour la note sur 20 (normalisée)
gradeSchema.virtual('normalizedGrade').get(function() {
  if (this.maxGrade === 20) return this.grade;
  return Math.round((this.grade / this.maxGrade) * 20 * 100) / 100;
});

// Virtual pour le statut de la note
gradeSchema.virtual('gradeStatus').get(function() {
  if (this.status === 'draft') return 'brouillon';
  if (this.status === 'published') return 'publiée';
  if (this.status === 'archived') return 'archivée';
  if (this.status === 'disputed') return 'contestée';
  return 'inconnu';
});

// Middleware pre-save pour la validation
gradeSchema.pre('save', function(next) {
  // Vérifier que la note ne dépasse pas le maximum
  if (this.grade > this.maxGrade) {
    return next(new Error('La note ne peut pas dépasser la note maximale'));
  }
  
  // Vérifier que le total des poids des critères est cohérent
  if (this.criteria && this.criteria.length > 0) {
    const totalWeight = this.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 100) > 5) {
      console.warn(`Attention: Le total des poids des critères est ${totalWeight}% (devrait être proche de 100%)`);
    }
  }
  
  // Ajouter à l'historique si c'est une modification
  if (this.isModified('grade') && !this.isNew) {
    const historyEntry = {
      action: 'updated',
      previousGrade: this._original.grade,
      newGrade: this.grade,
      reason: 'Modification de la note',
      modifiedBy: this.lastModifiedBy
    };
    this.history.push(historyEntry);
  }
  
  next();
});

// Méthode pour publier la note
gradeSchema.methods.publish = function() {
  this.status = 'published';
  this.isVisible = true;
  
  const historyEntry = {
    action: 'published',
    modifiedBy: this.lastModifiedBy
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour archiver la note
gradeSchema.methods.archive = function() {
  this.status = 'archived';
  this.isVisible = false;
  
  const historyEntry = {
    action: 'archived',
    modifiedBy: this.lastModifiedBy
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour contester la note
gradeSchema.methods.dispute = function(reason) {
  this.dispute.isDisputed = true;
  this.dispute.disputeDate = new Date();
  this.dispute.disputeReason = reason;
  this.dispute.disputeStatus = 'pending';
  this.status = 'disputed';
  
  const historyEntry = {
    action: 'disputed',
    reason: reason
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour résoudre une contestation
gradeSchema.methods.resolveDispute = function(resolution, resolvedBy) {
  this.dispute.disputeStatus = 'resolved';
  this.dispute.resolution = resolution;
  this.dispute.resolvedBy = resolvedBy;
  this.dispute.resolutionDate = new Date();
  this.status = 'published';
  
  const historyEntry = {
    action: 'disputed',
    reason: `Contestation résolue: ${resolution}`
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour modérer la note
gradeSchema.methods.moderate = function(moderatedGrade, moderatedBy, comments) {
  this.moderation.isModerated = true;
  this.moderation.moderatedBy = moderatedBy;
  this.moderation.moderationDate = new Date();
  this.moderation.moderationComments = comments;
  this.moderation.originalGrade = this.grade;
  this.moderation.moderatedGrade = moderatedGrade;
  
  this.grade = moderatedGrade;
  
  const historyEntry = {
    action: 'moderated',
    previousGrade: this.moderation.originalGrade,
    newGrade: this.moderation.moderatedGrade,
    reason: `Modération: ${comments}`
  };
  this.history.push(historyEntry);
  
  return this.save();
};

// Méthode pour calculer la note basée sur les critères
gradeSchema.methods.calculateGradeFromCriteria = function() {
  if (!this.criteria || this.criteria.length === 0) {
    return this.grade;
  }
  
  let totalScore = 0;
  let totalMaxScore = 0;
  
  this.criteria.forEach(criterion => {
    if (criterion.score !== undefined && criterion.score !== null) {
      totalScore += criterion.score * (criterion.weight / 100);
      totalMaxScore += criterion.maxScore * (criterion.weight / 100);
    }
  });
  
  if (totalMaxScore === 0) return 0;
  
  return Math.round((totalScore / totalMaxScore) * this.maxGrade * 100) / 100;
};

module.exports = mongoose.model('Grade', gradeSchema);