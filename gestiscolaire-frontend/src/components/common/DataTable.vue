<template>
  <div class="data-table-container">
    <!-- Header avec actions -->
    <div v-if="showHeader" class="table-header">
      <div class="table-title-section">
        <h3 v-if="title" class="table-title">{{ title }}</h3>
        <p v-if="subtitle" class="table-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="table-actions">
        <slot name="actions">
          <button 
            v-if="showRefresh"
            @click="handleRefresh"
            class="btn btn-outline-secondary btn-sm"
            :disabled="loading"
            title="Actualiser"
          >
            <i class="bi bi-arrow-clockwise" :class="{ 'spinner': loading }"></i>
          </button>
          
          <button 
            v-if="showExport"
            @click="handleExport"
            class="btn btn-outline-secondary btn-sm"
            :disabled="loading"
            title="Exporter"
          >
            <i class="bi bi-download"></i>
            Exporter
          </button>
        </slot>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div v-if="showFilters" class="table-filters">
      <div class="row">
        <div v-if="searchable" class="col-md-6">
          <div class="search-container">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              class="form-control"
              :placeholder="searchPlaceholder"
              v-model="searchQuery"
              @input="handleSearch"
            />
            <button 
              v-if="searchQuery"
              @click="clearSearch"
              class="clear-search-btn"
              title="Effacer la recherche"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="filter-actions">
            <select 
              v-if="showPageSize"
              v-model="currentPageSize"
              @change="handlePageSizeChange"
              class="form-select form-select-sm"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">
                {{ size }} par page
              </option>
            </select>
            
            <slot name="filters"></slot>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="table-loading-overlay">
      <LoadingSpinner size="medium" color="primary" message="Chargement..." />
    </div>

    <!-- Table responsive wrapper -->
    <div class="table-responsive" :class="{ 'table-loading': loading }">
      <table class="table" :class="tableClass">
        <!-- Header -->
        <thead class="table-header-row">
          <tr>
            <th v-if="selectable" class="table-select-header">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="handleSelectAll"
                  id="select-all"
                />
                <label class="form-check-label" for="select-all"></label>
              </div>
            </th>
            
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :class="getColumnClass(column)"
              :style="getColumnStyle(column)"
              @click="handleSort(column)"
            >
              <div class="table-header-content">
                <span>{{ column.title }}</span>
                <div v-if="column.sortable" class="sort-indicators">
                  <i 
                    class="bi bi-chevron-up"
                    :class="{ active: sortField === column.key && sortOrder === 'asc' }"
                  ></i>
                  <i 
                    class="bi bi-chevron-down"
                    :class="{ active: sortField === column.key && sortOrder === 'desc' }"
                  ></i>
                </div>
              </div>
            </th>
            
            <th v-if="hasActions" class="table-actions-header">Actions</th>
          </tr>
        </thead>
        
        <!-- Body -->
        <tbody>
          <tr v-if="!loading && processedData.length === 0" class="table-empty-row">
            <td :colspan="totalColumns" class="table-empty-cell">
              <div class="empty-state">
                <i class="bi bi-inbox empty-icon"></i>
                <h5 class="empty-title">{{ emptyTitle }}</h5>
                <p class="empty-message">{{ emptyMessage }}</p>
                <slot name="empty-actions"></slot>
              </div>
            </td>
          </tr>
          
          <tr
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            class="table-row"
            :class="getRowClass(item, index)"
            @click="handleRowClick(item, index)"
          >
            <td v-if="selectable" class="table-select-cell">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="isSelected(item)"
                  @change="handleRowSelect(item)"
                  :id="`select-${getRowKey(item, index)}`"
                />
                <label 
                  class="form-check-label" 
                  :for="`select-${getRowKey(item, index)}`"
                ></label>
              </div>
            </td>
            
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              :class="getColumnClass(column)"
              :style="getColumnStyle(column)"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getValue(item, column.key)"
                :index="index"
                :column="column"
              >
                <span v-if="column.type === 'badge'" class="badge" :class="getBadgeClass(getValue(item, column.key))">
                  {{ formatValue(getValue(item, column.key), column) }}
                </span>
                <span v-else-if="column.type === 'avatar'" class="cell-avatar">
                  <img 
                    :src="getValue(item, column.key) || '/src/assets/images/default-avatar.png'" 
                    :alt="item.name || 'Avatar'"
                    class="avatar-image"
                  />
                </span>
                <span v-else>
                  {{ formatValue(getValue(item, column.key), column) }}
                </span>
              </slot>
            </td>
            
            <td v-if="hasActions" class="table-actions-cell">
              <slot name="actions" :item="item" :index="index">
                <div class="action-buttons">
                  <button
                    v-for="action in actions"
                    :key="action.key"
                    @click.stop="handleAction(action, item, index)"
                    class="btn btn-sm"
                    :class="action.class || 'btn-outline-secondary'"
                    :title="action.title"
                    :disabled="action.disabled && action.disabled(item)"
                  >
                    <i v-if="action.icon" :class="action.icon"></i>
                    <span v-if="action.text">{{ action.text }}</span>
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && totalPages > 1" class="table-pagination">
      <div class="pagination-info">
        <span class="pagination-text">
          Affichage de {{ startItem }} à {{ endItem }} sur {{ totalItems }} éléments
        </span>
      </div>
      
      <nav class="pagination-nav">
        <ul class="pagination pagination-sm">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button 
              class="page-link"
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              title="Première page"
            >
              <i class="bi bi-chevron-double-left"></i>
            </button>
          </li>
          
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button 
              class="page-link"
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              title="Page précédente"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <button 
              class="page-link"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </li>
          
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button 
              class="page-link"
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              title="Page suivante"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
          
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button 
              class="page-link"
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              title="Dernière page"
            >
              <i class="bi bi-chevron-double-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Selected items info -->
    <div v-if="selectable && selectedItems.length > 0" class="selection-info">
      <div class="selection-content">
        <span class="selection-count">{{ selectedItems.length }} élément(s) sélectionné(s)</span>
        <button @click="clearSelection" class="btn btn-link btn-sm">
          Désélectionner tout
        </button>
      </div>
      
      <div class="selection-actions">
        <slot name="bulk-actions" :selected="selectedItems"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default {
  name: 'DataTable',
  components: {
    LoadingSpinner
  },
  props: {
    // Données
    data: {
      type: Array,
      default: () => []
    },
    
    // Colonnes
    columns: {
      type: Array,
      required: true
    },
    
    // Configuration
    title: String,
    subtitle: String,
    loading: Boolean,
    
    // Fonctionnalités
    searchable: {
      type: Boolean,
      default: true
    },
    
    sortable: {
      type: Boolean,
      default: true
    },
    
    selectable: {
      type: Boolean,
      default: false
    },
    
    paginated: {
      type: Boolean,
      default: true
    },
    
    // Pagination
    pageSize: {
      type: Number,
      default: 10
    },
    
    pageSizeOptions: {
      type: Array,
      default: () => [5, 10, 25, 50, 100]
    },
    
    // Actions
    actions: {
      type: Array,
      default: () => []
    },
    
    // Textes
    searchPlaceholder: {
      type: String,
      default: 'Rechercher...'
    },
    
    emptyTitle: {
      type: String,
      default: 'Aucune donnée'
    },
    
    emptyMessage: {
      type: String,
      default: 'Aucun élément à afficher'
    },
    
    // Styles
    striped: Boolean,
    hover: Boolean,
    bordered: Boolean,
    small: Boolean,
    
    // Affichage
    showHeader: {
      type: Boolean,
      default: true
    },
    
    showFilters: {
      type: Boolean,
      default: true
    },
    
    showPagination: {
      type: Boolean,
      default: true
    },
    
    showPageSize: {
      type: Boolean,
      default: true
    },
    
    showRefresh: {
      type: Boolean,
      default: true
    },
    
    showExport: {
      type: Boolean,
      default: true
    },
    
    // Clé unique pour les lignes
    rowKey: {
      type: String,
      default: 'id'
    }
  },
  emits: [
    'search',
    'sort',
    'page-change',
    'page-size-change',
    'row-click',
    'row-select',
    'select-all',
    'action',
    'refresh',
    'export'
  ],
  setup(props, { emit }) {
    // État local
    const searchQuery = ref('')
    const sortField = ref('')
    const sortOrder = ref('asc')
    const currentPage = ref(1)
    const currentPageSize = ref(props.pageSize)
    const selectedItems = ref([])
    
    // Computed
    const visibleColumns = computed(() => {
      return props.columns.filter(col => col.visible !== false)
    })
    
    const hasActions = computed(() => {
      return props.actions.length > 0
    })
    
    const totalColumns = computed(() => {
      let count = visibleColumns.value.length
      if (props.selectable) count++
      if (hasActions.value) count++
      return count
    })
    
    const tableClass = computed(() => {
      return {
        'table-striped': props.striped,
        'table-hover': props.hover,
        'table-bordered': props.bordered,
        'table-sm': props.small
      }
    })
    
    // Traitement des données
    const processedData = computed(() => {
      let data = [...props.data]
      
      // Recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        data = data.filter(item => {
          return visibleColumns.value.some(column => {
            const value = getValue(item, column.key)
            return String(value).toLowerCase().includes(query)
          })
        })
      }
      
      // Tri
      if (sortField.value) {
        data.sort((a, b) => {
          const aVal = getValue(a, sortField.value)
          const bVal = getValue(b, sortField.value)
          
          let comparison = 0
          if (aVal < bVal) comparison = -1
          if (aVal > bVal) comparison = 1
          
          return sortOrder.value === 'desc' ? -comparison : comparison
        })
      }
      
      return data
    })
    
    // Pagination
    const totalItems = computed(() => processedData.value.length)
    const totalPages = computed(() => Math.ceil(totalItems.value / currentPageSize.value))
    
    const startItem = computed(() => {
      return totalItems.value === 0 ? 0 : (currentPage.value - 1) * currentPageSize.value + 1
    })
    
    const endItem = computed(() => {
      return Math.min(currentPage.value * currentPageSize.value, totalItems.value)
    })
    
    const paginatedData = computed(() => {
      if (!props.paginated) return processedData.value
      
      const start = (currentPage.value - 1) * currentPageSize.value
      const end = start + currentPageSize.value
      return processedData.value.slice(start, end)
    })
    
    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })
    
    // Sélection
    const allSelected = computed(() => {
      return paginatedData.value.length > 0 && 
             paginatedData.value.every(item => isSelected(item))
    })
    
    const someSelected = computed(() => {
      return selectedItems.value.length > 0 && !allSelected.value
    })
    
    // Méthodes
    const getValue = (item, key) => {
      return key.split('.').reduce((obj, k) => obj?.[k], item)
    }
    
    const getRowKey = (item, index) => {
      return getValue(item, props.rowKey) || index
    }
    
    const getColumnClass = (column) => {
      const classes = []
      
      if (column.align) classes.push(`text-${column.align}`)
      if (column.width) classes.push('column-fixed-width')
      if (column.sortable) classes.push('sortable-column')
      if (column.class) classes.push(column.class)
      
      return classes
    }
    
    const getColumnStyle = (column) => {
      const style = {}
      if (column.width) style.width = column.width
      if (column.minWidth) style.minWidth = column.minWidth
      return style
    }
    
    const getRowClass = (item, index) => {
      const classes = []
      
      if (isSelected(item)) classes.push('selected')
      if (props.hover) classes.push('hoverable')
      
      return classes
    }
    
    const formatValue = (value, column) => {
      if (value == null) return '-'
      
      switch (column.type) {
        case 'date':
          return format(new Date(value), 'dd/MM/yyyy')
        case 'datetime':
          return format(new Date(value), 'dd/MM/yyyy HH:mm')
        case 'time-ago':
          return formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr })
        case 'currency':
          return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(value)
        case 'number':
          return new Intl.NumberFormat('fr-FR').format(value)
        case 'percentage':
          return `${value}%`
        default:
          return column.formatter ? column.formatter(value) : String(value)
      }
    }
    
    const getBadgeClass = (value) => {
      // Logique pour déterminer la classe du badge basée sur la valeur
      const badgeClasses = {
        'active': 'badge-success',
        'inactive': 'badge-secondary',
        'pending': 'badge-warning',
        'error': 'badge-danger',
        'success': 'badge-success',
        'warning': 'badge-warning',
        'danger': 'badge-danger'
      }
      
      return badgeClasses[String(value).toLowerCase()] || 'badge-secondary'
    }
    
    const isSelected = (item) => {
      const key = getRowKey(item)
      return selectedItems.value.some(selected => getRowKey(selected) === key)
    }
    
    // Handlers
    const handleSearch = () => {
      currentPage.value = 1
      emit('search', searchQuery.value)
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
      handleSearch()
    }
    
    const handleSort = (column) => {
      if (!column.sortable) return
      
      if (sortField.value === column.key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = column.key
        sortOrder.value = 'asc'
      }
      
      emit('sort', { field: sortField.value, order: sortOrder.value })
    }
    
    const handlePageSizeChange = () => {
      currentPage.value = 1
      emit('page-size-change', currentPageSize.value)
    }
    
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        emit('page-change', page)
      }
    }
    
    const handleRowClick = (item, index) => {
      emit('row-click', { item, index })
    }
    
    const handleRowSelect = (item) => {
      const key = getRowKey(item)
      const index = selectedItems.value.findIndex(selected => getRowKey(selected) === key)
      
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      } else {
        selectedItems.value.push(item)
      }
      
      emit('row-select', selectedItems.value)
    }
    
    const handleSelectAll = () => {
      if (allSelected.value) {
        // Désélectionner tous les éléments de la page actuelle
        paginatedData.value.forEach(item => {
          const key = getRowKey(item)
          const index = selectedItems.value.findIndex(selected => getRowKey(selected) === key)
          if (index > -1) {
            selectedItems.value.splice(index, 1)
          }
        })
      } else {
        // Sélectionner tous les éléments de la page actuelle
        paginatedData.value.forEach(item => {
          if (!isSelected(item)) {
            selectedItems.value.push(item)
          }
        })
      }
      
      emit('select-all', selectedItems.value)
    }
    
    const clearSelection = () => {
      selectedItems.value = []
      emit('row-select', [])
    }
    
    const handleAction = (action, item, index) => {
      emit('action', { action: action.key, item, index })
    }
    
    const handleRefresh = () => {
      emit('refresh')
    }
    
    const handleExport = () => {
      emit('export')
    }
    
    // Watchers
    watch(() => props.data, () => {
      // Nettoyer la sélection si les données changent
      if (props.selectable) {
        selectedItems.value = selectedItems.value.filter(selected => {
          const key = getRowKey(selected)
          return props.data.some(item => getRowKey(item) === key)
        })
      }
    })
    
    watch(currentPageSize, () => {
      currentPage.value = 1
    })
    
    onMounted(() => {
      currentPageSize.value = props.pageSize
    })
    
    return {
      // État
      searchQuery,
      sortField,
      sortOrder,
      currentPage,
      currentPageSize,
      selectedItems,
      
      // Computed
      visibleColumns,
      hasActions,
      totalColumns,
      tableClass,
      processedData,
      totalItems,
      totalPages,
      startItem,
      endItem,
      paginatedData,
      visiblePages,
      allSelected,
      someSelected,
      
      // Méthodes
      getValue,
      getRowKey,
      getColumnClass,
      getColumnStyle,
      getRowClass,
      formatValue,
      getBadgeClass,
      isSelected,
      handleSearch,
      clearSearch,
      handleSort,
      handlePageSizeChange,
      goToPage,
      handleRowClick,
      handleRowSelect,
      handleSelectAll,
      clearSelection,
      handleAction,
      handleRefresh,
      handleExport
    }
  }
}
</script>

