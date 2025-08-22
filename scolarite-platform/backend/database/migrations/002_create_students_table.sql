-- Migration: Création de la table students
-- Date: 2024-01-01
-- Description: Table des informations spécifiques aux étudiants

CREATE TABLE IF NOT EXISTS students (
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
    INDEX idx_academic_year (academic_year),
    INDEX idx_students_level_year (level, academic_year)
);