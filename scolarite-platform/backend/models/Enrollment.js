const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
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
  enrollment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'withdrawn', 'failed', 'audit'),
    defaultValue: 'active',
    allowNull: false
  },
  grade: {
    type: DataTypes.ENUM('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP'),
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
  attendance_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0.00,
      max: 100.00
    }
  },
  completion_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  withdrawal_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  withdrawal_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  special_considerations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'course_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['enrollment_date']
    },
    {
      fields: ['grade']
    }
  ]
});

// Méthodes d'instance
Enrollment.prototype.isActive = function() {
  return this.status === 'active';
};

Enrollment.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Enrollment.prototype.isWithdrawn = function() {
  return this.status === 'withdrawn';
};

Enrollment.prototype.isFailed = function() {
  return this.status === 'failed';
};

Enrollment.prototype.getGradeInfo = function() {
  return {
    grade: this.grade,
    gradePoints: this.grade_points,
    isPassing: this.grade && !['F', 'NP'].includes(this.grade)
  };
};

Enrollment.prototype.getEnrollmentDuration = function() {
  if (!this.enrollment_date) return null;
  
  const endDate = this.completion_date || this.withdrawal_date || new Date();
  const start = new Date(this.enrollment_date);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

Enrollment.prototype.canWithdraw = function() {
  return this.isActive() && !this.isCompleted();
};

Enrollment.prototype.getStatusInfo = function() {
  return {
    status: this.status,
    isActive: this.isActive(),
    isCompleted: this.isCompleted(),
    isWithdrawn: this.isWithdrawn(),
    isFailed: this.isFailed(),
    duration: this.getEnrollmentDuration()
  };
};

module.exports = Enrollment;