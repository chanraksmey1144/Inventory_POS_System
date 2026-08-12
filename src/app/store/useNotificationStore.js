import { create } from 'zustand'
import { uid } from '@/lib/utils'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications(notifications) {
    const unread = notifications.filter((notification) => !notification.read).length
    set({ notifications, unreadCount: unread })
  },

  markAsRead(id) {
    set({
      notifications: get().notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    })
  },

  markAllAsRead() {
    set({
      notifications: get().notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
      unreadCount: 0,
    })
  },

  deleteNotification(id) {
    const removed = get().notifications.find((notification) => notification.id === id)
    set({
      notifications: get().notifications.filter((notification) => notification.id !== id),
      unreadCount: removed && !removed.read ? get().unreadCount - 1 : get().unreadCount,
    })
  },

  deleteAll() {
    set({ notifications: [], unreadCount: 0 })
  },

  addNotification(notification) {
    const item = { id: uid('ntf'), read: false, createdAt: new Date().toISOString(), ...notification }
    set({
      notifications: [item, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    })
    return item
  },
}))

export default useNotificationStore
