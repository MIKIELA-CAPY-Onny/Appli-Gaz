<template>
  <div class="inscriptions-page">
    <!-- En-tête de la page -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">
            <i class="fas fa-user-plus me-2"></i>
            Gestion des Inscriptions
          </h1>
          <p class="page-subtitle">
            Gérez les inscriptions des étudiants aux modules
          </p>
        </div>
        <button
          v-if="userStore.isAdmin"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <i class="fas fa-plus me-2"></i>
          Nouvelle Inscription
        </button>
      </div>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="filters-section mb-4">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 mb-3">
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
                  placeholder="Nom étudiant, module..."
                  @input="debounceSearch"
                />
              </div>
            </div>
            
            <div class="col-md-2 mb-3">
              <label for="etudiantFilter" class="form-label">Étudiant</label>
              <select
                id="etudiantFilter"
                v-model="filters.etudiant"
                class="form-select"
                @change="fetchInscriptions"
              >
                <option value="">Tous les étudiants</option>
                <option
                  v-for="etudiant in etudiants"
                  :key="etudiant.id"
                  :value="etudiant.id"
                >
                  {{ etudiant.nom }} {{ etudiant.prenom }}
                </option>
              </select>
            </div>
            
            <div class="col-md-2 mb-3">
              <label for="moduleFilter" class="form-label">Module</label>
              <select
                id="moduleFilter"
                v-model="filters.module"
                class="form-select"
                @change="fetchInscriptions"
              >
                <option value="">Tous les modules</option>
                <option
                  v-for="module in modules"
                  :key="module.id"
                  :value="module.id"
                >
                  {{ module.code }} - {{ module.nom }}
                </option>
              </select>
            </div>
            
            <div class="col-md-2 mb-3">
              <label for="promotionFilter" class="form-label">Promotion</label>
              <select
                id="promotionFilter"
                v-model="filters.promotion"
                class="form-select"
                @change="fetchInscriptions"
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
            
            <div class="col-md-2 mb-3">
              <label for="statutFilter" class="form-label">Statut</label>
              <select
                id="statutFilter"
                v-model="filters.statut"
                class="form-select"
                @change="fetchInscriptions"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
            
            <div class="col-md-1 mb-3 d-flex align-items-end">
              <button
                @click="resetFilters"
                class="btn btn-outline-secondary w-100"
                title="Réinitialiser"
              >
                <i class="fas fa-undo"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Statistiques rapides -->
    <div class="stats-section mb-4">
      <div class="row">
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalInscriptions || 0 }}</div>
              <div class="stats-label">Total Inscriptions</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.inscriptionsActives || 0 }}</div>
              <div class="stats-label">Inscriptions Actives</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.inscriptionsTerminees || 0 }}</div>
              <div class="stats-label">Terminées</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.inscriptionsAnnulees || 0 }}</div>
              <div class="stats-label">Annulées</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Liste des inscriptions -->
    <div class="inscriptions-list">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-list me-2"></i>
            Liste des Inscriptions
            <span class="badge bg-primary ms-2">{{ pagination.total || 0 }}</span>
          </h5>
          
          <div class="d-flex align-items-center gap-2">
            <button
              v-if="userStore.isAdmin"
              @click="exportInscriptions"
              class="btn btn-outline-success btn-sm"
            >
              <i class="fas fa-download me-2"></i>
              Exporter
            </button>
            
            <label for="itemsPerPage" class="form-label me-2 mb-0">Par page:</label>
            <select
              id="itemsPerPage"
              v-model="pagination.limit"
              class="form-select form-select-sm"
              style="width: auto;"
              @change="fetchInscriptions"
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
            <p class="mt-3">Chargement des inscriptions...</p>
          </div>
          
          <div v-else-if="inscriptions.length === 0" class="text-center py-5">
            <i class="fas fa-user-plus fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Aucune inscription trouvée</h5>
            <p class="text-muted">
              {{ filters.search || filters.etudiant || filters.module || filters.promotion 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par ajouter une inscription' }}
            </p>
          </div>
          
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Étudiant</th>
                    <th>Module</th>
                    <th>Promotion</th>
                    <th>Date d'inscription</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inscription in inscriptions" :key="inscription.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-2">
                          <i class="fas fa-user-graduate"></i>
                        </div>
                        <div>
                          <div class="fw-bold">{{ inscription.etudiant?.nom }} {{ inscription.etudiant?.prenom }}</div>
                          <small class="text-muted">{{ inscription.etudiant?.matricule }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div class="fw-bold">{{ inscription.module?.code }}</div>
                        <small class="text-muted">{{ inscription.module?.nom }}</small>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-info">
                        {{ getPromotionName(inscription.etudiant?.promotion_id) }}
                      </span>
                    </td>
                    <td>
                      <small>{{ formatDate(inscription.date_inscription) }}</small>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(inscription.statut)">
                        {{ getStatusLabel(inscription.statut) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button
                          @click="viewInscription(inscription)"
                          class="btn btn-sm btn-outline-info"
                          title="Voir les détails"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="editInscription(inscription)"
                          class="btn btn-sm btn-outline-warning"
                          title="Modifier"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="deleteInscription(inscription)"
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
    
    <!-- Modal d'ajout/modification d'inscription -->
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
              <i class="fas fa-edit me-2" v-else></i>
              {{ showAddModal ? 'Nouvelle Inscription' : 'Modifier l\'Inscription' }}
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
                  <label for="etudiant_id" class="form-label">Étudiant *</label>
                  <select
                    id="etudiant_id"
                    v-model="formData.etudiant_id"
                    class="form-select"
                    :class="{ 'is-invalid': errors.etudiant_id }"
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    <option
                      v-for="etudiant in etudiants"
                      :key="etudiant.id"
                      :value="etudiant.id"
                    >
                      {{ etudiant.nom }} {{ etudiant.prenom }} ({{ etudiant.matricule }})
                    </option>
                  </select>
                  <div class="invalid-feedback">{{ errors.etudiant_id }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="module_id" class="form-label">Module *</label>
                  <select
                    id="module_id"
                    v-model="formData.module_id"
                    class="form-select"
                    :class="{ 'is-invalid': errors.module_id }"
                    required
                  >
                    <option value="">Sélectionner un module</option>
                    <option
                      v-for="module in modules"
                      :key="module.id"
                      :value="module.id"
                    >
                      {{ module.code }} - {{ module.nom }}
                    </option>
                  </select>
                  <div class="invalid-feedback">{{ errors.module_id }}</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="date_inscription" class="form-label">Date d'inscription *</label>
                  <input
                    id="date_inscription"
                    v-model="formData.date_inscription"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors.date_inscription }"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.date_inscription }}</div>
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
                    <option value="active">Active</option>
                    <option value="terminee">Terminée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.statut }}</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="commentaire" class="form-label">Commentaire</label>
                <textarea
                  id="commentaire"
                  v-model="formData.commentaire"
                  class="form-control"
                  rows="3"
                  :class="{ 'is-invalid': errors.commentaire }"
                  placeholder="Commentaire sur l'inscription..."
                ></textarea>
                <div class="invalid-feedback">{{ errors.commentaire }}</div>
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
    
    <!-- Modal de détails de l'inscription -->
    <div
      class="modal fade"
      :class="{ show: showViewModal }"
      :style="{ display: showViewModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-plus me-2"></i>
              Détails de l'Inscription
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="showViewModal = false"
            ></button>
          </div>
          
          <div class="modal-body" v-if="selectedInscription">
            <div class="row">
              <div class="col-md-6">
                <h6>Informations de l'étudiant</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Nom:</strong></td>
                    <td>{{ selectedInscription.etudiant?.nom }} {{ selectedInscription.etudiant?.prenom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Matricule:</strong></td>
                    <td>{{ selectedInscription.etudiant?.matricule }}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{{ selectedInscription.etudiant?.email }}</td>
                  </tr>
                  <tr>
                    <td><strong>Promotion:</strong></td>
                    <td>{{ getPromotionName(selectedInscription.etudiant?.promotion_id) }}</td>
                  </tr>
                </table>
              </div>
              
              <div class="col-md-6">
                <h6>Informations du module</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Code:</strong></td>
                    <td>{{ selectedInscription.module?.code }}</td>
                  </tr>
                  <tr>
                    <td><strong>Nom:</strong></td>
                    <td>{{ selectedInscription.module?.nom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Enseignant:</strong></td>
                    <td>{{ selectedInscription.module?.enseignant?.nom }} {{ selectedInscription.module?.enseignant?.prenom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Crédits:</strong></td>
                    <td>{{ selectedInscription.module?.credits }}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div class="mt-3">
              <h6>Informations de l'inscription</h6>
              <table class="table table-borderless">
                <tr>
                  <td><strong>Date d'inscription:</strong></td>
                  <td>{{ formatDate(selectedInscription.date_inscription) }}</td>
                </tr>
                <tr>
                  <td><strong>Statut:</strong></td>
                  <td>
                    <span :class="getStatusBadgeClass(selectedInscription.statut)">
                      {{ getStatusLabel(selectedInscription.statut) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="selectedInscription.commentaire">
                  <td><strong>Commentaire:</strong></td>
                  <td>{{ selectedInscription.commentaire }}</td>
                </tr>
              </table>
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
              @click="editInscription(selectedInscription)"
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
  name: 'Inscriptions',
  setup() {
    const userStore = useUserStore()
    
    // State
    const loading = ref(false)
    const submitting = ref(false)
    const inscriptions = ref([])
    const etudiants = ref([])
    const modules = ref([])
    const promotions = ref([])
    const selectedInscription = ref(null)
    const stats = ref({})
    
    // Modals
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    
    // Form data
    const formData = ref({
      etudiant_id: '',
      module_id: '',
      date_inscription: '',
      statut: 'active',
      commentaire: ''
    })
    
    // Filters and pagination
    const filters = ref({
      search: '',
      etudiant: '',
      module: '',
      promotion: '',
      statut: ''
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
    const fetchInscriptions = async () => {
      try {
        loading.value = true
        
        const params = new URLSearchParams({
          page: pagination.value.page,
          limit: pagination.value.limit
        })
        
        if (filters.value.search) {
          params.append('search', filters.value.search)
        }
        if (filters.value.etudiant) {
          params.append('etudiant_id', filters.value.etudiant)
        }
        if (filters.value.module) {
          params.append('module_id', filters.value.module)
        }
        if (filters.value.promotion) {
          params.append('promotion_id', filters.value.promotion)
        }
        if (filters.value.statut) {
          params.append('statut', filters.value.statut)
        }
        
        const response = await axios.get(`/api/inscriptions?${params.toString()}`)
        
        inscriptions.value = response.data.inscriptions || []
        pagination.value = {
          ...pagination.value,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des inscriptions:', error)
        toast.error('Erreur lors du chargement des inscriptions')
      } finally {
        loading.value = false
      }
    }
    
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/inscriptions/statistiques/globales')
        stats.value = response.data.statistiques || {}
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
      }
    }
    
    const fetchEtudiants = async () => {
      try {
        const response = await axios.get('/api/etudiants')
        etudiants.value = response.data.etudiants || []
      } catch (error) {
        console.error('Erreur lors de la récupération des étudiants:', error)
      }
    }
    
    const fetchModules = async () => {
      try {
        const response = await axios.get('/api/modules')
        modules.value = response.data.modules || []
      } catch (error) {
        console.error('Erreur lors de la récupération des modules:', error)
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
        etudiant: '',
        module: '',
        promotion: '',
        statut: ''
      }
      pagination.value.page = 1
      fetchInscriptions()
    }
    
    const changePage = (page) => {
      pagination.value.page = page
      fetchInscriptions()
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
        fetchInscriptions()
      }, 500)
    }
    
    let searchTimeout = null
    
    const openAddModal = () => {
      showAddModal.value = true
      resetForm()
    }
    
    const editInscription = (inscription) => {
      selectedInscription.value = inscription
      formData.value = { ...inscription }
      showEditModal.value = true
      showViewModal.value = false
      showAddModal.value = false
    }
    
    const viewInscription = async (inscription) => {
      try {
        const response = await axios.get(`/api/inscriptions/${inscription.id}`)
        selectedInscription.value = response.data.inscription
        showViewModal.value = true
        showAddModal.value = false
        showEditModal.value = false
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error)
        toast.error('Erreur lors du chargement des détails')
      }
    }
    
    const deleteInscription = async (inscription) => {
      try {
        const result = await Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: `Voulez-vous vraiment supprimer cette inscription ?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Oui, supprimer',
          cancelButtonText: 'Annuler'
        })
        
        if (result.isConfirmed) {
          await axios.delete(`/api/inscriptions/${inscription.id}`)
          toast.success('Inscription supprimée avec succès')
          fetchInscriptions()
          fetchStats()
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
          await axios.post('/api/inscriptions', formData.value)
          toast.success('Inscription créée avec succès')
        } else {
          await axios.put(`/api/inscriptions/${selectedInscription.value.id}`, formData.value)
          toast.success('Inscription modifiée avec succès')
        }
        
        closeModal()
        fetchInscriptions()
        fetchStats()
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
        etudiant_id: '',
        module_id: '',
        date_inscription: '',
        statut: 'active',
        commentaire: ''
      }
      errors.value = {}
    }
    
    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      selectedInscription.value = null
      resetForm()
    }
    
    const exportInscriptions = async () => {
      try {
        const params = new URLSearchParams()
        
        if (filters.value.search) params.append('search', filters.value.search)
        if (filters.value.etudiant) params.append('etudiant_id', filters.value.etudiant)
        if (filters.value.module) params.append('module_id', filters.value.module)
        if (filters.value.promotion) params.append('promotion_id', filters.value.promotion)
        if (filters.value.statut) params.append('statut', filters.value.statut)
        
        const response = await axios.get(`/api/inscriptions/export?${params.toString()}`, {
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'inscriptions_export.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        toast.success('Export réussi')
      } catch (error) {
        console.error('Erreur lors de l\'export:', error)
        toast.error('Erreur lors de l\'export')
      }
    }
    
    const getPromotionName = (promotionId) => {
      const promotion = promotions.value.find(p => p.id === promotionId)
      return promotion ? promotion.nom : 'Promotion inconnue'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        active: 'Active',
        terminee: 'Terminée',
        annulee: 'Annulée'
      }
      return labels[status] || status
    }
    
    const getStatusBadgeClass = (status) => {
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
      fetchInscriptions()
      fetchStats()
      fetchEtudiants()
      fetchModules()
      fetchPromotions()
    })
    
    return {
      userStore,
      loading,
      submitting,
      inscriptions,
      etudiants,
      modules,
      promotions,
      selectedInscription,
      stats,
      showAddModal,
      showEditModal,
      showViewModal,
      formData,
      filters,
      pagination,
      errors,
      isAdmin,
      fetchInscriptions,
      fetchStats,
      fetchEtudiants,
      fetchModules,
      fetchPromotions,
      resetFilters,
      changePage,
      getPageNumbers,
      debounceSearch,
      openAddModal,
      editInscription,
      viewInscription,
      deleteInscription,
      submitForm,
      resetForm,
      closeModal,
      exportInscriptions,
      getPromotionName,
      getStatusLabel,
      getStatusBadgeClass,
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

.inscriptions-list .card {
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

.avatar-sm {
  width: 32px;
  height: 32px;
  background-color: var(--light-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
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