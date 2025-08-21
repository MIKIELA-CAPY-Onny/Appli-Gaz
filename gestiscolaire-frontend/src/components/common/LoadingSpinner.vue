<template>
  <div class="loading-container" :class="containerClass">
    <div class="loading-spinner" :class="spinnerClass" :style="spinnerStyle">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    
    <div v-if="message" class="loading-message" :class="messageClass">
      {{ message }}
    </div>
    
    <div v-if="showProgress && progress !== null" class="loading-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <div class="progress-text">{{ progress }}%</div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'LoadingSpinner',
  props: {
    // Taille du spinner
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
    },
    
    // Couleur du spinner
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'white'].includes(value)
    },
    
    // Message à afficher
    message: {
      type: String,
      default: ''
    },
    
    // Position du spinner
    overlay: {
      type: Boolean,
      default: false
    },
    
    // Centrage
    centered: {
      type: Boolean,
      default: true
    },
    
    // Affichage de la progression
    showProgress: {
      type: Boolean,
      default: false
    },
    
    // Valeur de progression (0-100)
    progress: {
      type: Number,
      default: null,
      validator: (value) => value === null || (value >= 0 && value <= 100)
    },
    
    // Style inline personnalisé
    customStyle: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const containerClass = computed(() => {
      return {
        'loading-overlay': props.overlay,
        'loading-centered': props.centered,
        [`loading-${props.size}`]: true
      }
    })
    
    const spinnerClass = computed(() => {
      return {
        [`spinner-${props.size}`]: true,
        [`spinner-${props.color}`]: true
      }
    })
    
    const messageClass = computed(() => {
      return {
        [`message-${props.size}`]: true,
        [`text-${props.color}`]: props.color !== 'white'
      }
    })
    
    const spinnerStyle = computed(() => {
      return {
        ...props.customStyle
      }
    })
    
    return {
      containerClass,
      spinnerClass,
      messageClass,
      spinnerStyle
    }
  }
}
</script>

<style scoped>
/* Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.loading-centered {
  justify-content: center;
  min-height: 200px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Spinner */
.loading-spinner {
  position: relative;
  display: inline-block;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

/* Tailles */
.spinner-small {
  width: 20px;
  height: 20px;
}

.spinner-small .spinner-ring {
  width: 16px;
  height: 16px;
  margin: 2px;
  border: 2px solid transparent;
}

.spinner-medium {
  width: 40px;
  height: 40px;
}

.spinner-medium .spinner-ring {
  width: 32px;
  height: 32px;
  margin: 4px;
  border: 3px solid transparent;
}

.spinner-large {
  width: 60px;
  height: 60px;
}

.spinner-large .spinner-ring {
  width: 48px;
  height: 48px;
  margin: 6px;
  border: 4px solid transparent;
}

.spinner-xlarge {
  width: 80px;
  height: 80px;
}

.spinner-xlarge .spinner-ring {
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 5px solid transparent;
}

/* Couleurs */
.spinner-primary .spinner-ring {
  border-top-color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.spinner-secondary .spinner-ring {
  border-top-color: var(--secondary-color);
  border-bottom-color: var(--secondary-color);
}

.spinner-success .spinner-ring {
  border-top-color: var(--success-color);
  border-bottom-color: var(--success-color);
}

.spinner-warning .spinner-ring {
  border-top-color: var(--warning-color);
  border-bottom-color: var(--warning-color);
}

.spinner-danger .spinner-ring {
  border-top-color: var(--danger-color);
  border-bottom-color: var(--danger-color);
}

.spinner-info .spinner-ring {
  border-top-color: var(--info-color);
  border-bottom-color: var(--info-color);
}

.spinner-white .spinner-ring {
  border-top-color: var(--white);
  border-bottom-color: var(--white);
}

/* Messages */
.loading-message {
  font-weight: var(--font-weight-medium);
  text-align: center;
  max-width: 300px;
}

.message-small {
  font-size: var(--font-size-sm);
}

.message-medium {
  font-size: var(--font-size-base);
}

.message-large {
  font-size: var(--font-size-lg);
}

.message-xlarge {
  font-size: var(--font-size-xl);
}

/* Barre de progression */
.loading-progress {
  width: 200px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--gray-200);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-2);
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: progressStripe 1s linear infinite;
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes progressStripe {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 0;
  }
}

/* Variations de spinner */
.loading-spinner.pulse .spinner-ring {
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-spinner.dots {
  display: flex;
  gap: 4px;
}

.loading-spinner.dots .spinner-ring {
  position: static;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background-color: var(--primary-color);
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-spinner.dots .spinner-ring:nth-child(1) { animation-delay: -0.32s; }
.loading-spinner.dots .spinner-ring:nth-child(2) { animation-delay: -0.16s; }

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background-color: rgba(15, 23, 42, 0.9);
  }
  
  .loading-message {
    color: var(--text-inverse);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .loading-centered {
    min-height: 150px;
  }
  
  .loading-message {
    font-size: var(--font-size-sm);
    max-width: 250px;
  }
  
  .loading-progress {
    width: 150px;
  }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  .spinner-ring {
    animation: none;
  }
  
  .progress-fill {
    animation: none;
  }
  
  /* Spinner statique pour les utilisateurs qui préfèrent moins d'animation */
  .loading-spinner::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    background-color: var(--primary-color);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: blink 1s infinite;
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
}

/* États de chargement spécialisés */
.loading-container.error .spinner-ring {
  border-top-color: var(--danger-color);
  border-bottom-color: var(--danger-color);
}

.loading-container.success .spinner-ring {
  border-top-color: var(--success-color);
  border-bottom-color: var(--success-color);
}

/* Focus pour l'accessibilité */
.loading-container:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>