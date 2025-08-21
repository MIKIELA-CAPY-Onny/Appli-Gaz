const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  // Référence vers le modèle User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Informations professionnelles
  teacherId: {
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
    enum: ['professeur', 'maître_de_conférences', 'chargé_de_cours', 'assistant', 'chercheur', 'autre']
  },
  academicRank: {
    type: String,
    enum: ['doctorant', 'docteur', 'maître_de_conférences', 'professeur', 'professeur_émérite']
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
    enum: ['CDI', 'CDD', 'vacataire', 'stagiaire', 'autre']
  },
  isFullTime: {
    type: Boolean,
    default: true
  },
  
  // Spécialisations et domaines d'expertise
  specializations: [{
    type: String,
    trim: true
  }],
  researchAreas: [{
    type: String,
    trim: true
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
  
  // Informations académiques
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    field: {
      type: String,
      trim: true
    }
  }],
  
  // Publications et recherches
  publications: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['article', 'livre', 'chapitre', 'conférence', 'thèse', 'autre']
    },
    year: Number,
    journal: String,
    doi: String,
    url: String
  }],
  
  // Responsabilités administratives
  administrativeRoles: [{
    role: {
      type: String,
      required: true,
      trim: true
    },
    department: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Évaluations et feedback
  evaluations: [{
    semester: Number,
    year: Number,
    averageRating: {
      type: Number,
      min: 0,
      max: 5
    },
    totalResponses: Number,
    comments: [String]
  }],
  
  // Disponibilité et charge de travail
  workload: {
    teachingHours: {
      type: Number,
      min: 0,
      default: 0
    },
    researchHours: {
      type: Number,
      min: 0,
      default: 0
    },
    administrativeHours: {
      type: Number,
      min: 0,
      default: 0
    },
    totalHours: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Statut et permissions
  isActive: {
    type: Boolean,
    default: true
  },
  canTeach: {
    type: Boolean,
    default: true
  },
  canGrade: {
    type: Boolean,
    default: true
  },
  canCreateCourses: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ position: 1 });
teacherSchema.index({ 'user.email': 1 });

// Virtual pour l'ancienneté
teacherSchema.virtual('seniority').get(function() {
  if (!this.hireDate) return 0;
  const today = new Date();
  const hireDate = new Date(this.hireDate);
  const diffTime = Math.abs(today - hireDate);
  const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
});

// Virtual pour le statut de carrière
teacherSchema.virtual('careerStatus').get(function() {
  const seniority = this.seniority;
  if (seniority >= 20) return 'expérimenté';
  if (seniority >= 10) return 'confirmé';
  if (seniority >= 5) return 'intermédiaire';
  if (seniority >= 2) return 'jeune';
  return 'nouveau';
});

// Middleware pre-save pour générer un ID enseignant si non fourni
teacherSchema.pre('save', function(next) {
  if (!this.teacherId) {
    const year = this.hireDate ? this.hireDate.getFullYear() : new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.teacherId = `TCH${year}${random}`;
  }
  
  // Calculer la charge de travail totale
  if (this.workload) {
    this.workload.totalHours = 
      (this.workload.teachingHours || 0) + 
      (this.workload.researchHours || 0) + 
      (this.workload.administrativeHours || 0);
  }
  
  next();
});

// Méthode pour calculer la note moyenne des évaluations
teacherSchema.methods.calculateAverageRating = function() {
  if (!this.evaluations || this.evaluations.length === 0) {
    return 0;
  }
  
  let totalRating = 0;
  let totalResponses = 0;
  
  this.evaluations.forEach(eval => {
    if (eval.averageRating && eval.totalResponses) {
      totalRating += eval.averageRating * eval.totalResponses;
      totalResponses += eval.totalResponses;
    }
  });
  
  return totalResponses > 0 ? totalRating / totalResponses : 0;
};

// Méthode pour ajouter une évaluation
teacherSchema.methods.addEvaluation = function(semester, year, rating, responses, comments = []) {
  const evaluation = {
    semester,
    year,
    averageRating: rating,
    totalResponses: responses,
    comments
  };
  
  this.evaluations.push(evaluation);
  return this.save();
};

// Méthode pour vérifier la disponibilité
teacherSchema.methods.isAvailable = function(day, time) {
  if (!this.officeHours || this.officeHours.length === 0) {
    return false;
  }
  
  const officeHour = this.officeHours.find(oh => oh.day === day);
  if (!officeHour) return false;
  
  // Logique simple de vérification d'horaires
  // À adapter selon vos besoins
  return true;
};

module.exports = mongoose.model('Teacher', teacherSchema);