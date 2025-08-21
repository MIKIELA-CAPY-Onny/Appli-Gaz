# 🚀 Guide de Démarrage Rapide - Plateforme de Scolarité

## 📋 Prérequis

- **Node.js** version 16 ou supérieure
- **npm** ou **yarn**
- **MongoDB** installé et en cours d'exécution
- **Git** (optionnel)

## ⚡ Installation Express

### Option 1: Script automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x install.sh

# Lancer l'installation
./install.sh
```

### Option 2: Installation manuelle

```bash
# Installer les dépendances du projet principal
npm install

# Installer les dépendances du backend
cd backend
npm install
cd ..
```

## 🔧 Configuration

### 1. Base de données MongoDB

Assurez-vous que MongoDB est en cours d'exécution :

```bash
# Démarrer MongoDB (Ubuntu/Debian)
sudo systemctl start mongod

# Démarrer MongoDB (macOS avec Homebrew)
brew services start mongodb-community

# Vérifier le statut
mongo --eval "db.serverStatus()"
```

### 2. Variables d'environnement

Le fichier `.env` a été créé automatiquement. Modifiez-le selon vos besoins :

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/scolarite_db

# Serveur
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=24h
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
npm start
```

L'application sera accessible sur : **http://localhost:3000**

## 📱 Test de l'API

### 1. Vérifier que l'API fonctionne

```bash
curl http://localhost:3000/
```

Réponse attendue :
```json
{
  "message": "🎓 API Plateforme de Scolarité",
  "version": "1.0.0",
  "status": "Actif"
}
```

### 2. Endpoints disponibles

- **Authentification** : `POST /api/auth/login`
- **Étudiants** : `GET /api/students`
- **Cours** : `GET /api/courses`
- **Notes** : `GET /api/grades`

## 🗄️ Structure de la base de données

L'application crée automatiquement les collections suivantes :

- `users` - Utilisateurs du système
- `students` - Profils étudiants
- `teachers` - Profils enseignants
- `admins` - Profils administrateurs
- `courses` - Cours et matières
- `modules` - Modules d'enseignement
- `enrollments` - Inscriptions aux cours
- `grades` - Notes et évaluations
- `absences` - Présences et absences

## 🔐 Premier utilisateur administrateur

Pour créer le premier utilisateur administrateur, vous pouvez utiliser l'API ou créer directement en base :

```javascript
// Via MongoDB Compass ou mongo shell
use scolarite_db

db.users.insertOne({
  firstName: "Admin",
  lastName: "Principal",
  email: "admin@scolarite.fr",
  password: "$2b$12$...", // Hash bcrypt du mot de passe
  role: "admin",
  isActive: true,
  isVerified: true,
  createdAt: new Date()
})
```

## 🛠️ Développement

### Structure des dossiers

```
scolarite-platform/
├── backend/           # API Node.js/Express
│   ├── models/       # Modèles Mongoose
│   ├── routes/       # Routes de l'API
│   ├── controllers/  # Contrôleurs
│   ├── middleware/   # Middlewares
│   └── utils/        # Utilitaires
├── frontend/         # Interface utilisateur (à développer)
└── docs/            # Documentation
```

### Scripts disponibles

- `npm run dev` - Démarrage en mode développement avec nodemon
- `npm start` - Démarrage en mode production
- `npm test` - Exécution des tests
- `npm run install-backend` - Installation des dépendances backend uniquement

## 🐛 Dépannage

### Erreur de connexion MongoDB

```bash
# Vérifier que MongoDB est en cours d'exécution
sudo systemctl status mongod

# Vérifier la connexion
mongo --host localhost --port 27017
```

### Port déjà utilisé

```bash
# Vérifier les processus sur le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Dépendances manquantes

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

## 📚 Ressources

- **Documentation complète** : `README.md`
- **Variables d'environnement** : `.env.example`
- **Structure de l'API** : `backend/app.js`
- **Modèles de données** : `backend/models/`

## 🆘 Support

En cas de problème :

1. Vérifiez les logs de l'application
2. Consultez la documentation
3. Vérifiez la configuration MongoDB
4. Vérifiez les variables d'environnement

---

**🎉 Félicitations ! Votre plateforme de scolarité est maintenant prête à être utilisée !**