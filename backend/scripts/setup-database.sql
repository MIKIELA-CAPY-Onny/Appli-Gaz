-- Création de la base de données
CREATE DATABASE IF NOT EXISTS gestion_scolarite;
USE gestion_scolarite;

-- Table des utilisateurs (administrateurs, enseignants, étudiants)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('admin', 'enseignant', 'etudiant') NOT NULL,
    date_naissance DATE,
    telephone VARCHAR(20),
    adresse TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des promotions/années académiques
CREATE TABLE IF NOT EXISTS promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    annee_debut INT NOT NULL,
    annee_fin INT NOT NULL,
    statut ENUM('active', 'terminee', 'preparation') DEFAULT 'preparation',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des modules/cours
CREATE TABLE IF NOT EXISTS modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    credits INT DEFAULT 0,
    coefficient FLOAT DEFAULT 1.0,
    enseignant_id INT,
    promotion_id INT,
    statut ENUM('actif', 'inactif') DEFAULT 'actif',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enseignant_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);

-- Table des inscriptions (étudiants aux modules)
CREATE TABLE IF NOT EXISTS inscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    etudiant_id INT NOT NULL,
    module_id INT NOT NULL,
    promotion_id INT NOT NULL,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('inscrit', 'abandonne', 'termine') DEFAULT 'inscrit',
    FOREIGN KEY (etudiant_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_inscription (etudiant_id, module_id, promotion_id)
);

-- Table des notes
CREATE TABLE IF NOT EXISTS notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    etudiant_id INT NOT NULL,
    module_id INT NOT NULL,
    promotion_id INT NOT NULL,
    note FLOAT NOT NULL CHECK (note >= 0 AND note <= 20),
    type_evaluation ENUM('controle', 'examen', 'tp', 'projet') DEFAULT 'controle',
    coefficient FLOAT DEFAULT 1.0,
    commentaire TEXT,
    date_evaluation DATE NOT NULL,
    date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);

-- Table des absences
CREATE TABLE IF NOT EXISTS absences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    etudiant_id INT NOT NULL,
    module_id INT NOT NULL,
    promotion_id INT NOT NULL,
    date_absence DATE NOT NULL,
    type ENUM('absence', 'retard') DEFAULT 'absence',
    duree_retard_minutes INT DEFAULT 0,
    motif TEXT,
    justifiee BOOLEAN DEFAULT FALSE,
    justificatif TEXT,
    date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);

-- Table des sessions de cours
CREATE TABLE IF NOT EXISTS sessions_cours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT NOT NULL,
    promotion_id INT NOT NULL,
    date_cours DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    salle VARCHAR(50),
    type_cours ENUM('cours', 'td', 'tp') DEFAULT 'cours',
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);

-- Insertion des données de base
INSERT INTO utilisateurs (matricule, nom, prenom, email, mot_de_passe, role) VALUES
('ADMIN001', 'Admin', 'Principal', 'admin@universite.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'admin'),
('ENS001', 'Dupont', 'Jean', 'jean.dupont@universite.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'enseignant'),
('ETU001', 'Martin', 'Sophie', 'sophie.martin@etudiant.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'etudiant');

INSERT INTO promotions (nom, annee_debut, annee_fin, statut) VALUES
('L1 Informatique 2023-2024', 2023, 2024, 'active'),
('L2 Informatique 2023-2024', 2023, 2024, 'active'),
('L3 Informatique 2023-2024', 2023, 2024, 'active');

INSERT INTO modules (code, nom, description, credits, coefficient, enseignant_id, promotion_id) VALUES
('INFO101', 'Introduction à l\'informatique', 'Bases de l\'informatique et algorithmique', 6, 1.0, 2, 1),
('INFO102', 'Programmation Java', 'Programmation orientée objet avec Java', 6, 1.5, 2, 1),
('INFO201', 'Bases de données', 'Conception et gestion de bases de données', 6, 1.5, 2, 2);

-- Insertion d'inscriptions
INSERT INTO inscriptions (etudiant_id, module_id, promotion_id) VALUES
(3, 1, 1),
(3, 2, 1);

-- Insertion de notes
INSERT INTO notes (etudiant_id, module_id, promotion_id, note, type_evaluation, date_evaluation) VALUES
(3, 1, 1, 15.5, 'controle', '2024-01-15'),
(3, 1, 1, 17.0, 'examen', '2024-01-30'),
(3, 2, 1, 16.5, 'controle', '2024-01-20');

-- Insertion d'absences
INSERT INTO absences (etudiant_id, module_id, promotion_id, date_absence, type, motif) VALUES
(3, 1, 1, '2024-01-10', 'absence', 'Maladie'),
(3, 2, 1, '2024-01-25', 'retard', 'Problème de transport');