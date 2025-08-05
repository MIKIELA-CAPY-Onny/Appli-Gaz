const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Appointment extends Model {
  // Vérifier si le rendez-vous peut être annulé
  canBeCancelled() {
    const now = new Date();
    const appointmentTime = new Date(this.appointment_date);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff > 2 && ['scheduled', 'confirmed'].includes(this.status);
  }

  // Vérifier si le rendez-vous peut être reprogrammé
  canBeRescheduled() {
    const now = new Date();
    const appointmentTime = new Date(this.appointment_date);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff > 4 && ['scheduled', 'confirmed'].includes(this.status);
  }

  // Vérifier si le rendez-vous est en retard
  isLate() {
    if (this.status !== 'confirmed') return false;
    
    const now = new Date();
    const appointmentTime = new Date(this.appointment_date);
    const timeDiff = now.getTime() - appointmentTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff > 15;
  }

  // Calculer la durée de la consultation
  getDuration() {
    if (!this.end_time || !this.start_time) return null;
    
    const start = new Date(this.start_time);
    const end = new Date(this.end_time);
    const diff = end.getTime() - start.getTime();
    
    return Math.round(diff / (1000 * 60)); // en minutes
  }

  // Générer un code de confirmation unique
  static generateConfirmationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Obtenir les informations publiques du rendez-vous
  toPublicJSON() {
    return {
      id: this.id,
      appointmentNumber: this.appointment_number,
      patientId: this.patient_id,
      doctorId: this.doctor_id,
      facilityId: this.facility_id,
      appointmentDate: this.appointment_date,
      duration: this.duration,
      type: this.type,
      status: this.status,
      reason: this.reason,
      notes: this.notes,
      confirmationCode: this.confirmation_code,
      isUrgent: this.is_urgent,
      isFollowUp: this.is_follow_up,
      canBeCancelled: this.canBeCancelled(),
      canBeRescheduled: this.canBeRescheduled(),
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }
}

// Définition du modèle
Appointment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointment_number: {
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
  facility_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'facilities',
      key: 'id'
    }
  },
  appointment_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: new Date().toISOString()
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    validate: {
      min: 15,
      max: 240
    }
  },
  type: {
    type: DataTypes.ENUM(
      'consultation',
      'follow_up',
      'emergency',
      'telemedicine',
      'vaccination',
      'checkup',
      'specialist',
      'surgery',
      'laboratory',
      'radiology'
    ),
    allowNull: false,
    defaultValue: 'consultation'
  },
  status: {
    type: DataTypes.ENUM(
      'scheduled',    // Programmé
      'confirmed',    // Confirmé
      'in_progress',  // En cours
      'completed',    // Terminé
      'cancelled',    // Annulé
      'no_show',      // Absence
      'rescheduled'   // Reprogrammé
    ),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  symptoms: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  doctor_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  confirmation_code: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  is_urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_follow_up: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  follow_up_for: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  waiting_time: {
    type: DataTypes.INTEGER,
    allowNull: true // en minutes
  },
  room_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'partial', 'refunded'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  insurance_claim: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminder_sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rescheduled_from: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
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
  modelName: 'Appointment',
  tableName: 'appointments',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['appointment_number']
    },
    {
      fields: ['patient_id']
    },
    {
      fields: ['doctor_id']
    },
    {
      fields: ['facility_id']
    },
    {
      fields: ['appointment_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_urgent']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['confirmation_code']
    }
  ],
  hooks: {
    beforeCreate: async (appointment) => {
      if (!appointment.appointment_number) {
        // Générer un numéro de rendez-vous unique
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        appointment.appointment_number = `RDV${year}${month}${random}`;
      }
      
      if (!appointment.confirmation_code) {
        appointment.confirmation_code = Appointment.generateConfirmationCode();
      }
    },
    
    beforeUpdate: (appointment) => {
      // Mettre à jour les timestamps automatiquement
      if (appointment.changed('status')) {
        const now = new Date();
        
        if (appointment.status === 'in_progress' && !appointment.start_time) {
          appointment.start_time = now;
        }
        
        if (appointment.status === 'completed' && !appointment.end_time) {
          appointment.end_time = now;
          
          // Calculer le temps d'attente si start_time existe
          if (appointment.start_time) {
            const appointmentTime = new Date(appointment.appointment_date);
            const startTime = new Date(appointment.start_time);
            const waitingTime = Math.max(0, (startTime.getTime() - appointmentTime.getTime()) / (1000 * 60));
            appointment.waiting_time = Math.round(waitingTime);
          }
        }
        
        if (appointment.status === 'cancelled') {
          appointment.cancelled_at = now;
        }
      }
    }
  }
});

module.exports = Appointment;