<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Logo et description -->
        <div class="footer-section">
          <div class="footer-brand">
            <img src="/logo-gestiscolaire.png" alt="Logo" class="footer-logo" />
            <span class="brand-name">GestiScolaire</span>
          </div>
          <p class="footer-description">
            Système de gestion scolaire moderne et intuitif pour l'administration, 
            les enseignants et les étudiants.
          </p>
          <div class="footer-social">
            <a href="#" class="social-link" aria-label="Facebook">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
              <i class="bi bi-twitter"></i>
            </a>
            <a href="#" class="social-link" aria-label="LinkedIn">
              <i class="bi bi-linkedin"></i>
            </a>
            <a href="#" class="social-link" aria-label="Email">
              <i class="bi bi-envelope"></i>
            </a>
          </div>
        </div>

        <!-- Liens rapides -->
        <div class="footer-section">
          <h5 class="footer-title">Liens rapides</h5>
          <ul class="footer-links">
            <li><router-link to="/" class="footer-link">Accueil</router-link></li>
            <li><router-link to="/about" class="footer-link">À propos</router-link></li>
            <li><router-link to="/features" class="footer-link">Fonctionnalités</router-link></li>
            <li><router-link to="/contact" class="footer-link">Contact</router-link></li>
            <li><router-link to="/help" class="footer-link">Aide</router-link></li>
          </ul>
        </div>

        <!-- Support -->
        <div class="footer-section">
          <h5 class="footer-title">Support</h5>
          <ul class="footer-links">
            <li><router-link to="/help/getting-started" class="footer-link">Guide de démarrage</router-link></li>
            <li><router-link to="/help/faq" class="footer-link">FAQ</router-link></li>
            <li><router-link to="/help/documentation" class="footer-link">Documentation</router-link></li>
            <li><router-link to="/support" class="footer-link">Support technique</router-link></li>
            <li><router-link to="/feedback" class="footer-link">Feedback</router-link></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-section">
          <h5 class="footer-title">Contact</h5>
          <div class="contact-info">
            <div class="contact-item">
              <i class="bi bi-geo-alt"></i>
              <span>123 Rue de l'École<br>75000 Paris, France</span>
            </div>
            <div class="contact-item">
              <i class="bi bi-telephone"></i>
              <span>+33 1 23 45 67 89</span>
            </div>
            <div class="contact-item">
              <i class="bi bi-envelope"></i>
              <span>contact@gestiscolaire.fr</span>
            </div>
            <div class="contact-item">
              <i class="bi bi-clock"></i>
              <span>Lun - Ven: 8h - 18h</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Barre de copyright -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>&copy; {{ currentYear }} GestiScolaire. Tous droits réservés.</p>
          </div>
          
          <div class="footer-bottom-links">
            <router-link to="/privacy" class="footer-bottom-link">Politique de confidentialité</router-link>
            <router-link to="/terms" class="footer-bottom-link">Conditions d'utilisation</router-link>
            <router-link to="/cookies" class="footer-bottom-link">Cookies</router-link>
          </div>
          
          <div class="footer-version">
            <span class="version-info">Version {{ appVersion }}</span>
            <span class="status-indicator" :class="systemStatus.class" :title="systemStatus.text">
              <i :class="systemStatus.icon"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'FooterSection',
  setup() {
    const currentYear = new Date().getFullYear()
    const appVersion = ref('1.0.0')
    
    // Simulation du statut système
    const systemStatus = computed(() => {
      // Dans une vraie application, ceci viendrait d'une API
      const isOnline = navigator.onLine
      
      if (isOnline) {
        return {
          class: 'online',
          text: 'Système en ligne',
          icon: 'bi bi-circle-fill'
        }
      } else {
        return {
          class: 'offline',
          text: 'Système hors ligne',
          icon: 'bi bi-circle-fill'
        }
      }
    })
    
    return {
      currentYear,
      appVersion,
      systemStatus
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: var(--bg-sidebar);
  color: var(--white);
  margin-top: auto;
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: var(--spacing-8);
  padding: var(--spacing-12) 0 var(--spacing-8);
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.footer-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius);
}

.brand-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--white);
}

.footer-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-6);
}

.footer-social {
  display: flex;
  gap: var(--spacing-3);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.social-link:hover {
  background-color: var(--primary-color);
  color: var(--white);
  transform: translateY(-2px);
}

.footer-title {
  color: var(--white);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-4);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: var(--spacing-2);
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--white);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-sm);
}

.contact-item i {
  color: var(--primary-light);
  margin-top: 2px;
  flex-shrink: 0;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-6) 0;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--font-size-sm);
}

.copyright p {
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  gap: var(--spacing-6);
}

.footer-bottom-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.footer-bottom-link:hover {
  color: var(--white);
}

.footer-version {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.version-info {
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--font-size-xs);
  font-family: var(--font-family-mono);
}

.status-indicator {
  display: flex;
  align-items: center;
  font-size: 8px;
}

.status-indicator.online {
  color: var(--success-color);
}

.status-indicator.offline {
  color: var(--danger-color);
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-6);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-4);
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
    padding: var(--spacing-8) 0 var(--spacing-6);
    text-align: center;
  }
  
  .footer-brand {
    justify-content: center;
  }
  
  .footer-social {
    justify-content: center;
  }
  
  .contact-info {
    align-items: center;
  }
  
  .contact-item {
    justify-content: center;
    text-align: center;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-3);
  }
  
  .footer-bottom-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: var(--spacing-6) 0 var(--spacing-4);
  }
  
  .footer-bottom {
    padding: var(--spacing-4) 0;
  }
  
  .footer-bottom-links {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .social-link {
    width: 36px;
    height: 36px;
  }
}

/* Animation au scroll */
@media (prefers-reduced-motion: no-preference) {
  .footer-section {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .footer-section:nth-child(1) { animation-delay: 0.1s; }
  .footer-section:nth-child(2) { animation-delay: 0.2s; }
  .footer-section:nth-child(3) { animation-delay: 0.3s; }
  .footer-section:nth-child(4) { animation-delay: 0.4s; }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Mode impression */
@media print {
  .footer {
    background-color: transparent !important;
    color: #000 !important;
  }
  
  .footer-social,
  .footer-bottom-links {
    display: none !important;
  }
}
</style>