<template>
  <div class="utilisateurs-page">
    <!-- En-tête de la page -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">
            <i class="fas fa-users-cog me-2"></i>
            Gestion des Utilisateurs
          </h1>
          <p class="page-subtitle">
            Gérez les comptes utilisateurs de la plateforme
          </p>
        </div>
        <button
          v-if="userStore.isAdmin"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <i class="fas fa-plus me-2"></i>
          Nouvel Utilisateur
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
                  placeholder="Nom, prénom, email, matricule..."
                  @input="debounceSearch"
                />
              </div>
            </div>
            
            <div class="col-md-2 mb-3">
              <label for="roleFilter" class="form-label">Rôle</label>
              <select
                id="roleFilter"
                v-model="filters.role"
                class="form-select"
                @change="fetchUtilisateurs"
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Administrateur</option>
                <option value="enseignant">Enseignant</option>
                <option value="etudiant">Étudiant</option>
              </select>
            </div>
            
            <div class="col-md-2 mb-3">
              <label for="statutFilter" class="form-label">Statut</label>
              <select
                id="statutFilter"
                v-model="filters.statut"
                class="form-select"
                @change="fetchUtilisateurs"
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>
            
            <div class="col-md-2 mb-3">
              <label for="promotionFilter" class="form-label">Promotion</label>
              <select
                id="promotionFilter"
                v-model="filters.promotion"
                class="form-select"
                @change="fetchUtilisateurs"
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
            
            <div class="col-md-3 mb-3 d-flex align-items-end">
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
              <i class="fas fa-users"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalUtilisateurs || 0 }}</div>
              <div class="stats-label">Total Utilisateurs</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-user-shield"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalAdmins || 0 }}</div>
              <div class="stats-label">Administrateurs</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalEnseignants || 0 }}</div>
              <div class="stats-label">Enseignants</div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stats-card">
            <div class="stats-icon">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalEtudiants || 0 }}</div>
              <div class="stats-label">Étudiants</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Liste des utilisateurs -->
    <div class="utilisateurs-list">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">
            <i class="fas fa-list me-2"></i>
            Liste des Utilisateurs
            <span class="badge bg-primary ms-2">{{ pagination.total || 0 }}</span>
          </h5>
          
          <div class="d-flex align-items-center gap-2">
            <button
              v-if="userStore.isAdmin"
              @click="exportUtilisateurs"
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
              @change="fetchUtilisateurs"
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
            <p class="mt-3">Chargement des utilisateurs...</p>
          </div>
          
          <div v-else-if="utilisateurs.length === 0" class="text-center py-5">
            <i class="fas fa-users-cog fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Aucun utilisateur trouvé</h5>
            <p class="text-muted">
              {{ filters.search || filters.role || filters.statut || filters.promotion 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par ajouter un utilisateur' }}
            </p>
          </div>
          
          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Promotion</th>
                    <th>Statut</th>
                    <th>Dernière connexion</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="utilisateur in utilisateurs" :key="utilisateur.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-3">
                          <i :class="getRoleIcon(utilisateur.role)"></i>
                        </div>
                        <div>
                          <div class="fw-bold">{{ utilisateur.nom }} {{ utilisateur.prenom }}</div>
                          <small class="text-muted">{{ utilisateur.email }}</small>
                          <br>
                          <small class="text-muted">{{ utilisateur.matricule }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span :class="getRoleBadgeClass(utilisateur.role)">
                        {{ getRoleLabel(utilisateur.role) }}
                      </span>
                    </td>
                    <td>
                      <span v-if="utilisateur.promotion_id" class="badge bg-info">
                        {{ getPromotionName(utilisateur.promotion_id) }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(utilisateur.statut)">
                        {{ getStatusLabel(utilisateur.statut) }}
                      </span>
                    </td>
                    <td>
                      <small>{{ formatDateTime(utilisateur.derniere_connexion) || 'Jamais' }}</small>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button
                          @click="viewUtilisateur(utilisateur)"
                          class="btn btn-sm btn-outline-info"
                          title="Voir les détails"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin || userStore.user?.id === utilisateur.id"
                          @click="editUtilisateur(utilisateur)"
                          class="btn btn-sm btn-outline-warning"
                          title="Modifier"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        
                        <button
                          v-if="userStore.isAdmin && userStore.user?.id !== utilisateur.id"
                          @click="deleteUtilisateur(utilisateur)"
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
                    :disabled="pagination.page >= pagination.page >= pagination.totalPages"
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
    
    <!-- Modal d'ajout/modification d'utilisateur -->
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
              {{ showAddModal ? 'Nouvel Utilisateur' : 'Modifier l\'Utilisateur' }}
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
                  <label for="matricule" class="form-label">Matricule *</label>
                  <input
                    id="matricule"
                    v-model="formData.matricule"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.matricule }"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.matricule }}</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="role" class="form-label">Rôle *</label>
                  <select
                    id="role"
                    v-model="formData.role"
                    class="form-select"
                    :class="{ 'is-invalid': errors.role }"
                    required
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="admin">Administrateur</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="etudiant">Étudiant</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.role }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="promotion_id" class="form-label">Promotion</label>
                  <select
                    id="promotion_id"
                    v-model="formData.promotion_id"
                    class="form-select"
                    :class="{ 'is-invalid': errors.promotion_id }"
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
                    <option value="suspendu">Suspendu</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.statut }}</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="adresse" class="form-label">Adresse</label>
                <textarea
                  id="adresse"
                  v-model="formData.adresse"
                  class="form-control"
                  rows="3"
                  :class="{ 'is-invalid': errors.adresse }"
                  placeholder="Adresse complète..."
                ></textarea>
                <div class="invalid-feedback">{{ errors.adresse }}</div>
              </div>
              
              <div v-if="showAddModal" class="mb-3">
                <label for="password" class="form-label">Mot de passe *</label>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  required
                />
                <div class="invalid-feedback">{{ errors.password }}</div>
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
    
    <!-- Modal de détails de l'utilisateur -->
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
              Détails de l'Utilisateur
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="showViewModal = false"
            ></button>
          </div>
          
          <div class="modal-body" v-if="selectedUtilisateur">
            <div class="row">
              <div class="col-md-6">
                <h6>Informations personnelles</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Nom:</strong></td>
                    <td>{{ selectedUtilisateur.nom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Prénom:</strong></td>
                    <td>{{ selectedUtilisateur.prenom }}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{{ selectedUtilisateur.email }}</td>
                  </tr>
                  <tr>
                    <td><strong>Matricule:</strong></td>
                    <td>{{ selectedUtilisateur.matricule }}</td>
                  </tr>
                  <tr>
                    <td><strong>Téléphone:</strong></td>
                    <td>{{ selectedUtilisateur.telephone || 'Non renseigné' }}</td>
                  </tr>
                </table>
              </div>
              
              <div class="col-md-6">
                <h6>Informations professionnelles</h6>
                <table class="table table-borderless">
                  <tr>
                    <td><strong>Rôle:</strong></td>
                    <td>
                      <span :class="getRoleBadgeClass(selectedUtilisateur.role)">
                        {{ getRoleLabel(selectedUtilisateur.role) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Promotion:</strong></td>
                    <td>{{ getPromotionName(selectedUtilisateur.promotion_id) || 'Non assignée' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Statut:</strong></td>
                    <td>
                      <span :class="getStatusBadgeClass(selectedUtilisateur.statut)">
                        {{ getStatusLabel(selectedUtilisateur.statut) }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Dernière connexion:</strong></td>
                    <td>{{ formatDateTime(selectedUtilisateur.derniere_connexion) || 'Jamais' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Date de création:</strong></td>
                    <td>{{ formatDateTime(selectedUtilisateur.created_at) }}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div class="mt-3" v-if="selectedUtilisateur.adresse">
              <h6>Adresse</h6>
              <p class="mb-0">{{ selectedUtilisateur.adresse }}</p>
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
              v-if="userStore.isAdmin || userStore.user?.id === selectedUtilisateur?.id"
              type="button"
              class="btn btn-primary"
              @click="editUtilisateur(selectedUtilisateur)"
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
  name: 'Utilisateurs',
  setup() {
    const userStore = useUserStore()
    
    // State
    const loading = ref(false)
    const submitting = ref(false)
    const utilisateurs = ref([])
    const promotions = ref([])
    const selectedUtilisateur = ref(null)
    const stats = ref({})
    
    // Modals
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    
    // Form data
    const formData = ref({
      nom: '',
      prenom: '',
      email: '',
      matricule: '',
      role: '',
      promotion_id: '',
      telephone: '',
      adresse: '',
      statut: 'actif',
      password: ''
    })
    
    // Filters and pagination
    const filters = ref({
      search: '',
      role: '',
      statut: '',
      promotion: ''
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
    const fetchUtilisateurs = async () => {
      try {
        loading.value = true
        
        const params = new URLSearchParams({
          page: pagination.value.page,
          limit: pagination.value.limit
        })
        
        if (filters.value.search) {
          params.append('search', filters.value.search)
        }
        if (filters.value.role) {
          params.append('role', filters.value.role)
        }
        if (filters.value.statut) {
          params.append('statut', filters.value.statut)
        }
        if (filters.value.promotion) {
          params.append('promotion_id', filters.value.promotion)
        }
        
        const response = await axios.get(`/api/utilisateurs?${params.toString()}`)
        
        utilisateurs.value = response.data.utilisateurs || []
        pagination.value = {
          ...pagination.value,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error)
        toast.error('Erreur lors du chargement des utilisateurs')
      } finally {
        loading.value = false
      }
    }
    
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/utilisateurs/statistiques/globales')
        stats.value = response.data.statistiques || {}
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
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
        role: '',
        statut: '',
        promotion: ''
      }
      pagination.value.page = 1
      fetchUtilisateurs()
    }
    
    const changePage = (page) => {
      pagination.value.page = page
      fetchUtilisateurs()
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
        fetchUtilisateurs()
      }, 500)
    }
    
    let searchTimeout = null
    
    const openAddModal = () => {
      showAddModal.value = true
      resetForm()
    }
    
    const editUtilisateur = (utilisateur) => {
      selectedUtilisateur.value = utilisateur
      formData.value = { ...utilisateur }
      showEditModal.value = true
      showViewModal.value = false
      showAddModal.value = false
    }
    
    const viewUtilisateur = async (utilisateur) => {
      try {
        const response = await axios.get(`/api/utilisateurs/${utilisateur.id}`)
        selectedUtilisateur.value = response.data.utilisateur
        showViewModal.value = true
        showAddModal.value = false
        showEditModal.value = false
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error)
        toast.error('Erreur lors du chargement des détails')
      }
    }
    
    const deleteUtilisateur = async (utilisateur) => {
      try {
        const result = await Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: `Voulez-vous vraiment supprimer l'utilisateur ${utilisateur.nom} ${utilisateur.prenom} ?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Oui, supprimer',
          cancelButtonText: 'Annuler'
        })
        
        if (result.isConfirmed) {
          await axios.delete(`/api/utilisateurs/${utilisateur.id}`)
          toast.success('Utilisateur supprimé avec succès')
          fetchUtilisateurs()
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
          await axios.post('/api/utilisateurs', formData.value)
          toast.success('Utilisateur créé avec succès')
        } else {
          await axios.put(`/api/utilisateurs/${selectedUtilisateur.value.id}`, formData.value)
          toast.success('Utilisateur modifié avec succès')
        }
        
        closeModal()
        fetchUtilisateurs()
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
        prenom: '',
        email: '',
        matricule: '',
        role: '',
        promotion_id: '',
        telephone: '',
        adresse: '',
        statut: 'actif',
        password: ''
      }
      errors.value = {}
    }
    
    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      selectedUtilisateur.value = null
      resetForm()
    }
    
    const exportUtilisateurs = async () => {
      try {
        const params = new URLSearchParams()
        
        if (filters.value.search) params.append('search', filters.value.search)
        if (filters.value.role) params.append('role', filters.value.role)
        if (filters.value.statut) params.append('statut', filters.value.statut)
        if (filters.value.promotion) params.append('promotion_id', filters.value.promotion)
        
        const response = await axios.get(`/api/utilisateurs/export?${params.toString()}`, {
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'utilisateurs_export.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        toast.success('Export réussi')
      } catch (error) {
        console.error('Erreur lors de l\'export:', error)
        toast.error('Erreur lors de l\'export')
      }
    }
    
    const getRoleIcon = (role) => {
      const icons = {
        admin: 'fas fa-user-shield text-danger',
        enseignant: 'fas fa-chalkboard-teacher text-primary',
        etudiant: 'fas fa-user-graduate text-success'
      }
      return icons[role] || 'fas fa-user text-secondary'
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
      const promotion = promotions.value.find(p => p.id === promotionId)
      return promotion ? promotion.nom : 'Promotion inconnue'
    }
    
    const formatDateTime = (date) => {
      if (!date) return null
      return new Date(date).toLocaleString('fr-FR')
    }
    
    // Lifecycle
    onMounted(() => {
      fetchUtilisateurs()
      fetchStats()
      fetchPromotions()
    })
    
    return {
      userStore,
      loading,
      submitting,
      utilisateurs,
      promotions,
      selectedUtilisateur,
      stats,
      showAddModal,
      showEditModal,
      showViewModal,
      formData,
      filters,
      pagination,
      errors,
      isAdmin,
      fetchUtilisateurs,
      fetchStats,
      fetchPromotions,
      resetFilters,
      changePage,
      getPageNumbers,
      debounceSearch,
      openAddModal,
      editUtilisateur,
      viewUtilisateur,
      deleteUtilisateur,
      submitForm,
      resetForm,
      closeModal,
      exportUtilisateurs,
      getRoleIcon,
      getRoleLabel,
      getRoleBadgeClass,
      getStatusLabel,
      getStatusBadgeClass,
      getPromotionName,
      formatDateTime
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
  background: linear-gradient(135deg, var(--primary-color), var(--warning-color));
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

.utilisateurs-list .card {
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
  width: 40px;
  height: 40px;
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