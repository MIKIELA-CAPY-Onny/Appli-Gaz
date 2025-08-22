/**
 * Index des modèles de données
 * Centralise tous les modèles pour faciliter les imports
 */

const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Admin = require('./Admin');
const Course = require('./Course');
const Module = require('./Module');
const Enrollment = require('./Enrollment');
const Grade = require('./Grade');
const Absence = require('./Absence');

module.exports = {
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