const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Prescription extends Model {
  // Générer un numéro de prescription unique
  static generatePrescriptionNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `ORD${year}${month}${random}`;
  }
}

Prescription.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  prescription_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
  pharmacy_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'facilities',
      key: 'id'
    }
  },
  medications: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: false,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('pending', 'dispensed', 'partial', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dispensed_at: {
    type: DataTypes.DATE,
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
  modelName: 'Prescription',
  tableName: 'prescriptions',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (prescription) => {
      if (!prescription.prescription_number) {
        prescription.prescription_number = Prescription.generatePrescriptionNumber();
      }
    }
  }
});

module.exports = Prescription;