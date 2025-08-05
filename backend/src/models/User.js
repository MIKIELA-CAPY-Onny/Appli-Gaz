const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { sequelize } = require('../config/database');

class User extends Model {
  // Méthode pour hasher le mot de passe
  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Méthode pour vérifier le mot de passe
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Générer un token JWT
  generateAccessToken() {
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
        role: this.role,
        facilityId: this.facility_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'WAFYA',
        audience: 'WAFYA-USERS'
      }
    );
  }

  // Générer un refresh token
  generateRefreshToken() {
    return jwt.sign(
      { id: this.id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '30d',
        issuer: 'WAFYA',
        audience: 'WAFYA-REFRESH'
      }
    );
  }

  // Générer un secret 2FA
  generate2FASecret() {
    const secret = speakeasy.generateSecret({
      name: `WAFYA (${this.email})`,
      issuer: 'WAFYA',
      length: 32
    });
    return secret;
  }

  // Vérifier le code 2FA
  verify2FAToken(token) {
    return speakeasy.totp.verify({
      secret: this.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2
    });
  }

  // Incrémenter les tentatives de connexion
  async incrementLoginAttempts() {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
    const lockoutTime = parseInt(process.env.LOCKOUT_TIME) || 15 * 60 * 1000; // 15 minutes

    this.login_attempts = (this.login_attempts || 0) + 1;

    if (this.login_attempts >= maxAttempts) {
      this.locked_until = new Date(Date.now() + lockoutTime);
    }

    await this.save();
  }

  // Réinitialiser les tentatives de connexion
  async resetLoginAttempts() {
    this.login_attempts = 0;
    this.locked_until = null;
    await this.save();
  }

  // Vérifier si le compte est verrouillé
  isAccountLocked() {
    return this.locked_until && this.locked_until > new Date();
  }

  // Méthode pour obtenir les informations publiques de l'utilisateur
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.first_name,
      lastName: this.last_name,
      role: this.role,
      isActive: this.is_active,
      isVerified: this.is_verified,
      profilePicture: this.profile_picture,
      phone: this.phone,
      facilityId: this.facility_id,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }

  // Hook avant la création
  static async beforeCreate(user) {
    if (user.password) {
      user.password = await user.hashPassword(user.password);
    }
  }

  // Hook avant la mise à jour
  static async beforeUpdate(user) {
    if (user.changed('password')) {
      user.password = await user.hashPassword(user.password);
    }
  }
}

// Définition du modèle
User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      len: [3, 255]
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 255]
    }
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
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^(\+241|241)?[0-9]{8}$/ // Format téléphone Gabon
    }
  },
  role: {
    type: DataTypes.ENUM(
      'super_admin',      // Ministère de la Santé
      'facility_admin',   // Administrateur de structure
      'doctor',          // Médecin
      'nurse',           // Infirmier
      'pharmacist',      // Pharmacien
      'patient',         // Patient
      'staff'            // Personnel de santé
    ),
    allowNull: false,
    defaultValue: 'patient'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verification_token_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password_reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  backup_codes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login_ip: {
    type: DataTypes.INET,
    allowNull: true
  },
  profile_picture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      language: 'fr',
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      theme: 'light'
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
  specialization: {
    type: DataTypes.STRING,
    allowNull: true // Pour les médecins
  },
  license_number: {
    type: DataTypes.STRING,
    allowNull: true // Pour les professionnels de santé
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('M', 'F', 'Other'),
    allowNull: true
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  emergency_contact: {
    type: DataTypes.JSONB,
    allowNull: true
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
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['facility_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: User.beforeCreate,
    beforeUpdate: User.beforeUpdate
  }
});

module.exports = User;