const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Informations de base
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  
  // Informations académiques
  credits: {
    type: Number,
    required: true,
    min: [1, 'Un cours doit avoir au moins 1 crédit'],
    max: [30, 'Un cours ne peut pas avoir plus de 30 crédits']
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
  
  // Enseignants
  teachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    role: {
      type: String,
      enum: ['responsable', 'co-enseignant', 'assistant', 'intervenant'],
      default: 'co-enseignant'
    },
    hours: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  
  // Planning et horaires
  schedule: [{
    day: {
      type: String,
      required: true,
      enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
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
    room: {
      type: String,
      trim: true
    },
    building: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['cours', 'td', 'tp', 'examen', 'autre'],
      default: 'cours'
    }
  }],
  
  // Contenu et programme
  objectives: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  syllabus: [{
    week: {
      type: Number,
      required: true,
      min: 1
    },
    topic: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    materials: [String],
    activities: [String]
  }],
  
  // Évaluation
  evaluationMethods: [{
    type: {
      type: String,
      enum: ['examen_final', 'examen_partiel', 'tp', 'projet', 'participation', 'autre'],
      required: true
    },
    weight: {
      type: Number,
      required: true,
      min: [0, 'Le poids ne peut pas être négatif'],
      max: [100, 'Le poids ne peut pas dépasser 100%']
    },
    description: String
  }],
  
  // Ressources
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'lien', 'video', 'audio', 'autre']
    },
    url: String,
    description: String,
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  
  // Capacité et inscriptions
  maxStudents: {
    type: Number,
    min: [1, 'La capacité doit être d\'au moins 1 étudiant'],
    default: 50
  },
  currentEnrollments: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Statut
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
  averageGrade: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  totalGrades: {
    type: Number,
    min: 0,
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
courseSchema.index({ courseCode: 1 });
courseSchema.index({ level: 1, field: 1 });
courseSchema.index({ semester: 1, academicYear: 1 });
courseSchema.index({ status: 1, isVisible: 1 });
courseSchema.index({ 'teachers.teacher': 1 });

// Virtual pour la disponibilité
courseSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.isVisible && this.currentEnrollments < this.maxStudents;
});

// Virtual pour le pourcentage de remplissage
courseSchema.virtual('enrollmentPercentage').get(function() {
  if (this.maxStudents === 0) return 0;
  return Math.round((this.currentEnrollments / this.maxStudents) * 100);
});

// Virtual pour le statut de remplissage
courseSchema.virtual('enrollmentStatus').get(function() {
  const percentage = this.enrollmentPercentage;
  if (percentage >= 100) return 'complet';
  if (percentage >= 80) return 'presque_complet';
  if (percentage >= 50) return 'modérément_rempli';
  if (percentage >= 20) return 'peu_rempli';
  return 'vide';
});

// Virtual pour la durée totale du cours
courseSchema.virtual('totalHours').get(function() {
  if (!this.schedule || this.schedule.length === 0) return 0;
  
  let totalMinutes = 0;
  this.schedule.forEach(session => {
    const start = new Date(`2000-01-01T${session.startTime}:00`);
    const end = new Date(`2000-01-01T${session.endTime}:00`);
    const diffMs = end - start;
    totalMinutes += diffMs / (1000 * 60);
  });
  
  return Math.round(totalMinutes / 60 * 100) / 100; // Arrondir à 2 décimales
});

// Middleware pre-save pour valider les horaires
courseSchema.pre('save', function(next) {
  // Vérifier que les horaires sont cohérents
  if (this.schedule && this.schedule.length > 0) {
    for (const session of this.schedule) {
      const start = new Date(`2000-01-01T${session.startTime}:00`);
      const end = new Date(`2000-01-01T${session.endTime}:00`);
      
      if (start >= end) {
        return next(new Error('L\'heure de fin doit être après l\'heure de début'));
      }
    }
  }
  
  // Vérifier que le total des poids d'évaluation est proche de 100%
  if (this.evaluationMethods && this.evaluationMethods.length > 0) {
    const totalWeight = this.evaluationMethods.reduce((sum, method) => sum + method.weight, 0);
    if (Math.abs(totalWeight - 100) > 5) {
      console.warn(`Attention: Le total des poids d'évaluation est ${totalWeight}% (devrait être proche de 100%)`);
    }
  }
  
  next();
});

// Méthode pour ajouter un étudiant
courseSchema.methods.enrollStudent = function() {
  if (this.currentEnrollments >= this.maxStudents) {
    throw new Error('Le cours est complet');
  }
  this.currentEnrollments += 1;
  return this.save();
};

// Méthode pour retirer un étudiant
courseSchema.methods.unenrollStudent = function() {
  if (this.currentEnrollments <= 0) {
    throw new Error('Aucun étudiant inscrit à retirer');
  }
  this.currentEnrollments -= 1;
  return this.save();
};

// Méthode pour calculer la moyenne
courseSchema.methods.calculateAverageGrade = function() {
  // Cette méthode sera appelée après l'ajout de nouvelles notes
  // La logique sera implémentée dans le contrôleur des notes
};

// Méthode pour vérifier les conflits d'horaires
courseSchema.methods.hasScheduleConflict = function(otherCourse) {
  if (!this.schedule || !otherCourse.schedule) return false;
  
  for (const session1 of this.schedule) {
    for (const session2 of otherCourse.schedule) {
      if (session1.day === session2.day) {
        const start1 = new Date(`2000-01-01T${session1.startTime}:00`);
        const end1 = new Date(`2000-01-01T${session1.endTime}:00`);
        const start2 = new Date(`2000-01-01T${session2.startTime}:00`);
        const end2 = new Date(`2000-01-01T${session2.endTime}:00`);
        
        if (start1 < end2 && start2 < end1) {
          return true; // Conflit détecté
        }
      }
    }
  }
  
  return false;
};

module.exports = mongoose.model('Course', courseSchema);