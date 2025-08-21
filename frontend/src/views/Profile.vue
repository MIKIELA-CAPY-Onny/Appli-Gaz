<template>
  <div class="profile-page">
    <!-- En-tête de la page -->
    <div class="page-header mb-4">
      <div class="text-center">
        <h1 class="page-title">
          <i class="fas fa-user-cog me-2"></i>
          Mon Profil
        </h1>
        <p class="page-subtitle">
          Gérez vos informations personnelles et votre compte
        </p>
      </div>
    </div>
    
    <div class="row">
      <!-- Informations du profil -->
      <div class="col-md-8 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-user me-2"></i>
              Informations Personnelles
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="nom" class="form-label">Nom *</label>
                  <input
                    id="nom"
                    v-model="profileForm.nom"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.nom }"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.nom }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="prenom" class="form-label">Prénom *</label>
                  <input
                    id="prenom"
                    v-model="profileForm.prenom"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.prenom }"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.prenom }}</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">Email *</label>
                  <input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.email }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="telephone" class="form-label">Téléphone</label>
                  <input
                    id="telephone"
                    v-model="profileForm.telephone"
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': errors.telephone }"
                  />
                  <div class="invalid-feedback">{{ errors.telephone }}</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="adresse" class="form-label">Adresse</label>
                <textarea
                  id="adresse"
                  v-model="profileForm.adresse"
                  class="form-control"
                  rows="3"
                  :class="{ 'is-invalid': errors.adresse }"
                  placeholder="Votre adresse complète..."
                ></textarea>
                <div class="invalid-feedback">{{ errors.adresse }}</div>
              </div>
              
              <div class="d-flex justify-content-end">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="updatingProfile"
                >
                  <span v-if="updatingProfile" class="spinner-border spinner-border-sm me-2"></span>
                  Mettre à jour le profil
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Informations du compte -->
      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-info-circle me-2"></i>
              Informations du Compte
            </h5>
          </div>
          <div class="card-body">
            <div class="profile-info">
              <div class="info-item">
                <label class="info-label">Rôle:</label>
                <span :class="getRoleBadgeClass(userStore.user?.role)">
                  {{ getRoleLabel(userStore.user?.role) }}
                </span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Matricule:</label>
                <span class="info-value">{{ userStore.user?.matricule }}</span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Promotion:</label>
                <span class="info-value">{{ getPromotionName(userStore.user?.promotion_id) || 'Non assignée' }}</span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Statut:</label>
                <span :class="getStatusBadgeClass(userStore.user?.statut)">
                  {{ getStatusLabel(userStore.user?.statut) }}
                </span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Membre depuis:</label>
                <span class="info-value">{{ formatDate(userStore.user?.created_at) }}</span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Dernière connexion:</label>
                <span class="info-value">{{ formatDateTime(userStore.user?.derniere_connexion) || 'Jamais' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions rapides -->
        <div class="card mt-3">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-tools me-2"></i>
              Actions Rapides
            </h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button
                @click="showChangePasswordModal = true"
                class="btn btn-outline-warning"
              >
                <i class="fas fa-key me-2"></i>
                Changer le mot de passe
              </button>
              
              <button
                @click="exportProfile"
                class="btn btn-outline-info"
              >
                <i class="fas fa-download me-2"></i>
                Exporter mon profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Statistiques personnelles -->
    <div class="row" v-if="userStore.isEtudiant">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-line me-2"></i>
              Mes Statistiques Académiques
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 mb-3">
                <div class="stats-card">
                  <div class="stats-icon">
                    <i class="fas fa-book"></i>
                  </div>
                  <div class="stats-content">
                    <div class="stats-number">{{ stats.modulesInscrits || 0 }}</div>
                    <div class="stats-label">Modules Inscrits</div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-3 mb-3">
                <div class="stats-card">
                  <div class="stats-icon">
                    <i class="fas fa-star"></i>
                  </div>
                  <div class="stats-content">
                    <div class="stats-number">{{ stats.totalNotes || 0 }}</div>
                    <div class="stats-label">Notes Reçues</div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-3 mb-3">
                <div class="stats-card">
                  <div class="stats-icon">
                    <i class="fas fa-chart-line"></i>
                  </div>
                  <div class="stats-content">
                    <div class="stats-number">{{ stats.moyenneGenerale || 'N/A' }}</div>
                    <div class="stats-label">Moyenne Générale</div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-3 mb-3">
                <div class="stats-card">
                  <div class="stats-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="stats-content">
                    <div class="stats-number">{{ stats.totalAbsences || 0 }}</div>
                    <div class="stats-label">Absences</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de changement de mot de passe -->
    <div
      class="modal fade"
      :class="{ show: showChangePasswordModal }"
      :style="{ display: showChangePasswordModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-key me-2"></i>
              Changer le Mot de Passe
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="showChangePasswordModal = false"
            ></button>
          </div>
          
          <form @submit.prevent="changePassword">
            <div class="modal-body">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Mot de passe actuel *</label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.currentPassword }"
                  required
                />
                <div class="invalid-feedback">{{ errors.currentPassword }}</div>
              </div>
              
              <div class="mb-3">
                <label for="newPassword" class="form-label">Nouveau mot de passe *</label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.newPassword }"
                  required
                />
                <div class="invalid-feedback">{{ errors.newPassword }}</div>
                <small class="form-text text-muted">
                  Le mot de passe doit contenir au moins 8 caractères
                </small>
              </div>
              
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirmer le nouveau mot de passe *</label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  required
                />
                <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showChangePasswordModal = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="btn btn-warning"
                :disabled="changingPassword"
              >
                <span v-if="changingPassword" class="spinner-border spinner-border-sm me-2"></span>
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Overlay pour les modals -->
    <div
      v-if="showChangePasswordModal"
      class="modal-backdrop fade show"
      @click="showChangePasswordModal = false"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { toast } from 'vue3-toastify'

