<template>
  <form @submit.prevent="handleSubmit" class="student-form">
    <div class="form-header" v-if="!hideHeader">
      <h3 class="form-title">
        {{ isEditing ? 'Modifier l\'étudiant' : 'Ajouter un étudiant' }}
      </h3>
      <p v-if="subtitle" class="form-subtitle">{{ subtitle }}</p>
    </div>

    <div class="form-body">
      <!-- Informations personnelles -->
      <div class="form-section">
        <h4 class="section-title">
          <i class="bi bi-person section-icon"></i>
          Informations personnelles
        </h4>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="firstName" class="form-label required">Prénom</label>
              <input
                id="firstName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.firstName }"
                v-model="form.firstName"
                :disabled="loading"
                required
              />
              <div v-if="errors.firstName" class="invalid-feedback">
                {{ errors.firstName }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-group">
              <label for="lastName" class="form-label required">Nom</label>
              <input
                id="lastName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.lastName }"
                v-model="form.lastName"
                :disabled="loading"
                required
              />
              <div v-if="errors.lastName" class="invalid-feedback">
                {{ errors.lastName }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="email" class="form-label required">Email</label>
              <input
                id="email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                v-model="form.email"
                :disabled="loading"
                required
              />
              <div v-if="errors.email" class="invalid-feedback">
                {{ errors.email }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-group">
              <label for="phone" class="form-label">Téléphone</label>
              <input
                id="phone"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': errors.phone }"
                v-model="form.phone"
                :disabled="loading"
              />
              <div v-if="errors.phone" class="invalid-feedback">
                {{ errors.phone }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <label for="dateOfBirth" class="form-label required">Date de naissance</label>
              <input
                id="dateOfBirth"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.dateOfBirth }"
                v-model="form.dateOfBirth"
                :disabled="loading"
                :max="maxBirthDate"
                required
              />
              <div v-if="errors.dateOfBirth" class="invalid-feedback">
                {{ errors.dateOfBirth }}
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="form-group">
              <label for="gender" class="form-label">Genre</label>
              <select
                id="gender"
                class="form-select"
                :class="{ 'is-invalid': errors.gender }"
                v-model="form.gender"
                :disabled="loading"
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="O">Autre</option>
              </select>
              <div v-if="errors.gender" class="invalid-feedback">
                {{ errors.gender }}
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="form-group">
              <label for="nationality" class="form-label">Nationalité</label>
              <input
                id="nationality"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.nationality }"
                v-model="form.nationality"
                :disabled="loading"
              />
              <div v-if="errors.nationality" class="invalid-feedback">
                {{ errors.nationality }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations académiques -->
      <div class="form-section">
        <h4 class="section-title">
          <i class="bi bi-mortarboard section-icon"></i>
          Informations académiques
        </h4>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="studentNumber" class="form-label required">Numéro étudiant</label>
              <input
                id="studentNumber"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.studentNumber }"
                v-model="form.studentNumber"
                :disabled="loading || isEditing"
                :readonly="isEditing"
                required
              />
              <div v-if="errors.studentNumber" class="invalid-feedback">
                {{ errors.studentNumber }}
              </div>
              <div v-if="isEditing" class="form-text">
                Le numéro étudiant ne peut pas être modifié
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-group">
              <label for="level" class="form-label required">Niveau</label>
              <select
                id="level"
                class="form-select"
                :class="{ 'is-invalid': errors.level }"
                v-model="form.level"
                :disabled="loading"
                required
              >
                <option value="">Sélectionner un niveau</option>
                <option value="L1">Licence 1</option>
                <option value="L2">Licence 2</option>
                <option value="L3">Licence 3</option>
                <option value="M1">Master 1</option>
                <option value="M2">Master 2</option>
              </select>
              <div v-if="errors.level" class="invalid-feedback">
                {{ errors.level }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="program" class="form-label required">Filière</label>
              <select
                id="program"
                class="form-select"
                :class="{ 'is-invalid': errors.program }"
                v-model="form.program"
                :disabled="loading"
                required
              >
                <option value="">Sélectionner une filière</option>
                <option value="informatique">Informatique</option>
                <option value="mathematiques">Mathématiques</option>
                <option value="physique">Physique</option>
                <option value="chimie">Chimie</option>
                <option value="biologie">Biologie</option>
                <option value="economie">Économie</option>
                <option value="gestion">Gestion</option>
              </select>
              <div v-if="errors.program" class="invalid-feedback">
                {{ errors.program }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-group">
              <label for="academicYear" class="form-label required">Année académique</label>
              <select
                id="academicYear"
                class="form-select"
                :class="{ 'is-invalid': errors.academicYear }"
                v-model="form.academicYear"
                :disabled="loading"
                required
              >
                <option value="">Sélectionner</option>
                <option v-for="year in academicYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
              <div v-if="errors.academicYear" class="invalid-feedback">
                {{ errors.academicYear }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="enrollmentDate" class="form-label required">Date d'inscription</label>
              <input
                id="enrollmentDate"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.enrollmentDate }"
                v-model="form.enrollmentDate"
                :disabled="loading"
                :max="today"
                required
              />
              <div v-if="errors.enrollmentDate" class="invalid-feedback">
                {{ errors.enrollmentDate }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-group">
              <label for="status" class="form-label required">Statut</label>
              <select
                id="status"
                class="form-select"
                :class="{ 'is-invalid': errors.status }"
                v-model="form.status"
                :disabled="loading"
                required
              >
                <option value="">Sélectionner</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="suspended">Suspendu</option>
                <option value="graduated">Diplômé</option>
              </select>
              <div v-if="errors.status" class="invalid-feedback">
                {{ errors.status }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Adresse -->
      <div class="form-section">
        <h4 class="section-title">
          <i class="bi bi-geo-alt section-icon"></i>
          Adresse
        </h4>
        
        <div class="form-group">
          <label for="address" class="form-label">Adresse</label>
          <input
            id="address"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.address }"
            v-model="form.address"
            :disabled="loading"
            placeholder="Rue, numéro"
          />
          <div v-if="errors.address" class="invalid-feedback">
            {{ errors.address }}
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <label for="city" class="form-label">Ville</label>
              <input
                id="city"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.city }"
                v-model="form.city"
                :disabled="loading"
              />
              <div v-if="errors.city" class="invalid-feedback">
                {{ errors.city }}
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="form-group">
              <label for="postalCode" class="form-label">Code postal</label>
              <input
                id="postalCode"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.postalCode }"
                v-model="form.postalCode"
                :disabled="loading"
              />
              <div v-if="errors.postalCode" class="invalid-feedback">
                {{ errors.postalCode }}
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="form-group">
              <label for="country" class="form-label">Pays</label>
              <input
                id="country"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.country }"
                v-model="form.country"
                :disabled="loading"
              />
              <div v-if="errors.country" class="invalid-feedback">
                {{ errors.country }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact d'urgence -->
      <div class="form-section">
        <h4 class="section-title">
          <i class="bi bi-telephone section-icon"></i>
          Contact d'urgence
        </h4>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="emergencyContactName" class="form-label">Nom du contact</label>
              <input
                id="emergencyContactName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.emergencyContactName }"
                v-model="form.emergencyContactName"
                :disabled="loading"
              />
              <div v-if="errors.emergencyContactName" class="invalid-feedback">
                {{ errors.emergencyContactName }}
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-group">
              <label for="emergencyContactPhone" class="form-label">Téléphone du contact</label>
              <input
                id="emergencyContactPhone"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': errors.emergencyContactPhone }"
                v-model="form.emergencyContactPhone"
                :disabled="loading"
              />
              <div v-if="errors.emergencyContactPhone" class="invalid-feedback">
                {{ errors.emergencyContactPhone }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="emergencyContactRelation" class="form-label">Relation</label>
          <select
            id="emergencyContactRelation"
            class="form-select"
            :class="{ 'is-invalid': errors.emergencyContactRelation }"
            v-model="form.emergencyContactRelation"
            :disabled="loading"
          >
            <option value="">Sélectionner</option>
            <option value="parent">Parent</option>
            <option value="guardian">Tuteur</option>
            <option value="spouse">Conjoint(e)</option>
            <option value="sibling">Frère/Sœur</option>
            <option value="friend">Ami(e)</option>
            <option value="other">Autre</option>
          </select>
          <div v-if="errors.emergencyContactRelation" class="invalid-feedback">
            {{ errors.emergencyContactRelation }}
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-footer">
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="loading"
        >
          Annuler
        </button>
        
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !isFormValid"
        >
          <LoadingSpinner
            v-if="loading"
            size="small"
            color="white"
            class="me-2"
          />
          {{ isEditing ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { validateEmail, validatePhone, validateRequired } from '@/utils/validators'

export default {
  name: 'StudentForm',
  components: {
    LoadingSpinner
  },
  props: {
    student: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    // État du formulaire
    const form = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      studentNumber: '',
      level: '',
      program: '',
      academicYear: '',
      enrollmentDate: '',
      status: 'active',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: ''
    })
    
    const errors = ref({})
    
    // Computed
    const isEditing = computed(() => !!props.student?.id)
    
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })
    
    const maxBirthDate = computed(() => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 16) // Minimum 16 ans
      return date.toISOString().split('T')[0]
    })
    
    const academicYears = computed(() => {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let i = currentYear - 2; i <= currentYear + 1; i++) {
        years.push(`${i}-${i + 1}`)
      }
      return years
    })
    
    const isFormValid = computed(() => {
      return Object.keys(errors.value).length === 0 &&
             form.value.firstName &&
             form.value.lastName &&
             form.value.email &&
             form.value.dateOfBirth &&
             form.value.studentNumber &&
             form.value.level &&
             form.value.program &&
             form.value.academicYear &&
             form.value.enrollmentDate &&
             form.value.status
    })
    
    // Méthodes de validation
    const validateForm = () => {
      const newErrors = {}
      
      // Champs requis
      if (!validateRequired(form.value.firstName)) {
        newErrors.firstName = 'Le prénom est requis'
      }
      
      if (!validateRequired(form.value.lastName)) {
        newErrors.lastName = 'Le nom est requis'
      }
      
      if (!validateRequired(form.value.email)) {
        newErrors.email = 'L\'email est requis'
      } else if (!validateEmail(form.value.email)) {
        newErrors.email = 'Format d\'email invalide'
      }
      
      if (form.value.phone && !validatePhone(form.value.phone)) {
        newErrors.phone = 'Format de téléphone invalide'
      }
      
      if (!validateRequired(form.value.dateOfBirth)) {
        newErrors.dateOfBirth = 'La date de naissance est requise'
      } else {
        const birthDate = new Date(form.value.dateOfBirth)
        const minDate = new Date()
        minDate.setFullYear(minDate.getFullYear() - 16)
        
        if (birthDate > minDate) {
          newErrors.dateOfBirth = 'L\'étudiant doit avoir au moins 16 ans'
        }
      }
      
      if (!validateRequired(form.value.studentNumber)) {
        newErrors.studentNumber = 'Le numéro étudiant est requis'
      }
      
      if (!validateRequired(form.value.level)) {
        newErrors.level = 'Le niveau est requis'
      }
      
      if (!validateRequired(form.value.program)) {
        newErrors.program = 'La filière est requise'
      }
      
      if (!validateRequired(form.value.academicYear)) {
        newErrors.academicYear = 'L\'année académique est requise'
      }
      
      if (!validateRequired(form.value.enrollmentDate)) {
        newErrors.enrollmentDate = 'La date d\'inscription est requise'
      }
      
      if (!validateRequired(form.value.status)) {
        newErrors.status = 'Le statut est requis'
      }
      
      if (form.value.emergencyContactPhone && !validatePhone(form.value.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = 'Format de téléphone invalide'
      }
      
      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }
    
    // Gestionnaires d'événements
    const handleSubmit = () => {
      if (validateForm()) {
        emit('submit', { ...form.value })
      }
    }
    
    const handleCancel = () => {
      emit('cancel')
    }
    
    // Initialisation du formulaire
    const initializeForm = () => {
      if (props.student) {
        Object.keys(form.value).forEach(key => {
          if (props.student[key] !== undefined) {
            form.value[key] = props.student[key]
          }
        })
      } else {
        // Valeurs par défaut pour un nouveau étudiant
        form.value.enrollmentDate = today.value
        form.value.academicYear = academicYears.value[academicYears.value.length - 1]
        form.value.country = 'France'
      }
    }
    
    // Génération automatique du numéro étudiant
    const generateStudentNumber = () => {
      if (!isEditing.value && !form.value.studentNumber) {
        const year = new Date().getFullYear().toString().slice(-2)
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        form.value.studentNumber = `${year}${random}`
      }
    }
    
    // Watchers
    watch(() => props.student, initializeForm, { immediate: true })
    
    watch([() => form.value.firstName, () => form.value.lastName], () => {
      generateStudentNumber()
    })
    
    onMounted(() => {
      initializeForm()
    })
    
    return {
      form,
      errors,
      isEditing,
      today,
      maxBirthDate,
      academicYears,
      isFormValid,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.student-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: var(--spacing-6);
  text-align: center;
}

.form-title {
  margin: 0 0 var(--spacing-2);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.form-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.form-body {
  margin-bottom: var(--spacing-6);
}

.form-section {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0 0 var(--spacing-4);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  padding-bottom: var(--spacing-2);
  border-bottom: 2px solid var(--primary-color);
}

.section-icon {
  color: var(--primary-color);
  font-size: var(--font-size-xl);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.form-label.required::after {
  content: ' *';
  color: var(--danger-color);
}

.form-control,
.form-select {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.form-control:focus,
.form-select:focus {
  outline: 0;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-control:disabled,
.form-select:disabled {
  background-color: var(--gray-100);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-control[readonly] {
  background-color: var(--gray-50);
  color: var(--text-secondary);
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: var(--danger-color);
}

.form-control.is-valid,
.form-select.is-valid {
  border-color: var(--success-color);
}

.invalid-feedback {
  display: block;
  margin-top: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--danger-color);
}

.form-text {
  margin-top: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.form-footer {
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-6);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
  color: var(--white);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--secondary-dark);
  border-color: var(--secondary-dark);
}

/* Responsive */
@media (max-width: 768px) {
  .student-form {
    max-width: none;
    margin: 0;
  }
  
  .form-section {
    padding: var(--spacing-4);
    margin-bottom: var(--spacing-4);
  }
  
  .section-title {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-3);
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
  }
  
  .form-header {
    margin-bottom: var(--spacing-4);
  }
  
  .form-title {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: var(--spacing-3);
  }
  
  .form-group {
    margin-bottom: var(--spacing-3);
  }
  
  .form-control,
  .form-select {
    padding: var(--spacing-2);
    font-size: var(--font-size-sm);
  }
}

/* Animation */
.form-section {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* États de validation visuels */
.form-control.is-valid {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2310b981' d='m2.3 6.73.94-.94 1.54 1.54 2.56-2.56.94.94-3.5 3.5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  padding-right: calc(1.5em + 0.75rem);
}

.form-control.is-invalid {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc2626'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.25 5.25 1.5 1.5m0-1.5-1.5 1.5'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  padding-right: calc(1.5em + 0.75rem);
}
</style>