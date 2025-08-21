<template>
  <div id="app">
    <!-- Page de connexion -->
    <Login v-if="$route.name === 'Login'" />
    
    <!-- Application principale -->
    <div v-else class="app-container">
      <!-- Barre de navigation -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
          <router-link class="navbar-brand" to="/dashboard">
            <i class="fas fa-graduation-cap me-2"></i>
            Gestion de Scolarité
          </router-link>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <router-link class="nav-link" to="/dashboard">
                  <i class="fas fa-tachometer-alt me-1"></i>
                  Tableau de bord
                </router-link>
              </li>
            </ul>
            
            <!-- Menu utilisateur -->
            <ul class="navbar-nav" v-if="userStore.user">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i class="fas fa-user me-1"></i>
                  {{ userStore.user.prenom }} {{ userStore.user.nom }}
                  <span class="badge bg-light text-dark ms-1">{{ formatRole(userStore.user.role) }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <router-link class="dropdown-item" to="/profile">
                      <i class="fas fa-user-cog me-2"></i>
                      Mon profil
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" @click="logout">
                      <i class="fas fa-sign-out-alt me-2"></i>
                      Déconnexion
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      <!-- Contenu principal -->
      <div class="container-fluid">
        <div class="row">
          <!-- Sidebar -->
          <nav class="col-md-3 col-lg-2 d-md-block sidebar collapse" v-if="userStore.user">
            <div class="position-sticky pt-3">
              <ul class="nav flex-column">
                <!-- Menu pour tous les utilisateurs -->
                <li class="nav-item">
                  <router-link class="nav-link" to="/dashboard" active-class="active">
                    <i class="fas fa-tachometer-alt"></i>
                    Tableau de bord
                  </router-link>
                </li>
                
                <!-- Menu pour admin et enseignants -->
                <li class="nav-item" v-if="['admin', 'enseignant'].includes(userStore.user.role)">
                  <router-link class="nav-link" to="/etudiants" active-class="active">
                    <i class="fas fa-users"></i>
                    Étudiants
                  </router-link>
                </li>
                
                <li class="nav-item" v-if="['admin', 'enseignant'].includes(userStore.user.role)">
                  <router-link class="nav-link" to="/modules" active-class="active">
                    <i class="fas fa-book"></i>
                    Modules
                  </router-link>
                </li>
                
                <li class="nav-item" v-if="['admin', 'enseignant'].includes(userStore.user.role)">
                  <router-link class="nav-link" to="/notes" active-class="active">
                    <i class="fas fa-star"></i>
                    Notes
                  </router-link>
                </li>
                
                <li class="nav-item" v-if="['admin', 'enseignant'].includes(userStore.user.role)">
                  <router-link class="nav-link" to="/absences" active-class="active">
                    <i class="fas fa-clock"></i>
                    Absences
                  </router-link>
                </li>
                
                <!-- Menu pour admin seulement -->
                <li class="nav-item" v-if="userStore.user.role === 'admin'">
                  <router-link class="nav-link" to="/inscriptions" active-class="active">
                    <i class="fas fa-user-plus"></i>
                    Inscriptions
                  </router-link>
                </li>
                
                <li class="nav-item" v-if="userStore.user.role === 'admin'">
                  <router-link class="nav-link" to="/promotions" active-class="active">
                    <i class="fas fa-calendar-alt"></i>
                    Promotions
                  </router-link>
                </li>
                
                <li class="nav-item" v-if="userStore.user.role === 'admin'">
                  <router-link class="nav-link" to="/utilisateurs" active-class="active">
                    <i class="fas fa-user-shield"></i>
                    Utilisateurs
                  </router-link>
                </li>
                
                <!-- Menu pour étudiants -->
                <li class="nav-item" v-if="userStore.user.role === 'etudiant'">
                  <router-link class="nav-link" to="/profile" active-class="active">
                    <i class="fas fa-user-graduate"></i>
                    Mon dossier
                  </router-link>
                </li>
              </ul>
            </div>
          </nav>
          
          <!-- Contenu principal -->
          <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <router-view />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'
import Login from './views/Login.vue'

export default {
  name: 'App',
  components: {
    Login
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const userStore = useUserStore()
    
    // Computed properties
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    
    // Methods
    const formatRole = (role) => {
      const roles = {
        'admin': 'Admin',
        'enseignant': 'Enseignant',
        'etudiant': 'Étudiant'
      }
      return roles[role] || role
    }
    
    const logout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      // Vérifier si l'utilisateur est déjà connecté
      const token = localStorage.getItem('token')
      if (token && !authStore.isAuthenticated) {
        try {
          await authStore.verifyToken(token)
          if (authStore.isAuthenticated) {
            await userStore.fetchUserProfile()
          }
        } catch (error) {
          console.error('Erreur de vérification du token:', error)
          authStore.logout()
        }
      }
    })
    
    return {
      userStore,
      authStore,
      isAuthenticated,
      formatRole,
      logout
    }
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.sidebar {
  min-height: calc(100vh - 56px);
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
  color: white;
  padding-top: 20px;
}

.sidebar .nav-link {
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin: 2px 10px;
  padding: 10px 15px;
  transition: all 0.3s ease;
}

.sidebar .nav-link:hover,
.sidebar .nav-link.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.sidebar .nav-link i {
  width: 20px;
  margin-right: 10px;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.navbar-brand i {
  color: #ffd700;
}

.dropdown-menu {
  border-radius: 10px;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  border-radius: 5px;
  margin: 2px 5px;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background-color: var(--light-color);
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 56px;
    left: -100%;
    width: 100%;
    z-index: 1000;
    transition: left 0.3s ease;
  }
  
  .sidebar.show {
    left: 0;
  }
  
  main {
    margin-left: 0;
  }
}
</style>