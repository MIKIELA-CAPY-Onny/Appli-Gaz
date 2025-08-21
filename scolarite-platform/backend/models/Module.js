const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  // Informations de base
  moduleCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  
  // Informations académiques
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
  
  // Organisation
  semester: {
    type: Number,
    required: true,
    min: [1, 'Le semestre doit être au moins 1'],
    max: [10, 'Le semestre ne peut pas dépasser 10']
  },
  academicYear: {
    type: Number,
    required: true,
    min: [2000, 'L\'année académique doit être supérieure à 2000']
  },
  
  // Structure du module
  courses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    credits: {
      type: Number,
      min: 0,
      required: true
    },
    order: {
      type: Number,
      min: 1,
      default: 1
    }
  }],
  
  // Prérequis et co-requis
  prerequisites: [{
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    type: {
      type: String,
      enum: ['module', 'course'],
      required: true
    },
    description: String
  }],
  
  coRequisites: [{
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    type: {
      type: String,
      enum: ['module', 'course'],
      required: true
    },
    description: String
  }],
  
  // Objectifs et compétences
  objectives: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  competencies: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    level: {
      type: String,
      enum: ['débutant', 'intermédiaire', 'avancé', 'expert']
    }
  }],
  
  // Évaluation du module
  evaluation: {
    type: {
      type: String,
      enum: ['continue', 'finale', 'mixte'],
      default: 'mixte'
    },
    methods: [{
      type: String,
      enum: ['examen', 'tp', 'projet', 'présentation', 'participation', 'autre']
    }],
    weightDistribution: {
      continuous: {
        type: Number,
        min: 0,
        max: 100,
        default: 40
      },
      final: {
        type: Number,
        min: 0,
        max: 100,
        default: 60
      }
    },
    passingGrade: {
      type: Number,
      min: 0,
      max: 20,
      default: 10
    }
  },
  
  // Ressources et matériels
  resources: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'lien', 'video', 'audio', 'logiciel', 'autre']
    },
    url: String,
    description: String,
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  
  // Planning et organisation
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
  
  // Responsables
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  teachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    role: {
      type: String,
      enum: ['coordinateur', 'enseignant', 'assistant', 'intervenant'],
      default: 'enseignant'
    },
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }]
  }],
  
  // Statut et visibilité
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  
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
  
  // Statistiques
  totalCredits: {
    type: Number,
    min: 0,
    default: 0
  },
  totalStudents: {
    type: Number,
    min: 0,
    default: 0
  },
  averageGrade: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  passRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
moduleSchema.index({ moduleCode: 1 });
moduleSchema.index({ level: 1, field: 1 });
moduleSchema.index({ semester: 1, academicYear: 1 });
moduleSchema.index({ status: 1, isVisible: 1 });
moduleSchema.index({ coordinator: 1 });

// Virtual pour la durée du module
moduleSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual pour le statut temporel
moduleSchema.virtual('temporalStatus').get(function() {
  if (!this.startDate || !this.endDate) return 'indéfini';
  
  const now = new Date();
  if (now < this.startDate) return 'à_venir';
  if (now > this.endDate) return 'terminé';
  return 'en_cours';
});

// Virtual pour le nombre de cours requis
moduleSchema.virtual('requiredCoursesCount').get(function() {
  if (!this.courses) return 0;
  return this.courses.filter(c => c.isRequired).length;
});

// Virtual pour le nombre de cours optionnels
moduleSchema.virtual('optionalCoursesCount').get(function() {
  if (!this.courses) return 0;
  return this.courses.filter(c => !c.isRequired).length;
});

// Middleware pre-save pour calculer les totaux
moduleSchema.pre('save', function(next) {
  // Calculer le total des crédits
  if (this.courses && this.courses.length > 0) {
    this.totalCredits = this.courses.reduce((sum, course) => sum + course.credits, 0);
  }
  
  // Vérifier que les dates sont cohérentes
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new Error('La date de fin doit être après la date de début'));
  }
  
  // Vérifier que le total des poids d'évaluation est proche de 100%
  if (this.evaluation && this.evaluation.weightDistribution) {
    const total = this.evaluation.weightDistribution.continuous + this.evaluation.weightDistribution.final;
    if (Math.abs(total - 100) > 1) {
      return next(new Error('La somme des poids d\'évaluation doit être égale à 100%'));
    }
  }
  
  next();
});

// Méthode pour ajouter un cours au module
moduleSchema.methods.addCourse = function(courseId, isRequired = true, credits = 0, order = null) {
  const course = {
    course: courseId,
    isRequired,
    credits,
    order: order || (this.courses.length + 1)
  };
  
  this.courses.push(course);
  
  // Recalculer le total des crédits
  this.totalCredits = this.courses.reduce((sum, c) => sum + c.credits, 0);
  
  return this.save();
};

// Méthode pour retirer un cours du module
moduleSchema.methods.removeCourse = function(courseId) {
  this.courses = this.courses.filter(c => c.course.toString() !== courseId.toString());
  
  // Recalculer le total des crédits
  this.totalCredits = this.courses.reduce((sum, c) => sum + c.credits, 0);
  
  // Réorganiser l'ordre
  this.courses.forEach((course, index) => {
    course.order = index + 1;
  });
  
  return this.save();
};

// Méthode pour vérifier les prérequis
moduleSchema.methods.checkPrerequisites = function(studentId) {
  // Cette méthode vérifiera si un étudiant peut s'inscrire au module
  // en vérifiant qu'il a validé tous les prérequis
  // À implémenter selon la logique métier
  return true;
};

// Méthode pour calculer la note finale du module
moduleSchema.methods.calculateFinalGrade = function(studentId) {
  // Cette méthode calculera la note finale d'un étudiant dans le module
  // en tenant compte de tous les cours et de leurs poids
  // À implémenter selon la logique métier
  return 0;
};

// Méthode pour obtenir les statistiques du module
moduleSchema.methods.getStatistics = function() {
  return {
    totalCredits: this.totalCredits,
    totalStudents: this.totalStudents,
    averageGrade: this.averageGrade,
    passRate: this.passRate,
    requiredCourses: this.requiredCoursesCount,
    optionalCourses: this.optionalCoursesCount,
    duration: this.duration,
    temporalStatus: this.temporalStatus
  };
};

module.exports = mongoose.model('Module', moduleSchema);