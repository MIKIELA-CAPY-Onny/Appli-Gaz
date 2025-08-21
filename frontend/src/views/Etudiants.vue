<template>
  <div class="etudiants-page">
    <!-- En-tête de la page -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">
            <i class="fas fa-users me-2"></i>
            Gestion des Étudiants
          </h1>
          <p class="page-subtitle">
            Gérez les informations des étudiants de l'université
          </p>
        </div>
        <button
          v-if="userStore.isAdmin"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <i class="fas fa-plus me-2"></i>
          Nouvel Étudiant
        </button>
      </div>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="filters-section mb-4">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="searchInput" class="form-label">Recherche</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input
                  id="searchInput"
                  v-model="filters.search"
                  type="text"
                  class="form-control"
                  placeholder="Nom, prénom, matricule..."
                  @input="debounceSearch"
                />
              </div>
            </div>
            
            <div class="col-md-3 mb-3">
              <label for="promotionFilter" class="form-label">Promotion</label>
              <select
                id="promotionFilter"
                v-model="filters.promotion"
                class="form-select"
                @change="fetchEtudiants"
              >
                <option value="">Toutes les promotions</option>
                <option
                  v-for="promotion in promotions"
                  :key="promotion.id"
                  :value="promotion.id"
                >
                  {{ promotion.nom }}
                </option>
              </select>
            </div>
            
            <div class="col-md-3 mb-3">
              <label for="statusFilter" class="form-label">Statut</label>
              <select
                id="statusFilter"
                v-model="filters.status"
                class="form-select"
                @change="fetchEtudiants"
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="diplome">Diplômé</option>
              </select>
            </div>
            
            <div class="col-md-2 mb-3 d-flex align-items-end">
              <button
                @click="resetFilters"
                class="btn btn-outline-secondary w-100"
              >
                <i class="fas fa-undo me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Liste des étudiants -->
    <div class="students-list">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-list me-2"></i>
            Liste des Étudiants
            <span class="badge bg-primary ms-2">{{ pagination.total || 0 }}</span>
          </h5>
          
          <div class="d-flex align-items-center">
            <label for="itemsPerPage" class="form-label me-2 mb-0">Par page:</label>
            <select
              id="itemsPerPage"
              v-model="pagination.limit"
              class="form-select form-select-sm"
              style="width: auto;"
              @change="fetchEtudiants"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        
        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="loading-spinner"></div>
            <p class="mt-3">Chargement des étudiants...</p>
          </div>
          
          <div v-else-if="etudiants.length === 0" class="text-center py-5">
            <i class="fas fa-users fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Aucun étudiant trouvé</h5>
            <p class="text-muted">
              {{ filters.search || filters.promotion || filters.status 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par ajouter un étudiant' }}
            </p>
          </div>
          
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Matricule</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Promotion</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="etudiant in etudiants" :key="etudiant.id">
                    <td>
                      <span class="badge bg-secondary">{{ etudiant.matricule }}</span>
                    </td>
                    <td>
                      <strong>{{ etudiant.nom }}</strong>
                    </td>
                    <td>{{ etudiant.prenom }}</td>
                    <td>
                      <a :href="'mailto:' + etudiant.email" class="text-decoration-none">
                        {{ etudiant.email }}
                      </a>
                    </td>
                    <td>
                      <span class="badge bg-info">
                        {{ getPromotionName(etudiant.promotion_id) }}
                      </span>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(etudiant.statut)">
                        {{ getStatusLabel(etudiant.statut) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button
                          @click="viewEtudiant(etudiant)"
                          class="btn btn-sm btn-outline-info"
                          title="Voir les détails"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="editEtudiant(etudiant)"
                          class="btn btn-sm btn-outline-warning"
                          title="Modifier"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="deleteEtudiant(etudiant)"
                          class="btn btn-sm btn-outline-danger"
                          title="Supprimer"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Pagination -->
            <nav v-if="pagination.total > pagination.limit" class="mt-4">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                  <button
                    class="page-link"
                    @click="changePage(pagination.page - 1)"
                    :disabled="pagination.page <= 1"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                
                <li
                  v-for="page in getPageNumbers()"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.page }"
                >
                  <button
                    class="page-link"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                </li>
                
                <li class="page-item" :class="{ disabled: pagination.page >= pagination.totalPages }">
                  <button
                    class="page-link"
                    @click="changePage(pagination.page + 1)"
                    :disabled="pagination.page >= pagination.totalPages"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal d'ajout/modification d'étudiant -->
    <div
      class="modal fade"
      :class="{ show: showAddModal || showEditModal }"
      :style="{ display: (showAddModal || showEditModal) ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-plus me-2" v-if="showAddModal"></i>
              <i class="fas fa-user-edit me-2" v-else></i>
              {{ showAddModal ? 'Nouvel Étudiant' : 'Modifier l\'Étudiant' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          
          <form @submit.prevent="submitForm">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="nom" class="form-label">Nom *</label>
                  <input
                    id="nom"
                    v-model="formData.nom"
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
                    v-model="formData.prenom"
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
                    v-model="formData.email"
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
                    v-model="formData.telephone"
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': errors.telephone }"
                  />
                  <div class="invalid-feedback">{{ errors.telephone }}</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="date_naissance" class="form-label">Date de naissance</label>
                  <input
                    id="date_naissance"
                    v-model="formData.date_naissance"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors.date_naissance }"
                  />
                  <div class="invalid-feedback">{{ errors.date_naissance }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="promotion_id" class="form-label">Promotion *</label>
                  <select
                    id="promotion_id"
                    v-model="formData.promotion_id"
                    class="form-select"
                    :class="{ 'is-invalid': errors.promotion_id }"
                    required
                  >
                    <option value="">Sélectionner une promotion</option>
                    <option
                      v-for="promotion in promotions"
                      :key="promotion.id"
                      :value="promotion.id"
                    >
                      {{ promotion.nom }}
                    </option>
                  </select>
                  <div class="invalid-feedback">{{ errors.promotion_id }}</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="adresse" class="form-label">Adresse</label>
                  <textarea
                    id="adresse"
                    v-model="formData.adresse"
                    class="form-control"
                    rows="3"
                    :class="{ 'is-invalid': errors.adresse }"
                  ></textarea>
                  <div class="invalid-feedback">{{ errors.adresse }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="statut" class="form-label">Statut *</label>
                  <select
                    id="statut"
                    v-model="formData.statut"
                    class="form-select"
                    :class="{ 'is-invalid': errors.statut }"
                    required
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="diplome">Diplômé</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.statut }}</div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="submitting"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ showAddModal ? 'Créer' : 'Modifier' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal de détails de l'étudiant -->
    <div
      class="modal fade"
      :class="{ show: showViewModal }"
      :style="{ display: showViewModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user me-2"></i>
              Détails de l'Étudiant
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="showViewModal = false"
            ></button>
          </div>
          
          <div class="modal-body" v-if="selectedEtudiant">
            <div class="row">
              <div class="col-md-6">
                <h6>Informations personnelles</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Matricule:</strong></td>
                    <td>{{ selectedEtudiant.matricule }}</td>
                  </tr>
                  <tr>
                    <td><strong>Nom:</strong></td>
                    <td>{{ selectedEtudiant.nom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Prénom:</strong></td>
                    <td>{{ selectedEtudiant.prenom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{{ selectedEtudiant.email }}</td>
                  </tr>
                  <tr>
                    <td><strong>Téléphone:</strong></td>
                    <td>{{ selectedEtudiant.telephone || 'Non renseigné' }}</td>
                  </tr>
                </table>
              </div>
              
              <div class="col-md-6">
                <h6>Informations académiques</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Promotion:</strong></td>
                    <td>{{ getPromotionName(selectedEtudiant.promotion_id) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Statut:</strong></td>
                    <td>
                      <span :class="getStatusBadgeClass(selectedEtudiant.statut)">
                        {{ getStatusLabel(selectedEtudiant.statut) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Date de naissance:</strong></td>
                    <td>{{ formatDate(selectedEtudiant.date_naissance) || 'Non renseignée' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Adresse:</strong></td>
                    <td>{{ selectedEtudiant.adresse || 'Non renseignée' }}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <!-- Modules inscrits -->
            <div class="mt-4">
              <h6>Modules inscrits</h6>
              <div v-if="selectedEtudiant.inscriptions && selectedEtudiant.inscriptions.length > 0">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Module</th>
                        <th>Enseignant</th>
                        <th>Date d'inscription</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="inscription in selectedEtudiant.inscriptions" :key="inscription.id">
                        <td>{{ inscription.module?.nom }}</td>
                        <td>{{ inscription.module?.enseignant?.nom }} {{ inscription.module?.enseignant?.prenom }}</td>
                        <td>{{ formatDate(inscription.date_inscription) }}</td>
                        <td>
                          <span :class="getInscriptionStatusBadgeClass(inscription.statut)">
                            {{ getInscriptionStatusLabel(inscription.statut) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="text-muted">
                Aucun module inscrit
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showViewModal = false"
            >
              Fermer
            </button>
            <button
              v-if="userStore.isAdmin"
              type="button"
              class="btn btn-primary"
              @click="editEtudiant(selectedEtudiant)"
            >
              <i class="fas fa-edit me-2"></i>
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Overlay pour les modals -->
    <div
      v-if="showAddModal || showEditModal || showViewModal"
      class="modal-backdrop fade show"
      @click="closeModal"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user'
import axios from 'axios'
import { toast } from 'vue3-toastify'

export default {
  name: 'Etudiants',
  setup() {
    const userStore = useUserStore()
    
    // State
    const loading = ref(false)
    const submitting = ref(false)
    const etudiants = ref([])
    const promotions = ref([])
    const selectedEtudiant = ref(null)
    
    // Modals
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    
    // Form data
    const formData = ref({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      date_naissance: '',
      promotion_id: '',
      adresse: '',
      statut: 'actif'
    })
    
    // Filters and pagination
    const filters = ref({
      search: '',
      promotion: '',
      status: ''
    })
    
    const pagination = ref({
      page: 1,
      limit: 25,
      total: 0,
      totalPages: 0
    })
    
    // Errors
    const errors = ref({})
    
    // Computed
    const isAdmin = computed(() => userStore.isAdmin)
    
    // Methods
    const fetchEtudiants = async () => {
      try {
        loading.value = true
        
        const params = new URLSearchParams({
          page: pagination.value.page,
          limit: pagination.value.limit
        })
        
        if (filters.value.search) {
          params.append('search', filters.value.search)
        }
        if (filters.value.promotion) {
          params.append('promotion_id', filters.value.promotion)
        }
        if (filters.value.status) {
          params.append('statut', filters.value.status)
        }
        
        const response = await axios.get(`/api/etudiants?${params.toString()}`)
        
        etudiants.value = response.data.etudiants || []
        pagination.value = {
          ...pagination.value,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des étudiants:', error)
        toast.error('Erreur lors du chargement des étudiants')
      } finally {
        loading.value = false
      }
    }
    
    const fetchPromotions = async () => {
      try {
        const response = await axios.get('/api/promotions')
        promotions.value = response.data.promotions || []
      } catch (error) {
        console.error('Erreur lors de la récupération des promotions:', error)
      }
    }
    
    const resetFilters = () => {
      filters.value = {
        search: '',
        promotion: '',
        status: ''
      }
      pagination.value.page = 1
      fetchEtudiants()
    }
    
    const changePage = (page) => {
      pagination.value.page = page
      fetchEtudiants()
    }
    
    const getPageNumbers = () => {
      const pages = []
      const start = Math.max(1, pagination.value.page - 2)
      const end = Math.min(pagination.value.totalPages, pagination.value.page + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
    
    const debounceSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        pagination.value.page = 1
        fetchEtudiants()
      }, 500)
    }
    
    let searchTimeout = null
    
    const openAddModal = () => {
      showAddModal.value = true
      resetForm()
    }
    
    const editEtudiant = (etudiant) => {
      selectedEtudiant.value = etudiant
      formData.value = { ...etudiant }
      showEditModal.value = true
      showViewModal.value = false
      showAddModal.value = false
    }
    
    const viewEtudiant = async (etudiant) => {
      try {
        const response = await axios.get(`/api/etudiants/${etudiant.id}`)
        selectedEtudiant.value = response.data.etudiant
        showViewModal.value = true
        showAddModal.value = false
        showEditModal.value = false
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error)
        toast.error('Erreur lors du chargement des détails')
      }
    }
    
    const deleteEtudiant = async (etudiant) => {
      try {
        const result = await Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: `Voulez-vous vraiment supprimer l'étudiant ${etudiant.nom} ${etudiant.prenom} ?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Oui, supprimer',
          cancelButtonText: 'Annuler'
        })
        
        if (result.isConfirmed) {
          await axios.delete(`/api/etudiants/${etudiant.id}`)
          toast.success('Étudiant supprimé avec succès')
          fetchEtudiants()
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        toast.error('Erreur lors de la suppression')
      }
    }
    
    const submitForm = async () => {
      try {
        submitting.value = true
        errors.value = {}
        
        if (showAddModal.value) {
          await axios.post('/api/etudiants', formData.value)
          toast.success('Étudiant créé avec succès')
        } else {
          await axios.put(`/api/etudiants/${selectedEtudiant.value.id}`, formData.value)
          toast.success('Étudiant modifié avec succès')
        }
        
        closeModal()
        fetchEtudiants()
      } catch (error) {
        console.error('Erreur lors de la soumission:', error)
        
        if (error.response?.data?.errors) {
          errors.value = error.response.data.errors
        } else {
          toast.error('Erreur lors de la sauvegarde')
        }
      } finally {
        submitting.value = false
      }
    }
    
    const resetForm = () => {
      formData.value = {
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        date_naissance: '',
        promotion_id: '',
        adresse: '',
        statut: 'actif'
      }
      errors.value = {}
    }
    
    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      selectedEtudiant.value = null
      resetForm()
    }
    
    const getPromotionName = (promotionId) => {
      const promotion = promotions.value.find(p => p.id === promotionId)
      return promotion ? promotion.nom : 'Promotion inconnue'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        actif: 'Actif',
        inactif: 'Inactif',
        diplome: 'Diplômé'
      }
      return labels[status] || status
    }
    
    const getStatusBadgeClass = (status) => {
      const classes = {
        actif: 'badge bg-success',
        inactif: 'badge bg-danger',
        diplome: 'badge bg-info'
      }
      return classes[status] || 'badge bg-secondary'
    }
    
    const getInscriptionStatusLabel = (status) => {
      const labels = {
        active: 'Active',
        terminee: 'Terminée',
        annulee: 'Annulée'
      }
      return labels[status] || status
    }
    
    const getInscriptionStatusBadgeClass = (status) => {
      const classes = {
        active: 'badge bg-success',
        terminee: 'badge bg-info',
        annulee: 'badge bg-danger'
      }
      return classes[status] || 'badge bg-secondary'
    }
    
    const formatDate = (date) => {
      if (!date) return null
      return new Date(date).toLocaleDateString('fr-FR')
    }
    
    // Lifecycle
    onMounted(() => {
      fetchEtudiants()
      fetchPromotions()
    })
    
    return {
      userStore,
      loading,
      submitting,
      etudiants,
      promotions,
      selectedEtudiant,
      showAddModal,
      showEditModal,
      showViewModal,
      formData,
      filters,
      pagination,
      errors,
      isAdmin,
      fetchEtudiants,
      fetchPromotions,
      resetFilters,
      changePage,
      getPageNumbers,
      debounceSearch,
      openAddModal,
      editEtudiant,
      viewEtudiant,
      deleteEtudiant,
      submitForm,
      resetForm,
      closeModal,
      getPromotionName,
      getStatusLabel,
      getStatusBadgeClass,
      getInscriptionStatusLabel,
      getInscriptionStatusBadgeClass,
      formatDate
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

.filters-section .card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.students-list .card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: var(--dark-color);
}

.table td {
  vertical-align: middle;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
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

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pagination .page-link {
  color: var(--primary-color);
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .filters-section .row > div {
    margin-bottom: 1rem;
  }
  
  .table-responsive {
    font-size: 0.9rem;
  }
  
  .btn-group .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>