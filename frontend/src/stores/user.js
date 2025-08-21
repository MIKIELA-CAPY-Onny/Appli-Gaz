import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEnseignant = computed(() => user.value?.role === 'enseignant')
  const isEtudiant = computed(() => user.value?.role === 'etudiant')
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.prenom} ${user.value.nom}`
  })
  const matricule = computed(() => user.value?.matricule || '')

  // Actions
  const fetchUserProfile = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.get('/api/utilisateurs/profile/me')
      user.value = response.data
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération du profil'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (userData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.put('/api/utilisateurs/profile/me', userData)
      user.value = response.data.utilisateur
      
      toast.success('Profil mis à jour avec succès !')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUserById = async (userId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.get(`/api/utilisateurs/${userId}`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (userId, userData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.put(`/api/utilisateurs/${userId}`, userData)
      
      // Si c'est le profil de l'utilisateur connecté, mettre à jour le store
      if (userId === user.value?.id) {
        user.value = response.data.utilisateur
      }
      
      toast.success('Utilisateur mis à jour avec succès !')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.delete(`/api/utilisateurs/${userId}`)
      
      toast.success('Utilisateur supprimé avec succès !')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.post('/api/auth/register', userData)
      
      toast.success('Utilisateur créé avec succès !')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUsers = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.get('/api/utilisateurs', { params })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des utilisateurs'
      toast.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUserStatistics = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await axios.get('/api/utilisateurs/statistiques/globales')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des statistiques'
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

  const clearUser = () => {
    user.value = null
  }

  return {
    // State
    user,
    loading,
    error,
    
    // Getters
    isAdmin,
    isEnseignant,
    isEtudiant,
    fullName,
    matricule,
    
    // Actions
    fetchUserProfile,
    updateUserProfile,
    fetchUserById,
    updateUser,
    deleteUser,
    createUser,
    fetchUsers,
    fetchUserStatistics,
    clearError,
    setUser,
    clearUser
  }
})