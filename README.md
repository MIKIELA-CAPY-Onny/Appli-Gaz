# 🏥 WAFYA - Plateforme Numérique Nationale de Gestion des Structures de Santé au Gabon

## 📋 Présentation

WAFYA est une plateforme numérique complète conçue pour digitaliser et centraliser la gestion des structures de santé au Gabon. Elle offre des fonctionnalités avancées de téléconsultation, d'alertes sanitaires nationales, et de statistiques de santé par région.

## 🎯 Objectifs

- Digitaliser la gestion des structures de santé (cliniques, hôpitaux, pharmacies)
- Permettre un suivi médical complet accessible partout
- Système de téléconsultation intégré
- Alertes sanitaires nationales coordonnées avec le Ministère de la Santé
- Statistiques précises de santé par région
- Fonctionnement optimal en zones rurales avec synchronisation offline/online

## 🏗️ Architecture du Projet

```
wafya/
├── backend/                 # API Node.js + Express
├── frontend/               # Interface web React (PWA)
├── mobile/                 # Application Flutter
├── database/              # Scripts et migrations PostgreSQL
├── docs/                  # Documentation
└── deployment/           # Scripts de déploiement
```

## 🛠️ Technologies Utilisées

- **Backend**: Node.js, Express, PostgreSQL, JWT, WebRTC
- **Frontend Web**: React.js, PWA, Service Workers
- **Mobile**: Flutter (Android & iOS)
- **Base de données**: PostgreSQL avec chiffrement
- **Téléconsultation**: WebRTC
- **Notifications**: Firebase Cloud Messaging
- **Paiements**: Mobile Money (Airtel, Moov) + Stripe

## 👥 Équipe de Développement

- **Dev 1**: Backend & API (Semaines 1-6)
- **Dev 2**: Frontend Web (Semaines 1-7)
- **Dev 3**: Mobile & Intégration (Semaines 3-8)

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Flutter 3.0+
- Git

### Installation Backend
```bash
cd backend
npm install
npm run setup-db
npm run dev
```

### Installation Frontend
```bash
cd frontend
npm install
npm start
```

### Installation Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## 📱 Fonctionnalités Principales

### Pour les Structures de Santé
- Gestion des profils et personnels
- Dossiers patients complets
- Prise de rendez-vous en ligne
- Gestion des stocks (pharmacies)
- Téléconsultations
- Alertes sanitaires

### Pour les Médecins
- Agenda synchronisé
- Dossiers médicaux numériques
- Téléconsultations audio/vidéo
- Prescriptions électroniques

### Pour les Patients
- Dossier médical numérique
- Prise de rendez-vous
- Téléconsultations
- Notifications et alertes
- Mode offline

### Pour le Ministère de la Santé
- Alertes sanitaires nationales
- Statistiques par région
- Supervision complète
- Gestion des accès

## 🔒 Sécurité

- Authentification JWT + 2FA
- Chiffrement des données médicales
- Accès contrôlé par rôles
- Conformité RGPD
- Journalisation complète

## 💳 Monétisation

- Abonnements pour structures de santé
- Paiement mobile sécurisé
- Accès gratuit pour patients
- Gestion automatique des droits

## 📄 Licence

Ce projet est développé pour le Ministère de la Santé du Gabon.

## 📞 Contact

Pour toute question technique, contactez l'équipe de développement WAFYA.