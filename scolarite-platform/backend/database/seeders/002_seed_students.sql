-- Seeder: Insertion des données spécifiques aux étudiants
-- Date: 2024-01-01
-- Description: Données de test pour les étudiants

-- Insertion des administrateurs
INSERT INTO admins (user_id, employee_number, department, permissions, hire_date, status) VALUES
(1, 'ADM001', 'Administration Générale', '{"users": ["create", "read", "update", "delete"], "students": ["create", "read", "update", "delete"], "teachers": ["create", "read", "update", "delete"], "courses": ["create", "read", "update", "delete"], "grades": ["read"], "reports": ["generate"]}', '2020-01-15', 'active'),
(2, 'ADM002', 'Scolarité', '{"students": ["create", "read", "update", "delete"], "courses": ["create", "read", "update", "delete"], "enrollments": ["create", "read", "update", "delete"], "grades": ["read"], "reports": ["generate"]}', '2021-03-10', 'active');

-- Insertion des enseignants
INSERT INTO teachers (user_id, employee_number, department, specialization, hire_date, status) VALUES
(3, 'PROF001', 'Informatique', 'Programmation et Algorithmes', '2019-09-01', 'active'),
(4, 'PROF002', 'Mathématiques', 'Analyse et Algèbre', '2018-09-01', 'active'),
(5, 'PROF003', 'Mathématiques', 'Statistiques et Probabilités', '2020-09-01', 'active'),
(6, 'PROF004', 'Informatique', 'Bases de Données et Systèmes', '2021-09-01', 'active');

-- Insertion des étudiants
INSERT INTO students (user_id, student_number, birth_date, birth_place, nationality, level, academic_year, enrollment_date, status) VALUES
(7, 'ETU2024001', '2003-05-15', 'Paris', 'Française', 'L2', '2023-2024', '2022-09-15', 'active'),
(8, 'ETU2024002', '2003-08-22', 'Lyon', 'Française', 'L2', '2023-2024', '2022-09-15', 'active'),
(9, 'ETU2024003', '2002-12-10', 'Marseille', 'Française', 'L3', '2023-2024', '2021-09-15', 'active'),
(10, 'ETU2024004', '2003-03-18', 'Toulouse', 'Française', 'L2', '2023-2024', '2022-09-15', 'active'),
(11, 'ETU2024005', '2004-01-25', 'Lille', 'Française', 'L1', '2023-2024', '2023-09-15', 'active'),
(12, 'ETU2024006', '2003-07-08', 'Nice', 'Française', 'L2', '2023-2024', '2022-09-15', 'active');