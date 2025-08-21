import { ref, computed } from 'vue'

// État global des notifications
const notifications = ref([
  {
    id: 1,
    title: 'Nouvelle note disponible',
    message: 'Votre note de Mathématiques a été publiée',
    type: 'grade',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2h ago
  },
  {
    id: 2,
    title: 'Absence enregistrée',
    message: 'Votre absence du 15/01/2024 a été notée',
    type: 'attendance',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 3,
    title: 'Nouveau message',
    message: 'Vous avez reçu un message de votre enseignant',
    type: 'message',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  }
])

export function useNotifications() {
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true
    })
  }

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      createdAt: new Date(),
      ...notification
    }
    notifications.value.unshift(newNotification)
  }

  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    notifications: computed(() => notifications.value),
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAll
  }
}