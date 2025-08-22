-- Migration: Création de la table grades
-- Date: 2024-01-01
-- Description: Table des notes des étudiants

CREATE TABLE IF NOT EXISTS grades (
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
    INDEX idx_grades_student_date (student_id, created_at),
    CONSTRAINT chk_grade_range CHECK (grade >= 0 AND grade <= max_grade)
);