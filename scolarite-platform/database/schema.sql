-- Schéma de base de données pour la plateforme de scolarité
-- Création de la base de données
CREATE DATABASE IF NOT EXISTS scolarite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scolarite_db;

-- Table des utilisateurs (base pour tous les types d'utilisateurs)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Table des étudiants
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    birth_date DATE,
    birth_place VARCHAR(100),
    nationality VARCHAR(50),
    level ENUM('L1', 'L2', 'L3', 'M1', 'M2') NOT NULL,
    academic_year VARCHAR(9) NOT NULL, -- Format: 2023-2024
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'suspended', 'graduated', 'dropped') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_number (student_number),
    INDEX idx_level (level),
    INDEX idx_academic_year (academic_year)
);

-- Table des enseignants
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    hire_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'retired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employee_number (employee_number),
    INDEX idx_department (department)
);

-- Table des administrateurs
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    permissions JSON, -- Permissions spécifiques sous format JSON
    hire_date DATE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employee_number (employee_number)
);

-- Table des cours
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INT NOT NULL DEFAULT 3,
    level ENUM('L1', 'L2', 'L3', 'M1', 'M2') NOT NULL,
    semester ENUM('S1', 'S2') NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_level_semester (level, semester),
    INDEX idx_academic_year (academic_year)
);

-- Table des modules (unités d'enseignement)
CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    coefficient DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    hours_total INT NOT NULL,
    hours_cm INT DEFAULT 0, -- Cours magistraux
    hours_td INT DEFAULT 0, -- Travaux dirigés
    hours_tp INT DEFAULT 0, -- Travaux pratiques
    evaluation_type ENUM('exam', 'continuous', 'mixed') DEFAULT 'mixed',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
    INDEX idx_course_id (course_id),
    INDEX idx_teacher_id (teacher_id)
);

-- Table des inscriptions
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('enrolled', 'completed', 'failed', 'withdrawn') DEFAULT 'enrolled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id, academic_year),
    INDEX idx_student_course (student_id, course_id),
    INDEX idx_academic_year (academic_year)
);

-- Table des notes
CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    module_id INT NOT NULL,
    grade_type ENUM('cc', 'exam', 'tp', 'project') NOT NULL, -- cc = contrôle continu
    grade DECIMAL(4,2) NOT NULL,
    max_grade DECIMAL(4,2) NOT NULL DEFAULT 20.00,
    coefficient DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    exam_date DATE,
    comments TEXT,
    created_by INT NOT NULL, -- ID de l'enseignant qui a saisi la note
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES teachers(id) ON DELETE RESTRICT,
    INDEX idx_student_module (student_id, module_id),
    INDEX idx_grade_type (grade_type),
    INDEX idx_exam_date (exam_date),
    CONSTRAINT chk_grade_range CHECK (grade >= 0 AND grade <= max_grade)
);

-- Table des absences
CREATE TABLE absences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    module_id INT NOT NULL,
    absence_date DATE NOT NULL,
    absence_time TIME,
    duration_hours DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    type ENUM('absence', 'late', 'early_leave') NOT NULL,
    is_justified BOOLEAN DEFAULT FALSE,
    justification_document VARCHAR(255),
    reason TEXT,
    recorded_by INT NOT NULL, -- ID de l'enseignant qui a enregistré l'absence
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES teachers(id) ON DELETE RESTRICT,
    INDEX idx_student_module (student_id, module_id),
    INDEX idx_absence_date (absence_date),
    INDEX idx_type (type)
);

-- Table des sessions (pour la gestion des connexions)
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Vues utiles
-- Vue pour obtenir les informations complètes des étudiants
CREATE VIEW student_details AS
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

-- Vue pour obtenir les informations complètes des enseignants
CREATE VIEW teacher_details AS
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

-- Vue pour les moyennes par module
CREATE VIEW module_averages AS
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

-- Index pour optimiser les performances
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_students_level_year ON students(level, academic_year);
CREATE INDEX idx_grades_student_date ON grades(student_id, created_at);
CREATE INDEX idx_absences_student_date ON absences(student_id, absence_date);