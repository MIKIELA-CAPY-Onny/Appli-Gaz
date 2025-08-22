-- Seeder: Insertion des modules
-- Date: 2024-01-01
-- Description: Données de test pour les modules d'enseignement

INSERT INTO modules (course_id, teacher_id, name, description, coefficient, hours_total, hours_cm, hours_td, hours_tp, evaluation_type, is_active) VALUES
-- Modules pour INFO201 (POO) - Enseignant 1
(5, 1, 'Concepts de Base POO', 'Classes, objets, héritage', 1.5, 40, 20, 15, 5, 'mixed', TRUE),
(5, 1, 'Polymorphisme et Interfaces', 'Concepts avancés de POO', 1.0, 30, 15, 10, 5, 'mixed', TRUE),

-- Modules pour MATH201 (Algèbre) - Enseignant 2
(6, 2, 'Espaces Vectoriels', 'Théorie des espaces vectoriels', 1.5, 35, 25, 10, 0, 'exam', TRUE),
(6, 2, 'Matrices et Déterminants', 'Calcul matriciel', 1.0, 25, 15, 10, 0, 'mixed', TRUE),

-- Modules pour INFO202 (Structures de Données) - Enseignant 1
(7, 1, 'Listes et Piles', 'Structures de données linéaires', 1.0, 30, 15, 10, 5, 'mixed', TRUE),
(7, 1, 'Arbres et Graphes', 'Structures de données hiérarchiques', 1.5, 35, 15, 10, 10, 'mixed', TRUE),

-- Modules pour MATH202 (Statistiques) - Enseignant 3
(8, 3, 'Statistiques Descriptives', 'Analyse descriptive des données', 1.0, 25, 15, 10, 0, 'continuous', TRUE),
(8, 3, 'Probabilités de Base', 'Introduction aux probabilités', 1.0, 25, 15, 10, 0, 'exam', TRUE),

-- Modules pour INFO301 (Bases de Données) - Enseignant 4
(9, 4, 'Modélisation de Données', 'Conception de bases de données', 1.5, 30, 15, 10, 5, 'mixed', TRUE),
(9, 4, 'SQL et Requêtes', 'Langage SQL et optimisation', 1.0, 25, 10, 10, 5, 'mixed', TRUE),

-- Modules pour INFO302 (Développement Web) - Enseignant 1
(10, 1, 'Frontend Development', 'HTML, CSS, JavaScript', 1.0, 35, 10, 15, 10, 'continuous', TRUE),
(10, 1, 'Backend Development', 'Serveurs et APIs', 1.5, 35, 15, 10, 10, 'mixed', TRUE);