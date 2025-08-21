<template>
  <div class="search-bar" :class="searchBarClass">
    <div class="search-input-container">
      <!-- Icône de recherche -->
      <div class="search-icon-wrapper">
        <i class="bi bi-search search-icon"></i>
      </div>
      
      <!-- Input de recherche -->
      <input
        ref="searchInput"
        type="text"
        class="search-input"
        :class="inputClass"
        :placeholder="placeholder"
        :disabled="disabled"
        v-model="searchQuery"
        @input="handleInput"
        @keyup.enter="handleSubmit"
        @keyup.escape="handleEscape"
        @focus="handleFocus"
        @blur="handleBlur"
        autocomplete="off"
      />
      
      <!-- Bouton de nettoyage -->
      <button
        v-if="searchQuery && clearable"
        @click="handleClear"
        class="clear-button"
        type="button"
        tabindex="-1"
        :title="clearTitle"
      >
        <i class="bi bi-x-lg"></i>
      </button>
      
      <!-- Bouton de recherche -->
      <button
        v-if="showSearchButton"
        @click="handleSubmit"
        class="search-button"
        :class="searchButtonClass"
        type="button"
        :disabled="disabled || (!searchQuery && !allowEmpty)"
        :title="searchTitle"
      >
        <LoadingSpinner
          v-if="loading"
          size="small"
          color="white"
        />
        <i v-else class="bi bi-search"></i>
      </button>
    </div>
    
    <!-- Suggestions dropdown -->
    <div
      v-if="showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)"
      class="suggestions-dropdown"
      :class="{ show: focused || forceShowSuggestions }"
    >
      <!-- Suggestions -->
      <div v-if="filteredSuggestions.length > 0" class="suggestions-section">
        <div class="suggestions-header">
          <span class="suggestions-title">Suggestions</span>
        </div>
        <ul class="suggestions-list">
          <li
            v-for="(suggestion, index) in filteredSuggestions"
            :key="`suggestion-${index}`"
            class="suggestion-item"
            :class="{ active: selectedSuggestion === index }"
            @click="selectSuggestion(suggestion)"
            @mouseenter="selectedSuggestion = index"
          >
            <div class="suggestion-content">
              <div class="suggestion-text" v-html="highlightMatch(suggestion.text || suggestion)"></div>
              <div v-if="suggestion.description" class="suggestion-description">
                {{ suggestion.description }}
              </div>
            </div>
            <div v-if="suggestion.category" class="suggestion-category">
              {{ suggestion.category }}
            </div>
          </li>
        </ul>
      </div>
      
      <!-- Recherches récentes -->
      <div v-if="showRecentSearches && recentSearches.length > 0" class="suggestions-section">
        <div class="suggestions-header">
          <span class="suggestions-title">Recherches récentes</span>
          <button @click="clearRecentSearches" class="clear-recent-btn">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <ul class="suggestions-list">
          <li
            v-for="(recent, index) in recentSearches"
            :key="`recent-${index}`"
            class="suggestion-item recent-item"
            @click="selectRecentSearch(recent)"
          >
            <div class="suggestion-content">
              <i class="bi bi-clock-history recent-icon"></i>
              <div class="suggestion-text">{{ recent }}</div>
            </div>
            <button @click.stop="removeRecentSearch(index)" class="remove-recent-btn">
              <i class="bi bi-x"></i>
            </button>
          </li>
        </ul>
      </div>
      
      <!-- Actions personnalisées -->
      <div v-if="$slots.actions" class="suggestions-actions">
        <slot name="actions" :query="searchQuery" :close="closeSuggestions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'SearchBar',
  components: {
    LoadingSpinner
  },
  props: {
    // Valeur de recherche
    modelValue: {
      type: String,
      default: ''
    },
    
    // Configuration de base
    placeholder: {
      type: String,
      default: 'Rechercher...'
    },
    
    disabled: {
      type: Boolean,
      default: false
    },
    
    loading: {
      type: Boolean,
      default: false
    },
    
    // Apparence
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'filled', 'outlined'].includes(value)
    },
    
    rounded: {
      type: Boolean,
      default: false
    },
    
    // Fonctionnalités
    clearable: {
      type: Boolean,
      default: true
    },
    
    showSearchButton: {
      type: Boolean,
      default: false
    },
    
    allowEmpty: {
      type: Boolean,
      default: false
    },
    
    // Recherche en temps réel
    debounceMs: {
      type: Number,
      default: 300
    },
    
    minLength: {
      type: Number,
      default: 0
    },
    
    // Suggestions
    suggestions: {
      type: Array,
      default: () => []
    },
    
    showSuggestions: {
      type: Boolean,
      default: true
    },
    
    maxSuggestions: {
      type: Number,
      default: 10
    },
    
    // Recherches récentes
    showRecentSearches: {
      type: Boolean,
      default: true
    },
    
    maxRecentSearches: {
      type: Number,
      default: 5
    },
    
    // Textes personnalisés
    clearTitle: {
      type: String,
      default: 'Effacer'
    },
    
    searchTitle: {
      type: String,
      default: 'Rechercher'
    },
    
    // Classes personnalisées
    customClass: {
      type: String,
      default: ''
    }
  },
  emits: [
    'update:modelValue',
    'search',
    'input',
    'focus',
    'blur',
    'clear',
    'suggestion-select'
  ],
  setup(props, { emit }) {
    // État local
    const searchInput = ref(null)
    const searchQuery = ref(props.modelValue)
    const focused = ref(false)
    const selectedSuggestion = ref(-1)
    const forceShowSuggestions = ref(false)
    const recentSearches = ref([])
    const debounceTimer = ref(null)
    
    // Classes computed
    const searchBarClass = computed(() => [
      `search-bar-${props.size}`,
      `search-bar-${props.variant}`,
      {
        'search-bar-rounded': props.rounded,
        'search-bar-disabled': props.disabled,
        'search-bar-loading': props.loading,
        'search-bar-focused': focused.value
      },
      props.customClass
    ])
    
    const inputClass = computed(() => ({
      'has-search-button': props.showSearchButton,
      'has-clear-button': searchQuery.value && props.clearable
    }))
    
    const searchButtonClass = computed(() => [
      'btn',
      props.size === 'small' ? 'btn-sm' : props.size === 'large' ? 'btn-lg' : '',
      'btn-primary'
    ])
    
    // Suggestions filtrées
    const filteredSuggestions = computed(() => {
      if (!searchQuery.value || searchQuery.value.length < props.minLength) {
        return []
      }
      
      const query = searchQuery.value.toLowerCase()
      const filtered = props.suggestions
        .filter(suggestion => {
          const text = typeof suggestion === 'string' ? suggestion : suggestion.text
          return text.toLowerCase().includes(query)
        })
        .slice(0, props.maxSuggestions)
      
      return filtered
    })
    
    // Méthodes
    const handleInput = () => {
      emit('update:modelValue', searchQuery.value)
      emit('input', searchQuery.value)
      
      // Debounce pour la recherche automatique
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
      
      debounceTimer.value = setTimeout(() => {
        if (searchQuery.value.length >= props.minLength) {
          emit('search', searchQuery.value)
        }
      }, props.debounceMs)
      
      // Reset selection
      selectedSuggestion.value = -1
    }
    
    const handleSubmit = () => {
      if (selectedSuggestion.value >= 0 && filteredSuggestions.value.length > 0) {
        selectSuggestion(filteredSuggestions.value[selectedSuggestion.value])
      } else {
        if (searchQuery.value || props.allowEmpty) {
          addToRecentSearches(searchQuery.value)
          emit('search', searchQuery.value)
          closeSuggestions()
        }
      }
    }
    
    const handleEscape = () => {
      if (forceShowSuggestions.value || focused.value) {
        closeSuggestions()
        searchInput.value?.blur()
      }
    }
    
    const handleFocus = () => {
      focused.value = true
      forceShowSuggestions.value = true
      emit('focus')
    }
    
    const handleBlur = () => {
      focused.value = false
      setTimeout(() => {
        forceShowSuggestions.value = false
      }, 200) // Délai pour permettre les clics sur suggestions
      emit('blur')
    }
    
    const handleClear = () => {
      searchQuery.value = ''
      emit('update:modelValue', '')
      emit('clear')
      searchInput.value?.focus()
      
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
    }
    
    const selectSuggestion = (suggestion) => {
      const text = typeof suggestion === 'string' ? suggestion : suggestion.text
      searchQuery.value = text
      emit('update:modelValue', text)
      emit('suggestion-select', suggestion)
      emit('search', text)
      
      addToRecentSearches(text)
      closeSuggestions()
      searchInput.value?.blur()
    }
    
    const selectRecentSearch = (recent) => {
      searchQuery.value = recent
      emit('update:modelValue', recent)
      emit('search', recent)
      closeSuggestions()
      searchInput.value?.blur()
    }
    
    const closeSuggestions = () => {
      forceShowSuggestions.value = false
      selectedSuggestion.value = -1
    }
    
    const highlightMatch = (text) => {
      if (!searchQuery.value) return text
      
      const regex = new RegExp(`(${searchQuery.value})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    }
    
    // Gestion des recherches récentes
    const loadRecentSearches = () => {
      try {
        const stored = localStorage.getItem('gestiscolaire-recent-searches')
        if (stored) {
          recentSearches.value = JSON.parse(stored)
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des recherches récentes:', error)
      }
    }
    
    const saveRecentSearches = () => {
      try {
        localStorage.setItem('gestiscolaire-recent-searches', JSON.stringify(recentSearches.value))
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde des recherches récentes:', error)
      }
    }
    
    const addToRecentSearches = (query) => {
      if (!query.trim() || !props.showRecentSearches) return
      
      // Supprimer si déjà présent
      const index = recentSearches.value.indexOf(query)
      if (index > -1) {
        recentSearches.value.splice(index, 1)
      }
      
      // Ajouter au début
      recentSearches.value.unshift(query)
      
      // Limiter le nombre
      if (recentSearches.value.length > props.maxRecentSearches) {
        recentSearches.value = recentSearches.value.slice(0, props.maxRecentSearches)
      }
      
      saveRecentSearches()
    }
    
    const removeRecentSearch = (index) => {
      recentSearches.value.splice(index, 1)
      saveRecentSearches()
    }
    
    const clearRecentSearches = () => {
      recentSearches.value = []
      saveRecentSearches()
    }
    
    // Navigation au clavier dans les suggestions
    const handleKeyDown = (event) => {
      if (!forceShowSuggestions.value && !focused.value) return
      
      const totalSuggestions = filteredSuggestions.value.length + recentSearches.value.length
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          selectedSuggestion.value = Math.min(selectedSuggestion.value + 1, totalSuggestions - 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          selectedSuggestion.value = Math.max(selectedSuggestion.value - 1, -1)
          break
        case 'Enter':
          event.preventDefault()
          handleSubmit()
          break
        case 'Escape':
          handleEscape()
          break
      }
    }
    
    // Focus méthode publique
    const focus = () => {
      searchInput.value?.focus()
    }
    
    // Watchers
    watch(() => props.modelValue, (newValue) => {
      searchQuery.value = newValue
    })
    
    // Lifecycle
    onMounted(() => {
      loadRecentSearches()
      document.addEventListener('keydown', handleKeyDown)
    })
    
    onUnmounted(() => {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
      document.removeEventListener('keydown', handleKeyDown)
    })
    
    return {
      // Refs
      searchInput,
      searchQuery,
      focused,
      selectedSuggestion,
      forceShowSuggestions,
      recentSearches,
      
      // Computed
      searchBarClass,
      inputClass,
      searchButtonClass,
      filteredSuggestions,
      
      // Methods
      handleInput,
      handleSubmit,
      handleEscape,
      handleFocus,
      handleBlur,
      handleClear,
      selectSuggestion,
      selectRecentSearch,
      closeSuggestions,
      highlightMatch,
      removeRecentSearch,
      clearRecentSearches,
      focus
    }
  }
}
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  z-index: 1;
  pointer-events: none;
}

.search-icon {
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) var(--spacing-10);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: 0;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input:disabled {
  background-color: var(--gray-100);
  color: var(--text-muted);
  cursor: not-allowed;
}

.search-input.has-clear-button {
  padding-right: var(--spacing-10);
}

.search-input.has-search-button {
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  border-right: none;
}

.clear-button {
  position: absolute;
  right: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all var(--transition-fast);
}

.clear-button:hover {
  background-color: var(--gray-100);
  color: var(--text-primary);
}

.search-button {
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  border-left: none;
  padding: var(--spacing-3) var(--spacing-4);
  min-width: 48px;
}

/* Tailles */
.search-bar-small .search-input {
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-2) var(--spacing-8);
  font-size: var(--font-size-sm);
}

.search-bar-small .search-icon-wrapper {
  width: 32px;
}

.search-bar-small .search-icon {
  font-size: var(--font-size-sm);
}

.search-bar-small .search-input.has-clear-button {
  padding-right: var(--spacing-8);
}

.search-bar-small .search-button {
  padding: var(--spacing-2) var(--spacing-3);
  min-width: 40px;
}

.search-bar-large .search-input {
  padding: var(--spacing-4) var(--spacing-5) var(--spacing-4) var(--spacing-12);
  font-size: var(--font-size-lg);
}

.search-bar-large .search-icon-wrapper {
  width: 48px;
}

.search-bar-large .search-icon {
  font-size: var(--font-size-lg);
}

.search-bar-large .search-input.has-clear-button {
  padding-right: var(--spacing-12);
}

.search-bar-large .search-button {
  padding: var(--spacing-4) var(--spacing-5);
  min-width: 56px;
}

/* Variantes */
.search-bar-filled .search-input {
  background-color: var(--gray-100);
  border-color: var(--gray-100);
}

.search-bar-filled .search-input:focus {
  background-color: var(--bg-surface);
  border-color: var(--primary-color);
}

.search-bar-outlined .search-input {
  border-width: 2px;
}

.search-bar-rounded .search-input {
  border-radius: var(--border-radius-xl);
}

.search-bar-rounded .search-button {
  border-radius: 0 var(--border-radius-xl) var(--border-radius-xl) 0;
}

/* États */
.search-bar-focused .search-input {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-bar-loading .search-input {
  pointer-events: none;
}

/* Suggestions dropdown */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  max-height: 300px;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-fast);
}

.suggestions-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.suggestions-section {
  padding: var(--spacing-2) 0;
}

.suggestions-section:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--gray-50);
}

.suggestions-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.clear-recent-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

.clear-recent-btn:hover {
  background-color: var(--gray-200);
  color: var(--text-primary);
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  gap: var(--spacing-3);
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: var(--gray-50);
}

.suggestion-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}

.suggestion-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-text :deep(mark) {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 1px 2px;
  border-radius: 2px;
}

.suggestion-description {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.suggestion-category {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  background-color: var(--gray-100);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.recent-item .recent-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.remove-recent-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  opacity: 0;
  transition: all var(--transition-fast);
}

.suggestion-item:hover .remove-recent-btn {
  opacity: 1;
}

.remove-recent-btn:hover {
  background-color: var(--gray-200);
  color: var(--text-primary);
}

.suggestions-actions {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--border-color);
  background-color: var(--gray-50);
}

/* Scrollbar personnalisée */
.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: var(--gray-100);
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

/* Responsive */
@media (max-width: 768px) {
  .search-bar-large .search-input {
    font-size: var(--font-size-base);
    padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) var(--spacing-10);
  }
  
  .search-bar-large .search-icon-wrapper {
    width: 40px;
  }
  
  .search-bar-large .search-button {
    padding: var(--spacing-3) var(--spacing-4);
    min-width: 48px;
  }
  
  .suggestions-dropdown {
    max-height: 250px;
  }
  
  .suggestion-item {
    padding: var(--spacing-2) var(--spacing-3);
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .suggestions-dropdown {
    background-color: var(--gray-800);
    border-color: var(--gray-700);
  }
  
  .suggestions-header {
    background-color: var(--gray-900);
  }
  
  .suggestion-item:hover,
  .suggestion-item.active {
    background-color: var(--gray-700);
  }
  
  .suggestions-actions {
    background-color: var(--gray-900);
    border-top-color: var(--gray-700);
  }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  .suggestions-dropdown {
    transition: none;
  }
  
  .clear-button,
  .suggestion-item {
    transition: none;
  }
}
</style>