<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
        <div 
          class="modal-container"
          :class="modalClass"
          @click.stop
          role="dialog"
          :aria-labelledby="titleId"
          :aria-describedby="bodyId"
          aria-modal="true"
        >
          <!-- Header -->
          <div v-if="!hideHeader" class="modal-header" :class="headerClass">
            <div class="modal-title-section">
              <div v-if="icon" class="modal-icon" :class="iconClass">
                <i :class="icon"></i>
              </div>
              <h4 v-if="title" :id="titleId" class="modal-title">
                {{ title }}
              </h4>
            </div>
            
            <button 
              v-if="!hideCloseButton"
              @click="handleClose"
              class="modal-close-btn"
              aria-label="Fermer"
              type="button"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Body -->
          <div :id="bodyId" class="modal-body" :class="bodyClass">
            <slot>
              <p v-if="message">{{ message }}</p>
            </slot>
          </div>

          <!-- Footer -->
          <div v-if="!hideFooter || hasFooterSlot" class="modal-footer" :class="footerClass">
            <slot name="footer">
              <div class="modal-actions">
                <button
                  v-if="!hideCancelButton"
                  @click="handleCancel"
                  class="btn btn-secondary"
                  :disabled="loading"
                  type="button"
                >
                  {{ cancelText }}
                </button>
                
                <button
                  v-if="!hideConfirmButton"
                  @click="handleConfirm"
                  class="btn"
                  :class="confirmButtonClass"
                  :disabled="loading || confirmDisabled"
                  type="button"
                >
                  <LoadingSpinner
                    v-if="loading"
                    size="small"
                    color="white"
                    class="me-2"
                  />
                  {{ confirmText }}
                </button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { computed, onMounted, onUnmounted, useSlots } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'ModalDialog',
  components: {
    LoadingSpinner
  },
  props: {
    // Contrôle d'affichage
    show: {
      type: Boolean,
      default: false
    },
    
    // Titre de la modal
    title: {
      type: String,
      default: ''
    },
    
    // Message du corps
    message: {
      type: String,
      default: ''
    },
    
    // Icône
    icon: {
      type: String,
      default: ''
    },
    
    // Taille de la modal
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xlarge', 'fullscreen'].includes(value)
    },
    
    // Type de modal (affecte les couleurs)
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'info', 'success', 'warning', 'danger'].includes(value)
    },
    
    // Textes des boutons
    confirmText: {
      type: String,
      default: 'Confirmer'
    },
    
    cancelText: {
      type: String,
      default: 'Annuler'
    },
    
    // Masquer des éléments
    hideHeader: {
      type: Boolean,
      default: false
    },
    
    hideFooter: {
      type: Boolean,
      default: false
    },
    
    hideCloseButton: {
      type: Boolean,
      default: false
    },
    
    hideConfirmButton: {
      type: Boolean,
      default: false
    },
    
    hideCancelButton: {
      type: Boolean,
      default: false
    },
    
    // État de chargement
    loading: {
      type: Boolean,
      default: false
    },
    
    // Désactiver la confirmation
    confirmDisabled: {
      type: Boolean,
      default: false
    },
    
    // Fermeture automatique
    persistent: {
      type: Boolean,
      default: false
    },
    
    // Fermer en cliquant sur l'overlay
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    
    // Fermer avec Escape
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    
    // Classes personnalisées
    customClass: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'confirm', 'cancel', 'show', 'hide'],
  setup(props, { emit }) {
    const slots = useSlots()
    
    const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
    const bodyId = `modal-body-${Math.random().toString(36).substr(2, 9)}`
    
    const hasFooterSlot = computed(() => !!slots.footer)
    
    const modalClass = computed(() => {
      return [
        `modal-${props.size}`,
        `modal-${props.type}`,
        props.customClass,
        {
          'modal-loading': props.loading
        }
      ]
    })
    
    const headerClass = computed(() => {
      return {
        [`modal-header-${props.type}`]: props.type !== 'default'
      }
    })
    
    const bodyClass = computed(() => {
      return {
        'modal-body-with-icon': !!props.icon
      }
    })
    
    const footerClass = computed(() => {
      return {
        [`modal-footer-${props.type}`]: props.type !== 'default'
      }
    })
    
    const iconClass = computed(() => {
      const typeClasses = {
        info: 'text-info',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger'
      }
      return typeClasses[props.type] || 'text-primary'
    })
    
    const confirmButtonClass = computed(() => {
      const typeClasses = {
        default: 'btn-primary',
        info: 'btn-info',
        success: 'btn-success',
        warning: 'btn-warning',
        danger: 'btn-danger'
      }
      return typeClasses[props.type] || 'btn-primary'
    })
    
    const handleClose = () => {
      if (!props.persistent) {
        emit('close')
        emit('hide')
      }
    }
    
    const handleConfirm = () => {
      emit('confirm')
    }
    
    const handleCancel = () => {
      emit('cancel')
      handleClose()
    }
    
    const handleOverlayClick = () => {
      if (props.closeOnOverlay) {
        handleClose()
      }
    }
    
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && props.closeOnEscape && props.show) {
        handleClose()
      }
    }
    
    onMounted(() => {
      document.addEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'hidden'
      emit('show')
    })
    
    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = ''
    })
    
    return {
      titleId,
      bodyId,
      hasFooterSlot,
      modalClass,
      headerClass,
      bodyClass,
      footerClass,
      iconClass,
      confirmButtonClass,
      handleClose,
      handleConfirm,
      handleCancel,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
}

