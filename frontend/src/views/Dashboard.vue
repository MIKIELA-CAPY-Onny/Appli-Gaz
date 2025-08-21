<template>
  <div class="dashboard">
    <!-- En-tête du tableau de bord -->
    <div class="dashboard-header mb-4">
      <h1 class="dashboard-title">
        <i class="fas fa-tachometer-alt me-2"></i>
        Tableau de bord
      </h1>
      <p class="dashboard-subtitle">
        Bienvenue, {{ userStore.fullName }} ! Voici un aperçu de votre activité.
      </p>
    </div>
    
    <!-- Statistiques principales -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3" v-if="userStore.isAdmin">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.totalEtudiants || 0 }}</div>
            <div class="stats-label">Étudiants</div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3" v-if="userStore.isAdmin">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.totalModules || 0 }}</div>
            <div class="stats-label">Modules</div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3" v-if="userStore.isAdmin">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.totalNotes || 0 }}</div>
            <div class="stats-label">Notes</div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3" v-if="userStore.isAdmin">
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
      
      <!-- Statistiques pour enseignants -->
      <div class="col-md-3 mb-3" v-if="userStore.isEnseignant">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-chalkboard-teacher"></i>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.modulesEnseignes || 0 }}</div>
            <div class="stats-label">Mes Modules</div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3" v-if="userStore.isEnseignant">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-user-graduate"></i>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.etudiantsInscrits || 0 }}</div>
            <div class="stats-label">Étudiants Inscrits</div>
          </div>
        </div>
      </div>
      
      <!-- Statistiques pour étudiants -->
      <div class="col-md-3 mb-3" v-if="userStore.isEtudiant">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.modulesInscrits || 0 }}</div>
            <div class="stats-label">Modules Inscrits</div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3" v-if="userStore.isEtudiant">
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
    
    <!-- Graphiques et visualisations -->
    <div class="row mb-4" v-if="userStore.isAdmin">
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-pie me-2"></i>
              Répartition des utilisateurs par rôle
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="usersChart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-bar me-2"></i>
              Évolution des inscriptions
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="inscriptionsChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Graphiques pour enseignants -->
    <div class="row mb-4" v-if="userStore.isEnseignant">
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-line me-2"></i>
              Moyennes par module
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="moyennesChart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-bar me-2"></i>
              Taux de présence
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="presenceChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Activités récentes -->
    <div class="row">
      <div class="col-md-8 mb-3">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-history me-2"></i>
              Activités récentes
            </h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="loading-spinner"></div>
              <p class="mt-2">Chargement des activités...</p>
            </div>
            
            <div v-else-if="recentActivities.length === 0" class="text-center py-4">
              <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
              <p class="text-muted">Aucune activité récente</p>
            </div>
            
            <div v-else class="activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <i :class="getActivityIcon(activity.type)"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-time">{{ formatDateTime(activity.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-tasks me-2"></i>
              Actions rapides
            </h5>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <router-link
                v-if="userStore.isAdmin"
                to="/etudiants"
                class="btn btn-outline-primary w-100 mb-2"
              >
                <i class="fas fa-user-plus me-2"></i>
                Ajouter un étudiant
              </router-link>
              
              <router-link
                v-if="userStore.isAdmin"
                to="/modules"
                class="btn btn-outline-success w-100 mb-2"
              >
                <i class="fas fa-book me-2"></i>
                Créer un module
              </router-link>
              
              <router-link
                v-if="['admin', 'enseignant'].includes(userStore.user?.role)"
                to="/notes"
                class="btn btn-outline-warning w-100 mb-2"
              >
                <i class="fas fa-star me-2"></i>
                Saisir des notes
              </router-link>
              
              <router-link
                v-if="['admin', 'enseignant'].includes(userStore.user?.role)"
                to="/absences"
                class="btn btn-outline-info w-100 mb-2"
              >
                <i class="fas fa-clock me-2"></i>
                Enregistrer une absence
              </router-link>
              
              <router-link
                to="/profile"
                class="btn btn-outline-secondary w-100"
              >
                <i class="fas fa-user-cog me-2"></i>
                Modifier mon profil
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user'
import axios from 'axios'
import Chart from 'chart.js/auto'

export default {
  name: 'Dashboard',
  setup() {
    const userStore = useUserStore()
    
    // State
    const loading = ref(false)
    const stats = ref({})
    const recentActivities = ref([])
    
    // Chart references
    const usersChart = ref(null)
    const inscriptionsChart = ref(null)
    const moyennesChart = ref(null)
    const presenceChart = ref(null)
    
    // Computed
    const isAdmin = computed(() => userStore.isAdmin)
    const isEnseignant = computed(() => userStore.isEnseignant)
    const isEtudiant = computed(() => userStore.isEtudiant)
    
    // Methods
    const fetchDashboardStats = async () => {
      try {
        loading.value = true
        
        if (isAdmin.value) {
          // Statistiques pour admin
          const [etudiantsRes, modulesRes, notesRes, absencesRes] = await Promise.all([
            axios.get('/api/etudiants?limit=1'),
            axios.get('/api/modules?limit=1'),
            axios.get('/api/notes?limit=1'),
            axios.get('/api/absences?limit=1')
          ])
          
          stats.value = {
            totalEtudiants: etudiantsRes.data.pagination?.total || 0,
            totalModules: modulesRes.data.pagination?.total || 0,
            totalNotes: notesRes.data.pagination?.total || 0,
            totalAbsences: absencesRes.data.pagination?.total || 0
          }
        } else if (isEnseignant.value) {
          // Statistiques pour enseignant
          const [modulesRes, inscriptionsRes] = await Promise.all([
            axios.get('/api/modules?enseignant_id=' + userStore.user.id),
            axios.get('/api/inscriptions?limit=1')
          ])
          
          stats.value = {
            modulesEnseignes: modulesRes.data.modules?.length || 0,
            etudiantsInscrits: inscriptionsRes.data.pagination?.total || 0
          }
        } else if (isEtudiant.value) {
          // Statistiques pour étudiant
          const [inscriptionsRes, notesRes] = await Promise.all([
            axios.get('/api/inscriptions?etudiant_id=' + userStore.user.id),
            axios.get('/api/notes?etudiant_id=' + userStore.user.id)
          ])
          
          const modulesInscrits = inscriptionsRes.data.inscriptions?.length || 0
          const notes = notesRes.data.notes || []
          
          let moyenneGenerale = 'N/A'
          if (notes.length > 0) {
            const total = notes.reduce((sum, note) => sum + note.note, 0)
            moyenneGenerale = (total / notes.length).toFixed(2)
          }
          
          stats.value = {
            modulesInscrits,
            moyenneGenerale
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
      } finally {
        loading.value = false
      }
    }
    
    const fetchRecentActivities = async () => {
      try {
        // Simuler des activités récentes
        recentActivities.value = [
          {
            id: 1,
            type: 'note',
            title: 'Nouvelle note ajoutée',
            description: 'Note de 15/20 pour le module INFO101',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 2,
            type: 'absence',
            title: 'Absence enregistrée',
            description: 'Absence de Sophie Martin pour INFO102',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: 3,
            type: 'inscription',
            title: 'Nouvelle inscription',
            description: 'Jean Dupont inscrit au module INFO201',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ]
      } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error)
      }
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        note: 'fas fa-star text-warning',
        absence: 'fas fa-clock text-danger',
        inscription: 'fas fa-user-plus text-success',
        module: 'fas fa-book text-primary'
      }
      return icons[type] || 'fas fa-info-circle text-info'
    }
    
    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('fr-FR')
    }
    
    const createCharts = () => {
      if (isAdmin.value) {
        createUsersChart()
        createInscriptionsChart()
      } else if (isEnseignant.value) {
        createMoyennesChart()
        createPresenceChart()
      }
    }
    
    const createUsersChart = () => {
      if (!usersChart.value) return
      
      const ctx = usersChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Administrateurs', 'Enseignants', 'Étudiants'],
          datasets: [{
            data: [2, 5, 150],
            backgroundColor: ['#dc3545', '#28a745', '#007bff']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
    
    const createInscriptionsChart = () => {
      if (!inscriptionsChart.value) return
      
      const ctx = inscriptionsChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          datasets: [{
            label: 'Inscriptions',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
    
    const createMoyennesChart = () => {
      if (!moyennesChart.value) return
      
      const ctx = moyennesChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['INFO101', 'INFO102', 'INFO201'],
          datasets: [{
            label: 'Moyenne',
            data: [14.5, 16.2, 13.8],
            backgroundColor: '#28a745'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 20
            }
          }
        }
      })
    }
    
    const createPresenceChart = () => {
      if (!presenceChart.value) return
      
      const ctx = presenceChart.value.getContext('2d')
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Présent', 'Absent', 'Retard'],
          datasets: [{
            data: [85, 10, 5],
            backgroundColor: ['#28a745', '#dc3545', '#ffc107']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
    
    // Lifecycle
    onMounted(async () => {
      await fetchDashboardStats()
      await fetchRecentActivities()
      
      // Créer les graphiques après un délai pour s'assurer que les éléments sont rendus
      setTimeout(() => {
        createCharts()
      }, 100)
    })
    
    return {
      userStore,
      loading,
      stats,
      recentActivities,
      usersChart,
      inscriptionsChart,
      moyennesChart,
      presenceChart,
      isAdmin,
      isEnseignant,
      isEtudiant,
      getActivityIcon,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.dashboard-header {
  text-align: center;
  padding: 2rem 0;
}

.dashboard-title {
  color: var(--primary-color);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  color: var(--secondary-color);
  font-size: 1.1rem;
}

.stats-card {
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

.chart-container {
  position: relative;
  height: 300px;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  margin-top: 0.2rem;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.25rem;
}

.activity-description {
  color: var(--secondary-color);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: var(--secondary-color);
  font-size: 0.8rem;
}

.quick-actions .btn {
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.quick-actions .btn:hover {
  transform: translateX(5px);
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

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem 0;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .stats-card {
    padding: 1rem;
  }
  
  .stats-number {
    font-size: 1.5rem;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>