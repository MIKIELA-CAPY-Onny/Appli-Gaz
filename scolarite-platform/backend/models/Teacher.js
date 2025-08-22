const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Teacher = sequelize.define('Teacher', {
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
  employee_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  position: {
    type: DataTypes.ENUM('professor', 'associate_professor', 'assistant_professor', 'lecturer', 'instructor'),
    allowNull: false,
    defaultValue: 'instructor'
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  qualification: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  specialization: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  office_location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  office_hours: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'retired'),
    defaultValue: 'active',
    allowNull: false
  },
  max_courses_per_semester: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    validate: {
      min: 1,
      max: 8
    }
  },
  current_courses_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  research_interests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  publications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  awards: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'teachers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['employee_number']
    },
    {
      fields: ['department']
    },
    {
      fields: ['position']
    },
    {
      fields: ['status']
    }
  ]
});

// Méthodes d'instance
Teacher.prototype.isActive = function() {
  return this.status === 'active';
};

Teacher.prototype.canTeachMoreCourses = function() {
  return this.current_courses_count < this.max_courses_per_semester;
};

Teacher.prototype.getTeachingLoad = function() {
  return {
    current: this.current_courses_count,
    maximum: this.max_courses_per_semester,
    available: this.max_courses_per_semester - this.current_courses_count
  };
};

Teacher.prototype.getDepartmentInfo = function() {
  return {
    department: this.department,
    position: this.position,
    hireDate: this.hire_date
  };
};

module.exports = Teacher;