-- Migration: Création de la table absences
-- Date: 2024-01-01
-- Description: Table des absences et retards des étudiants

CREATE TABLE IF NOT EXISTS absences (
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
    INDEX idx_type (type),
    INDEX idx_absences_student_date (student_id, absence_date)
);