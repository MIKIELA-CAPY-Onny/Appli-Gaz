<template>
  <div class="promotions-page">
    <!-- En-tête de la page -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">
            <i class="fas fa-graduation-cap me-2"></i>
            Gestion des Promotions
          </h1>
          <p class="page-subtitle">
            Gérez les promotions et années d'études de l'université
          </p>
        </div>
        <button
          v-if="userStore.isAdmin"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <i class="fas fa-plus me-2"></i>
          Nouvelle Promotion
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
                  placeholder="Nom de la promotion, année..."
                  @input="debounceSearch"
                />
              </div>
            </div>
            
            <div class="col-md-3 mb-3">
              <label for="anneeFilter" class="form-label">Année</label>
              <select
                id="anneeFilter"
                v-model="filters.annee"
                class="form-select"
                @change="fetchPromotions"
              >
                <option value="">Toutes les années</option>
                <option
                  v-for="annee in annees"
                  :key="annee"
                  :value="annee"
                >
                  {{ annee }}-{{ annee + 1 }}
                </option>
              </select>
            </div>
            
            <div class="col-md-3 mb-3">
              <label for="statutFilter" class="form-label">Statut</label>
              <select
                id="statutFilter"
                v-model="filters.statut"
                class="form-select"
                @change="fetchPromotions"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminee">Terminée</option>
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
    
    <!-- Statistiques rapides -->
    <div class="stats-section mb-4">
      <div class="row">
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalPromotions || 0 }}</div>
              <div class="stats-label">Total Promotions</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalEtudiants || 0 }}</div>
              <div class="stats-label">Total Étudiants</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-book"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalModules || 0 }}</div>
              <div class="stats-label">Total Modules</div>
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
      </div>
    </div>
    
    <!-- Liste des promotions -->
    <div class="promotions-list">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-list me-2"></i>
            Liste des Promotions
            <span class="badge bg-primary ms-2">{{ pagination.total || 0 }}</span>
          </h5>
          
          <div class="d-flex align-items-center gap-2">
            <button
              v-if="userStore.isAdmin"
              @click="exportPromotions"
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
              @change="fetchPromotions"
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
            <p class="mt-3">Chargement des promotions...</p>
          </div>
          
          <div v-else-if="promotions.length === 0" class="text-center py-5">
            <i class="fas fa-graduation-cap fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Aucune promotion trouvée</h5>
            <p class="text-muted">
              {{ filters.search || filters.annee || filters.statut 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par ajouter une promotion' }}
            </p>
          </div>
          
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Année</th>
                    <th>Étudiants</th>
                    <th>Modules</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="promotion in promotions" :key="promotion.id">
                    <td>
                      <div>
                        <div class="fw-bold">{{ promotion.nom }}</div>
                        <small class="text-muted">{{ promotion.description || 'Aucune description' }}</small>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-info">
                        {{ promotion.annee }}-{{ promotion.annee + 1 }}
                      </span>
                    </td>
                    <td>
                      <div class="text-center">
                        <div class="h5 text-primary mb-0">{{ promotion.etudiants?.length || 0 }}</div>
                        <small class="text-muted">étudiants</small>
                      </div>
                    </td>
                    <td>
                      <div class="text-center">
                        <div class="h5 text-success mb-0">{{ promotion.modules?.length || 0 }}</div>
                        <small class="text-muted">modules</small>
                      </div>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(promotion.statut)">
                        {{ getStatusLabel(promotion.statut) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button
                          @click="viewPromotion(promotion)"
                          class="btn btn-sm btn-outline-info"
                          title="Voir les détails"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="editPromotion(promotion)"
                          class="btn btn-sm btn-outline-warning"
                          title="Modifier"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="deletePromotion(promotion)"
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
    
    <!-- Modal d'ajout/modification de promotion -->
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
              <i class="fas fa-graduation-cap me-2" v-if="showAddModal"></i>
              <i class="fas fa-edit me-2" v-else></i>
              {{ showAddModal ? 'Nouvelle Promotion' : 'Modifier la Promotion' }}
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
                    placeholder="ex: Licence 1 Informatique"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.nom }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="annee" class="form-label">Année *</label>
                  <select
                    id="annee"
                    v-model="formData.annee"
                    class="form-select"
                    :class="{ 'is-invalid': errors.annee }"
                    required
                  >
                    <option value="">Sélectionner une année</option>
                    <option
                      v-for="annee in annees"
                      :key="annee"
                      :value="annee"
                    >
                      {{ annee }}-{{ annee + 1 }}
                    </option>
                  </select>
                  <div class="invalid-feedback">{{ errors.annee }}</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="capacite" class="form-label">Capacité d'accueil</label>
                  <input
                    id="capacite"
                    v-model="formData.capacite"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.capacite }"
                    min="1"
                    max="1000"
                    placeholder="ex: 150"
                  />
                  <div class="invalid-feedback">{{ errors.capacite }}</div>
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
                    <option value="inactive">Inactive</option>
                    <option value="terminee">Terminée</option>
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
                  placeholder="Description de la promotion..."
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
    
    <!-- Modal de détails de la promotion -->
    <div
      class="modal fade"
      :class="{ show: showViewModal }"
      :style="{ display: showViewModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-graduation-cap me-2"></i>
              Détails de la Promotion
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="showViewModal = false"
            ></button>
          </div>
          
          <div class="modal-body" v-if="selectedPromotion">
            <div class="row">
              <div class="col-md-6">
                <h6>Informations générales</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Nom:</strong></td>
                    <td>{{ selectedPromotion.nom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Année:</strong></td>
                    <td>{{ selectedPromotion.annee }}-{{ selectedPromotion.annee + 1 }}</td>
                  </tr>
                  <tr>
                    <td><strong>Description:</strong></td>
                    <td>{{ selectedPromotion.description || 'Aucune description' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Capacité:</strong></td>
                    <td>{{ selectedPromotion.capacite || 'Non définie' }} étudiants</td>
                  </tr>
                </table>
              </div>
              
              <div class="col-md-6">
                <h6>Informations académiques</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Statut:</strong></td>
                    <td>
                      <span :class="getStatusBadgeClass(selectedPromotion.statut)">
                        {{ getStatusLabel(selectedPromotion.statut) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Date de début:</strong></td>
                    <td>{{ formatDate(selectedPromotion.date_debut) || 'Non définie' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Date de fin:</strong></td>
                    <td>{{ formatDate(selectedPromotion.date_fin) || 'Non définie' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Étudiants inscrits:</strong></td>
                    <td>{{ selectedPromotion.etudiants?.length || 0 }}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <!-- Modules de la promotion -->
            <div class="mt-4">
              <h6>Modules de la promotion</h6>
              <div v-if="selectedPromotion.modules && selectedPromotion.modules.length > 0">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Nom</th>
                        <th>Enseignant</th>
                        <th>Crédits</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="module in selectedPromotion.modules" :key="module.id">
                        <td>{{ module.code }}</td>
                        <td>{{ module.nom }}</td>
                        <td>{{ module.enseignant?.nom }} {{ module.enseignant?.prenom }}</td>
                        <td>{{ module.credits }}</td>
                        <td>
                          <span :class="getModuleStatusBadgeClass(module.statut)">
                            {{ getModuleStatusLabel(module.statut) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="text-muted">
                Aucun module défini pour cette promotion
              </div>
            </div>
            
            <!-- Étudiants de la promotion -->
            <div class="mt-4">
              <h6>Étudiants de la promotion</h6>
              <div v-if="selectedPromotion.etudiants && selectedPromotion.etudiants.length > 0">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Matricule</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="etudiant in selectedPromotion.etudiants" :key="etudiant.id">
                        <td>{{ etudiant.matricule }}</td>
                        <td>{{ etudiant.nom }}</td>
                        <td>{{ etudiant.prenom }}</td>
                        <td>{{ etudiant.email }}</td>
                        <td>
                          <span :class="getEtudiantStatusBadgeClass(etudiant.statut)">
                            {{ getEtudiantStatusLabel(etudiant.statut) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="text-muted">
                Aucun étudiant inscrit dans cette promotion
              </div>
            </div>
            
            <!-- Statistiques -->
            <div class="mt-4">
              <h6>Statistiques</h6>
              <div class="row">
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-primary">{{ selectedPromotion.etudiants?.length || 0 }}</div>
                    <small class="text-muted">Étudiants inscrits</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-success">{{ selectedPromotion.modules?.length || 0 }}</div>
                    <small class="text-muted">Modules</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-warning">{{ getTotalCredits() }}</div>
                    <small class="text-muted">Crédits totaux</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-info">{{ getTauxRemplissage() }}%</div>
                    <small class="text-muted">Taux de remplissage</small>
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
              @click="editPromotion(selectedPromotion)"
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
  name: 'Promotions',
  setup() {
    const userStore = useUserStore()
    
    // State
    const loading = ref(false)
    const submitting = ref(false)
    const promotions = ref([])
    const selectedPromotion = ref(null)
    const stats = ref({})
    
    // Modals
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    
    // Form data
    const formData = ref({
      nom: '',
      annee: '',
      description: '',
      capacite: '',
      date_debut: '',
      date_fin: '',
      statut: 'active'
    })
    
    // Filters and pagination
    const filters = ref({
      search: '',
      annee: '',
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
    const annees = computed(() => {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        years.push(i)
      }
      return years
    })
    
    // Methods
    const fetchPromotions = async () => {
      try {
        loading.value = true
        
        const params = new URLSearchParams({
          page: pagination.value.page,
          limit: pagination.value.limit
        })
        
        if (filters.value.search) {
          params.append('search', filters.value.search)
        }
        if (filters.value.annee) {
          params.append('annee', filters.value.annee)
        }
        if (filters.value.statut) {
          params.append('statut', filters.value.statut)
        }
        
        const response = await axios.get(`/api/promotions?${params.toString()}`)
        
        promotions.value = response.data.promotions || []
        pagination.value = {
          ...pagination.value,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des promotions:', error)
        toast.error('Erreur lors du chargement des promotions')
      } finally {
        loading.value = false
      }
    }
    
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/promotions/statistiques/globales')
        stats.value = response.data.statistiques || {}
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
      }
    }
    
    const resetFilters = () => {
      filters.value = {
        search: '',
        annee: '',
        statut: ''
      }
      pagination.value.page = 1
      fetchPromotions()
    }
    
    const changePage = (page) => {
      pagination.value.page = page
      fetchPromotions()
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
        fetchPromotions()
      }, 500)
    }
    
    let searchTimeout = null
    
    const openAddModal = () => {
      showAddModal.value = true
      resetForm()
    }
    
    const editPromotion = (promotion) => {
      selectedPromotion.value = promotion
      formData.value = { ...promotion }
      showEditModal.value = true
      showViewModal.value = false
      showAddModal.value = false
    }
    
    const viewPromotion = async (promotion) => {
      try {
        const response = await axios.get(`/api/promotions/${promotion.id}`)
        selectedPromotion.value = response.data.promotion
        showViewModal.value = true
        showAddModal.value = false
        showEditModal.value = false
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error)
        toast.error('Erreur lors du chargement des détails')
      }
    }
    
    const deletePromotion = async (promotion) => {
      try {
        const result = await Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: `Voulez-vous vraiment supprimer la promotion ${promotion.nom} ?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Oui, supprimer',
          cancelButtonText: 'Annuler'
        })
        
        if (result.isConfirmed) {
          await axios.delete(`/api/promotions/${promotion.id}`)
          toast.success('Promotion supprimée avec succès')
          fetchPromotions()
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
          await axios.post('/api/promotions', formData.value)
          toast.success('Promotion créée avec succès')
        } else {
          await axios.put(`/api/promotions/${selectedPromotion.value.id}`, formData.value)
          toast.success('Promotion modifiée avec succès')
        }
        
        closeModal()
        fetchPromotions()
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
        nom: '',
        annee: '',
        description: '',
        capacite: '',
        date_debut: '',
        date_fin: '',
        statut: 'active'
      }
      errors.value = {}
    }
    
    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      selectedPromotion.value = null
      resetForm()
    }
    
    const exportPromotions = async () => {
      try {
        const params = new URLSearchParams()
        
        if (filters.value.search) params.append('search', filters.value.search)
        if (filters.value.annee) params.append('annee', filters.value.annee)
        if (filters.value.statut) params.append('statut', filters.value.statut)
        
        const response = await axios.get(`/api/promotions/export?${params.toString()}`, {
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'promotions_export.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        toast.success('Export réussi')
      } catch (error) {
        console.error('Erreur lors de l\'export:', error)
        toast.error('Erreur lors de l\'export')
      }
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        active: 'Active',
        inactive: 'Inactive',
        terminee: 'Terminée'
      }
      return labels[status] || status
    }
    
    const getStatusBadgeClass = (status) => {
      const classes = {
        active: 'badge bg-success',
        inactive: 'badge bg-warning',
        terminee: 'badge bg-info'
      }
      return classes[status] || 'badge bg-secondary'
    }
    
    const getModuleStatusLabel = (status) => {
      const labels = {
        actif: 'Actif',
        inactif: 'Inactif',
        termine: 'Terminé'
      }
      return labels[status] || status
    }
    
    const getModuleStatusBadgeClass = (status) => {
      const classes = {
        actif: 'badge bg-success',
        inactif: 'badge bg-danger',
        termine: 'badge bg-info'
      }
      return classes[status] || 'badge bg-secondary'
    }
    
    const getEtudiantStatusLabel = (status) => {
      const labels = {
        actif: 'Actif',
        inactif: 'Inactif',
        diplome: 'Diplômé'
      }
      return labels[status] || status
    }
    
    const getEtudiantStatusBadgeClass = (status) => {
      const classes = {
        actif: 'badge bg-success',
        inactif: 'badge bg-danger',
        diplome: 'badge bg-info'
      }
      return classes[status] || 'badge bg-secondary'
    }
    
    const getTotalCredits = () => {
      if (!selectedPromotion.value?.modules) return 0
      return selectedPromotion.value.modules.reduce((total, module) => total + (module.credits || 0), 0)
    }
    
    const getTauxRemplissage = () => {
      if (!selectedPromotion.value?.capacite) return 0
      const etudiants = selectedPromotion.value.etudiants?.length || 0
      return Math.round((etudiants / selectedPromotion.value.capacite) * 100)
    }
    
    const formatDate = (date) => {
      if (!date) return null
      return new Date(date).toLocaleDateString('fr-FR')
    }
    
    // Lifecycle
    onMounted(() => {
      fetchPromotions()
      fetchStats()
    })
    
    return {
      userStore,
      loading,
      submitting,
      promotions,
      selectedPromotion,
      stats,
      showAddModal,
      showEditModal,
      showViewModal,
      formData,
      filters,
      pagination,
      errors,
      isAdmin,
      annees,
      fetchPromotions,
      fetchStats,
      resetFilters,
      changePage,
      getPageNumbers,
      debounceSearch,
      openAddModal,
      editPromotion,
      viewPromotion,
      deletePromotion,
      submitForm,
      resetForm,
      closeModal,
      exportPromotions,
      getStatusLabel,
      getStatusBadgeClass,
      getModuleStatusLabel,
      getModuleStatusBadgeClass,
      getEtudiantStatusLabel,
      getEtudiantStatusBadgeClass,
      getTotalCredits,
      getTauxRemplissage,
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

.stats-section .stats-card {
  background: linear-gradient(135deg, var(--primary-color), var(--success-color));
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

.promotions-list .card {
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