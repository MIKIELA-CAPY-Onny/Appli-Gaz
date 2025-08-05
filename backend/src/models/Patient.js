const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Patient extends Model {
  // Calculer l'âge à partir de la date de naissance
  getAge() {
    if (!this.date_of_birth) return null;
    
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Calculer l'IMC (Indice de Masse Corporelle)
  calculateBMI() {
    if (!this.weight || !this.height) return null;
    
    const heightInMeters = this.height / 100;
    const bmi = this.weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  }

  // Obtenir le statut IMC
  getBMIStatus() {
    const bmi = this.calculateBMI();
    if (!bmi) return null;
    
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  // Vérifier si le patient a des allergies
  hasAllergies() {
    return this.allergies && this.allergies.length > 0;
  }

  // Vérifier si le patient prend des médicaments
  hasCurrentMedications() {
    return this.current_medications && this.current_medications.length > 0;
  }

  // Obtenir les informations publiques du patient
  toPublicJSON() {
    return {
      id: this.id,
      patientNumber: this.patient_number,
      firstName: this.first_name,
      lastName: this.last_name,
      dateOfBirth: this.date_of_birth,
      age: this.getAge(),
      gender: this.gender,
      phone: this.phone,
      email: this.email,
      emergencyContact: this.emergency_contact,
      bloodType: this.blood_type,
      bmi: this.calculateBMI(),
      bmiStatus: this.getBMIStatus(),
      hasAllergies: this.hasAllergies(),
      hasCurrentMedications: this.hasCurrentMedications(),
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }

  // Obtenir le dossier médical complet (pour les professionnels de santé)
  toMedicalJSON() {
    return {
      ...this.toPublicJSON(),
      allergies: this.allergies,
      currentMedications: this.current_medications,
      medicalHistory: this.medical_history,
      chronicConditions: this.chronic_conditions,
      surgicalHistory: this.surgical_history,
      familyHistory: this.family_history,
      socialHistory: this.social_history,
      vitalSigns: this.vital_signs,
      weight: this.weight,
      height: this.height,
      notes: this.notes
    };
  }

  // Générer un numéro de patient unique
  static generatePatientNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `P${year}${random}`;
  }
}

// Définition du modèle
Patient.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  patient_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isBefore: new Date().toISOString().split('T')[0]
    }
  },
  gender: {
    type: DataTypes.ENUM('M', 'F', 'Other'),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^(\+241|241)?[0-9]{8}$/ // Format téléphone Gabon
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  emergency_contact: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      hasRequiredFields(value) {
        if (!value.name || !value.phone || !value.relationship) {
          throw new Error('Le contact d\'urgence doit contenir nom, téléphone et relation');
        }
      }
    }
  },
  blood_type: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 30,
      max: 250
    }
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 1,
      max: 500
    }
  },
  allergies: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: [],
    allowNull: false
  },
  current_medications: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: [],
    allowNull: false
  },
  medical_history: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: [],
    allowNull: false
  },
  chronic_conditions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: false
  },
  surgical_history: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: [],
    allowNull: false
  },
  family_history: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: false
  },
  social_history: {
    type: DataTypes.JSONB,
    defaultValue: {
      smoking: false,
      alcohol: false,
      drugs: false,
      exercise: 'none',
      occupation: ''
    },
    allowNull: false
  },
  vital_signs: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: false
  },
  insurance_info: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  preferred_language: {
    type: DataTypes.STRING,
    defaultValue: 'fr'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  privacy_settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      share_with_family: false,
      share_for_research: false,
      emergency_access: true
    }
  },
  last_visit: {
    type: DataTypes.DATE,
    allowNull: true
  },
  primary_doctor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  primary_facility_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'facilities',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Patient',
  tableName: 'patients',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['patient_number']
    },
    {
      unique: true,
      fields: ['user_id']
    },
    {
      fields: ['first_name', 'last_name']
    },
    {
      fields: ['date_of_birth']
    },
    {
      fields: ['gender']
    },
    {
      fields: ['blood_type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['primary_doctor_id']
    },
    {
      fields: ['primary_facility_id']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: async (patient) => {
      if (!patient.patient_number) {
        // Générer un numéro de patient unique
        let patientNumber;
        let isUnique = false;
        
        while (!isUnique) {
          patientNumber = Patient.generatePatientNumber();
          const existing = await Patient.findOne({ 
            where: { patient_number: patientNumber },
            paranoid: false
          });
          if (!existing) {
            isUnique = true;
          }
        }
        
        patient.patient_number = patientNumber;
      }
    }
  }
});

module.exports = Patient;