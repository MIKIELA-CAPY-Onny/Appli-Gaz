-- Seeder: Insertion des cours
-- Date: 2024-01-01
-- Description: Données de test pour les cours

INSERT INTO courses (code, name, description, credits, level, semester, academic_year, is_active) VALUES
-- Cours de L1
('INFO101', 'Introduction à l\'Informatique', 'Concepts de base de l\'informatique et de la programmation', 6, 'L1', 'S1', '2023-2024', TRUE),
('MATH101', 'Mathématiques Fondamentales', 'Algèbre et analyse de base', 6, 'L1', 'S1', '2023-2024', TRUE),
('INFO102', 'Programmation Structurée', 'Apprentissage de la programmation en C', 6, 'L1', 'S2', '2023-2024', TRUE),
('MATH102', 'Analyse Mathématique', 'Fonctions, limites et dérivées', 6, 'L1', 'S2', '2023-2024', TRUE),

-- Cours de L2
('INFO201', 'Programmation Orientée Objet', 'Concepts de POO avec Java', 6, 'L2', 'S1', '2023-2024', TRUE),
('MATH201', 'Algèbre Linéaire', 'Espaces vectoriels et matrices', 6, 'L2', 'S1', '2023-2024', TRUE),
('INFO202', 'Structures de Données', 'Listes, arbres, graphes et algorithmes', 6, 'L2', 'S2', '2023-2024', TRUE),
('MATH202', 'Statistiques Descriptives', 'Introduction aux statistiques', 4, 'L2', 'S2', '2023-2024', TRUE),

-- Cours de L3
('INFO301', 'Bases de Données', 'Conception et gestion de bases de données', 6, 'L3', 'S1', '2023-2024', TRUE),
('INFO302', 'Développement Web', 'Technologies web modernes', 6, 'L3', 'S2', '2023-2024', TRUE),
('MATH301', 'Probabilités', 'Théorie des probabilités', 4, 'L3', 'S1', '2023-2024', TRUE),

-- Cours de M1
('INFO401', 'Intelligence Artificielle', 'Introduction à l\'IA et machine learning', 6, 'M1', 'S1', '2023-2024', TRUE),
('INFO402', 'Sécurité Informatique', 'Cryptographie et sécurité des systèmes', 6, 'M1', 'S2', '2023-2024', TRUE),

-- Cours de M2
('INFO501', 'Projet de Recherche', 'Projet de fin d\'études', 12, 'M2', 'S1', '2023-2024', TRUE);