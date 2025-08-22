# GestiScolarité - Plateforme de Gestion Universitaire

## Description
Plateforme web de gestion de scolarité permettant aux administrateurs et enseignants de gérer les informations liées aux étudiants, cours, notes et absences.

## Fonctionnalités

### Pour les Administrateurs
- Gestion des étudiants (ajout, modification, suppression)
- Gestion des cours et modules
- Gestion des inscriptions
- Génération de relevés de notes
- Gestion des enseignants

### Pour les Enseignants
- Saisie et consultation des notes
- Gestion des absences
- Consultation des listes d'étudiants

### Pour les Étudiants
- Consultation des notes
- Consultation des absences
- Accès au relevé de notes

## Technologies Utilisées

### Backend
- Node.js avec Express.js
- MySQL pour la base de données
- JWT pour l'authentification
- bcrypt pour le hachage des mots de passe

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5 pour le design responsive
- Vue.js pour l'interactivité

## Installation

1. Clonez le repository
```bash
git clone <url-du-repo>
cd scolarite-platform
```

2. Installez les dépendances
```bash
npm run install-all
```

3. Configurez la base de données
- Créez une base de données MySQL nommée `scolarite_db`
- Copiez `.env.example` vers `.env` et configurez vos paramètres
- Exécutez les migrations :
```bash
npm run setup-db
```

4. Lancez l'application
```bash
npm run dev
```

## Configuration

Créez un fichier `.env` à la racine avec :
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=scolarite_db
JWT_SECRET=votre_secret_jwt
PORT=3000
```

## Structure du Projet

```
scolarite-platform/
├── backend/           # API et logique serveur
├── frontend/          # Interface utilisateur
├── database/          # Migrations et seeders
└── docs/             # Documentation
```

## Utilisation

1. Accédez à `http://localhost:3000`
2. Connectez-vous avec les comptes par défaut :
   - Admin : admin@university.com / admin123
   - Enseignant : teacher@university.com / teacher123
   - Étudiant : student@university.com / student123

## Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commitez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT.