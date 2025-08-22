-- Migration: Création de la table courses
-- Date: 2024-01-01
-- Description: Table des cours/matières

CREATE TABLE IF NOT EXISTS courses (
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