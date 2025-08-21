<template>
  <aside class="sidebar" :class="{ show: isOpen }">
    <div class="sidebar-content">
      <!-- Logo et titre -->
      <div class="sidebar-header">
        <router-link to="/" class="sidebar-brand">
          <img src="/logo-gestiscolaire.png" alt="Logo" class="sidebar-logo" />
          <span class="brand-text">GestiScolaire</span>
        </router-link>
      </div>

      <!-- Navigation principale -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- Dashboard -->
          <li class="nav-item">
            <router-link
              :to="getDashboardRoute()"
              class="nav-link"
              :class="{ active: isActiveRoute('dashboard') }"
            >
              <i class="nav-icon bi bi-speedometer2"></i>
              <span class="nav-text">Tableau de bord</span>
            </router-link>
          </li>

          <!-- Menu Administrateur -->
          <template v-if="user.role === 'admin'">
            <li class="nav-section">
              <span class="nav-section-title">Administration</span>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/admin/students"
                class="nav-link"
                :class="{ active: isActiveRoute('admin/students') }"
              >
                <i class="nav-icon bi bi-people"></i>
                <span class="nav-text">Gestion Étudiants</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/admin/modules"
                class="nav-link"
                :class="{ active: isActiveRoute('admin/modules') }"
              >
                <i class="nav-icon bi bi-book"></i>
                <span class="nav-text">Gestion Modules</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/admin/inscriptions"
                class="nav-link"
                :class="{ active: isActiveRoute('admin/inscriptions') }"
              >
                <i class="nav-icon bi bi-card-checklist"></i>
                <span class="nav-text">Inscriptions</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/admin/reports"
                class="nav-link"
                :class="{ active: isActiveRoute('admin/reports') }"
              >
                <i class="nav-icon bi bi-graph-up"></i>
                <span class="nav-text">Rapports</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/admin/users"
                class="nav-link"
                :class="{ active: isActiveRoute('admin/users') }"
              >
                <i class="nav-icon bi bi-person-gear"></i>
                <span class="nav-text">Utilisateurs</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/admin/settings"
                class="nav-link"
                :class="{ active: isActiveRoute('admin/settings') }"
              >
                <i class="nav-icon bi bi-gear"></i>
                <span class="nav-text">Paramètres</span>
              </router-link>
            </li>
          </template>

          <!-- Menu Enseignant -->
          <template v-if="user.role === 'teacher'">
            <li class="nav-section">
              <span class="nav-section-title">Enseignement</span>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/teacher/grades"
                class="nav-link"
                :class="{ active: isActiveRoute('teacher/grades') }"
              >
                <i class="nav-icon bi bi-mortarboard"></i>
                <span class="nav-text">Gestion Notes</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/teacher/attendance"
                class="nav-link"
                :class="{ active: isActiveRoute('teacher/attendance') }"
              >
                <i class="nav-icon bi bi-calendar-check"></i>
                <span class="nav-text">Présences</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/teacher/students"
                class="nav-link"
                :class="{ active: isActiveRoute('teacher/students') }"
              >
                <i class="nav-icon bi bi-people"></i>
                <span class="nav-text">Mes Étudiants</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/teacher/modules"
                class="nav-link"
                :class="{ active: isActiveRoute('teacher/modules') }"
              >
                <i class="nav-icon bi bi-book"></i>
                <span class="nav-text">Mes Modules</span>
              </router-link>
            </li>
          </template>

          <!-- Menu Étudiant -->
          <template v-if="user.role === 'student'">
            <li class="nav-section">
              <span class="nav-section-title">Mon Parcours</span>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/student/grades"
                class="nav-link"
                :class="{ active: isActiveRoute('student/grades') }"
              >
                <i class="nav-icon bi bi-mortarboard"></i>
                <span class="nav-text">Mes Notes</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/student/attendance"
                class="nav-link"
                :class="{ active: isActiveRoute('student/attendance') }"
              >
                <i class="nav-icon bi bi-calendar-check"></i>
                <span class="nav-text">Mes Absences</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/student/modules"
                class="nav-link"
                :class="{ active: isActiveRoute('student/modules') }"
              >
                <i class="nav-icon bi bi-book"></i>
                <span class="nav-text">Mes Modules</span>
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link
                to="/student/profile"
                class="nav-link"
                :class="{ active: isActiveRoute('student/profile') }"
              >
                <i class="nav-icon bi bi-person"></i>
                <span class="nav-text">Mon Profil</span>
              </router-link>
            </li>
          </template>

          <!-- Menus communs -->
          <li class="nav-section">
            <span class="nav-section-title">Général</span>
          </li>
          
          <li class="nav-item">
            <router-link
              to="/calendar"
              class="nav-link"
              :class="{ active: isActiveRoute('calendar') }"
            >
              <i class="nav-icon bi bi-calendar3"></i>
              <span class="nav-text">Calendrier</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link
              to="/messages"
              class="nav-link"
              :class="{ active: isActiveRoute('messages') }"
            >
              <i class="nav-icon bi bi-envelope"></i>
              <span class="nav-text">Messages</span>
              <span v-if="unreadMessages > 0" class="nav-badge">{{ unreadMessages }}</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link
              to="/help"
              class="nav-link"
              :class="{ active: isActiveRoute('help') }"
            >
              <i class="nav-icon bi bi-question-circle"></i>
              <span class="nav-text">Aide</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Footer sidebar -->
      <div class="sidebar-footer">
        <div class="user-info">
          <img 
            :src="user.avatar || '/src/assets/images/default-avatar.png'" 
            :alt="user.name"
            class="user-avatar"
          />
          <div class="user-details">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-role">{{ getUserRoleLabel(user.role) }}</div>
          </div>
        </div>
        
        <div class="sidebar-actions">
          <button 
            @click="$emit('toggle-theme')"
            class="action-btn"
            title="Changer le thème"
          >
            <i class="bi bi-moon"></i>
          </button>
          
          <button 
            @click="logout"
            class="action-btn"
            title="Se déconnecter"
          >
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay pour mobile -->
    <div v-if="isOpen" class="sidebar-overlay" @click="$emit('close')"></div>
  </aside>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth-store'

