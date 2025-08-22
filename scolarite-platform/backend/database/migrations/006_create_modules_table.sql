-- Migration: Création de la table modules
-- Date: 2024-01-01
-- Description: Table des modules/unités d'enseignement

CREATE TABLE IF NOT EXISTS modules (
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