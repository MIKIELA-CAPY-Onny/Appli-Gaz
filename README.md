# 🎓 Plateforme de Gestion de Scolarité

Une application web complète pour la gestion administrative et académique d'un établissement d'enseignement supérieur, développée avec Vue.js 3 et Node.js.

## ✨ Fonctionnalités

### 🔐 Authentification et Gestion des Utilisateurs
- **Connexion sécurisée** avec JWT
- **Gestion des rôles** : Administrateur, Enseignant, Étudiant
- **Profils personnalisés** avec modification des informations
- **Changement de mot de passe** sécurisé

### 👥 Gestion des Étudiants
- **Inscription et gestion** des étudiants
- **Attribution des promotions** et modules
- **Suivi des statuts** (Actif, Inactif, Diplômé)
- **Recherche et filtres** avancés

### 📚 Gestion des Modules
- **Création et gestion** des modules de cours
- **Attribution des enseignants** et crédits
- **Planification des dates** de début/fin
- **Suivi des inscriptions** et statistiques

### 📝 Gestion des Notes
- **Saisie des notes** par module et étudiant
- **Types d'évaluation** : Contrôle, Examen, TP, Projet
- **Calcul automatique** des moyennes
- **Export des relevés** de notes

### 📊 Gestion des Inscriptions
- **Inscription des étudiants** aux modules
- **Suivi des statuts** d'inscription
- **Gestion des promotions** et années
- **Statistiques d'inscription**

### 🎯 Gestion des Promotions
- **Création des promotions** par année
- **Gestion des capacités** d'accueil
- **Suivi des étudiants** et modules
- **Statistiques académiques**

### 📈 Tableau de Bord
- **Vue d'ensemble** adaptée au rôle utilisateur
- **Statistiques en temps réel** avec graphiques
- **Activités récentes** et actions rapides
- **Indicateurs de performance**

## 🛠️ Technologies Utilisées

### Frontend
- **Vue.js 3** avec Composition API
- **Vue Router 4** pour la navigation
- **Pinia** pour la gestion d'état
- **Bootstrap 5** pour l'interface
- **Chart.js** pour les graphiques
- **Vite** pour le build et le développement

### Backend
- **Node.js** avec Express.js
- **MySQL** avec mysql2/promise
- **JWT** pour l'authentification
- **bcrypt** pour le hachage des mots de passe
- **Express Validator** pour la validation
- **Helmet** pour la sécurité

### Outils de Développement
- **ESLint** et **Prettier** pour la qualité du code
- **Nodemon** pour le rechargement automatique
- **CORS** pour la gestion des requêtes cross-origin

## 🚀 Installation

### Prérequis
- **Node.js** (version 16 ou supérieure)
- **MySQL** (version 8.0 ou supérieure)
- **npm** ou **yarn**

### 1. Cloner le Repository
```bash
git clone <url-du-repository>
cd gestion-scolarite
```

### 2. Configuration de la Base de Données
```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE gestion_scolarite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Importer le schéma
mysql -u root -p gestion_scolarite < backend/database.sql
```

### 3. Configuration des Variables d'Environnement
```bash
# Copier le fichier d'exemple
cp backend/.env.example backend/.env

# Éditer le fichier .env avec vos informations
nano backend/.env
```

Exemple de configuration :
```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=gestion_scolarite

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici
JWT_EXPIRES_IN=24h

# Configuration de sécurité
BCRYPT_ROUNDS=12
```

### 4. Installation des Dépendances
```bash
# Backend
cd backend
npm install

# Frontend (dans un autre terminal)
cd frontend
npm install
```

