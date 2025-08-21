<template>
  <div class="login-container">
    <div class="login-background">
      <div class="login-overlay"></div>
    </div>
    
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-4">
          <div class="login-card">
            <div class="login-header text-center mb-4">
              <div class="logo-container mb-3">
                <i class="fas fa-graduation-cap"></i>
              </div>
              <h2 class="login-title">Gestion de Scolarité</h2>
              <p class="login-subtitle">Connectez-vous à votre compte</p>
            </div>
            
            <form @submit.prevent="handleLogin" class="login-form">
              <!-- Email -->
              <div class="form-group mb-3">
                <label for="email" class="form-label">
                  <i class="fas fa-envelope me-2"></i>
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="votre.email@universite.com"
                  required
                />
                <div class="invalid-feedback" v-if="errors.email">
                  {{ errors.email }}
                </div>
              </div>
              
              <!-- Mot de passe -->
              <div class="form-group mb-3">
                <label for="password" class="form-label">
                  <i class="fas fa-lock me-2"></i>
                  Mot de passe
                </label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="form.password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.password }"
                    placeholder="Votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="togglePassword"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
              </div>
              
              <!-- Bouton de connexion -->
              <div class="form-group mb-3">
                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="authStore.loading"
                >
                  <span v-if="authStore.loading" class="loading-spinner me-2"></span>
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  {{ authStore.loading ? 'Connexion...' : 'Se connecter' }}
                </button>
              </div>
              
              <!-- Informations de connexion -->
              <div class="login-info text-center">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  Utilisez vos identifiants universitaires
                </small>
              </div>
            </form>
            
            <!-- Comptes de démonstration -->
            <div class="demo-accounts mt-4">
              <div class="accordion" id="demoAccordion">
                <div class="accordion-item">
                  <h2 class="accordion-header" id="demoHeading">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#demoCollapse"
                    >
                      <i class="fas fa-key me-2"></i>
                      Comptes de démonstration
                    </button>
                  </h2>
                  <div
                    id="demoCollapse"
                    class="accordion-collapse collapse"
                    data-bs-parent="#demoAccordion"
                  >
                    <div class="accordion-body">
                      <div class="row">
                        <div class="col-12 mb-2">
                          <button
                            @click="fillDemoCredentials('admin')"
                            class="btn btn-sm btn-outline-primary w-100"
                          >
                            <i class="fas fa-user-shield me-1"></i>
                            Administrateur
                          </button>
                        </div>
                        <div class="col-12 mb-2">
                          <button
                            @click="fillDemoCredentials('enseignant')"
                            class="btn btn-sm btn-outline-success w-100"
                          >
                            <i class="fas fa-chalkboard-teacher me-1"></i>
                            Enseignant
                          </button>
                        </div>
                        <div class="col-12">
                          <button
                            @click="fillDemoCredentials('etudiant')"
                            class="btn btn-sm btn-outline-info w-100"
                          >
                            <i class="fas fa-user-graduate me-1"></i>
                            Étudiant
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="login-footer text-center mt-4">
              <small class="text-muted">
                &copy; 2024 Gestion de Scolarité - Université
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const userStore = useUserStore()
    
    // Form data
    const form = reactive({
      email: '',
      password: ''
    })
    
    // Form validation errors
    const errors = reactive({
      email: '',
      password: ''
    })
    
    // UI state
    const showPassword = ref(false)
    
    // Demo credentials
    const demoCredentials = {
      admin: {
        email: 'admin@universite.com',
        password: 'password123'
      },
      enseignant: {
        email: 'jean.dupont@universite.com',
        password: 'password123'
      },
      etudiant: {
        email: 'sophie.martin@etudiant.com',
        password: 'password123'
      }
    }
    
    // Methods
    const validateForm = () => {
      let isValid = true
      errors.email = ''
      errors.password = ''
      
      if (!form.email) {
        errors.email = 'L\'adresse email est requise'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'L\'adresse email n\'est pas valide'
        isValid = false
      }
      
      if (!form.password) {
        errors.password = 'Le mot de passe est requis'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        isValid = false
      }
      
      return isValid
    }
    
    const handleLogin = async () => {
      if (!validateForm()) {
        return
      }
      
      try {
        await authStore.login(form)
        
        // Récupérer le profil utilisateur
        await userStore.fetchUserProfile()
        
        // Rediriger vers le tableau de bord
        router.push('/dashboard')
      } catch (error) {
        console.error('Erreur de connexion:', error)
        // L'erreur est déjà gérée dans le store
      }
    }
    
    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }
    
    const fillDemoCredentials = (role) => {
      const credentials = demoCredentials[role]
      if (credentials) {
        form.email = credentials.email
        form.password = credentials.password
        
        // Effacer les erreurs
        errors.email = ''
        errors.password = ''
      }
    }
    
    const clearErrors = () => {
      Object.keys(errors).forEach(key => {
        errors[key] = ''
      })
    }
    
    // Lifecycle
    onMounted(() => {
      // Effacer les erreurs au montage
      clearErrors()
      
      // Si l'utilisateur est déjà connecté, rediriger
      if (authStore.isAuthenticated) {
        router.push('/dashboard')
      }
    })
    
    return {
      form,
      errors,
      showPassword,
      authStore,
      userStore,
      handleLogin,
      togglePassword,
      fillDemoCredentials
    }
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="120" fill="url(%23a)"/></svg>');
  background-size: cover;
  background-position: center;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
}

.logo-container {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.logo-container i {
  font-size: 2.5rem;
  color: white;
}

.login-title {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-info {
  padding: 1rem 0;
  border-top: 1px solid #e9ecef;
  margin-top: 1rem;
}

.demo-accounts .accordion-item {
  border: none;
  background: transparent;
}

.demo-accounts .accordion-button {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: none;
  border-radius: 10px;
  color: #2c3e50;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.demo-accounts .accordion-button:not(.collapsed) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: none;
}

.demo-accounts .accordion-button:focus {
  box-shadow: none;
}

.demo-accounts .accordion-body {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 0 0 10px 10px;
  padding: 1rem;
}

.demo-accounts .btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.demo-accounts .btn:hover {
  transform: translateY(-2px);
}

.login-footer {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .login-card {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .logo-container {
    width: 60px;
    height: 60px;
  }
  
  .logo-container i {
    font-size: 2rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>