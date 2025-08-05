const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class MedicalRecord extends Model {}

MedicalRecord.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    allowNull: false,
    references: {
      model: 'facilities',
      key: 'id'
    }
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  telemedicine_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'telemedicine_sessions',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'consultation',
      'diagnosis',
      'treatment',
      'test_result',
      'vaccination',
      'surgery',
      'emergency'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  diagnosis: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  symptoms: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vital_signs: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  is_confidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  modelName: 'MedicalRecord',
  tableName: 'medical_records',
  timestamps: true,
  underscored: true
});

module.exports = MedicalRecord;