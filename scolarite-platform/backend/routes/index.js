/**
 * Routes principales de l'API
 * Centralise toutes les routes et endpoints
 */

const express = require('express');
const router = express.Router();

// Import des routes spécifiques
const authRoutes = require('./auth');
const studentRoutes = require('./students');
const teacherRoutes = require('./teachers');
const courseRoutes = require('./courses');
const moduleRoutes = require('./modules');
const gradeRoutes = require('./grades');
const absenceRoutes = require('./absences');
const enrollmentRoutes = require('./enrollments');

// Middleware global pour les routes API
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const { logRoleAccess } = require('../middleware/roleCheck');

// Route de base pour vérifier que l'API fonctionne
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API GestiScolarité - Version 1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/v1/auth',
            students: '/api/v1/students',
            teachers: '/api/v1/teachers',
            courses: '/api/v1/courses',
            modules: '/api/v1/modules',
            grades: '/api/v1/grades',
            absences: '/api/v1/absences',
            enrollments: '/api/v1/enrollments'
        },
        documentation: '/api/v1/docs'
    });
});

// Route de vérification de santé de l'API
router.get('/health', async (req, res) => {
    try {
        const db = require('../config/database');
        
        // Tester la connexion à la base de données
        const isDbConnected = await db.testConnection();
        
        // Obtenir des informations sur le système
        const healthData = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            database: {
                connected: isDbConnected,
                host: db.config.host,
                database: db.config.database
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            poolInfo: db.getPoolInfo()
        };

        const statusCode = isDbConnected ? 200 : 503;
        
        res.status(statusCode).json({
            success: isDbConnected,
            data: healthData
        });

    } catch (error) {
        console.error('Erreur lors de la vérification de santé:', error);
        res.status(503).json({
            success: false,
            message: 'Service indisponible',
            timestamp: new Date().toISOString()
        });
    }
});

// Route pour obtenir les métadonnées de l'API
router.get('/metadata', (req, res) => {
    res.json({
        success: true,
        data: {
            roles: ['admin', 'teacher', 'student'],
            levels: ['L1', 'L2', 'L3', 'M1', 'M2'],
            semesters: ['S1', 'S2'],
            gradeTypes: ['cc', 'exam', 'tp', 'project'],
            absenceTypes: ['absence', 'late', 'early_leave'],
            enrollmentStatus: ['enrolled', 'completed', 'failed', 'withdrawn'],
            studentStatus: ['active', 'suspended', 'graduated', 'dropped'],
            teacherStatus: ['active', 'inactive', 'retired'],
            evaluationTypes: ['exam', 'continuous', 'mixed'],
            departments: [
                'Informatique',
                'Mathématiques',
                'Physique',
                'Chimie',
                'Biologie',
                'Administration Générale',
                'Scolarité'
            ]
        }
    });
});

// Appliquer les middlewares globaux aux routes protégées
router.use(sanitizeInput.cleanStrings);
router.use(sanitizeInput.convertBooleans);

// Routes d'authentification (pas de protection requise)
router.use('/auth', authRoutes);

// Middleware d'authentification pour toutes les autres routes
router.use(requireAuth);
router.use(logRoleAccess);

// Routes protégées
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/grades', gradeRoutes);
router.use('/absences', absenceRoutes);
router.use('/enrollments', enrollmentRoutes);

// Route de documentation simple
router.get('/docs', (req, res) => {
    res.json({
        success: true,
        message: 'Documentation de l\'API GestiScolarité',
        data: {
            version: '1.0.0',
            baseUrl: '/api/v1',
            authentication: {
                type: 'Bearer Token (JWT)',
                loginEndpoint: 'POST /api/v1/auth/login',
                refreshEndpoint: 'POST /api/v1/auth/refresh'
            },
            endpoints: {
                auth: {
                    'POST /login': 'Connexion utilisateur',
                    'POST /refresh': 'Rafraîchir le token',
                    'POST /logout': 'Déconnexion',
                    'GET /profile': 'Profil utilisateur',
                    'PUT /profile': 'Mettre à jour le profil',
                    'POST /change-password': 'Changer le mot de passe'
                },
                students: {
                    'GET /': 'Liste des étudiants (pagination)',
                    'GET /:id': 'Détails d\'un étudiant',
                    'POST /': 'Créer un étudiant',
                    'PUT /:id': 'Mettre à jour un étudiant',
                    'DELETE /:id': 'Supprimer un étudiant',
                    'GET /:id/grades': 'Notes d\'un étudiant',
                    'GET /:id/absences': 'Absences d\'un étudiant',
                    'GET /:id/report': 'Bulletin d\'un étudiant'
                },
                teachers: {
                    'GET /': 'Liste des enseignants',
                    'GET /:id': 'Détails d\'un enseignant',
                    'POST /': 'Créer un enseignant',
                    'PUT /:id': 'Mettre à jour un enseignant',
                    'DELETE /:id': 'Supprimer un enseignant',
                    'GET /:id/modules': 'Modules d\'un enseignant',
                    'GET /:id/students': 'Étudiants d\'un enseignant'
                },
                courses: {
                    'GET /': 'Liste des cours',
                    'GET /:id': 'Détails d\'un cours',
                    'POST /': 'Créer un cours',
                    'PUT /:id': 'Mettre à jour un cours',
                    'DELETE /:id': 'Supprimer un cours',
                    'GET /:id/modules': 'Modules d\'un cours',
                    'GET /:id/students': 'Étudiants inscrits'
                },
                modules: {
                    'GET /': 'Liste des modules',
                    'GET /:id': 'Détails d\'un module',
                    'POST /': 'Créer un module',
                    'PUT /:id': 'Mettre à jour un module',
                    'DELETE /:id': 'Supprimer un module',
                    'GET /:id/students': 'Étudiants d\'un module',
                    'GET /:id/grades': 'Notes d\'un module'
                },
                grades: {
                    'GET /': 'Liste des notes',
                    'GET /:id': 'Détails d\'une note',
                    'POST /': 'Créer une note',
                    'PUT /:id': 'Mettre à jour une note',
                    'DELETE /:id': 'Supprimer une note',
                    'POST /bulk': 'Saisie en masse',
                    'GET /student/:student_id': 'Notes d\'un étudiant',
                    'GET /module/:module_id': 'Notes d\'un module'
                },
                absences: {
                    'GET /': 'Liste des absences',
                    'GET /:id': 'Détails d\'une absence',
                    'POST /': 'Enregistrer une absence',
                    'PUT /:id': 'Mettre à jour une absence',
                    'DELETE /:id': 'Supprimer une absence',
                    'POST /bulk': 'Enregistrement en masse',
                    'POST /:id/justify': 'Justifier une absence'
                },
                enrollments: {
                    'GET /': 'Liste des inscriptions',
                    'GET /:id': 'Détails d\'une inscription',
                    'POST /': 'Créer une inscription',
                    'PUT /:id': 'Mettre à jour une inscription',
                    'DELETE /:id': 'Supprimer une inscription',
                    'POST /bulk': 'Inscription en masse'
                }
            },
            queryParameters: {
                pagination: 'page, limit',
                filtering: 'search, level, semester, academic_year, status',
                sorting: 'sort, order (asc|desc)'
            },
            responseFormat: {
                success: {
                    success: true,
                    data: 'Object|Array',
                    message: 'string (optional)',
                    pagination: 'Object (for lists)'
                },
                error: {
                    success: false,
                    message: 'string',
                    timestamp: 'ISO string',
                    path: 'string',
                    method: 'string'
                }
            }
        }
    });
});

module.exports = router;