/* Container */
.modal-container {
  background-color: var(--bg-surface);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Tailles */
.modal-small {
  width: 100%;
  max-width: 400px;
}

.modal-medium {
  width: 100%;
  max-width: 600px;
}

.modal-large {
  width: 100%;
  max-width: 800px;
}

.modal-xlarge {
  width: 100%;
  max-width: 1200px;
}

.modal-fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  border-radius: 0;
  margin: 0;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--gray-50);
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(var(--primary-color), 0.1);
  flex-shrink: 0;
}

.modal-icon i {
  font-size: var(--font-size-xl);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background-color: var(--gray-100);
  color: var(--text-primary);
}

/* Types de header */
.modal-header-info {
  background-color: rgba(6, 182, 212, 0.1);
  border-bottom-color: rgba(6, 182, 212, 0.2);
}

.modal-header-success {
  background-color: rgba(16, 185, 129, 0.1);
  border-bottom-color: rgba(16, 185, 129, 0.2);
}

.modal-header-warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-bottom-color: rgba(245, 158, 11, 0.2);
}

.modal-header-danger {
  background-color: rgba(239, 68, 68, 0.1);
  border-bottom-color: rgba(239, 68, 68, 0.2);
}

/* Body */
.modal-body {
  padding: var(--spacing-6);
  overflow-y: auto;
  flex: 1;
}

.modal-body-with-icon {
  padding-left: calc(var(--spacing-6) + 40px + var(--spacing-3));
}

/* Footer */
.modal-footer {
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--border-color);
  background-color: var(--gray-50);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
}

/* Loading state */
.modal-loading {
  pointer-events: none;
}

.modal-loading .modal-body {
  opacity: 0.7;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-50px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-2);
    align-items: flex-end;
  }
  
  .modal-container {
    width: 100%;
    max-height: 85vh;
    border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  }
  
  .modal-small,
  .modal-medium,
  .modal-large,
  .modal-xlarge {
    max-width: none;
  }
  
  .modal-header {
    padding: var(--spacing-4);
  }
  
  .modal-body {
    padding: var(--spacing-4);
  }
  
  .modal-footer {
    padding: var(--spacing-3) var(--spacing-4);
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .modal-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .modal-title {
    font-size: var(--font-size-lg);
  }
  
  .modal-body-with-icon {
    padding-left: var(--spacing-4);
  }
  
  /* Animation mobile */
  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    transform: translateY(100%);
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: var(--spacing-3);
  }
  
  .modal-body {
    padding: var(--spacing-3);
  }
  
  .modal-footer {
    padding: var(--spacing-2) var(--spacing-3);
  }
  
  .modal-icon {
    width: 32px;
    height: 32px;
  }
  
  .modal-icon i {
    font-size: var(--font-size-lg);
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .modal-overlay {
    background-color: rgba(0, 0, 0, 0.7);
  }
  
  .modal-header {
    background-color: var(--gray-800);
    border-bottom-color: var(--gray-700);
  }
  
  .modal-footer {
    background-color: var(--gray-800);
    border-top-color: var(--gray-700);
  }
  
  .modal-close-btn:hover {
    background-color: var(--gray-700);
  }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-container,
  .modal-leave-active .modal-container {
    transition: none;
  }
}

/* Focus */
.modal-container:focus {
  outline: none;
}

.modal-close-btn:focus,
.btn:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* États des boutons */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Scrollbar personnalisée pour le body */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}
</style>