<template>
  <div id="app" class="app-container">
    <!-- Navigation principale -->
    <NavBar 
      v-if="showNavigation"
      @toggle-sidebar="toggleSidebar"
    />
    
    <!-- Sidebar -->
    <SideBar 
      v-if="showNavigation"
      :is-open="sidebarOpen"
      @close="closeSidebar"
      @toggle-theme="toggleTheme"
    />
    
    <!-- Contenu principal -->
    <main 
      class="main-content"
      :class="{
        'with-sidebar': showNavigation && !isMobile,
        'sidebar-open': sidebarOpen && isMobile
      }"
    >
      <div class="content-wrapper">
        <!-- Loading global -->
        <LoadingSpinner 
          v-if="globalLoading"
          overlay
          size="large"
          message="Chargement..."
        />
        
        <!-- Router view -->
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <!-- Footer -->
    <FooterSection v-if="showNavigation && !isMobile" />
    
    <!-- Overlay mobile pour sidebar -->
    <div 
      v-if="sidebarOpen && isMobile" 
      class="mobile-overlay"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './store/auth-store'
import NavBar from './components/common/NavBar.vue'
import SideBar from './components/common/SideBar.vue'
import FooterSection from './components/common/FooterSection.vue'
import LoadingSpinner from './components/common/LoadingSpinner.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    SideBar,
    FooterSection,
    LoadingSpinner
  },
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    
    // État local
    const sidebarOpen = ref(false)
    const windowWidth = ref(window.innerWidth)
    const globalLoading = ref(false)
    const theme = ref('light')
    
    // Computed
    const isMobile = computed(() => windowWidth.value < 768)
    
    const showNavigation = computed(() => {
      // Masquer la navigation sur les pages d'authentification
      const authRoutes = ['/login', '/register', '/forgot-password']
      return !authRoutes.includes(route.path) && authStore.isAuthenticated
    })
    
    // Méthodes
    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value
    }
    
    const closeSidebar = () => {
      sidebarOpen.value = false
    }
    
    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme.value)
      localStorage.setItem('theme', theme.value)
    }
    
    const handleResize = () => {
      windowWidth.value = window.innerWidth
      
      // Fermer la sidebar automatiquement sur desktop
      if (!isMobile.value) {
        sidebarOpen.value = false
      }
    }
    
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light'
      theme.value = savedTheme
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    
    const handleKeydown = (event) => {
      // Fermer la sidebar avec Escape
      if (event.key === 'Escape' && sidebarOpen.value) {
        closeSidebar()
      }
    }
    
    // Lifecycle
    onMounted(() => {
      initializeTheme()
      window.addEventListener('resize', handleResize)
      document.addEventListener('keydown', handleKeydown)
      
      // Initialiser l'authentification
      authStore.initializeAuth()
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeydown)
    })
    
    return {
      sidebarOpen,
      isMobile,
      showNavigation,
      globalLoading,
      theme,
      toggleSidebar,
      closeSidebar,
      toggleTheme
    }
  }
}
</script>

<style>
/* Styles globaux pour l'application */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  transition: margin-left var(--transition-normal);
  margin-top: var(--navbar-height);
}

.main-content.with-sidebar {
  margin-left: var(--sidebar-width);
}

.main-content.sidebar-open {
  overflow: hidden;
}

.content-wrapper {
  padding: var(--spacing-6);
  max-width: var(--container-max-width);
  margin: 0 auto;
  position: relative;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-fixed) - 1);
}

/* Transitions de page */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: var(--spacing-3);
  }
}

/* Mode sombre */
[data-theme="dark"] {
  --bg-body: #0f172a;
  --bg-surface: #1e293b;
  --bg-card: #334155;
  --bg-sidebar: #0f172a;
  --bg-navbar: #1e293b;
  
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  
  --border-color: #334155;
  --border-color-dark: #475569;
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--gray-100);
}

::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

/* Mode sombre - scrollbar */
[data-theme="dark"] ::-webkit-scrollbar-track {
  background: var(--gray-800);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: var(--gray-600);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

/* Focus global */
*:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Sélection de texte */
::selection {
  background-color: var(--primary-color);
  color: var(--white);
}

/* Animation de chargement global */
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>