### 5. Démarrage de l'Application
```bash
# Backend (port 3000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000

## 👤 Comptes de Démonstration

### Administrateur
- **Email** : admin@universite.fr
- **Mot de passe** : admin123

### Enseignant
- **Email** : enseignant@universite.fr
- **Mot de passe** : enseignant123

### Étudiant
- **Email** : etudiant@universite.fr
- **Mot de passe** : etudiant123

## 📱 Utilisation

### 1. Connexion
- Accédez à l'application via votre navigateur
- Utilisez les identifiants de démonstration
- L'interface s'adapte automatiquement à votre rôle

### 2. Navigation
- **Dashboard** : Vue d'ensemble et statistiques
- **Étudiants** : Gestion des étudiants (Admin)
- **Modules** : Gestion des modules de cours
- **Notes** : Saisie et consultation des notes
- **Inscriptions** : Gestion des inscriptions
- **Promotions** : Gestion des promotions
- **Utilisateurs** : Gestion des comptes (Admin)
- **Profil** : Modification de vos informations

### 3. Actions Principales
- **Recherche** : Utilisez les filtres pour trouver rapidement les informations
- **Ajout** : Créez de nouveaux éléments avec les formulaires
- **Modification** : Cliquez sur l'icône d'édition pour modifier
- **Suppression** : Supprimez les éléments (avec confirmation)
- **Export** : Exportez les données en CSV/PDF

## 🔒 Sécurité

### Authentification
- **JWT** avec expiration configurable
- **Hachage** des mots de passe avec bcrypt
- **Middleware** d'authentification sur toutes les routes protégées

### Autorisation
- **Gestion des rôles** avec middleware de vérification
- **Accès conditionnel** aux fonctionnalités selon le rôle
- **Validation** des données côté serveur

### Protection
- **Helmet** pour les en-têtes de sécurité
- **CORS** configuré pour la production
- **Rate limiting** pour prévenir les abus
- **Validation** des entrées utilisateur

## 📊 Structure de la Base de Données

### Tables Principales
- **`utilisateurs`** : Comptes utilisateurs et profils
- **`promotions`** : Années d'études et promotions
- **`modules`** : Cours et matières enseignées
- **`etudiants`** : Informations des étudiants
- **`inscriptions`** : Inscriptions aux modules
- **`notes`** : Évaluations et notes
- **`absences`** : Suivi des présences

### Relations
- **Promotions** → **Étudiants** (1:N)
- **Modules** → **Inscriptions** (1:N)
- **Étudiants** → **Inscriptions** (1:N)
- **Modules** → **Notes** (1:N)
- **Étudiants** → **Notes** (1:N)

## 🚀 Déploiement

### Production
```bash
# Build du frontend
cd frontend
npm run build

# Configuration du serveur de production
# Utilisez PM2 ou Docker pour le backend
```

### Variables d'Environnement de Production
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=secret_tres_securise_en_production
DB_HOST=localhost
DB_USER=user_production
DB_PASSWORD=mot_de_passe_securise
```

## 🧪 Tests

### Tests Backend
```bash
cd backend
npm test
```

### Tests Frontend
```bash
cd frontend
npm run test
```

## 📝 API Documentation

### Endpoints Principaux

#### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Création d'utilisateur (Admin)
- `GET /api/auth/verify` - Vérification du token

#### Étudiants
- `GET /api/etudiants` - Liste des étudiants
- `POST /api/etudiants` - Création d'étudiant
- `PUT /api/etudiants/:id` - Modification d'étudiant
- `DELETE /api/etudiants/:id` - Suppression d'étudiant

#### Modules
- `GET /api/modules` - Liste des modules
- `POST /api/modules` - Création de module
- `PUT /api/modules/:id` - Modification de module
- `DELETE /api/modules/:id` - Suppression de module

#### Notes
- `GET /api/notes` - Liste des notes
- `POST /api/notes` - Création de note
- `PUT /api/notes/:id` - Modification de note
- `DELETE /api/notes/:id` - Suppression de note

## 🤝 Contribution

### Comment Contribuer
1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité
3. **Commitez** vos changements
4. **Poussez** vers la branche
5. **Ouvrez** une Pull Request

### Standards de Code
- **ESLint** et **Prettier** pour la cohérence
- **Conventions** de nommage en français
- **Documentation** des fonctions complexes
- **Tests** pour les nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

### Problèmes Courants
- **Erreur de connexion DB** : Vérifiez vos variables d'environnement
- **Port déjà utilisé** : Changez le port dans le fichier `.env`
- **Erreur JWT** : Vérifiez la variable `JWT_SECRET`

### Contact
- **Issues** : Utilisez GitHub Issues
- **Documentation** : Consultez ce README
- **Support** : Créez une issue avec le label "support"

## 🔄 Mises à Jour

### Version 1.0.0
- ✅ Authentification complète
- ✅ Gestion des utilisateurs et rôles
- ✅ CRUD complet pour toutes les entités
- ✅ Interface responsive et moderne
- ✅ Export des données
- ✅ Statistiques et tableaux de bord

### Prochaines Fonctionnalités
- 🔄 Notifications en temps réel
- 🔄 API mobile
- 🔄 Système de messagerie
- 🔄 Gestion des emplois du temps
- 🔄 Intégration avec d'autres systèmes

---

**Développé avec ❤️ pour la gestion académique moderne**