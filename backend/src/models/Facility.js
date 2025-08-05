const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Facility extends Model {
  // Méthode pour obtenir les informations publiques de la structure
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      phone: this.phone,
      email: this.email,
      address: this.address,
      coordinates: this.coordinates,
      services: this.services,
      workingHours: this.working_hours,
      isActive: this.is_active,
      isVerified: this.is_verified,
      rating: this.rating,
      totalReviews: this.total_reviews,
      images: this.images,
      createdAt: this.created_at
    };
  }

  // Calculer la distance depuis un point donné
  calculateDistance(lat, lng) {
    if (!this.coordinates || !this.coordinates.latitude || !this.coordinates.longitude) {
      return null;
    }

    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat - this.coordinates.latitude) * Math.PI / 180;
    const dLng = (lng - this.coordinates.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Vérifier si ouvert maintenant
  isOpenNow() {
    if (!this.working_hours) return false;

    const now = new Date();
    const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().substr(0, 5);

    const todayHours = this.working_hours[currentDay];
    if (!todayHours || todayHours.closed) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  }

  // Mettre à jour la note moyenne
  async updateRating() {
    const { Review } = require('./index');
    const reviews = await Review.findAll({
      where: { facility_id: this.id },
      attributes: ['rating']
    });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      this.rating = Math.round((totalRating / reviews.length) * 10) / 10;
      this.total_reviews = reviews.length;
    } else {
      this.rating = 0;
      this.total_reviews = 0;
    }

    await this.save();
  }
}

// Définition du modèle
Facility.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  type: {
    type: DataTypes.ENUM(
      'hospital',        // Hôpital
      'clinic',          // Clinique
      'pharmacy',        // Pharmacie
      'laboratory',      // Laboratoire
      'dental_clinic',   // Clinique dentaire
      'maternity',       // Maternité
      'emergency_center', // Centre d'urgence
      'health_center'    // Centre de santé
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  license_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    validate: {
      hasRequiredFields(value) {
        if (!value.street || !value.city || !value.province) {
          throw new Error('L\'adresse doit contenir au minimum la rue, la ville et la province');
        }
      }
    }
  },
  coordinates: {
    type: DataTypes.JSONB,
    allowNull: true,
    validate: {
      isValidCoordinates(value) {
        if (value && (!value.latitude || !value.longitude)) {
          throw new Error('Les coordonnées doivent contenir latitude et longitude');
        }
        if (value && (value.latitude < -90 || value.latitude > 90)) {
          throw new Error('Latitude invalide');
        }
        if (value && (value.longitude < -180 || value.longitude > 180)) {
          throw new Error('Longitude invalide');
        }
      }
    }
  },
  services: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: false
  },
  specialties: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: false
  },
  working_hours: {
    type: DataTypes.JSONB,
    defaultValue: {
      lundi: { open: '08:00', close: '18:00', closed: false },
      mardi: { open: '08:00', close: '18:00', closed: false },
      mercredi: { open: '08:00', close: '18:00', closed: false },
      jeudi: { open: '08:00', close: '18:00', closed: false },
      vendredi: { open: '08:00', close: '18:00', closed: false },
      samedi: { open: '08:00', close: '12:00', closed: false },
      dimanche: { closed: true }
    }
  },
  emergency_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  telemedicine_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bed_capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  available_beds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_government: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  subscription_status: {
    type: DataTypes.ENUM('active', 'expired', 'suspended', 'trial'),
    defaultValue: 'trial'
  },
  subscription_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  insurance_accepted: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  payment_methods: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['cash', 'mobile_money']
  },
  contact_person: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  admin_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      online_booking: true,
      telemedicine: false,
      notifications: {
        email: true,
        sms: true
      },
      auto_confirm_appointments: false
    }
  },
  statistics: {
    type: DataTypes.JSONB,
    defaultValue: {
      total_patients: 0,
      total_appointments: 0,
      total_consultations: 0
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
  modelName: 'Facility',
  tableName: 'facilities',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_verified']
    },
    {
      fields: ['subscription_status']
    },
    {
      fields: ['rating']
    },
    {
      unique: true,
      fields: ['license_number']
    },
    {
      fields: ['admin_user_id']
    },
    {
      name: 'facilities_location_idx',
      fields: [sequelize.literal("((coordinates->>'latitude')::float)")]
    },
    {
      name: 'facilities_location_lng_idx',
      fields: [sequelize.literal("((coordinates->>'longitude')::float)")]
    }
  ],
  hooks: {
    beforeSave: (facility) => {
      // Validation des lits disponibles
      if (facility.available_beds && facility.bed_capacity && 
          facility.available_beds > facility.bed_capacity) {
        throw new Error('Le nombre de lits disponibles ne peut pas dépasser la capacité totale');
      }
    }
  }
});

module.exports = Facility;