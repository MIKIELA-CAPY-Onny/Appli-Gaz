# Plateforme de Scolarité

Une application web complète pour la gestion de la scolarité des étudiants, enseignants et administrateurs.

## Fonctionnalités

- **Gestion des utilisateurs** : Étudiants, enseignants, administrateurs
- **Gestion des cours** : Création, modification, suppression des cours
- **Gestion des modules** : Organisation des cours par modules
- **Inscriptions** : Gestion des inscriptions aux cours
- **Notes** : Système de notation et évaluation
- **Absences** : Suivi des présences et absences
- **Authentification** : Système de connexion sécurisé avec JWT

## Structure du projet

```
scolarite-platform/
├── backend/          # API Node.js/Express
├── frontend/         # Interface utilisateur (à développer)
└── docs/            # Documentation
```

## Installation

### Prérequis

- Node.js (v16 ou supérieur)
- MongoDB
- npm ou yarn

### Configuration

1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Copier `.env.example` vers `.env` et configurer les variables
4. Démarrer la base de données MongoDB
5. Lancer l'application : `npm run dev`

## API Endpoints

- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur
- `GET /api/students` - Liste des étudiants
- `GET /api/courses` - Liste des cours
- `GET /api/grades` - Notes des étudiants
- Et plus encore...

## Technologies utilisées

- **Backend** : Node.js, Express.js, MongoDB, Mongoose
- **Authentification** : JWT, bcrypt
- **Validation** : Joi, express-validator
- **Base de données** : MongoDB avec Mongoose ODM

## Licence

MIT