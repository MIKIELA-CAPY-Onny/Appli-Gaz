<template>
  <div class="login-view">
    <div class="login-container">
      <!-- Header avec logo -->
      <div class="login-header">
        <div class="logo-section">
          <img src="/logo-gestiscolaire.png" alt="GestiScolaire" class="login-logo" />
          <h1 class="app-title">GestiScolaire</h1>
        </div>
        <h2 class="login-title">Connexion</h2>
        <p class="login-subtitle">Accédez à votre espace de gestion scolaire</p>
      </div>

      <!-- Formulaire de connexion -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">
            <i class="bi bi-envelope"></i>
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            v-model="form.email"
            :disabled="loading"
            placeholder="votre.email@exemple.fr"
            required
          />
          <div v-if="errors.email" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            <i class="bi bi-lock"></i>
            Mot de passe
          </label>
          <div class="password-input">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              v-model="form.password"
              :disabled="loading"
              placeholder="Votre mot de passe"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="errors.password" class="invalid-feedback">
            {{ errors.password }}
          </div>
        </div>

        <div class="form-options">
          <div class="form-check">
            <input
              id="remember"
              type="checkbox"
              class="form-check-input"
              v-model="form.remember"
              :disabled="loading"
            />
            <label for="remember" class="form-check-label">
              Se souvenir de moi
            </label>
          </div>
          
          <router-link to="/forgot-password" class="forgot-link">
            Mot de passe oublié ?
          </router-link>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-login"
          :disabled="loading || !isFormValid"
        >
          <LoadingSpinner
            v-if="loading"
            size="small"
            color="white"
            class="me-2"
          />
          Se connecter
        </button>

        <!-- Message d'erreur global -->
        <div v-if="errorMessage" class="alert alert-danger">
          <i class="bi bi-exclamation-circle"></i>
          {{ errorMessage }}
        </div>
      </form>

      <!-- Comptes de démonstration -->
      <div class="demo-accounts">
        <h4 class="demo-title">Comptes de démonstration</h4>
        <div class="demo-grid">
          <div class="demo-account" @click="loginAsDemo('admin')">
            <div class="demo-role admin">
              <i class="bi bi-gear-fill"></i>
              <span>Administrateur</span>
            </div>
            <div class="demo-email">admin@gestiscolaire.fr</div>
          </div>
          
          <div class="demo-account" @click="loginAsDemo('teacher')">
            <div class="demo-role teacher">
              <i class="bi bi-mortarboard-fill"></i>
              <span>Enseignant</span>
            </div>
            <div class="demo-email">teacher@gestiscolaire.fr</div>
          </div>
          
          <div class="demo-account" @click="loginAsDemo('student')">
            <div class="demo-role student">
              <i class="bi bi-person-fill"></i>
              <span>Étudiant</span>
            </div>
            <div class="demo-email">student@gestiscolaire.fr</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p>
          Pas encore de compte ? 
          <router-link to="/register" class="register-link">
            S'inscrire
          </router-link>
        </p>
        <div class="footer-links">
          <a href="#" class="footer-link">Aide</a>
          <a href="#" class="footer-link">Confidentialité</a>
          <a href="#" class="footer-link">Conditions</a>
        </div>
      </div>
    </div>

    <!-- Background decoratif -->
    <div class="login-background">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth-store'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'LoginView',
  components: {
    LoadingSpinner
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    
    // État du formulaire
    const form = ref({
      email: '',
      password: '',
      remember: false
    })
    
    const errors = ref({})
    const errorMessage = ref('')
    const showPassword = ref(false)
    const loading = computed(() => authStore.loading)
    
    // Validation
    const isFormValid = computed(() => {
      return form.value.email && form.value.password && Object.keys(errors.value).length === 0
    })
    
    const validateForm = () => {
      const newErrors = {}
      
      if (!form.value.email) {
        newErrors.email = 'L\'email est requis'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        newErrors.email = 'Format d\'email invalide'
      }
      
      if (!form.value.password) {
        newErrors.password = 'Le mot de passe est requis'
      } else if (form.value.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
      }
      
      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }
    
    // Gestionnaires
    const handleLogin = async () => {
      errorMessage.value = ''
      
      if (!validateForm()) return
      
      try {
        await authStore.login(form.value)
        
        toast.success('Connexion réussie !', {
          position: 'top-right',
          timeout: 3000
        })
        
        // Redirection basée sur le rôle
        const redirectPath = getRedirectPath()
        router.push(redirectPath)
        
      } catch (error) {
        errorMessage.value = error.message || 'Erreur de connexion'
        toast.error('Échec de la connexion', {
          position: 'top-right',
          timeout: 5000
        })
      }
    }
    
    const loginAsDemo = async (role) => {
      const demoCredentials = {
        admin: { email: 'admin@gestiscolaire.fr', password: 'password' },
        teacher: { email: 'teacher@gestiscolaire.fr', password: 'password' },
        student: { email: 'student@gestiscolaire.fr', password: 'password' }
      }
      
      form.value.email = demoCredentials[role].email
      form.value.password = demoCredentials[role].password
      
      await handleLogin()
    }
    
    const getRedirectPath = () => {
      const user = authStore.user
      if (!user) return '/login'
      
      switch (user.role) {
        case 'admin':
          return '/admin/dashboard'
        case 'teacher':
          return '/teacher/dashboard'
        case 'student':
          return '/student/dashboard'
        default:
          return '/dashboard'
      }
    }
    
    // Lifecycle
    onMounted(() => {
      // Préremplir le formulaire en développement
      if (import.meta.env.DEV) {
        form.value.email = 'admin@gestiscolaire.fr'
        form.value.password = 'password'
      }
    })
    
    return {
      form,
      errors,
      errorMessage,
      showPassword,
      loading,
      isFormValid,
      handleLogin,
      loginAsDemo
    }
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: var(--spacing-4);
  position: relative;
  overflow: hidden;
}

