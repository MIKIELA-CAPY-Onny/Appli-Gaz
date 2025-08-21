<template>
  <ModalDialog
    :show="show"
    :title="title"
    :type="type"
    :icon="icon"
    size="small"
    :loading="loading"
    :confirm-text="confirmText"
    :cancel-text="cancelText"
    :confirm-disabled="confirmDisabled"
    :hide-cancel-button="hideCancelButton"
    :persistent="persistent"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <div class="confirm-dialog-content">
      <!-- Message principal -->
      <div v-if="message" class="confirm-message">
        <p>{{ message }}</p>
      </div>
      
      <!-- Contenu personnalisé -->
      <div v-if="$slots.default" class="confirm-custom-content">
        <slot></slot>
      </div>
      
      <!-- Détails supplémentaires -->
      <div v-if="details" class="confirm-details">
        <div class="details-toggle" @click="showDetails = !showDetails">
          <i class="bi" :class="showDetails ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          <span>{{ detailsLabel }}</span>
        </div>
        
        <div v-if="showDetails" class="details-content">
          <div v-if="typeof details === 'string'" class="details-text">
            {{ details }}
          </div>
          <div v-else class="details-list">
            <ul>
              <li v-for="(detail, index) in details" :key="index">
                {{ detail }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Checkbox de confirmation -->
      <div v-if="requireConfirmation" class="confirm-checkbox">
        <div class="form-check">
          <input
            id="confirm-checkbox"
            type="checkbox"
            class="form-check-input"
            v-model="confirmationChecked"
          />
          <label for="confirm-checkbox" class="form-check-label">
            {{ confirmationText }}
          </label>
        </div>
      </div>
      
      <!-- Input de confirmation -->
      <div v-if="requireInput" class="confirm-input">
        <label class="form-label">
          {{ inputLabel }}
        </label>
        <input
          ref="confirmInput"
          type="text"
          class="form-control"
          :placeholder="inputPlaceholder"
          v-model="inputValue"
          @keyup.enter="handleConfirm"
        />
        <div v-if="inputHint" class="form-text">
          {{ inputHint }}
        </div>
      </div>
      
      <!-- Compte à rebours -->
      <div v-if="countdown > 0" class="confirm-countdown">
        <div class="countdown-bar">
          <div 
            class="countdown-progress" 
            :style="{ width: countdownProgress + '%' }"
          ></div>
        </div>
        <div class="countdown-text">
          Cette action sera annulée dans {{ countdown }} seconde(s)
        </div>
      </div>
    </div>
  </ModalDialog>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import ModalDialog from './ModalDialog.vue'

export default {
  name: 'ConfirmDialog',
  components: {
    ModalDialog
  },
  props: {
    // Contrôle d'affichage
    show: {
      type: Boolean,
      default: false
    },
    
    // Contenu
    title: {
      type: String,
      default: 'Confirmer l\'action'
    },
    
    message: {
      type: String,
      default: 'Êtes-vous sûr de vouloir continuer ?'
    },
    
    details: {
      type: [String, Array],
      default: null
    },
    
    detailsLabel: {
      type: String,
      default: 'Voir les détails'
    },
    
    // Type et apparence
    type: {
      type: String,
      default: 'warning',
      validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value)
    },
    
    icon: {
      type: String,
      default: ''
    },
    
    // Boutons
    confirmText: {
      type: String,
      default: 'Confirmer'
    },
    
    cancelText: {
      type: String,
      default: 'Annuler'
    },
    
    hideCancelButton: {
      type: Boolean,
      default: false
    },
    
    // États
    loading: {
      type: Boolean,
      default: false
    },
    
    persistent: {
      type: Boolean,
      default: false
    },
    
    // Confirmation supplémentaire
    requireConfirmation: {
      type: Boolean,
      default: false
    },
    
    confirmationText: {
      type: String,
      default: 'Je comprends les conséquences de cette action'
    },
    
    // Input de confirmation
    requireInput: {
      type: Boolean,
      default: false
    },
    
    inputLabel: {
      type: String,
      default: 'Tapez "CONFIRMER" pour continuer'
    },
    
    inputPlaceholder: {
      type: String,
      default: 'CONFIRMER'
    },
    
    inputValue: {
      type: String,
      default: 'CONFIRMER'
    },
    
    inputHint: {
      type: String,
      default: ''
    },
    
    // Compte à rebours automatique
    autoCancel: {
      type: Number,
      default: 0 // 0 = désactivé, sinon nombre de secondes
    }
  },
  emits: ['confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    // État local
    const showDetails = ref(false)
    const confirmationChecked = ref(false)
    const inputValue = ref('')
    const confirmInput = ref(null)
    const countdown = ref(0)
    const countdownInterval = ref(null)
    
    // Computed
    const defaultIcons = {
      info: 'bi bi-info-circle',
      success: 'bi bi-check-circle',
      warning: 'bi bi-exclamation-triangle',
      danger: 'bi bi-exclamation-octagon'
    }
    
    const computedIcon = computed(() => {
      return props.icon || defaultIcons[props.type] || defaultIcons.warning
    })
    
    const confirmDisabled = computed(() => {
      if (props.loading) return true
      
      if (props.requireConfirmation && !confirmationChecked.value) {
        return true
      }
      
      if (props.requireInput) {
        const expectedValue = props.inputValue.toUpperCase()
        const actualValue = inputValue.value.toUpperCase()
        return actualValue !== expectedValue
      }
      
      return false
    })
    
    const countdownProgress = computed(() => {
      if (props.autoCancel === 0) return 0
      return ((props.autoCancel - countdown.value) / props.autoCancel) * 100
    })
    
    // Méthodes
    const handleConfirm = () => {
      if (!confirmDisabled.value) {
        stopCountdown()
        emit('confirm')
      }
    }
    
    const handleCancel = () => {
      stopCountdown()
      emit('cancel')
    }
    
    const handleClose = () => {
      stopCountdown()
      emit('close')
    }
    
    const startCountdown = () => {
      if (props.autoCancel > 0) {
        countdown.value = props.autoCancel
        countdownInterval.value = setInterval(() => {
          countdown.value--
          if (countdown.value <= 0) {
            stopCountdown()
            handleCancel()
          }
        }, 1000)
      }
    }
    
    const stopCountdown = () => {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
        countdownInterval.value = null
      }
      countdown.value = 0
    }
    
    const resetState = () => {
      showDetails.value = false
      confirmationChecked.value = false
      inputValue.value = ''
      stopCountdown()
    }
    
    // Watchers
    watch(() => props.show, (newValue) => {
      if (newValue) {
        resetState()
        startCountdown()
        
        // Focus sur l'input si requis
        if (props.requireInput) {
          nextTick(() => {
            confirmInput.value?.focus()
          })
        }
      } else {
        stopCountdown()
      }
    })
    
    // Lifecycle
    onUnmounted(() => {
      stopCountdown()
    })
    
    return {
      // Refs
      showDetails,
      confirmationChecked,
      inputValue,
      confirmInput,
      countdown,
      
      // Computed
      icon: computedIcon,
      confirmDisabled,
      countdownProgress,
      
      // Methods
      handleConfirm,
      handleCancel,
      handleClose
    }
  }
}
</script>

