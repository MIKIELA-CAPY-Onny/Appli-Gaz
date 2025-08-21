<template>
  <nav class="navbar">
    <div class="navbar-container d-flex justify-content-between align-items-center w-100">
      <!-- Toggle sidebar mobile -->
      <button 
        class="mobile-nav-toggle d-md-none"
        @click="toggleSidebar"
        aria-label="Toggle navigation"
      >
        <i class="bi bi-list"></i>
      </button>

      <!-- Brand -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img src="/logo-gestiscolaire.png" alt="Logo" class="navbar-logo me-2" />
        <span>GestiScolaire</span>
      </router-link>

      <!-- Search bar (hidden on mobile) -->
      <div class="navbar-search d-none d-lg-block">
        <div class="search-container">
          <i class="bi bi-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Rechercher..."
            v-model="searchQuery"
            @keyup.enter="performSearch"
          />
        </div>
      </div>

      <!-- User menu -->
      <div class="navbar-nav">
        <!-- Notifications -->
        <div class="nav-item dropdown">
          <button 
            class="nav-link notification-btn"
            @click="toggleNotifications"
            :class="{ active: showNotifications }"
          >
            <i class="bi bi-bell"></i>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>
          
          <!-- Notifications dropdown -->
          <div v-if="showNotifications" class="dropdown-menu notification-dropdown">
            <div class="dropdown-header">
              <h6 class="mb-0">Notifications</h6>
              <button v-if="notifications.length > 0" @click="markAllAsRead" class="btn-link">
                Tout marquer comme lu
              </button>
            </div>
            
            <div class="notification-list">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ unread: !notification.read }"
                @click="markAsRead(notification.id)"
              >
                <div class="notification-icon">
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                </div>
              </div>
              
              <div v-if="notifications.length === 0" class="notification-empty">
                <i class="bi bi-bell-slash"></i>
                <p>Aucune notification</p>
              </div>
            </div>
            
            <div class="dropdown-footer">
              <router-link to="/notifications" class="btn btn-sm btn-outline-primary w-100">
                Voir toutes les notifications
              </router-link>
            </div>
          </div>
        </div>

        <!-- User profile -->
        <div class="nav-item dropdown">
          <button 
            class="nav-link user-btn"
            @click="toggleUserMenu"
            :class="{ active: showUserMenu }"
          >
            <img 
              :src="user.avatar || '/src/assets/images/default-avatar.png'" 
              :alt="user.name"
              class="user-avatar"
            />
            <span class="user-name d-none d-md-inline">{{ user.name }}</span>
            <i class="bi bi-chevron-down"></i>
          </button>
          
          <!-- User dropdown -->
          <div v-if="showUserMenu" class="dropdown-menu user-dropdown">
            <div class="dropdown-header">
              <div class="user-info">
                <img 
                  :src="user.avatar || '/src/assets/images/default-avatar.png'" 
                  :alt="user.name"
                  class="user-avatar-large"
                />
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-role">{{ getUserRoleLabel(user.role) }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </div>
            
            <div class="dropdown-body">
              <router-link to="/profile" class="dropdown-item">
                <i class="bi bi-person"></i>
                Mon profil
              </router-link>
              
              <router-link to="/settings" class="dropdown-item">
                <i class="bi bi-gear"></i>
                Paramètres
              </router-link>
              
              <div class="dropdown-divider"></div>
              
              <button @click="logout" class="dropdown-item text-danger">
                <i class="bi bi-box-arrow-right"></i>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile search (shown when toggled) -->
    <div v-if="showMobileSearch" class="mobile-search">
      <div class="search-container">
        <i class="bi bi-search search-icon"></i>
        <input
          type="text"
          class="search-input"
          placeholder="Rechercher..."
          v-model="searchQuery"
          @keyup.enter="performSearch"
          ref="mobileSearchInput"
        />
        <button @click="closeMobileSearch" class="close-search-btn">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth-store'
