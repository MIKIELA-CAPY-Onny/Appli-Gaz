# GestiScolaire Frontend

Application frontend de gestion scolaire développée avec Vue.js 3 et Bootstrap 5.

## 🚀 Technologies utilisées

- **Vue.js 3** - Framework JavaScript progressif
- **Bootstrap 5** - Framework CSS pour l'interface utilisateur
- **Pinia** - Gestionnaire d'état pour Vue.js
- **Vue Router** - Routeur officiel pour Vue.js
- **Axios** - Client HTTP pour les appels API
- **Chart.js** - Bibliothèque de graphiques
- **Vite** - Outil de build moderne et rapide

## 📋 Fonctionnalités

### Authentification
- Connexion/Déconnexion sécurisée
- Gestion des rôles (Administrateur, Enseignant, Étudiant)
- Récupération de mot de passe

### Interface Administrateur
- Tableau de bord avec statistiques
- Gestion des étudiants
- Gestion des modules
- Gestion des inscriptions
- Rapports de notes
- Gestion des utilisateurs
- Paramètres système

### Interface Enseignant
- Tableau de bord enseignant
- Gestion des notes
- Gestion des absences
- Liste des étudiants
- Détails des modules

### Interface Étudiant
- Tableau de bord étudiant
- Consultation des notes
- Consultation des absences
- Modules inscrits
- Paramètres du profil

## 🛠️ Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd gestiscolaire-frontend
```

2. Installer les dépendances
```bash
npm install
```

3. Lancer le serveur de développement
```bash
npm run dev
```

4. Build pour la production
```bash
npm run build
```

## 📁 Structure du projet

```
src/
├── assets/          # Ressources statiques (styles, images)
├── components/      # Composants Vue réutilisables
├── layouts/         # Layouts pour différents rôles
├── views/           # Pages principales de l'application
├── router/          # Configuration du routeur
├── store/           # Stores Pinia pour la gestion d'état
├── services/        # Services pour les appels API
├── utils/           # Utilitaires et helpers
└── composables/     # Composition API utilities
```

## 🔧 Configuration

L'application utilise des variables d'environnement pour la configuration. Créer un fichier `.env.local` :

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=GestiScolaire
```

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎨 Thème et Design

L'application utilise un système de thème personnalisé basé sur Bootstrap avec :
- Variables CSS personnalisées
- Palette de couleurs cohérente
- Composants réutilisables
- Design moderne et intuitif

## 🔒 Sécurité

- Authentification basée sur JWT
- Guards de route pour la protection des pages
- Gestion des permissions par rôle
- Validation côté client et serveur

## 📊 Graphiques et Statistiques

- Graphiques de notes avec Chart.js
- Statistiques de présence
- Tableaux de bord interactifs
- Exports de données

## 🌐 Internationalisation

L'application est préparée pour l'internationalisation avec support du français par défaut.

## 📝 License

Ce projet est sous licence MIT.