export default {
  name: 'SideBar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'toggle-theme'],
  setup(_, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    
    const user = computed(() => authStore.user || {})
    const unreadMessages = computed(() => authStore.unreadMessages || 0)
    
    const getDashboardRoute = () => {
      const roleRoutes = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard'
      }
      return roleRoutes[user.value.role] || '/dashboard'
    }
    
    const isActiveRoute = (routeName) => {
      return route.path.includes(routeName)
    }
    
    const getUserRoleLabel = (role) => {
      const roles = {
        admin: 'Administrateur',
        teacher: 'Enseignant',
        student: 'Étudiant'
      }
      return roles[role] || role
    }
    
    const logout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
        emit('close')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }
    
    return {
      user,
      unreadMessages,
      getDashboardRoute,
      isActiveRoute,
      getUserRoleLabel,
      logout
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-sidebar);
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-fixed);
  transform: translateX(-100%);
  transition: transform var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.sidebar.show {
  transform: translateX(0);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 0;
}

.sidebar-header {
  padding: var(--spacing-6) var(--spacing-4) var(--spacing-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--white);
  text-decoration: none;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius);
}

.brand-text {
  color: var(--white);
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-4) 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-section {
  margin: var(--spacing-6) 0 var(--spacing-2);
}

.nav-section-title {
  display: block;
  padding: 0 var(--spacing-4);
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-item {
  margin-bottom: var(--spacing-1);
}

.nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 0;
  transition: all var(--transition-fast);
  position: relative;
  gap: var(--spacing-3);
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--white);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--white);
  border-right: 3px solid var(--primary-light);
}

.nav-icon {
  font-size: var(--font-size-lg);
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.nav-badge {
  background-color: var(--danger-color);
  color: var(--white);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-footer {
  padding: var(--spacing-4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  color: var(--white);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--white);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-fixed) - 1);
}

/* Responsive */
@media (min-width: 769px) {
  .sidebar {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 280px;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
}

/* Scrollbar personnalisée */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Animation d'entrée des éléments */
.nav-item {
  animation: slideInLeft 0.3s ease-out;
  animation-fill-mode: both;
}

.nav-item:nth-child(1) { animation-delay: 0.1s; }
.nav-item:nth-child(2) { animation-delay: 0.15s; }
.nav-item:nth-child(3) { animation-delay: 0.2s; }
.nav-item:nth-child(4) { animation-delay: 0.25s; }
.nav-item:nth-child(5) { animation-delay: 0.3s; }
.nav-item:nth-child(6) { animation-delay: 0.35s; }
.nav-item:nth-child(7) { animation-delay: 0.4s; }
.nav-item:nth-child(8) { animation-delay: 0.45s; }

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>