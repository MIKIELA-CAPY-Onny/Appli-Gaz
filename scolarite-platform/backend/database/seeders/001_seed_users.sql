-- Seeder: Insertion des utilisateurs de test
-- Date: 2024-01-01
-- Description: Données de test pour les utilisateurs (admin, enseignants, étudiants)

-- Insertion des utilisateurs administrateurs
INSERT INTO users (email, password, first_name, last_name, phone, address, role, is_active) VALUES
('admin@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Admin', 'Principal', '+33123456789', '123 Rue de l\'Université, Paris', 'admin', TRUE),
('admin2@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Marie', 'Dupont', '+33123456790', '456 Avenue des Écoles, Lyon', 'admin', TRUE);

-- Insertion des utilisateurs enseignants
INSERT INTO users (email, password, first_name, last_name, phone, address, role, is_active) VALUES
('teacher1@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Pierre', 'Martin', '+33123456791', '789 Rue des Professeurs, Paris', 'teacher', TRUE),
('teacher2@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Sophie', 'Bernard', '+33123456792', '321 Boulevard de la Science, Marseille', 'teacher', TRUE),
('teacher3@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Jean', 'Moreau', '+33123456793', '654 Allée des Mathématiques, Toulouse', 'teacher', TRUE),
('teacher4@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Isabelle', 'Roux', '+33123456794', '987 Rue de l\'Informatique, Lille', 'teacher', TRUE);

-- Insertion des utilisateurs étudiants
INSERT INTO users (email, password, first_name, last_name, phone, address, role, is_active) VALUES
('student1@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Lucas', 'Petit', '+33123456795', '111 Rue des Étudiants, Paris', 'student', TRUE),
('student2@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Emma', 'Durand', '+33123456796', '222 Avenue de la Jeunesse, Lyon', 'student', TRUE),
('student3@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Hugo', 'Leroy', '+33123456797', '333 Boulevard des Campus, Marseille', 'student', TRUE),
('student4@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Chloé', 'Garnier', '+33123456798', '444 Rue de l\'Apprentissage, Toulouse', 'student', TRUE),
('student5@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Nathan', 'Rousseau', '+33123456799', '555 Place des Études, Lille', 'student', TRUE),
('student6@university.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xBw.Hh.4e', 'Léa', 'Vincent', '+33123456800', '666 Impasse du Savoir, Nice', 'student', TRUE);

-- Mot de passe pour tous les comptes de test: "password123"