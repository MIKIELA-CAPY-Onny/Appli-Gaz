const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Alert extends Model {
  // Vérifier si l'alerte est active
  isActive() {
    const now = new Date();
    return this.status === 'active' && 
           (!this.expires_at || this.expires_at > now) &&
           this.published_at <= now;
  }

  // Vérifier si l'alerte est urgente
  isUrgent() {
    return this.priority === 'urgent' || this.priority === 'critical';
  }

  // Calculer le temps restant avant expiration
  getTimeToExpiry() {
    if (!this.expires_at) return null;
    
    const now = new Date();
    const expiry = new Date(this.expires_at);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 0;
    
    return Math.floor(diff / (1000 * 60 * 60)); // en heures
  }

  // Obtenir les informations publiques de l'alerte
  toPublicJSON() {
    return {
      id: this.id,
      alertNumber: this.alert_number,
      title: this.title,
      message: this.message,
      type: this.type,
      priority: this.priority,
      status: this.status,
      targetAudience: this.target_audience,
      regions: this.regions,
      facilities: this.facilities,
      publishedAt: this.published_at,
      expiresAt: this.expires_at,
      isActive: this.isActive(),
      isUrgent: this.isUrgent(),
      timeToExpiry: this.getTimeToExpiry(),
      attachments: this.attachments,
      actionRequired: this.action_required,
      contactInfo: this.contact_info,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }

  // Générer un numéro d'alerte unique
  static generateAlertNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ALT${year}${month}${day}${random}`;
  }
}

// Définition du modèle
Alert.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  alert_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 200]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [20, 5000]
    }
  },
  type: {
    type: DataTypes.ENUM(
      'epidemic',           // Épidémie
      'pandemic',           // Pandémie
      'outbreak',           // Foyer épidémique
      'health_emergency',   // Urgence sanitaire
      'vaccination',        // Campagne de vaccination
      'drug_recall',        // Rappel de médicament
      'contamination',      // Contamination
      'shortage',           // Pénurie
      'policy_update',      // Mise à jour politique
      'weather_health',     // Alerte météo-santé
      'environmental',      // Environnementale
      'general'            // Générale
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent', 'critical'),
    allowNull: false,
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM(
      'draft',      // Brouillon
      'pending',    // En attente
      'active',     // Active
      'expired',    // Expirée
      'cancelled',  // Annulée
      'archived'    // Archivée
    ),
    allowNull: false,
    defaultValue: 'draft'
  },
  target_audience: {
    type: DataTypes.ARRAY(DataTypes.ENUM(
      'all',              // Tous
      'patients',         // Patients
      'doctors',          // Médecins
      'nurses',           // Infirmiers
      'pharmacists',      // Pharmaciens
      'facility_admins',  // Administrateurs de structures
      'health_workers',   // Travailleurs de santé
      'general_public'    // Grand public
    )),
    allowNull: false,
    defaultValue: ['all']
  },
  regions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [] // Si vide, alerte nationale
  },
  provinces: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  cities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  facilities: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true,
    defaultValue: [] // Structures spécifiques
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  action_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  action_deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  action_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact_info: {
    type: DataTypes.JSONB,
    defaultValue: {
      phone: '+241 01 XX XX XX',
      email: 'sante@gouv.ga',
      website: 'https://sante.gouv.ga'
    }
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: []
  },
  related_alerts: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  severity_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  estimated_impact: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: true
  },
  response_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  response_deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  statistics: {
    type: DataTypes.JSONB,
    defaultValue: {
      views: 0,
      sent_notifications: 0,
      responses_received: 0,
      facilities_reached: 0
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
  modelName: 'Alert',
  tableName: 'alerts',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['alert_number']
    },
    {
      fields: ['type']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['status']
    },
    {
      fields: ['published_at']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['approved_by']
    },
    {
      fields: ['target_audience']
    },
    {
      fields: ['regions']
    },
    {
      fields: ['tags']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: async (alert) => {
      if (!alert.alert_number) {
        // Générer un numéro d'alerte unique
        let alertNumber;
        let isUnique = false;
        
        while (!isUnique) {
          alertNumber = Alert.generateAlertNumber();
          const existing = await Alert.findOne({ 
            where: { alert_number: alertNumber },
            paranoid: false
          });
          if (!existing) {
            isUnique = true;
          }
        }
        
        alert.alert_number = alertNumber;
      }
    },
    
    beforeUpdate: (alert) => {
      // Mettre à jour les timestamps automatiquement
      if (alert.changed('status')) {
        const now = new Date();
        
        if (alert.status === 'active' && !alert.published_at) {
          alert.published_at = now;
        }
        
        if (alert.status === 'expired' || alert.status === 'cancelled') {
          if (!alert.expires_at || alert.expires_at > now) {
            alert.expires_at = now;
          }
        }
      }
    },
    
    afterCreate: async (alert) => {
      // Log de création d'alerte
      const logger = require('../utils/logger');
      logger.logBusinessEvent('Alert Created', {
        alertId: alert.id,
        alertNumber: alert.alert_number,
        type: alert.type,
        priority: alert.priority,
        createdBy: alert.created_by
      });
    },
    
    afterUpdate: async (alert) => {
      // Log de mise à jour d'alerte
      if (alert.changed('status')) {
        const logger = require('../utils/logger');
        logger.logBusinessEvent('Alert Status Changed', {
          alertId: alert.id,
          alertNumber: alert.alert_number,
          oldStatus: alert._previousDataValues.status,
          newStatus: alert.status
        });
      }
    }
  }
});

module.exports = Alert;