.login-container {
  background: var(--bg-surface);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-8);
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.logo-section {
  margin-bottom: var(--spacing-6);
}

.login-logo {
  width: 80px;
  height: 80px;
  margin-bottom: var(--spacing-3);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.app-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  margin: 0;
}

.login-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2);
}

.login-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--font-size-base);
}

.login-form {
  margin-bottom: var(--spacing-6);
}

.form-group {
  margin-bottom: var(--spacing-5);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.form-control {
  width: 100%;
  padding: var(--spacing-4);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.form-control:focus {
  outline: 0;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.form-control.is-invalid {
  border-color: var(--danger-color);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--border-radius);
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--text-primary);
}

.invalid-feedback {
  display: block;
  margin-top: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--danger-color);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.form-check {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.form-check-input {
  margin: 0;
}

.form-check-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-4);
}

.alert {
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.demo-accounts {
  margin-bottom: var(--spacing-6);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--border-color);
}

.demo-title {
  text-align: center;
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-3);
}

.demo-account {
  background: var(--gray-50);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.demo-account:hover {
  background: var(--gray-100);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.demo-role {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.demo-role i {
  font-size: var(--font-size-xl);
}

.demo-role.admin {
  color: var(--admin-color);
}

.demo-role.teacher {
  color: var(--teacher-color);
}

.demo-role.student {
  color: var(--student-color);
}

.demo-email {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.login-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.register-link:hover {
  text-decoration: underline;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  margin-top: var(--spacing-3);
}

.footer-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: var(--font-size-xs);
}

.footer-link:hover {
  color: var(--text-secondary);
}

/* Background décoratif */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .login-view {
    padding: var(--spacing-2);
  }
  
  .login-container {
    padding: var(--spacing-6);
  }
  
  .login-logo {
    width: 60px;
    height: 60px;
  }
  
  .app-title {
    font-size: var(--font-size-xl);
  }
  
  .login-title {
    font-size: var(--font-size-2xl);
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .form-options {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: var(--spacing-4);
  }
  
  .footer-links {
    flex-direction: column;
    gap: var(--spacing-2);
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .demo-account {
    background: var(--gray-800);
    border-color: var(--gray-700);
  }
  
  .demo-account:hover {
    background: var(--gray-700);
  }
}

/* Animation d'entrée */
.login-container {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>