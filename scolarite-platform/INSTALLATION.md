# Guide d'Installation - GestiScolarité

## 🎯 Prérequis

Avant d'installer la plateforme, assurez-vous d'avoir :

### Logiciels requis
- **Node.js** 14.0+ ([Télécharger](https://nodejs.org/))
- **npm** 6.0+ (inclus avec Node.js)
- **MySQL** 5.7+ ou 8.0+ ([Télécharger](https://dev.mysql.com/downloads/))

### Vérification des prérequis
```bash
node --version    # Doit afficher v14.0.0 ou plus
npm --version     # Doit afficher 6.0.0 ou plus
mysql --version   # Vérifier que MySQL est installé
```

## 🚀 Installation Rapide

### Option 1: Script automatique (Recommandé)
```bash
# Cloner ou télécharger le projet
cd scolarite-platform

# Lancer le script d'installation
node start.js
```

Le script va automatiquement :
1. Vérifier les prérequis
2. Installer les dépendances
3. Configurer l'environnement
4. Proposer la configuration de la base de données
5. Démarrer l'application

### Option 2: Installation manuelle

#### 1. Configuration de l'environnement
```bash
# Copier le fichier de configuration
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env  # ou votre éditeur préféré
```

#### 2. Installation des dépendances
```bash
# Dépendances principales
npm install

# Dépendances backend
cd backend
npm install
cd ..
```

#### 3. Configuration de la base de données
```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE scolarite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Exécuter les migrations et seeders
cd backend
npm run setup-db
```

#### 4. Démarrage de l'application
```bash
# Mode développement
cd backend
npm run dev

# OU mode production
npm start
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Base de données (REQUIS)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=scolarite_db
DB_PORT=3306

# JWT (REQUIS)
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
JWT_EXPIRES_IN=24h

# Serveur
PORT=3000
NODE_ENV=development

# Sécurité
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Configuration MySQL

1. **Créer un utilisateur dédié (recommandé) :**
```sql
CREATE USER 'scolarite_user'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT ALL PRIVILEGES ON scolarite_db.* TO 'scolarite_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Mettre à jour le .env :**
```env
DB_USER=scolarite_user
DB_PASSWORD=mot_de_passe_fort
```

## 🗄️ Base de Données

### Structure
La base de données comprend les tables suivantes :
- `users` - Utilisateurs (base)
- `students` - Informations étudiants
- `teachers` - Informations enseignants  
- `admins` - Informations administrateurs
- `courses` - Cours/matières
- `modules` - Modules d'enseignement
- `enrollments` - Inscriptions
- `grades` - Notes
- `absences` - Absences et retards

### Commandes utiles
```bash
# Configuration complète
npm run setup-db

# Migrations seulement
npm run setup-db -- --migrate

# Données de test seulement
npm run setup-db -- --seed

# Réinitialisation complète
npm run setup-db -- --reset
```

## 👥 Comptes de Test

Après configuration, ces comptes sont disponibles :

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| Admin | admin@university.com | password123 | Administrateur principal |
| Enseignant | teacher1@university.com | password123 | Professeur d'informatique |
| Étudiant | student1@university.com | password123 | Étudiant L2 |

## 🌐 Accès à l'application

Une fois démarrée, l'application est accessible sur :

- **Interface web :** http://localhost:3000
- **API :** http://localhost:3000/api/v1
- **Documentation API :** http://localhost:3000/api/v1/docs
- **Health Check :** http://localhost:3000/api/v1/health

## 🔧 Développement

### Structure du projet
```
scolarite-platform/
├── backend/              # API Node.js/Express
│   ├── config/          # Configuration (DB, Auth)
│   ├── controllers/     # Logique métier
│   ├── middleware/      # Middlewares Express
│   ├── models/          # Modèles de données
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires
│   ├── database/        # Migrations et seeders
│   ├── app.js          # Configuration Express
│   └── server.js       # Point d'entrée
├── frontend/            # Interface web
│   └── index.html      # SPA Vue.js
├── database/           # Schéma principal
└── docs/              # Documentation
```

### Commandes de développement
```bash
# Démarrer en mode dev avec rechargement auto
cd backend
npm run dev

# Réinitialiser la base de données
npm run setup-db -- --reset

# Voir les logs en temps réel
tail -f logs/app.log  # Si configuré
```

### Scripts disponibles
```bash
# Projet principal
npm start              # Démarrer l'application
npm run install-all    # Installer toutes les dépendances

# Backend
npm run dev           # Mode développement
npm run start         # Mode production  
npm run setup-db      # Configuration DB
npm test              # Tests (si configurés)
```

## 🚨 Dépannage

### Erreurs courantes

#### 1. Erreur de connexion MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution :** Vérifiez que MySQL est démarré
```bash
# Ubuntu/Debian
sudo systemctl start mysql

# macOS (Homebrew)
brew services start mysql

# Windows
net start mysql
```

#### 2. Base de données inexistante
```
Error: Unknown database 'scolarite_db'
```
**Solution :** Créez la base de données
```sql
CREATE DATABASE scolarite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. Erreur de permissions
```
Error: Access denied for user 'root'@'localhost'
```
**Solution :** Vérifiez les identifiants dans `.env`

#### 4. Port déjà utilisé
```
Error: listen EADDRINUSE :::3000
```
**Solution :** Changez le port dans `.env`
```env
PORT=3001
```

#### 5. Token JWT invalide
**Solution :** Générez un nouveau secret JWT
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Logs et debug

#### Activer les logs détaillés
```env
NODE_ENV=development
DEBUG=scolarite:*
```

#### Vérifier la santé de l'API
```bash
curl http://localhost:3000/api/v1/health
```

### Réinitialisation complète
```bash
# Supprimer les dépendances
rm -rf node_modules backend/node_modules

# Réinstaller
npm install
cd backend && npm install

# Réinitialiser la base de données
npm run setup-db -- --reset
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs dans la console
2. Consultez ce guide de dépannage
3. Vérifiez la configuration dans `.env`
4. Testez la connexion à la base de données

### Informations système utiles
```bash
# Version Node.js
node --version

# Version npm
npm --version

# Version MySQL
mysql --version

# Espace disque
df -h

# Mémoire disponible
free -h  # Linux
vm_stat  # macOS
```

## 🎉 Prochaines étapes

Une fois l'installation terminée :

1. Connectez-vous avec un compte de test
2. Explorez les différentes fonctionnalités
3. Consultez la documentation API
4. Personnalisez selon vos besoins

**L'application est maintenant prête à être utilisée !** 🚀