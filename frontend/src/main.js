import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import App from './App.vue'

// Import des composants
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import Etudiants from './views/Etudiants.vue'
import Modules from './views/Modules.vue'
import Notes from './views/Notes.vue'
import Absences from './views/Absences.vue'
import Inscriptions from './views/Inscriptions.vue'
import Promotions from './views/Promotions.vue'
import Utilisateurs from './views/Utilisateurs.vue'
import Profile from './views/Profile.vue'

// Import des stores
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'

// Configuration des routes
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/etudiants',
    name: 'Etudiants',
    component: Etudiants,
    meta: { requiresAuth: true, roles: ['admin', 'enseignant'] }
  },
  {
    path: '/modules',
    name: 'Modules',
    component: Modules,
    meta: { requiresAuth: true, roles: ['admin', 'enseignant'] }
  },
  {
    path: '/notes',
    name: 'Notes',
    component: Notes,
    meta: { requiresAuth: true, roles: ['admin', 'enseignant'] }
  },
  {
    path: '/absences',
    name: 'Absences',
    component: Absences,
    meta: { requiresAuth: true, roles: ['admin', 'enseignant'] }
  },
  {
    path: '/inscriptions',
    name: 'Inscriptions',
    component: Inscriptions,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: Promotions,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/utilisateurs',
    name: 'Utilisateurs',
    component: Utilisateurs,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

// Création du router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Garde de navigation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  
  // Vérifier si l'utilisateur est authentifié
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Essayer de récupérer le token depuis le localStorage
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // Vérifier la validité du token
        await authStore.verifyToken(token)
        if (authStore.isAuthenticated) {
          // Récupérer les informations utilisateur
          await userStore.fetchUserProfile()
          next()
          return
        }
      } catch (error) {
        console.error('Erreur de vérification du token:', error)
        authStore.logout()
      }
    }
    
    // Rediriger vers la page de connexion
    next('/login')
    return
  }
  
  // Vérifier les rôles requis
  if (to.meta.roles && userStore.user) {
    if (!to.meta.roles.includes(userStore.user.role)) {
      toast.error('Accès interdit. Vous n\'avez pas les permissions nécessaires.')
      next('/dashboard')
      return
    }
  }
  
  // Si l'utilisateur est connecté et essaie d'accéder à la page de connexion
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

// Création de l'application
const app = createApp(App)

// Configuration des plugins
app.use(createPinia())
app.use(router)
app.use(toast, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'colored'
})

// Configuration globale
app.config.globalProperties.$filters = {
  formatDate(value) {
    if (!value) return ''
    return new Date(value).toLocaleDateString('fr-FR')
  },
  formatDateTime(value) {
    if (!value) return ''
    return new Date(value).toLocaleString('fr-FR')
  },
  formatRole(role) {
    const roles = {
      'admin': 'Administrateur',
      'enseignant': 'Enseignant',
      'etudiant': 'Étudiant'
    }
    return roles[role] || role
  },
  formatStatus(status) {
    const statuses = {
      'inscrit': 'Inscrit',
      'abandonne': 'Abandonné',
      'termine': 'Terminé',
      'active': 'Active',
      'terminee': 'Terminée',
      'preparation': 'En préparation',
      'actif': 'Actif',
      'inactif': 'Inactif'
    }
    return statuses[status] || status
  },
  formatTypeEvaluation(type) {
    const types = {
      'controle': 'Contrôle',
      'examen': 'Examen',
      'tp': 'Travaux Pratiques',
      'projet': 'Projet'
    }
    return types[type] || type
  },
  formatTypeAbsence(type) {
    const types = {
      'absence': 'Absence',
      'retard': 'Retard'
    }
    return types[type] || type
  }
}

// Gestion des erreurs globales
app.config.errorHandler = (err, vm, info) => {
  console.error('Erreur Vue:', err, info)
  toast.error('Une erreur est survenue dans l\'application')
}

// Gestion des erreurs non capturées
window.addEventListener('unhandledrejection', event => {
  console.error('Promesse rejetée non gérée:', event.reason)
  toast.error('Une erreur inattendue est survenue')
})

// Montage de l'application
app.mount('#app')

// Export pour utilisation dans d'autres modules
export { app, router }