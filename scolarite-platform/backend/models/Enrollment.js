const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  // Étudiant et cours
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
  
  // Informations d'inscription
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
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
  
  // Statut de l'inscription
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'withdrawn', 'failed', 'suspended'],
    default: 'pending'
  },
  
  // Type d'inscription
  enrollmentType: {
    type: String,
    enum: ['regular', 'audit', 'credit_transfer', 'makeup', 'other'],
    default: 'regular'
  },
  
  // Informations académiques
  grade: {
    type: Number,
    min: [0, 'La note ne peut pas être négative'],
    max: [20, 'La note ne peut pas dépasser 20']
  },
  credits: {
    type: Number,
    min: [0, 'Les crédits ne peuvent pas être négatifs'],
    required: true
  },
  
  // Évaluations détaillées
  evaluations: [{
    type: {
      type: String,
      enum: ['examen_final', 'examen_partiel', 'tp', 'projet', 'participation', 'autre'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    grade: {
      type: Number,
      min: 0,
      max: 20
    },
    weight: {
      type: Number,
      min: 0,
      max: 100
    },
    date: {
      type: Date,
      default: Date.now
    },
    comments: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }
  }],
  
  // Présence et participation
  attendance: {
    totalSessions: {
      type: Number,
      min: 0,
      default: 0
    },
    attendedSessions: {
      type: Number,
      min: 0,
      default: 0
    },
    attendanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Progression
  progress: {
    completedTopics: [{
      type: String,
      trim: true
    }],
    currentWeek: {
      type: Number,
      min: 1,
      default: 1
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Documents et ressources
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['devoir', 'projet', 'rapport', 'autre']
    },
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    grade: {
      type: Number,
      min: 0,
      max: 20
    },
    feedback: String,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }
  }],
  
  // Communication et feedback
  feedback: [{
    from: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Informations financières
  financial: {
    tuitionPaid: {
      type: Boolean,
      default: false
    },
    paymentDate: Date,
    amount: {
      type: Number,
      min: 0
    },
    paymentMethod: String,
    scholarship: {
      type: String,
      trim: true
    },
    discount: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Dates importantes
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: 'La date de fin doit être après la date de début'
    }
  },
  withdrawalDeadline: Date,
  
  // Raisons et commentaires
  withdrawalReason: {
    type: String,
    trim: true
  },
  adminComments: {
    type: String,
    trim: true
  },
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, academicYear: 1, semester: 1 });
enrollmentSchema.index({ course: 1, academicYear: 1, semester: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrollmentDate: 1 });

// Virtual pour le statut de réussite
enrollmentSchema.virtual('isPassed').get(function() {
  if (!this.grade) return false;
  return this.grade >= 10; // Note de passage par défaut
});

// Virtual pour le pourcentage de progression
enrollmentSchema.virtual('progressPercentage').get(function() {
  if (!this.progress || !this.progress.completedTopics) return 0;
  // À adapter selon la logique métier
  return Math.min(100, (this.progress.currentWeek / 16) * 100); // 16 semaines par semestre
});

// Virtual pour la note finale calculée
enrollmentSchema.virtual('calculatedGrade').get(function() {
  if (!this.evaluations || this.evaluations.length === 0) {
    return this.grade || 0;
  }
  
  let totalWeightedGrade = 0;
  let totalWeight = 0;
  
  this.evaluations.forEach(eval => {
    if (eval.grade && eval.weight) {
      totalWeightedGrade += eval.grade * eval.weight;
      totalWeight += eval.weight;
    }
  });
  
  return totalWeight > 0 ? totalWeightedGrade / totalWeight : 0;
});

// Middleware pre-save pour calculer les statistiques
enrollmentSchema.pre('save', function(next) {
  // Calculer le taux de présence
  if (this.attendance && this.attendance.totalSessions > 0) {
    this.attendance.attendanceRate = Math.round(
      (this.attendance.attendedSessions / this.attendance.totalSessions) * 100
    );
  }
  
  // Mettre à jour la note si elle a changé
  if (this.isModified('evaluations')) {
    this.grade = this.calculatedGrade;
  }
  
  next();
});

// Méthode pour ajouter une évaluation
enrollmentSchema.methods.addEvaluation = function(type, title, grade, weight, comments = '', gradedBy = null) {
  const evaluation = {
    type,
    title,
    grade,
    weight,
    comments,
    gradedBy
  };
  
  this.evaluations.push(evaluation);
  
  // Recalculer la note finale
  this.grade = this.calculatedGrade;
  
  return this.save();
};

// Méthode pour mettre à jour la présence
enrollmentSchema.methods.updateAttendance = function(attended, total) {
  this.attendance.attendedSessions = attended;
  this.attendance.totalSessions = total;
  
  if (total > 0) {
    this.attendance.attendanceRate = Math.round((attended / total) * 100);
  }
  
  return this.save();
};

// Méthode pour ajouter un document
enrollmentSchema.methods.addDocument = function(name, type, url, submittedBy = null) {
  const document = {
    name,
    type,
    url,
    submittedBy
  };
  
  this.documents.push(document);
  return this.save();
};

// Méthode pour ajouter un feedback
enrollmentSchema.methods.addFeedback = function(from, message) {
  const feedback = {
    from,
    message
  };
  
  this.feedback.push(feedback);
  return this.save();
};

// Méthode pour retirer l'inscription
enrollmentSchema.methods.withdraw = function(reason, adminComments = '') {
  this.status = 'withdrawn';
  this.withdrawalReason = reason;
  this.adminComments = adminComments;
  this.endDate = new Date();
  
  return this.save();
};

// Méthode pour compléter l'inscription
enrollmentSchema.methods.complete = function() {
  this.status = 'completed';
  this.endDate = new Date();
  
  return this.save();
};

// Méthode pour suspendre l'inscription
enrollmentSchema.methods.suspend = function(reason, adminComments = '') {
  this.status = 'suspended';
  this.adminComments = adminComments;
  
  return this.save();
};

// Méthode pour réactiver l'inscription
enrollmentSchema.methods.reactivate = function() {
  if (this.status === 'suspended') {
    this.status = 'active';
    this.adminComments = '';
    return this.save();
  }
  throw new Error('Seules les inscriptions suspendues peuvent être réactivées');
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);