const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Absence = sequelize.define('Absence', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  type: {
    type: DataTypes.ENUM('absent', 'late', 'excused', 'unexcused', 'medical', 'other'),
    allowNull: false,
    defaultValue: 'absent'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  documentation: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Lien vers la documentation justificative'
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_justified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  justification_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  impact_on_grade: {
    type: DataTypes.ENUM('none', 'minor', 'moderate', 'major'),
    defaultValue: 'none'
  },
  make_up_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  make_up_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  make_up_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notification_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'absences',
  timestamps: true,
  indexes: [
    {
      fields: ['student_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['date']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_justified']
    },
    {
      fields: ['student_id', 'course_id', 'date']
    }
  ]
});

// Méthodes d'instance
Absence.prototype.isJustified = function() {
  return this.is_justified;
};

Absence.prototype.isExcused = function() {
  return this.type === 'excused' || this.type === 'medical';
};

Absence.prototype.isUnexcused = function() {
  return this.type === 'unexcused' || this.type === 'absent';
};

Absence.prototype.isLate = function() {
  return this.type === 'late';
};

Absence.prototype.requiresMakeUp = function() {
  return this.make_up_required;
};

Absence.prototype.isMakeUpCompleted = function() {
  return this.make_up_completed;
};

Absence.prototype.getAbsenceInfo = function() {
  return {
    date: this.date,
    type: this.type,
    reason: this.reason,
    isJustified: this.is_justified,
    isExcused: this.isExcused(),
    isUnexcused: this.isUnexcused(),
    isLate: this.isLate(),
    impact: this.impact_on_grade
  };
};

Absence.prototype.getMakeUpInfo = function() {
  return {
    required: this.make_up_required,
    date: this.make_up_date,
    completed: this.make_up_completed
  };
};

Absence.prototype.getVerificationInfo = function() {
  return {
    verified: !!this.verified_by,
    verifiedBy: this.verified_by,
    verifiedAt: this.verified_at,
    notificationSent: this.notification_sent,
    notificationDate: this.notification_date
  };
};

Absence.prototype.canBeJustified = function() {
  return !this.is_justified && this.type !== 'excused';
};

Absence.prototype.getAbsenceSummary = function() {
  return {
    ...this.getAbsenceInfo(),
    ...this.getMakeUpInfo(),
    ...this.getVerificationInfo()
  };
};

module.exports = Absence;