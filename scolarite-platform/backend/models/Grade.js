const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'modules',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  assessment_type: {
    type: DataTypes.ENUM('exam', 'quiz', 'assignment', 'project', 'participation', 'midterm', 'final'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  max_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  score_obtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0.00
    }
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0.00,
      max: 100.00
    }
  },
  letter_grade: {
    type: DataTypes.ENUM('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'),
    allowNull: true
  },
  grade_points: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0.00,
      max: 4.00
    }
  },
  weight_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0.00,
      max: 100.00
    }
  },
  assessment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  submission_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_late: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  graded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  graded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'submitted', 'graded', 'late', 'missing'),
    defaultValue: 'pending',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'grades',
  timestamps: true,
  indexes: [
    {
      fields: ['student_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['module_id']
    },
    {
      fields: ['assessment_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['assessment_date']
    }
  ]
});

// Méthodes d'instance
Grade.prototype.isGraded = function() {
  return this.status === 'graded';
};

Grade.prototype.isPending = function() {
  return this.status === 'pending';
};

Grade.prototype.isSubmitted = function() {
  return this.status === 'submitted';
};

Grade.prototype.isMissing = function() {
  return this.status === 'missing';
};

Grade.prototype.calculatePercentage = function() {
  if (!this.score_obtained || !this.max_score) return null;
  return (this.score_obtained / this.max_score) * 100;
};

Grade.prototype.calculateGradePoints = function() {
  if (!this.percentage) return null;
  
  if (this.percentage >= 93) return 4.00;
  if (this.percentage >= 90) return 3.67;
  if (this.percentage >= 87) return 3.33;
  if (this.percentage >= 83) return 3.00;
  if (this.percentage >= 80) return 2.67;
  if (this.percentage >= 77) return 2.33;
  if (this.percentage >= 73) return 2.00;
  if (this.percentage >= 70) return 1.67;
  if (this.percentage >= 67) return 1.33;
  if (this.percentage >= 63) return 1.00;
  if (this.percentage >= 60) return 0.67;
  return 0.00;
};

Grade.prototype.getLetterGrade = function() {
  if (!this.percentage) return null;
  
  if (this.percentage >= 93) return 'A';
  if (this.percentage >= 90) return 'A-';
  if (this.percentage >= 87) return 'B+';
  if (this.percentage >= 83) return 'B';
  if (this.percentage >= 80) return 'B-';
  if (this.percentage >= 77) return 'C+';
  if (this.percentage >= 73) return 'C';
  if (this.percentage >= 70) return 'C-';
  if (this.percentage >= 67) return 'D+';
  if (this.percentage >= 63) return 'D';
  if (this.percentage >= 60) return 'D-';
  return 'F';
};

Grade.prototype.getGradeInfo = function() {
  const percentage = this.calculatePercentage();
  const letterGrade = this.getLetterGrade();
  const gradePoints = this.calculateGradePoints();
  
  return {
    score: this.score_obtained,
    maxScore: this.max_score,
    percentage: percentage,
    letterGrade: letterGrade,
    gradePoints: gradePoints,
    isPassing: percentage >= 60,
    weight: this.weight_percentage
  };
};

Grade.prototype.getSubmissionInfo = function() {
  return {
    dueDate: this.due_date,
    submissionDate: this.submission_date,
    isLate: this.is_late,
    status: this.status
  };
};

module.exports = Grade;