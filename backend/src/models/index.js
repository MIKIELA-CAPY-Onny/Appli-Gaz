const { sequelize } = require('../config/database');

// Import de tous les modèles
const User = require('./User');
const Facility = require('./Facility');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Alert = require('./Alert');
const Telemedicine = require('./Telemedicine');
const Prescription = require('./Prescription');
const MedicalRecord = require('./MedicalRecord');
const Payment = require('./Payment');
const Notification = require('./Notification');

// Définition des associations entre modèles

// User associations
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patientProfile' });
User.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });
User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'doctorAppointments' });
User.hasMany(Alert, { foreignKey: 'created_by', as: 'createdAlerts' });
User.hasMany(Alert, { foreignKey: 'approved_by', as: 'approvedAlerts' });
User.hasMany(Telemedicine, { foreignKey: 'doctor_id', as: 'doctorConsultations' });
User.hasMany(Prescription, { foreignKey: 'doctor_id', as: 'prescriptions' });
User.hasMany(MedicalRecord, { foreignKey: 'doctor_id', as: 'medicalRecords' });
User.hasMany(Payment, { foreignKey: 'processed_by', as: 'processedPayments' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// Facility associations
Facility.hasMany(User, { foreignKey: 'facility_id', as: 'staff' });
Facility.hasOne(User, { foreignKey: 'id', sourceKey: 'admin_user_id', as: 'admin' });
Facility.hasMany(Appointment, { foreignKey: 'facility_id', as: 'appointments' });
Facility.hasMany(Patient, { foreignKey: 'primary_facility_id', as: 'patients' });
Facility.hasMany(Telemedicine, { foreignKey: 'facility_id', as: 'telemedicineConsultations' });
Facility.hasMany(MedicalRecord, { foreignKey: 'facility_id', as: 'medicalRecords' });
Facility.hasMany(Payment, { foreignKey: 'facility_id', as: 'payments' });

// Patient associations
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Patient.belongsTo(User, { foreignKey: 'primary_doctor_id', as: 'primaryDoctor' });
Patient.belongsTo(Facility, { foreignKey: 'primary_facility_id', as: 'primaryFacility' });
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Patient.hasMany(Telemedicine, { foreignKey: 'patient_id', as: 'telemedicineConsultations' });
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id', as: 'medicalRecords' });
Patient.hasMany(Payment, { foreignKey: 'patient_id', as: 'payments' });

// Appointment associations
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });
Appointment.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });
Appointment.belongsTo(User, { foreignKey: 'cancelled_by', as: 'cancelledBy' });
Appointment.belongsTo(Appointment, { foreignKey: 'follow_up_for', as: 'originalAppointment' });
Appointment.belongsTo(Appointment, { foreignKey: 'rescheduled_from', as: 'previousAppointment' });
Appointment.hasMany(Appointment, { foreignKey: 'follow_up_for', as: 'followUpAppointments' });
Appointment.hasMany(Appointment, { foreignKey: 'rescheduled_from', as: 'rescheduledAppointments' });
Appointment.hasOne(Telemedicine, { foreignKey: 'appointment_id', as: 'telemedicineSession' });
Appointment.hasMany(Prescription, { foreignKey: 'appointment_id', as: 'prescriptions' });
Appointment.hasMany(MedicalRecord, { foreignKey: 'appointment_id', as: 'medicalRecords' });
Appointment.hasOne(Payment, { foreignKey: 'appointment_id', as: 'payment' });

// Alert associations
Alert.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Alert.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// Telemedicine associations
Telemedicine.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Telemedicine.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });
Telemedicine.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });
Telemedicine.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
Telemedicine.hasMany(Prescription, { foreignKey: 'telemedicine_id', as: 'prescriptions' });
Telemedicine.hasMany(MedicalRecord, { foreignKey: 'telemedicine_id', as: 'medicalRecords' });

// Prescription associations
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });
Prescription.belongsTo(Facility, { foreignKey: 'pharmacy_id', as: 'pharmacy' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
Prescription.belongsTo(Telemedicine, { foreignKey: 'telemedicine_id', as: 'telemedicineSession' });

// MedicalRecord associations
MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });
MedicalRecord.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
MedicalRecord.belongsTo(Telemedicine, { foreignKey: 'telemedicine_id', as: 'telemedicineSession' });

// Payment associations
Payment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Payment.belongsTo(Facility, { foreignKey: 'facility_id', as: 'facility' });
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
Payment.belongsTo(User, { foreignKey: 'processed_by', as: 'processedBy' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export de tous les modèles et de la connexion
module.exports = {
  sequelize,
  User,
  Facility,
  Patient,
  Appointment,
  Alert,
  Telemedicine,
  Prescription,
  MedicalRecord,
  Payment,
  Notification
};

// Fonction utilitaire pour synchroniser tous les modèles
const syncAllModels = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Tous les modèles ont été synchronisés avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    return false;
  }
};

// Fonction pour créer les données de test
const seedDatabase = async () => {
  try {
    // Créer un super admin par défaut
    const adminExists = await User.findOne({ 
      where: { role: 'super_admin' },
      paranoid: false 
    });
    
    if (!adminExists) {
      const superAdmin = await User.create({
        email: 'admin@wafya.ga',
        password: 'Admin123!',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin',
        is_verified: true,
        phone: '+24101234567'
      });
      
      console.log('✅ Super admin créé:', superAdmin.email);
    }
    
    console.log('✅ Base de données initialisée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    return false;
  }
};

module.exports.syncAllModels = syncAllModels;
module.exports.seedDatabase = seedDatabase;