const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  level: {
    type: DataTypes.ENUM('L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3'),
    allowNull: false
  },
  semester: {
    type: DataTypes.ENUM('S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'),
    allowNull: false
  },
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2020,
      max: 2030
    }
  },
  max_students: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    validate: {
      min: 1,
      max: 200
    }
  },
  current_students: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed', 'cancelled'),
    defaultValue: 'active',
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  schedule: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Horaires des cours (jour, heure, salle)'
  },
  prerequisites: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  syllabus: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  evaluation_method: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  materials: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'courses',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['code']
    },
    {
      fields: ['teacher_id']
    },
    {
      fields: ['level', 'semester']
    },
    {
      fields: ['academic_year']
    },
    {
      fields: ['status']
    }
  ]
});

// Méthodes d'instance
Course.prototype.isActive = function() {
  return this.status === 'active';
};

Course.prototype.isFull = function() {
  return this.current_students >= this.max_students;
};

Course.prototype.getAvailableSlots = function() {
  return Math.max(0, this.max_students - this.current_students);
};

Course.prototype.canEnrollStudent = function() {
  return this.isActive() && !this.isFull();
};

Course.prototype.getDuration = function() {
  if (!this.start_date || !this.end_date) return null;
  
  const start = new Date(this.start_date);
  const end = new Date(this.end_date);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

Course.prototype.getScheduleInfo = function() {
  return {
    startDate: this.start_date,
    endDate: this.end_date,
    duration: this.getDuration(),
    schedule: this.schedule
  };
};

module.exports = Course;