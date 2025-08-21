<template>
  <div class="modules-page">
    <!-- En-tête de la page -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">
            <i class="fas fa-book me-2"></i>
            Gestion des Modules
          </h1>
          <p class="page-subtitle">
            Gérez les modules et cours de l'université
          </p>
        </div>
        <button
          v-if="userStore.isAdmin"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <i class="fas fa-plus me-2"></i>
          Nouveau Module
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
                  placeholder="Nom du module, code..."
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
                @change="fetchModules"
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
              <label for="enseignantFilter" class="form-label">Enseignant</label>
              <select
                id="enseignantFilter"
                v-model="filters.enseignant"
                class="form-select"
                @change="fetchModules"
              >
                <option value="">Tous les enseignants</option>
                <option
                  v-for="enseignant in enseignants"
                  :key="enseignant.id"
                  :value="enseignant.id"
                >
                  {{ enseignant.nom }} {{ enseignant.prenom }}
                </option>
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
    
    <!-- Liste des modules -->
    <div class="modules-list">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-list me-2"></i>
            Liste des Modules
            <span class="badge bg-primary ms-2">{{ pagination.total || 0 }}</span>
          </h5>
          
          <div class="d-flex align-items-center">
            <label for="itemsPerPage" class="form-label me-2 mb-0">Par page:</label>
            <select
              id="itemsPerPage"
              v-model="pagination.limit"
              class="form-select form-select-sm"
              style="width: auto;"
              @change="fetchModules"
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
            <p class="mt-3">Chargement des modules...</p>
          </div>
          
          <div v-else-if="modules.length === 0" class="text-center py-5">
            <i class="fas fa-book fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Aucun module trouvé</h5>
            <p class="text-muted">
              {{ filters.search || filters.promotion || filters.enseignant 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par ajouter un module' }}
            </p>
          </div>
          
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Nom</th>
                    <th>Enseignant</th>
                    <th>Promotion</th>
                    <th>Crédits</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="module in modules" :key="module.id">
                    <td>
                      <span class="badge bg-secondary">{{ module.code }}</span>
                    </td>
                    <td>
                      <strong>{{ module.nom }}</strong>
                      <br>
                      <small class="text-muted">{{ module.description }}</small>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-2">
                          <i class="fas fa-user-tie"></i>
                        </div>
                        <div>
                          <div class="fw-bold">{{ module.enseignant?.nom }} {{ module.enseignant?.prenom }}</div>
                          <small class="text-muted">{{ module.enseignant?.email }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-info">
                        {{ getPromotionName(module.promotion_id) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-warning">{{ module.credits }} crédits</span>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(module.statut)">
                        {{ getStatusLabel(module.statut) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button
                          @click="viewModule(module)"
                          class="btn btn-sm btn-outline-info"
                          title="Voir les détails"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="editModule(module)"
                          class="btn btn-sm btn-outline-warning"
                          title="Modifier"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="deleteModule(module)"
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
    
    <!-- Modal d'ajout/modification de module -->
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
              <i class="fas fa-book me-2" v-if="showAddModal"></i>
              <i class="fas fa-edit me-2" v-else></i>
              {{ showAddModal ? 'Nouveau Module' : 'Modifier le Module' }}
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
                  <label for="code" class="form-label">Code *</label>
                  <input
                    id="code"
                    v-model="formData.code"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.code }"
                    placeholder="ex: INFO101"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.code }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="nom" class="form-label">Nom *</label>
                  <input
                    id="nom"
                    v-model="formData.nom"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.nom }"
                    placeholder="ex: Introduction à l'informatique"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.nom }}</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="enseignant_id" class="form-label">Enseignant *</label>
                  <select
                    id="enseignant_id"
                    v-model="formData.enseignant_id"
                    class="form-select"
                    :class="{ 'is-invalid': errors.enseignant_id }"
                    required
                  >
                    <option value="">Sélectionner un enseignant</option>
                    <option
                      v-for="enseignant in enseignants"
                      :key="enseignant.id"
                      :value="enseignant.id"
                    >
                      {{ enseignant.nom }} {{ enseignant.prenom }}
                    </option>
                  </select>
                  <div class="invalid-feedback">{{ errors.enseignant_id }}</div>
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
                <div class="col-md-4 mb-3">
                  <label for="credits" class="form-label">Crédits *</label>
                  <input
                    id="credits"
                    v-model="formData.credits"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.credits }"
                    min="1"
                    max="10"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.credits }}</div>
                </div>
                
                <div class="col-md-4 mb-3">
                  <label for="volume_horaire" class="form-label">Volume horaire (h)</label>
                  <input
                    id="volume_horaire"
                    v-model="formData.volume_horaire"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.volume_horaire }"
                    min="10"
                    max="200"
                  />
                  <div class="invalid-feedback">{{ errors.volume_horaire }}</div>
                </div>
                
                <div class="col-md-4 mb-3">
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
                    <option value="termine">Terminé</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.statut }}</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  class="form-control"
                  rows="3"
                  :class="{ 'is-invalid': errors.description }"
                  placeholder="Description détaillée du module..."
                ></textarea>
                <div class="invalid-feedback">{{ errors.description }}</div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="date_debut" class="form-label">Date de début</label>
                  <input
                    id="date_debut"
                    v-model="formData.date_debut"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors.date_debut }"
                  />
                  <div class="invalid-feedback">{{ errors.date_debut }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="date_fin" class="form-label">Date de fin</label>
                  <input
                    id="date_fin"
                    v-model="formData.date_fin"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors.date_fin }"
                  />
                  <div class="invalid-feedback">{{ errors.date_fin }}</div>
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
    
    <!-- Modal de détails du module -->
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
              <i class="fas fa-book me-2"></i>
              Détails du Module
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="showViewModal = false"
            ></button>
          </div>
          
          <div class="modal-body" v-if="selectedModule">
            <div class="row">
              <div class="col-md-6">
                <h6>Informations générales</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Code:</strong></td>
                    <td>{{ selectedModule.code }}</td>
                  </tr>
                  <tr>
                    <td><strong>Nom:</strong></td>
                    <td>{{ selectedModule.nom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Description:</strong></td>
                    <td>{{ selectedModule.description || 'Aucune description' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Crédits:</strong></td>
                    <td>{{ selectedModule.credits }}</td>
                  </tr>
                  <tr>
                    <td><strong>Volume horaire:</strong></td>
                    <td>{{ selectedModule.volume_horaire || 'Non défini' }} heures</td>
                  </tr>
                </table>
              </div>
              
              <div class="col-md-6">
                <h6>Informations académiques</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Enseignant:</strong></td>
                    <td>{{ selectedModule.enseignant?.nom }} {{ selectedModule.enseignant?.prenom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Promotion:</strong></td>
                    <td>{{ getPromotionName(selectedModule.promotion_id) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Statut:</strong></td>
                    <td>
                      <span :class="getStatusBadgeClass(selectedModule.statut)">
                        {{ getStatusLabel(selectedModule.statut) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Date de début:</strong></td>
                    <td>{{ formatDate(selectedModule.date_debut) || 'Non définie' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Date de fin:</strong></td>
                    <td>{{ formatDate(selectedModule.date_fin) || 'Non définie' }}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <!-- Étudiants inscrits -->
            <div class="mt-4">
              <h6>Étudiants inscrits</h6>
              <div v-if="selectedModule.inscriptions && selectedModule.inscriptions.length > 0">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Étudiant</th>
                        <th>Matricule</th>
                        <th>Date d'inscription</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="inscription in selectedModule.inscriptions" :key="inscription.id">
                        <td>{{ inscription.etudiant?.nom }} {{ inscription.etudiant?.prenom }}</td>
                        <td>{{ inscription.etudiant?.matricule }}</td>
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
                Aucun étudiant inscrit
              </div>
            </div>
            
            <!-- Statistiques -->
            <div class="mt-4">
              <h6>Statistiques</h6>
              <div class="row">
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-primary">{{ selectedModule.inscriptions?.length || 0 }}</div>
                    <small class="text-muted">Étudiants inscrits</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-success">{{ selectedModule.notes?.length || 0 }}</div>
                    <small class="text-muted">Notes saisies</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-warning">{{ selectedModule.absences?.length || 0 }}</div>
                    <small class="text-muted">Absences</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-info">{{ selectedModule.volume_horaire || 0 }}h</div>
                    <small class="text-muted">Volume horaire</small>
                  </div>
                </div>
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
              @click="editModule(selectedModule)"
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
  name: 'Modules',
  setup() {
    const userStore = useUserStore()
    
    // State
    const loading = ref(false)
    const submitting = ref(false)
    const modules = ref([])
    const promotions = ref([])
    const enseignants = ref([])
    const selectedModule = ref(null)
    
    // Modals
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    
    // Form data
    const formData = ref({
      code: '',
      nom: '',
      description: '',
      enseignant_id: '',
      promotion_id: '',
      credits: 3,
      volume_horaire: '',
      date_debut: '',
      date_fin: '',
      statut: 'actif'
    })
    
    // Filters and pagination
    const filters = ref({
      search: '',
      promotion: '',
      enseignant: ''
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
    const fetchModules = async () => {
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
        if (filters.value.enseignant) {
          params.append('enseignant_id', filters.value.enseignant)
        }
        
        const response = await axios.get(`/api/modules?${params.toString()}`)
        
        modules.value = response.data.modules || []
        pagination.value = {
          ...pagination.value,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des modules:', error)
        toast.error('Erreur lors du chargement des modules')
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
    
    const fetchEnseignants = async () => {
      try {
        const response = await axios.get('/api/utilisateurs?role=enseignant')
        enseignants.value = response.data.utilisateurs || []
      } catch (error) {
        console.error('Erreur lors de la récupération des enseignants:', error)
      }
    }
    
    const resetFilters = () => {
      filters.value = {
        search: '',
        promotion: '',
        enseignant: ''
      }
      pagination.value.page = 1
      fetchModules()
    }
    
    const changePage = (page) => {
      pagination.value.page = page
      fetchModules()
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
        fetchModules()
      }, 500)
    }
    
    let searchTimeout = null
    
    const openAddModal = () => {
      showAddModal.value = true
      resetForm()
    }
    
    const editModule = (module) => {
      selectedModule.value = module
      formData.value = { ...module }
      showEditModal.value = true
      showViewModal.value = false
      showAddModal.value = false
    }
    
    const viewModule = async (module) => {
      try {
        const response = await axios.get(`/api/modules/${module.id}`)
        selectedModule.value = response.data.module
        showViewModal.value = true
        showAddModal.value = false
        showEditModal.value = false
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error)
        toast.error('Erreur lors du chargement des détails')
      }
    }
    
    const deleteModule = async (module) => {
      try {
        const result = await Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: `Voulez-vous vraiment supprimer le module ${module.nom} ?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Oui, supprimer',
          cancelButtonText: 'Annuler'
        })
        
        if (result.isConfirmed) {
          await axios.delete(`/api/modules/${module.id}`)
          toast.success('Module supprimé avec succès')
          fetchModules()
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
          await axios.post('/api/modules', formData.value)
          toast.success('Module créé avec succès')
        } else {
          await axios.put(`/api/modules/${selectedModule.value.id}`, formData.value)
          toast.success('Module modifié avec succès')
        }
        
        closeModal()
        fetchModules()
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
        code: '',
        nom: '',
        description: '',
        enseignant_id: '',
        promotion_id: '',
        credits: 3,
        volume_horaire: '',
        date_debut: '',
        date_fin: '',
        statut: 'actif'
      }
      errors.value = {}
    }
    
    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      selectedModule.value = null
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
        termine: 'Terminé'
      }
      return labels[status] || status
    }
    
    const getStatusBadgeClass = (status) => {
      const classes = {
        actif: 'badge bg-success',
        inactif: 'badge bg-danger',
        termine: 'badge bg-info'
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
      fetchModules()
      fetchPromotions()
      fetchEnseignants()
    })
    
    return {
      userStore,
      loading,
      submitting,
      modules,
      promotions,
      enseignants,
      selectedModule,
      showAddModal,
      showEditModal,
      showViewModal,
      formData,
      filters,
      pagination,
      errors,
      isAdmin,
      fetchModules,
      fetchPromotions,
      fetchEnseignants,
      resetFilters,
      changePage,
      getPageNumbers,
      debounceSearch,
      openAddModal,
      editModule,
      viewModule,
      deleteModule,
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
  background: linear-gradient(135deg, var(--primary-color), var(--success-color));
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

.modules-list .card {
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