import { useNotifications } from '@/composables/use-notifications'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default {
  name: 'NavBar',
  emits: ['toggle-sidebar'],
  setup(_, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
    
    const searchQuery = ref('')
    const showNotifications = ref(false)
    const showUserMenu = ref(false)
    const showMobileSearch = ref(false)
    const mobileSearchInput = ref(null)
    
    const user = computed(() => authStore.user || {})
    
    const toggleSidebar = () => {
      emit('toggle-sidebar')
    }
    
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
      showUserMenu.value = false
    }
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
      showNotifications.value = false
    }
    
    const toggleMobileSearch = () => {
      showMobileSearch.value = !showMobileSearch.value
      if (showMobileSearch.value) {
        setTimeout(() => {
          mobileSearchInput.value?.focus()
        }, 100)
      }
    }
    
    const closeMobileSearch = () => {
      showMobileSearch.value = false
      searchQuery.value = ''
    }
    
    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          name: 'search',
          query: { q: searchQuery.value }
        })
        closeMobileSearch()
      }
    }
    
    const getUserRoleLabel = (role) => {
      const roles = {
        admin: 'Administrateur',
        teacher: 'Enseignant',
        student: 'Étudiant'
      }
      return roles[role] || role
    }
    
    const getNotificationIcon = (type) => {
      const icons = {
        info: 'bi bi-info-circle text-info',
        success: 'bi bi-check-circle text-success',
        warning: 'bi bi-exclamation-triangle text-warning',
        error: 'bi bi-x-circle text-danger',
        grade: 'bi bi-mortarboard text-primary',
        attendance: 'bi bi-calendar-check text-success',
        message: 'bi bi-envelope text-info'
      }
      return icons[type] || 'bi bi-bell text-secondary'
    }
    
    const formatTime = (date) => {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: fr
      })
    }
    
    const logout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }
    
    const handleClickOutside = (event) => {
      const target = event.target
      
      if (!target.closest('.dropdown')) {
        showNotifications.value = false
        showUserMenu.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      searchQuery,
      showNotifications,
      showUserMenu,
      showMobileSearch,
      mobileSearchInput,
      user,
      notifications,
      unreadCount,
      toggleSidebar,
      toggleNotifications,
      toggleUserMenu,
      toggleMobileSearch,
      closeMobileSearch,
      performSearch,
      getUserRoleLabel,
      getNotificationIcon,
      formatTime,
      markAsRead,
      markAllAsRead,
      logout
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: var(--bg-navbar);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.navbar-container {
  max-width: 100%;
  padding: 0 var(--spacing-4);
}

.navbar-logo {
  height: 32px;
  width: auto;
}

.navbar-brand {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  text-decoration: none;
}

.navbar-search {
  flex: 1;
  max-width: 400px;
  margin: 0 var(--spacing-6);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-3);
  color: var(--text-muted);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-2) var(--spacing-10);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  background-color: var(--gray-50);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: 0;
  border-color: var(--primary-color);
  background-color: var(--white);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  background: none;
  border: none;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  cursor: pointer;
  gap: var(--spacing-2);
}

.nav-link:hover,
.nav-link.active {
  background-color: var(--gray-100);
  color: var(--text-primary);
}

.notification-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: var(--danger-color);
  color: var(--white);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  min-width: 280px;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--gray-50);
  display: flex;
  justify-content: between;
  align-items: center;
}

.dropdown-header h6 {
  margin: 0;
  font-weight: var(--font-weight-semibold);
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--font-size-xs);
  cursor: pointer;
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: underline;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
}

.user-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.user-details {
  flex: 1;
}

.user-details .user-name {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-1);
}

.user-role {
  font-size: var(--font-size-xs);
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-email {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.dropdown-body {
  padding: var(--spacing-2) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--text-primary);
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--gray-50);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-2) 0;
}

.notification-dropdown {
  right: -50px;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  gap: var(--spacing-3);
}

.notification-item:hover {
  background-color: var(--gray-50);
}

.notification-item.unread {
  background-color: rgba(37, 99, 235, 0.05);
  border-left: 3px solid var(--primary-color);
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-1);
}

.notification-message {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-1);
  line-height: var(--line-height-tight);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.notification-empty {
  text-align: center;
  padding: var(--spacing-8) var(--spacing-4);
  color: var(--text-muted);
}

.notification-empty i {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-3);
  display: block;
}

.dropdown-footer {
  padding: var(--spacing-3);
  border-top: 1px solid var(--border-color);
  background-color: var(--gray-50);
}

.mobile-search {
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-3);
}

.close-search-btn {
  position: absolute;
  right: var(--spacing-3);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-1);
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 var(--spacing-3);
  }
  
  .navbar-brand span {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .dropdown-menu {
    position: fixed;
    top: var(--navbar-height);
    right: var(--spacing-3);
    left: var(--spacing-3);
    width: auto;
    min-width: auto;
  }
  
  .notification-dropdown {
    right: var(--spacing-3);
  }
}
</style>