export default {
  name: 'Profile',
  setup() {
    const userStore = useUserStore()
    const authStore = useAuthStore()
    
    // State
    const updatingProfile = ref(false)
    const changingPassword = ref(false)
    const showChangePasswordModal = ref(false)
    const stats = ref({})
    
    // Forms
    const profileForm = ref({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: ''
    })
    
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // Errors
    const errors = ref({})
    
    // Methods
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/utilisateurs/profile/me')
        const user = response.data.utilisateur
        
        profileForm.value = {
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          telephone: user.telephone || '',
          adresse: user.adresse || ''
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
        toast.error('Erreur lors du chargement du profil')
      }
    }
    
    const fetchStats = async () => {
      if (!userStore.isEtudiant) return
      
      try {
        const [inscriptionsRes, notesRes, absencesRes] = await Promise.all([
          axios.get('/api/inscriptions?etudiant_id=' + userStore.user.id),
          axios.get('/api/notes?etudiant_id=' + userStore.user.id),
          axios.get('/api/absences?etudiant_id=' + userStore.user.id)
        ])
        
        const modulesInscrits = inscriptionsRes.data.inscriptions?.length || 0
        const notes = notesRes.data.notes || []
        const absences = absencesRes.data.absences || []
        
        let moyenneGenerale = 'N/A'
        if (notes.length > 0) {
          const total = notes.reduce((sum, note) => sum + note.note, 0)
          moyenneGenerale = (total / notes.length).toFixed(2)
        }
        
        stats.value = {
          modulesInscrits,
          totalNotes: notes.length,
          moyenneGenerale,
          totalAbsences: absences.length
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
      }
    }
    
    const updateProfile = async () => {
      try {
        updatingProfile.value = true
        errors.value = {}
        
        await axios.put('/api/utilisateurs/profile/me', profileForm.value)
        
        // Mettre à jour le store utilisateur
        await userStore.fetchUserProfile()
        
        toast.success('Profil mis à jour avec succès')
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        
        if (error.response?.data?.errors) {
          errors.value = error.response.data.errors
        } else {
          toast.error('Erreur lors de la mise à jour du profil')
        }
      } finally {
        updatingProfile.value = false
      }
    }
    
    const changePassword = async () => {
      try {
        changingPassword.value = true
        errors.value = {}
        
        // Validation côté client
        if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
          errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
          return
        }
        
        if (passwordForm.value.newPassword.length < 8) {
          errors.value.newPassword = 'Le mot de passe doit contenir au moins 8 caractères'
          return
        }
        
        await authStore.changePassword({
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        })
        
        showChangePasswordModal.value = false
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        
        toast.success('Mot de passe changé avec succès')
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error)
        
        if (error.response?.data?.errors) {
          errors.value = error.response.data.errors
        } else {
          toast.error('Erreur lors du changement de mot de passe')
        }
      } finally {
        changingPassword.value = false
      }
    }
    
    const exportProfile = async () => {
      try {
        const response = await axios.get('/api/utilisateurs/profile/me/export', {
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'mon_profil.pdf')
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        toast.success('Profil exporté avec succès')
      } catch (error) {
        console.error('Erreur lors de l\'export:', error)
        toast.error('Erreur lors de l\'export')
      }
    }
    
    const getRoleLabel = (role) => {
      const labels = {
        admin: 'Administrateur',
        enseignant: 'Enseignant',
        etudiant: 'Étudiant'
      }
      return labels[role] || role
    }
    
    const getRoleBadgeClass = (role) => {
      const classes = {
        admin: 'badge bg-danger',
        enseignant: 'badge bg-primary',
        etudiant: 'badge bg-success'
      }
      return classes[role] || 'badge bg-secondary'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        actif: 'Actif',
        inactif: 'Inactif',
        suspendu: 'Suspendu'
      }
      return labels[status] || status
    }
    
    const getStatusBadgeClass = (status) => {
      const classes = {
        actif: 'badge bg-success',
        inactif: 'badge bg-warning',
        suspendu: 'badge bg-danger'
      }
      return classes[status] || 'badge bg-secondary'
    }
    
    const getPromotionName = (promotionId) => {
      // Pour l'instant, on retourne une valeur par défaut
      // En production, on pourrait récupérer la liste des promotions
      return promotionId ? `Promotion ${promotionId}` : 'Non assignée'
    }
    
    const formatDate = (date) => {
      if (!date) return null
      return new Date(date).toLocaleDateString('fr-FR')
    }
    
    const formatDateTime = (date) => {
      if (!date) return null
      return new Date(date).toLocaleString('fr-FR')
    }
    
    // Lifecycle
    onMounted(() => {
      fetchProfile()
      fetchStats()
    })
    
    return {
      userStore,
      updatingProfile,
      changingPassword,
      showChangePasswordModal,
      stats,
      profileForm,
      passwordForm,
      errors,
      updateProfile,
      changePassword,
      exportProfile,
      getRoleLabel,
      getRoleBadgeClass,
      getStatusLabel,
      getStatusBadgeClass,
      getPromotionName,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
}

.page-title {
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.page-subtitle {
  margin-bottom: 0;
  opacity: 0.9;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-info .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.profile-info .info-item:last-child {
  border-bottom: none;
}

.profile-info .info-label {
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0;
}

.profile-info .info-value {
  color: var(--secondary-color);
}

.stats-section .stats-card {
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
  color: white;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.stats-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.stats-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stats-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block;
}

.modal-backdrop {
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .profile-info .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .stats-card {
    padding: 1rem;
  }
  
  .stats-number {
    font-size: 1.5rem;
  }
}
</style>