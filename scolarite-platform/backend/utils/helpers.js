// Fonctions utilitaires communes

// Générer un numéro d'étudiant unique
const generateStudentNumber = (academicYear, level, sequence) => {
  const year = academicYear.toString().slice(-2);
  const levelCode = level.replace(/\D/g, '');
  const seq = sequence.toString().padStart(4, '0');
  return `${year}${levelCode}${seq}`;
};

// Générer un numéro d'employé unique
const generateEmployeeNumber = (department, position, sequence) => {
  const deptCode = department.substring(0, 3).toUpperCase();
  const posCode = position.substring(0, 2).toUpperCase();
  const seq = sequence.toString().padStart(3, '0');
  return `${deptCode}${posCode}${seq}`;
};

// Générer un code de cours unique
const generateCourseCode = (level, semester, subject, sequence) => {
  const levelCode = level.replace(/\D/g, '');
  const semCode = semester.replace(/\D/g, '');
  const subjCode = subject.substring(0, 3).toUpperCase();
  const seq = sequence.toString().padStart(2, '0');
  return `${levelCode}${semCode}${subjCode}${seq}`;
};

// Formater une date pour l'affichage
const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

// Formater une date et heure
const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  switch (format) {
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'YYYY-MM-DD HH:mm:ss':
      const seconds = d.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
};

// Calculer l'âge à partir d'une date de naissance
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Formater un numéro de téléphone
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater selon la longueur
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.length === 9) {
    return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone; // Retourner tel quel si le format n'est pas reconnu
};

// Valider un numéro de téléphone
const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 15;
};

// Formater un montant monétaire
const formatCurrency = (amount, currency = 'EUR', locale = 'fr-FR') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Formater un pourcentage
const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '';
  
  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Générer un slug à partir d'un texte
const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ûüù]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Tronquer un texte à une longueur donnée
const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Capitaliser la première lettre de chaque mot
const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Générer un identifiant unique court
const generateShortId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// Vérifier si une chaîne est un email valide
const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Vérifier si une chaîne est une URL valide
const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Formater une taille de fichier
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Générer une couleur aléatoire
const generateRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

// Vérifier si un objet est vide
const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Nettoyer un objet en supprimant les propriétés vides
const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  });
  
  return cleaned;
};

module.exports = {
  generateStudentNumber,
  generateEmployeeNumber,
  generateCourseCode,
  formatDate,
  formatDateTime,
  calculateAge,
  formatPhoneNumber,
  isValidPhoneNumber,
  formatCurrency,
  formatPercentage,
  generateSlug,
  truncateText,
  capitalizeWords,
  generateShortId,
  isValidEmail,
  isValidUrl,
  formatFileSize,
  generateRandomColor,
  isEmpty,
  cleanObject
};