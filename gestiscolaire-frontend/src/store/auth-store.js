import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref(null)
  const token = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const unreadMessages = ref(0)

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value ? `${user.value.firstName} ${user.value.lastName}` : '')

  // Actions
  const initializeAuth = async () => {
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
      
      initialized.value = true
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
      logout()
    }
  }

  const login = async (credentials) => {
    loading.value = true
    
    try {
      // Simulation d'un appel API - remplacer par un vrai appel
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Données de démonstration basées sur l'email
      let mockUser = null
      let mockToken = 'demo-token-' + Date.now()
      
      if (credentials.email === 'admin@gestiscolaire.fr') {
        mockUser = {
          id: 1,
          firstName: 'Jean',
          lastName: 'Administrateur',
          email: 'admin@gestiscolaire.fr',
          role: 'admin',
          avatar: null,
          permissions: ['all']
        }
      } else if (credentials.email === 'teacher@gestiscolaire.fr') {
        mockUser = {
          id: 2,
          firstName: 'Marie',
          lastName: 'Enseignant',
          email: 'teacher@gestiscolaire.fr',
          role: 'teacher',
          avatar: null,
          permissions: ['grades', 'attendance', 'students']
        }
      } else if (credentials.email === 'student@gestiscolaire.fr') {
        mockUser = {
          id: 3,
          firstName: 'Pierre',
          lastName: 'Étudiant',
          email: 'student@gestiscolaire.fr',
          role: 'student',
          studentNumber: '2024001',
          level: 'L3',
          program: 'Informatique',
          avatar: null,
          permissions: ['profile', 'grades_view', 'attendance_view']
        }
      } else {
        throw new Error('Identifiants incorrects')
      }
      
      // Sauvegarder les données
      user.value = mockUser
      token.value = mockToken
      unreadMessages.value = Math.floor(Math.random() * 5)
      
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      
      return { user: mockUser, token: mockToken }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // Simulation d'un appel API pour déconnexion
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Nettoyer les données
      user.value = null
      token.value = null
      unreadMessages.value = 0
      
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const updateProfile = async (profileData) => {
    loading.value = true
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mettre à jour les données utilisateur
      user.value = { ...user.value, ...profileData }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      
      return user.value
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    loading.value = true
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Vérifier l'ancien mot de passe (simulation)
      if (passwordData.currentPassword !== 'password') {
        throw new Error('Mot de passe actuel incorrect')
      }
      
      return true
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    loading.value = true
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simuler l'envoi d'email
      console.log(`Email de réinitialisation envoyé à ${email}`)
      
      return true
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const hasPermission = (permission) => {
    if (!user.value || !user.value.permissions) return false
    
    return user.value.permissions.includes('all') || 
           user.value.permissions.includes(permission)
  }

  const hasRole = (role) => {
    return user.value?.role === role
  }

  const markMessagesAsRead = () => {
    unreadMessages.value = 0
  }

  return {
    // État
    user,
    token,
    initialized,
    loading,
    unreadMessages,
    
    // Computed
    isAuthenticated,
    userRole,
    userName,
    
    // Actions
    initializeAuth,
    login,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    hasPermission,
    hasRole,
    markMessagesAsRead
  }
})