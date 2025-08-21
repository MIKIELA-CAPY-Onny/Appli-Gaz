const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Référence vers le modèle User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Informations académiques
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    enum: ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3']
  },
  field: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  
  // Informations de scolarité
  enrollmentYear: {
    type: Number,
    required: true,
    min: [2000, 'L\'année d\'inscription doit être supérieure à 2000'],
    max: [new Date().getFullYear() + 1, 'L\'année d\'inscription ne peut pas être dans le futur']
  },
  currentSemester: {
    type: Number,
    required: true,
    min: [1, 'Le semestre doit être au moins 1'],
    max: [10, 'Le semestre ne peut pas dépasser 10']
  },
  
  // Statut académique
  academicStatus: {
    type: String,
    enum: ['actif', 'inactif', 'suspendu', 'diplômé', 'abandon'],
    default: 'actif'
  },
  gpa: {
    type: Number,
    min: [0, 'La moyenne ne peut pas être négative'],
    max: [20, 'La moyenne ne peut pas dépasser 20'],
    default: 0
  },
  creditsEarned: {
    type: Number,
    min: [0, 'Les crédits ne peuvent pas être négatifs'],
    default: 0
  },
  totalCredits: {
    type: Number,
    min: [0, 'Les crédits totaux ne peuvent pas être négatifs'],
    required: true
  },
  
  // Informations de contact d'urgence
  emergencyContact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
    }
  },
  
  // Informations financières
  tuitionStatus: {
    type: String,
    enum: ['à jour', 'en retard', 'exonéré'],
    default: 'à jour'
  },
  scholarship: {
    type: String,
    trim: true
  },
  
  // Informations de stage/alternance
  internship: {
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    supervisor: String,
    status: {
      type: String,
      enum: ['en cours', 'terminé', 'annulé'],
      default: 'en cours'
    }
  },
  
  // Documents
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['carte_etudiant', 'certificat_scolarite', 'releve_notes', 'attestation_stage', 'autre']
    },
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    isValid: {
      type: Boolean,
      default: true
    }
  }],
  
  // Notes et évaluations
  academicHistory: [{
    semester: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    gpa: {
      type: Number,
      min: 0,
      max: 20
    },
    creditsEarned: {
      type: Number,
      min: 0
    },
    courses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      grade: {
        type: Number,
        min: 0,
        max: 20
      },
      credits: {
        type: Number,
        min: 0
      }
    }]
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
studentSchema.index({ studentId: 1 });
studentSchema.index({ level: 1 });
studentSchema.index({ field: 1 });
studentSchema.index({ academicStatus: 1 });
studentSchema.index({ 'user.email': 1 });

// Virtual pour le pourcentage de progression
studentSchema.virtual('progressPercentage').get(function() {
  if (this.totalCredits === 0) return 0;
  return Math.round((this.creditsEarned / this.totalCredits) * 100);
});

// Virtual pour le statut de progression
studentSchema.virtual('progressStatus').get(function() {
  const percentage = this.progressPercentage;
  if (percentage >= 100) return 'diplômé';
  if (percentage >= 75) return 'avancé';
  if (percentage >= 50) return 'intermédiaire';
  if (percentage >= 25) return 'débutant';
  return 'nouveau';
});

// Middleware pre-save pour générer un ID étudiant si non fourni
studentSchema.pre('save', function(next) {
  if (!this.studentId) {
    const year = this.enrollmentYear || new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.studentId = `STU${year}${random}`;
  }
  next();
});

// Méthode pour calculer la moyenne générale
studentSchema.methods.calculateGPA = function() {
  if (!this.academicHistory || this.academicHistory.length === 0) {
    return 0;
  }
  
  let totalGradePoints = 0;
  let totalCredits = 0;
  
  this.academicHistory.forEach(semester => {
    semester.courses.forEach(course => {
      if (course.grade && course.credits) {
        totalGradePoints += course.grade * course.credits;
        totalCredits += course.credits;
      }
    });
  });
  
  return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
};

// Méthode pour ajouter un cours à l'historique
studentSchema.methods.addCourseToHistory = function(semester, year, courseId, grade, credits) {
  let semesterHistory = this.academicHistory.find(h => h.semester === semester && h.year === year);
  
  if (!semesterHistory) {
    semesterHistory = {
      semester,
      year,
      gpa: 0,
      creditsEarned: 0,
      courses: []
    };
    this.academicHistory.push(semesterHistory);
  }
  
  semesterHistory.courses.push({
    course: courseId,
    grade,
    credits
  });
  
  // Recalculer le GPA du semestre
  const totalGradePoints = semesterHistory.courses.reduce((sum, c) => sum + (c.grade * c.credits), 0);
  const totalCredits = semesterHistory.courses.reduce((sum, c) => sum + c.credits, 0);
  semesterHistory.gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  semesterHistory.creditsEarned = totalCredits;
  
  return this.save();
};

module.exports = mongoose.model('Student', studentSchema);