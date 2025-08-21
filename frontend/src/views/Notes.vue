<template>
  <div class="notes-page">
    <!-- En-tête de la page -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">
            <i class="fas fa-star me-2"></i>
            Gestion des Notes
          </h1>
          <p class="page-subtitle">
            Gérez les notes des étudiants par module
          </p>
        </div>
        <button
          v-if="['admin', 'enseignant'].includes(userStore.user?.role)"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <i class="fas fa-plus me-2"></i>
          Nouvelle Note
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
              <label for="moduleFilter" class="form-label">Module</label>
              <select
                id="moduleFilter"
                v-model="filters.module"
                class="form-select"
                @change="fetchNotes"
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
                @change="fetchNotes"
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
              <label for="typeFilter" class="form-label">Type</label>
              <select
                id="typeFilter"
                v-model="filters.type"
                class="form-select"
                @change="fetchNotes"
              >
                <option value="">Tous les types</option>
                <option value="controle">Contrôle</option>
                <option value="examen">Examen</option>
                <option value="tp">TP</option>
                <option value="projet">Projet</option>
              </select>
            </div>
            
            <div class="col-md-2 mb-3">
              <label for="noteFilter" class="form-label">Note min.</label>
              <input
                id="noteFilter"
                v-model="filters.noteMin"
                type="number"
                class="form-control"
                min="0"
                max="20"
                placeholder="0"
                @change="fetchNotes"
              />
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
              <i class="fas fa-star"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalNotes || 0 }}</div>
              <div class="stats-label">Total Notes</div>
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
              <i class="fas fa-trophy"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.noteMax || 'N/A' }}</div>
              <div class="stats-label">Note Maximale</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.noteMin || 'N/A' }}</div>
              <div class="stats-label">Note Minimale</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Liste des notes -->
    <div class="notes-list">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-list me-2"></i>
            Liste des Notes
            <span class="badge bg-primary ms-2">{{ pagination.total || 0 }}</span>
          </h5>
          
          <div class="d-flex align-items-center gap-2">
            <button
              v-if="['admin', 'enseignant'].includes(userStore.user?.role)"
              @click="exportNotes"
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
              @change="fetchNotes"
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
            <p class="mt-3">Chargement des notes...</p>
          </div>
          
          <div v-else-if="notes.length === 0" class="text-center py-5">
            <i class="fas fa-star fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Aucune note trouvée</h5>
            <p class="text-muted">
              {{ filters.search || filters.module || filters.promotion || filters.type 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par ajouter une note' }}
            </p>
          </div>
          
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Étudiant</th>
                    <th>Module</th>
                    <th>Type</th>
                    <th>Note</th>
                    <th>Coefficient</th>
                    <th>Date</th>
                    <th>Commentaire</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="note in notes" :key="note.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-2">
                          <i class="fas fa-user-graduate"></i>
                        </div>
                        <div>
                          <div class="fw-bold">{{ note.etudiant?.nom }} {{ note.etudiant?.prenom }}</div>
                          <small class="text-muted">{{ note.etudiant?.matricule }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div class="fw-bold">{{ note.module?.code }}</div>
                        <small class="text-muted">{{ note.module?.nom }}</small>
                      </div>
                    </td>
                    <td>
                      <span :class="getTypeBadgeClass(note.type_evaluation)">
                        {{ getTypeLabel(note.type_evaluation) }}
                      </span>
                    </td>
                    <td>
                      <span :class="getNoteBadgeClass(note.note)">
                        <strong>{{ note.note }}/20</strong>
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-secondary">{{ note.coefficient || 1 }}</span>
                    </td>
                    <td>
                      <small>{{ formatDate(note.date_evaluation) }}</small>
                    </td>
                    <td>
                      <span v-if="note.commentaire" class="text-muted">
                        {{ note.commentaire.length > 50 ? note.commentaire.substring(0, 50) + '...' : note.commentaire }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button
                          @click="viewNote(note)"
                          class="btn btn-sm btn-outline-info"
                          title="Voir les détails"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        
                        <button
                          v-if="['admin', 'enseignant'].includes(userStore.user?.role)"
                          @click="editNote(note)"
                          class="btn btn-sm btn-outline-warning"
                          title="Modifier"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin"
                          @click="deleteNote(note)"
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
    
    <!-- Modal d'ajout/modification de note -->
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
              <i class="fas fa-star me-2" v-if="showAddModal"></i>
              <i class="fas fa-edit me-2" v-else></i>
              {{ showAddModal ? 'Nouvelle Note' : 'Modifier la Note' }}
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
                <div class="col-md-4 mb-3">
                  <label for="note" class="form-label">Note *</label>
                  <input
                    id="note"
                    v-model="formData.note"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.note }"
                    min="0"
                    max="20"
                    step="0.01"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.note }}</div>
                </div>
                
                <div class="col-md-4 mb-3">
                  <label for="coefficient" class="form-label">Coefficient</label>
                  <input
                    id="coefficient"
                    v-model="formData.coefficient"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.coefficient }"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value="1"
                  />
                  <div class="invalid-feedback">{{ errors.coefficient }}</div>
                </div>
                
                <div class="col-md-4 mb-3">
                  <label for="type_evaluation" class="form-label">Type *</label>
                  <select
                    id="type_evaluation"
                    v-model="formData.type_evaluation"
                    class="form-select"
                    :class="{ 'is-invalid': errors.type_evaluation }"
                    required
                  >
                    <option value="">Sélectionner le type</option>
                    <option value="controle">Contrôle</option>
                    <option value="examen">Examen</option>
                    <option value="tp">TP</option>
                    <option value="projet">Projet</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.type_evaluation }}</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="date_evaluation" class="form-label">Date d'évaluation *</label>
                  <input
                    id="date_evaluation"
                    v-model="formData.date_evaluation"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors.date_evaluation }"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.date_evaluation }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="statut" class="form-label">Statut</label>
                  <select
                    id="statut"
                    v-model="formData.statut"
                    class="form-select"
                    :class="{ 'is-invalid': errors.statut }"
                  >
                    <option value="validee">Validée</option>
                    <option value="provisoire">Provisoire</option>
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
                  placeholder="Commentaire sur la note..."
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
    
    <!-- Modal de détails de la note -->
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
              <i class="fas fa-star me-2"></i>
              Détails de la Note
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="showViewModal = false"
            ></button>
          </div>
          
          <div class="modal-body" v-if="selectedNote">
            <div class="row">
              <div class="col-md-6">
                <h6>Informations de l'étudiant</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Nom:</strong></td>
                    <td>{{ selectedNote.etudiant?.nom }} {{ selectedNote.etudiant?.prenom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Matricule:</strong></td>
                    <td>{{ selectedNote.etudiant?.matricule }}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{{ selectedNote.etudiant?.email }}</td>
                  </tr>
                </table>
              </div>
              
              <div class="col-md-6">
                <h6>Informations de la note</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Module:</strong></td>
                    <td>{{ selectedNote.module?.code }} - {{ selectedNote.module?.nom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Note:</strong></td>
                    <td>
                      <span :class="getNoteBadgeClass(selectedNote.note)">
                        <strong>{{ selectedNote.note }}/20</strong>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Type:</strong></td>
                    <td>
                      <span :class="getTypeBadgeClass(selectedNote.type_evaluation)">
                        {{ getTypeLabel(selectedNote.type_evaluation) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Coefficient:</strong></td>
                    <td>{{ selectedNote.coefficient || 1 }}</td>
                  </tr>
                  <tr>
                    <td><strong>Date:</strong></td>
                    <td>{{ formatDate(selectedNote.date_evaluation) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Statut:</strong></td>
                    <td>
                      <span :class="getStatusBadgeClass(selectedNote.statut)">
                        {{ getStatusLabel(selectedNote.statut) }}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div class="mt-3" v-if="selectedNote.commentaire">
              <h6>Commentaire</h6>
              <p class="text-muted">{{ selectedNote.commentaire }}</p>
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
              v-if="['admin', 'enseignant'].includes(userStore.user?.role)"
              type="button"
              class="btn btn-primary"
              @click="editNote(selectedNote)"
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
  name: 'Notes',
  setup() {
    const userStore = useUserStore()
    
    // State
    const loading = ref(false)
    const submitting = ref(false)
    const notes = ref([])
    const modules = ref([])
    const promotions = ref([])
    const etudiants = ref([])
    const selectedNote = ref(null)
    const stats = ref({})
    
    // Modals
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    
    // Form data
    const formData = ref({
      etudiant_id: '',
      module_id: '',
      note: '',
      coefficient: 1,
      type_evaluation: '',
      date_evaluation: '',
      statut: 'validee',
      commentaire: ''
    })
    
    // Filters and pagination
    const filters = ref({
      search: '',
      module: '',
      promotion: '',
      type: '',
      noteMin: ''
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
    const isEnseignant = computed(() => userStore.isEnseignant)
    
    // Methods
    const fetchNotes = async () => {
      try {
        loading.value = true
        
        const params = new URLSearchParams({
          page: pagination.value.page,
          limit: pagination.value.limit
        })
        
        if (filters.value.search) {
          params.append('search', filters.value.search)
        }
        if (filters.value.module) {
          params.append('module_id', filters.value.module)
        }
        if (filters.value.promotion) {
          params.append('promotion_id', filters.value.promotion)
        }
        if (filters.value.type) {
          params.append('type_evaluation', filters.value.type)
        }
        if (filters.value.noteMin) {
          params.append('note_min', filters.value.noteMin)
        }
        
        const response = await axios.get(`/api/notes?${params.toString()}`)
        
        notes.value = response.data.notes || []
        pagination.value = {
          ...pagination.value,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error)
        toast.error('Erreur lors du chargement des notes')
      } finally {
        loading.value = false
      }
    }
    
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/notes/statistiques/globales')
        stats.value = response.data.statistiques || {}
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
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
    
    const fetchEtudiants = async () => {
      try {
        const response = await axios.get('/api/etudiants')
        etudiants.value = response.data.etudiants || []
      } catch (error) {
        console.error('Erreur lors de la récupération des étudiants:', error)
      }
    }
    
    const resetFilters = () => {
      filters.value = {
        search: '',
        module: '',
        promotion: '',
        type: '',
        noteMin: ''
      }
      pagination.value.page = 1
      fetchNotes()
    }
    
    const changePage = (page) => {
      pagination.value.page = page
      fetchNotes()
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
        fetchNotes()
      }, 500)
    }
    
    let searchTimeout = null
    
    const openAddModal = () => {
      showAddModal.value = true
      resetForm()
    }
    
    const editNote = (note) => {
      selectedNote.value = note
      formData.value = { ...note }
      showEditModal.value = true
      showViewModal.value = false
      showAddModal.value = false
    }
    
    const viewNote = async (note) => {
      try {
        const response = await axios.get(`/api/notes/${note.id}`)
        selectedNote.value = response.data.note
        showViewModal.value = true
        showAddModal.value = false
        showEditModal.value = false
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error)
        toast.error('Erreur lors du chargement des détails')
      }
    }
    
    const deleteNote = async (note) => {
      try {
        const result = await Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: `Voulez-vous vraiment supprimer cette note ?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Oui, supprimer',
          cancelButtonText: 'Annuler'
        })
        
        if (result.isConfirmed) {
          await axios.delete(`/api/notes/${note.id}`)
          toast.success('Note supprimée avec succès')
          fetchNotes()
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
          await axios.post('/api/notes', formData.value)
          toast.success('Note créée avec succès')
        } else {
          await axios.put(`/api/notes/${selectedNote.value.id}`, formData.value)
          toast.success('Note modifiée avec succès')
        }
        
        closeModal()
        fetchNotes()
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
        note: '',
        coefficient: 1,
        type_evaluation: '',
        date_evaluation: '',
        statut: 'validee',
        commentaire: ''
      }
      errors.value = {}
    }
    
    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      selectedNote.value = null
      resetForm()
    }
    
    const exportNotes = async () => {
      try {
        const params = new URLSearchParams()
        
        if (filters.value.search) params.append('search', filters.value.search)
        if (filters.value.module) params.append('module_id', filters.value.module)
        if (filters.value.promotion) params.append('promotion_id', filters.value.promotion)
        if (filters.value.type) params.append('type_evaluation', filters.value.type)
        if (filters.value.noteMin) params.append('note_min', filters.value.noteMin)
        
        const response = await axios.get(`/api/notes/export?${params.toString()}`, {
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'notes_export.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        toast.success('Export réussi')
      } catch (error) {
        console.error('Erreur lors de l\'export:', error)
        toast.error('Erreur lors de l\'export')
      }
    }
    
    const getTypeLabel = (type) => {
      const labels = {
        controle: 'Contrôle',
        examen: 'Examen',
        tp: 'TP',
        projet: 'Projet'
      }
      return labels[type] || type
    }
    
    const getTypeBadgeClass = (type) => {
      const classes = {
        controle: 'badge bg-primary',
        examen: 'badge bg-danger',
        tp: 'badge bg-success',
        projet: 'badge bg-warning'
      }
      return classes[type] || 'badge bg-secondary'
    }
    
    const getNoteBadgeClass = (note) => {
      if (note >= 16) return 'badge bg-success'
      if (note >= 14) return 'badge bg-info'
      if (note >= 12) return 'badge bg-warning'
      if (note >= 10) return 'badge bg-secondary'
      return 'badge bg-danger'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        validee: 'Validée',
        provisoire: 'Provisoire',
        annulee: 'Annulée'
      }
      return labels[status] || status
    }
    
    const getStatusBadgeClass = (status) => {
      const classes = {
        validee: 'badge bg-success',
        provisoire: 'badge bg-warning',
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
      fetchNotes()
      fetchStats()
      fetchModules()
      fetchPromotions()
      fetchEtudiants()
    })
    
    return {
      userStore,
      loading,
      submitting,
      notes,
      modules,
      promotions,
      etudiants,
      selectedNote,
      stats,
      showAddModal,
      showEditModal,
      showViewModal,
      formData,
      filters,
      pagination,
      errors,
      isAdmin,
      isEnseignant,
      fetchNotes,
      fetchStats,
      fetchModules,
      fetchPromotions,
      fetchEtudiants,
      resetFilters,
      changePage,
      getPageNumbers,
      debounceSearch,
      openAddModal,
      editNote,
      viewNote,
      deleteNote,
      submitForm,
      resetForm,
      closeModal,
      exportNotes,
      getTypeLabel,
      getTypeBadgeClass,
      getNoteBadgeClass,
      getStatusLabel,
      getStatusBadgeClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, var(--primary-color), var(--warning-color));
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

.notes-list .card {
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