<style scoped>
.data-table-container {
  position: relative;
}

/* Header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
  gap: var(--spacing-4);
}

.table-title-section {
  flex: 1;
}

.table-title {
  margin: 0 0 var(--spacing-1);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.table-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.table-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

/* Filtres */
.table-filters {
  margin-bottom: var(--spacing-4);
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 1;
}

.search-container .form-control {
  padding-left: var(--spacing-10);
  padding-right: var(--spacing-10);
}

.clear-search-btn {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
}

.clear-search-btn:hover {
  background-color: var(--gray-100);
  color: var(--text-primary);
}

.filter-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  align-items: center;
}

/* Loading overlay */
.table-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(1px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Table */
.table-responsive {
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.table {
  margin-bottom: 0;
  background-color: var(--bg-surface);
}

.table-header-row th {
  background-color: var(--gray-50);
  border-bottom: 2px solid var(--border-color);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  padding: var(--spacing-4);
  vertical-align: middle;
  position: sticky;
  top: 0;
  z-index: 1;
}

.sortable-column {
  cursor: pointer;
  user-select: none;
}

.table-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}

.sort-indicators {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sort-indicators i {
  font-size: 10px;
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.sort-indicators i.active {
  color: var(--primary-color);
}

.sortable-column:hover .sort-indicators i {
  color: var(--text-secondary);
}

/* Cells */
.table td {
  padding: var(--spacing-4);
  vertical-align: middle;
  border-bottom: 1px solid var(--border-color);
}

.table-select-header,
.table-select-cell {
  width: 40px;
  text-align: center;
}

.table-actions-header,
.table-actions-cell {
  width: 120px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-1);
  justify-content: center;
}

.cell-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

/* Row states */
.table-row.selected {
  background-color: rgba(37, 99, 235, 0.05);
}

.table-row.hoverable:hover {
  background-color: var(--gray-50);
}

.table-row.selected:hover {
  background-color: rgba(37, 99, 235, 0.1);
}

/* Empty state */
.table-empty-cell {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.empty-icon {
  font-size: var(--font-size-4xl);
  color: var(--text-muted);
}

.empty-title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.empty-message {
  margin: 0;
  color: var(--text-secondary);
  max-width: 400px;
}

/* Pagination */
.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background-color: var(--gray-50);
  border-top: 1px solid var(--border-color);
  gap: var(--spacing-4);
}

.pagination-info {
  flex: 1;
}

.pagination-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.pagination-nav {
  flex-shrink: 0;
}

/* Selection info */
.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  background-color: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: var(--border-radius);
  margin-top: var(--spacing-4);
}

.selection-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.selection-count {
  font-weight: var(--font-weight-medium);
  color: var(--primary-color);
}

.selection-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
  
  .table-actions {
    justify-content: flex-end;
  }
  
  .table-filters .row {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .filter-actions {
    justify-content: flex-start;
  }
  
  .table-pagination {
    flex-direction: column;
    gap: var(--spacing-3);
    text-align: center;
  }
  
  .pagination-nav {
    order: -1;
  }
  
  .selection-info {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
  
  .selection-content {
    justify-content: center;
  }
  
  .selection-actions {
    justify-content: center;
  }
  
  /* Mobile table */
  .table-responsive {
    font-size: var(--font-size-sm);
  }
  
  .table th,
  .table td {
    padding: var(--spacing-2) var(--spacing-3);
  }
  
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-1);
  }
  
  .action-buttons .btn {
    font-size: var(--font-size-xs);
    padding: var(--spacing-1) var(--spacing-2);
  }
}

@media (max-width: 480px) {
  .table-header {
    gap: var(--spacing-2);
  }
  
  .table-title {
    font-size: var(--font-size-lg);
  }
  
  .table-actions .btn {
    padding: var(--spacing-2);
  }
  
  .table-actions .btn span {
    display: none;
  }
}

/* Animations */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Print styles */
@media print {
  .table-header,
  .table-filters,
  .table-pagination,
  .selection-info,
  .table-loading-overlay {
    display: none !important;
  }
  
  .table-responsive {
    overflow: visible !important;
    box-shadow: none !important;
  }
  
  .table {
    font-size: 12px !important;
  }
  
  .table th,
  .table td {
    padding: 4px !important;
  }
}
</style>