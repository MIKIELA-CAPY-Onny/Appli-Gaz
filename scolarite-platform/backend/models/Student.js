const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  student_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  level: {
    type: DataTypes.ENUM('L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3'),
    allowNull: false,
    comment: 'Niveau d\'étude: Licence, Master, Doctorat'
  },
  field_of_study: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  academic_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2020,
      max: 2030
    }
  },
  semester: {
    type: DataTypes.ENUM('S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'),
    allowNull: false
  },
  enrollment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  graduation_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended', 'withdrawn'),
    defaultValue: 'active',
    allowNull: false
  },
  gpa: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0.00,
      max: 4.00
    }
  },
  total_credits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  advisor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  emergency_contact_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  emergency_contact_relationship: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'students',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['student_number']
    },
    {
      fields: ['level', 'field_of_study']
    },
    {
      fields: ['status']
    }
  ]
});

// Méthodes d'instance
Student.prototype.isGraduated = function() {
  return this.status === 'graduated';
};

Student.prototype.isActive = function() {
  return this.status === 'active';
};

Student.prototype.getAcademicProgress = function() {
  // Logique pour calculer le progrès académique
  return {
    level: this.level,
    semester: this.semester,
    gpa: this.gpa,
    totalCredits: this.total_credits
  };
};

module.exports = Student;