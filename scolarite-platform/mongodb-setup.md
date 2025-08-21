# 🗄️ Configuration MongoDB - Plateforme de Scolarité

## 📋 Prérequis

- MongoDB Community Edition installé
- Droits d'administration sur votre système

## 🚀 Installation MongoDB

### Ubuntu/Debian

```bash
# Mettre à jour les paquets
sudo apt update

# Installer MongoDB
sudo apt install mongodb

# Démarrer le service
sudo systemctl start mongod

# Activer le démarrage automatique
sudo systemctl enable mongod

# Vérifier le statut
sudo systemctl status mongod
```

### CentOS/RHEL/Fedora

```bash
# Créer le fichier de repository
sudo tee /etc/yum.repos.d/mongodb-org.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

# Installer MongoDB
sudo yum install -y mongodb-org

# Démarrer le service
sudo systemctl start mongod

# Activer le démarrage automatique
sudo systemctl enable mongod
```

### macOS (avec Homebrew)

```bash
# Installer MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Démarrer le service
brew services start mongodb-community

# Vérifier le statut
brew services list | grep mongodb
```

### Windows

1. Télécharger MongoDB Community Server depuis [mongodb.com](https://www.mongodb.com/try/download/community)
2. Installer avec l'installateur
3. MongoDB sera installé comme service Windows et démarré automatiquement

## ⚙️ Configuration

### Fichier de configuration MongoDB

Créer/modifier `/etc/mongod.conf` (Linux) ou `C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg` (Windows) :

```yaml
# Configuration réseau
net:
  port: 27017
  bindIp: 127.0.0.1

# Configuration de la base de données
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Configuration système
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Configuration de processus
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
```

### Variables d'environnement

Dans votre fichier `.env` :

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/scolarite_db
MONGODB_URI_TEST=mongodb://localhost:27017/scolarite_test

# Si vous avez configuré l'authentification
# MONGODB_URI=mongodb://username:password@localhost:27017/scolarite_db
```

## 🔐 Sécurité (Optionnel)

### Créer un utilisateur administrateur

```javascript
// Se connecter à MongoDB
mongo

// Créer un utilisateur administrateur
use admin
db.createUser({
  user: "admin",
  pwd: "votre_mot_de_passe_securise",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

// Créer un utilisateur pour l'application
use scolarite_db
db.createUser({
  user: "scolarite_user",
  pwd: "mot_de_passe_application",
  roles: ["readWrite"]
})
```

### Activer l'authentification

Modifier le fichier de configuration :

```yaml
security:
  authorization: enabled
```

Redémarrer MongoDB :

```bash
# Linux
sudo systemctl restart mongod

# macOS
brew services restart mongodb-community

# Windows
# Redémarrer le service MongoDB depuis les Services
```

## 🧪 Test de connexion

### Test simple

```bash
# Se connecter à MongoDB
mongo

# Ou avec authentification
mongo -u username -p password --authenticationDatabase admin

# Tester la connexion
db.runCommand({ping: 1})
```

### Test depuis l'application

```bash
# Démarrer l'application
npm run dev

# Vérifier les logs de connexion
# Vous devriez voir : "✅ MongoDB connecté: localhost"
```

## 🐛 Dépannage

### Erreur de connexion

```bash
# Vérifier que MongoDB est en cours d'exécution
sudo systemctl status mongod

# Vérifier les logs
sudo tail -f /var/log/mongodb/mongod.log

# Vérifier le port
sudo netstat -tlnp | grep 27017
```

### Erreur de permissions

```bash
# Vérifier les permissions du dossier de données
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb

# Redémarrer MongoDB
sudo systemctl restart mongod
```

### Erreur de port déjà utilisé

```bash
# Vérifier les processus sur le port 27017
sudo lsof -i :27017

# Tuer le processus si nécessaire
sudo kill -9 <PID>
```

## 📊 Outils de gestion

### MongoDB Compass (Interface graphique)

1. Télécharger depuis [mongodb.com](https://www.mongodb.com/try/download/compass)
2. Installer et lancer
3. Se connecter à `mongodb://localhost:27017`

### MongoDB Shell

```bash
# Installer MongoDB Shell
# Ubuntu/Debian
sudo apt install mongodb-mongosh

# macOS
brew install mongosh

# Utilisation
mongosh "mongodb://localhost:27017/scolarite_db"
```

## 🔄 Sauvegarde et restauration

### Sauvegarde

```bash
# Sauvegarde complète
mongodump --db scolarite_db --out /backup/

# Sauvegarde d'une collection spécifique
mongodump --db scolarite_db --collection users --out /backup/
```

### Restauration

```bash
# Restauration complète
mongorestore --db scolarite_db /backup/scolarite_db/

# Restauration d'une collection
mongorestore --db scolarite_db --collection users /backup/scolarite_db/users.bson
```

## 📈 Monitoring

### Vérifier les statistiques

```javascript
// Dans MongoDB Shell
use scolarite_db
db.stats()
db.users.stats()
```

### Vérifier les performances

```javascript
// Profiler les requêtes lentes
db.setProfilingLevel(1, { slowms: 100 })

// Voir les requêtes lentes
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 })
```

---

**🎉 MongoDB est maintenant configuré et prêt pour votre plateforme de scolarité !**