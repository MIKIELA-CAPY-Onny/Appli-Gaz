const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Module = sequelize.define('Module', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  order_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  duration_hours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  materials: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resources: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Ressources additionnelles (liens, fichiers, etc.)'
  },
  assessment_criteria: {
    type: DataTypes.TEXT,
    allowNull: true
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
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed'),
    defaultValue: 'active',
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'modules',
  timestamps: true,
  indexes: [
    {
      fields: ['course_id']
    },
    {
      fields: ['course_id', 'order_number']
    },
    {
      fields: ['status']
    }
  ]
});

// Méthodes d'instance
Module.prototype.isActive = function() {
  return this.status === 'active';
};

Module.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Module.prototype.getDurationInfo = function() {
  return {
    hours: this.duration_hours,
    startDate: this.start_date,
    endDate: this.end_date
  };
};

Module.prototype.getWeightInfo = function() {
  return {
    weight: this.weight_percentage,
    isWeighted: this.weight_percentage > 0
  };
};

Module.prototype.getContentSummary = function() {
  return {
    title: this.title,
    description: this.description,
    objectives: this.objectives,
    materials: this.materials,
    resources: this.resources
  };
};

module.exports = Module;