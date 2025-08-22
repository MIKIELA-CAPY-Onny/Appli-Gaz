/**
 * Script de configuration de la base de données
 * Exécute les migrations et les seeders
 */

const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');

/**
 * Exécuter les migrations dans l'ordre
 */
async function runMigrations() {
    try {
        console.log('🔄 Exécution des migrations...');
        
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort(); // Tri par nom de fichier pour garantir l'ordre

        for (const file of migrationFiles) {
            console.log(`📄 Exécution de la migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            await db.executeSqlFile(content);
        }

        console.log('✅ Toutes les migrations ont été exécutées avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution des migrations:', error.message);
        throw error;
    }
}

/**
 * Exécuter les seeders dans l'ordre
 */
async function runSeeders() {
    try {
        console.log('🌱 Exécution des seeders...');
        
        const seedersDir = path.join(__dirname, 'seeders');
        const files = await fs.readdir(seedersDir);
        const seederFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort(); // Tri par nom de fichier pour garantir l'ordre

        for (const file of seederFiles) {
            console.log(`🌱 Exécution du seeder: ${file}`);
            const filePath = path.join(seedersDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            await db.executeSqlFile(content);
        }

        console.log('✅ Tous les seeders ont été exécutés avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution des seeders:', error.message);
        throw error;
    }
}

/**
 * Créer les vues utiles
 */
async function createViews() {
    try {
        console.log('👁️ Création des vues...');

        // Vue pour obtenir les informations complètes des étudiants
        const studentDetailsView = `
            CREATE OR REPLACE VIEW student_details AS
            SELECT 
                s.id,
                s.student_number,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                s.level,
                s.academic_year,
                s.enrollment_date,
                s.status,
                u.is_active
            FROM students s
            JOIN users u ON s.user_id = u.id;
        `;

        // Vue pour obtenir les informations complètes des enseignants
        const teacherDetailsView = `
            CREATE OR REPLACE VIEW teacher_details AS
            SELECT 
                t.id,
                t.employee_number,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                t.department,
                t.specialization,
                t.hire_date,
                t.status,
                u.is_active
            FROM teachers t
            JOIN users u ON t.user_id = u.id;
        `;

        // Vue pour les moyennes par module
        const moduleAveragesView = `
            CREATE OR REPLACE VIEW module_averages AS
            SELECT 
                g.student_id,
                g.module_id,
                m.name as module_name,
                m.coefficient,
                AVG(g.grade * g.coefficient / g.max_grade * 20) as average_grade,
                COUNT(g.id) as grade_count
            FROM grades g
            JOIN modules m ON g.module_id = m.id
            GROUP BY g.student_id, g.module_id;
        `;

        await db.execute(studentDetailsView);
        await db.execute(teacherDetailsView);
        await db.execute(moduleAveragesView);

        console.log('✅ Vues créées avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de la création des vues:', error.message);
        throw error;
    }
}

/**
 * Vérifier si la base de données existe
 */
async function checkDatabase() {
    try {
        console.log('🔍 Vérification de la base de données...');
        
        const [rows] = await db.execute(
            'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
            [db.config.database]
        );

        if (rows.length === 0) {
            console.log('📦 Création de la base de données...');
            await db.execute(`CREATE DATABASE IF NOT EXISTS ${db.config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log('✅ Base de données créée');
        } else {
            console.log('✅ Base de données trouvée');
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification de la base de données:', error.message);
        throw error;
    }
}

/**
 * Créer les index pour optimiser les performances
 */
async function createIndexes() {
    try {
        console.log('📊 Création des index d\'optimisation...');

        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active)',
            'CREATE INDEX IF NOT EXISTS idx_students_level_year ON students(level, academic_year)',
            'CREATE INDEX IF NOT EXISTS idx_grades_student_date ON grades(student_id, created_at)',
            'CREATE INDEX IF NOT EXISTS idx_absences_student_date ON absences(student_id, absence_date)',
            'CREATE INDEX IF NOT EXISTS idx_enrollments_year ON enrollments(academic_year)',
            'CREATE INDEX IF NOT EXISTS idx_modules_teacher ON modules(teacher_id, is_active)',
            'CREATE INDEX IF NOT EXISTS idx_courses_level_semester ON courses(level, semester, academic_year)'
        ];

        for (const indexQuery of indexes) {
            await db.execute(indexQuery);
        }

        console.log('✅ Index créés avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de la création des index:', error.message);
        throw error;
    }
}

/**
 * Fonction principale de setup
 */
async function setupDatabase() {
    try {
        console.log('🚀 Début de la configuration de la base de données...\n');

        // Tester la connexion
        const isConnected = await db.testConnection();
        if (!isConnected) {
            throw new Error('Impossible de se connecter à la base de données');
        }

        // Vérifier/créer la base de données
        await checkDatabase();

        // Exécuter les migrations
        await runMigrations();

        // Créer les vues
        await createViews();

        // Créer les index
        await createIndexes();

        // Exécuter les seeders
        await runSeeders();

        console.log('\n🎉 Configuration de la base de données terminée avec succès!');
        console.log('📋 Résumé:');
        console.log('  - Migrations exécutées ✅');
        console.log('  - Vues créées ✅');
        console.log('  - Index créés ✅');
        console.log('  - Données de test insérées ✅');
        console.log('\n📝 Comptes de test créés:');
        console.log('  - Admin: admin@university.com / password123');
        console.log('  - Enseignant: teacher1@university.com / password123');
        console.log('  - Étudiant: student1@university.com / password123');

    } catch (error) {
        console.error('\n💥 Erreur lors de la configuration:', error.message);
        process.exit(1);
    } finally {
        await db.closePool();
    }
}

/**
 * Réinitialiser la base de données (DROP et recréation)
 */
async function resetDatabase() {
    try {
        console.log('⚠️ Réinitialisation de la base de données...');
        
        // Supprimer la base de données
        await db.execute(`DROP DATABASE IF EXISTS ${db.config.database}`);
        console.log('🗑️ Base de données supprimée');

        // Recréer la base de données
        await db.execute(`CREATE DATABASE ${db.config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('📦 Base de données recréée');

        // Relancer la configuration
        await setupDatabase();

    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error.message);
        process.exit(1);
    }
}

/**
 * Afficher l'aide
 */
function showHelp() {
    console.log(`
📚 Script de configuration de la base de données

Usage: node setup.js [option]

Options:
  --help, -h     Afficher cette aide
  --reset, -r    Réinitialiser complètement la base de données
  --migrate, -m  Exécuter uniquement les migrations
  --seed, -s     Exécuter uniquement les seeders

Exemples:
  node setup.js              # Configuration complète
  node setup.js --reset      # Réinitialisation complète
  node setup.js --migrate    # Migrations uniquement
  node setup.js --seed       # Seeders uniquement
    `);
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

if (args.includes('--reset') || args.includes('-r')) {
    resetDatabase();
} else if (args.includes('--migrate') || args.includes('-m')) {
    (async () => {
        try {
            await db.testConnection();
            await runMigrations();
            await createViews();
            await createIndexes();
            console.log('✅ Migrations terminées');
        } catch (error) {
            console.error('❌ Erreur:', error.message);
            process.exit(1);
        } finally {
            await db.closePool();
        }
    })();
} else if (args.includes('--seed') || args.includes('-s')) {
    (async () => {
        try {
            await db.testConnection();
            await runSeeders();
            console.log('✅ Seeders terminés');
        } catch (error) {
            console.error('❌ Erreur:', error.message);
            process.exit(1);
        } finally {
            await db.closePool();
        }
    })();
} else {
    setupDatabase();
}

module.exports = {
    setupDatabase,
    resetDatabase,
    runMigrations,
    runSeeders,
    createViews,
    createIndexes
};