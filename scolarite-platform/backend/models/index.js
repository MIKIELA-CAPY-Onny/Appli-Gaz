const { sequelize } = require('../config/database');

// Import des modèles
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Admin = require('./Admin');
const Course = require('./Course');
const Module = require('./Module');
const Enrollment = require('./Enrollment');
const Grade = require('./Grade');
const Absence = require('./Absence');

// Définition des associations

// User - Student (One-to-One)
User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Teacher (One-to-One)
User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacher' });
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Admin (One-to-One)
User.hasOne(Admin, { foreignKey: 'user_id', as: 'admin' });
Admin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Course - Module (One-to-Many)
Course.hasMany(Module, { foreignKey: 'course_id', as: 'modules' });
Module.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Teacher - Course (One-to-Many)
Teacher.hasMany(Course, { foreignKey: 'teacher_id', as: 'courses' });
Course.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });

// Student - Enrollment (One-to-Many)
Student.hasMany(Enrollment, { foreignKey: 'student_id', as: 'enrollments' });
Enrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Course - Enrollment (One-to-Many)
Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Student - Grade (One-to-Many)
Student.hasMany(Grade, { foreignKey: 'student_id', as: 'grades' });
Grade.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Course - Grade (One-to-Many)
Course.hasMany(Grade, { foreignKey: 'course_id', as: 'grades' });
Grade.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Student - Absence (One-to-Many)
Student.hasMany(Absence, { foreignKey: 'student_id', as: 'absences' });
Absence.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Course - Absence (One-to-Many)
Course.hasMany(Absence, { foreignKey: 'course_id', as: 'absences' });
Absence.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Module - Grade (One-to-Many)
Module.hasMany(Grade, { foreignKey: 'module_id', as: 'grades' });
Grade.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

module.exports = {
  sequelize,
  User,
  Student,
  Teacher,
  Admin,
  Course,
  Module,
  Enrollment,
  Grade,
  Absence
};