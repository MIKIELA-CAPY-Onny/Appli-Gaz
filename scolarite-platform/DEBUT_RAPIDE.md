# ⚡ DÉMARRAGE ULTRA-RAPIDE - 3 ÉTAPES

## 🎯 Vous voulez démarrer MAINTENANT ? Suivez ces 3 étapes !

### 🚀 ÉTAPE 1 : Installation (2 minutes)

#### Sur Linux/macOS :
```bash
cd scolarite-platform
chmod +x install.sh
./install.sh
```

#### Sur Windows :
```bash
cd scolarite-platform
install.bat
```

### 🗄️ ÉTAPE 2 : Démarrer MongoDB (1 minute)

#### Ubuntu/Debian :
```bash
sudo systemctl start mongod
```

#### macOS :
```bash
brew services start mongodb-community
```

#### Windows :
- Ouvrez "Services" (Win+R → services.msc)
- Trouvez "MongoDB" et cliquez "Démarrer"

### ▶️ ÉTAPE 3 : Lancer l'application (30 secondes)

```bash
npm run dev
```

## 🎉 C'est tout ! Votre application est maintenant accessible sur :

**🌐 http://localhost:3000**

## 🧪 Test rapide

```bash
node test-api.js
```

## 📚 Besoin d'aide ?

- **Problème d'installation** → `QUICKSTART.md`
- **Configuration MongoDB** → `mongodb-setup.md`
- **Développement** → `ETAPES_SUIVANTES.md`
- **Vérifications** → `CHECKLIST.md`

---

**⚡ Vous êtes prêt ! Votre plateforme de scolarité fonctionne !**