import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => userRole.value === 'admin')
  const isEnseignant = computed(() => userRole.value === 'enseignant')
  const isEtudiant = computed(() => userRole.value === 'etudiant')

  // Actions
  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.post('/api/auth/login', credentials)
      
      if (response.data.token) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('token', response.data.token)
        
        // Configurer axios pour inclure le token dans toutes les requêtes
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        
        toast.success('Connexion réussie !')
        return response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de connexion'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.post('/api/auth/register', userData)
      
      toast.success('Inscription réussie !')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur d\'inscription'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyToken = async (tokenToVerify) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.get('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      })
      
      if (response.data.valid) {
        token.value = tokenToVerify
        user.value = response.data.user
        localStorage.setItem('token', tokenToVerify)
        
        // Configurer axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenToVerify}`
        
        return true
      } else {
        throw new Error('Token invalide')
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de vérification du token'
      logout()
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    
    // Supprimer le header d'autorisation d'axios
    delete axios.defaults.headers.common['Authorization']
    
    toast.success('Déconnexion réussie')
  }

  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.post('/api/auth/change-password', passwordData)
      
      toast.success('Mot de passe modifié avec succès !')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du changement de mot de passe'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const setUser = (userData) => {
    user.value = userData
  }

  // Configuration axios par défaut
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // Intercepteur pour gérer les erreurs d'authentification
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        toast.error('Session expirée. Veuillez vous reconnecter.')
        logout()
      }
      return Promise.reject(error)
    }
  )

  return {
    // State
    token,
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isEnseignant,
    isEtudiant,
    
    // Actions
    login,
    register,
    verifyToken,
    logout,
    changePassword,
    clearError,
    setUser
  }
})