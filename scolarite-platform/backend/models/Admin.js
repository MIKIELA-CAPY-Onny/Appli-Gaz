const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
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
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'moderator', 'support'),
    allowNull: false,
    defaultValue: 'admin'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      users: ['read', 'create', 'update'],
      students: ['read', 'create', 'update'],
      teachers: ['read', 'create', 'update'],
      courses: ['read', 'create', 'update', 'delete'],
      grades: ['read', 'create', 'update'],
      reports: ['read', 'create']
    }
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
    allowNull: false
  },
  last_activity: {
    type: DataTypes.DATE,
    allowNull: true
  },
  access_level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'admins',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['employee_number']
    },
    {
      fields: ['role']
    },
    {
      fields: ['status']
    },
    {
      fields: ['access_level']
    }
  ]
});

// Méthodes d'instance
Admin.prototype.isSuperAdmin = function() {
  return this.role === 'super_admin';
};

Admin.prototype.hasPermission = function(resource, action) {
  if (this.isSuperAdmin()) return true;
  
  const userPermissions = this.permissions || {};
  const resourcePermissions = userPermissions[resource] || [];
  
  return resourcePermissions.includes(action);
};

Admin.prototype.isActive = function() {
  return this.status === 'active';
};

Admin.prototype.updateLastActivity = function() {
  this.last_activity = new Date();
  return this.save();
};

Admin.prototype.getPermissionsSummary = function() {
  return {
    role: this.role,
    accessLevel: this.access_level,
    permissions: this.permissions,
    isSuperAdmin: this.isSuperAdmin()
  };
};

module.exports = Admin;