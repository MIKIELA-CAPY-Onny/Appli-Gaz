const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Telemedicine extends Model {
  // Vérifier si la session est active
  isActive() {
    return this.status === 'in_progress';
  }

  // Calculer la durée de la consultation
  getDuration() {
    if (!this.end_time || !this.start_time) return null;
    
    const start = new Date(this.start_time);
    const end = new Date(this.end_time);
    const diff = end.getTime() - start.getTime();
    
    return Math.round(diff / (1000 * 60)); // en minutes
  }

  // Générer un code de session unique
  static generateSessionCode() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

Telemedicine.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  session_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  facility_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'facilities',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'scheduled',
      'waiting',
      'in_progress',
      'completed',
      'cancelled',
      'technical_issue'
    ),
    defaultValue: 'scheduled'
  },
  type: {
    type: DataTypes.ENUM('video', 'audio', 'chat'),
    defaultValue: 'video'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  connection_quality: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  recording_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Telemedicine',
  tableName: 'telemedicine_sessions',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (session) => {
      if (!session.session_code) {
        session.session_code = Telemedicine.generateSessionCode();
      }
    }
  }
});

module.exports = Telemedicine;