<style scoped>
.confirm-dialog-content {
  text-align: center;
}

.confirm-message {
  margin-bottom: var(--spacing-4);
}

.confirm-message p {
  margin: 0;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
}

.confirm-custom-content {
  margin-bottom: var(--spacing-4);
}

/* Détails */
.confirm-details {
  margin-bottom: var(--spacing-4);
  text-align: left;
}

.details-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.details-toggle:hover {
  background-color: var(--gray-50);
}

.details-content {
  margin-top: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--gray-50);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--primary-color);
}

.details-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.details-list ul {
  margin: 0;
  padding-left: var(--spacing-4);
}

.details-list li {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-1);
}

/* Checkbox de confirmation */
.confirm-checkbox {
  margin-bottom: var(--spacing-4);
  text-align: left;
}

.form-check {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
}

.form-check-input {
  margin-top: 2px;
  flex-shrink: 0;
}

.form-check-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
  cursor: pointer;
}

/* Input de confirmation */
.confirm-input {
  margin-bottom: var(--spacing-4);
  text-align: left;
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.form-control:focus {
  outline: 0;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-text {
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Compte à rebours */
.confirm-countdown {
  margin-bottom: var(--spacing-4);
}

.countdown-bar {
  height: 4px;
  background-color: var(--gray-200);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-2);
}

.countdown-progress {
  height: 100%;
  background-color: var(--danger-color);
  transition: width 1s linear;
}

.countdown-text {
  font-size: var(--font-size-sm);
  color: var(--danger-color);
  font-weight: var(--font-weight-medium);
}

/* Types spécifiques */
.confirm-dialog-content :deep(.modal-icon.text-info) {
  background-color: rgba(6, 182, 212, 0.1);
}

.confirm-dialog-content :deep(.modal-icon.text-success) {
  background-color: rgba(16, 185, 129, 0.1);
}

.confirm-dialog-content :deep(.modal-icon.text-warning) {
  background-color: rgba(245, 158, 11, 0.1);
}

.confirm-dialog-content :deep(.modal-icon.text-danger) {
  background-color: rgba(239, 68, 68, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .confirm-message p {
    font-size: var(--font-size-sm);
  }
  
  .details-content {
    padding: var(--spacing-2);
  }
  
  .form-check {
    align-items: center;
  }
}

/* Animations */
.details-content {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* États de validation */
.form-control.is-valid {
  border-color: var(--success-color);
}

.form-control.is-invalid {
  border-color: var(--danger-color);
}

.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .details-content {
    background-color: var(--gray-800);
    border-left-color: var(--primary-light);
  }
  
  .details-toggle:hover {
    background-color: var(--gray-700);
  }
  
  .countdown-bar {
    background-color: var(--gray-700);
  }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  .details-content {
    animation: none;
  }
  
  .countdown-progress {
    transition: none;
  }
}

/* Focus visible */
.details-toggle:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.form-check-input:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
</style>