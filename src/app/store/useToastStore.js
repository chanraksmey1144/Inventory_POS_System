import { create } from 'zustand'
import { uid } from '@/lib/utils'

let toastId = 0

const useToastStore = create((set, get) => ({
  toasts: [],

  push({ type = 'success', message, title, duration = 4000 }) {
    toastId += 1
    const toast = { id: toastId, type, message, title }
    set({ toasts: [...get().toasts, toast] })
    if (duration > 0) {
      setTimeout(() => get().dismiss(toast.id), duration)
    }
    return toast.id
  },

  success(message, title) {
    return get().push({ type: 'success', message, title })
  },
  error(message, title) {
    return get().push({ type: 'error', message, title, duration: 5000 })
  },
  info(message, title) {
    return get().push({ type: 'info', message, title })
  },
  warning(message, title) {
    return get().push({ type: 'warning', message, title, duration: 5000 })
  },

  dismiss(id) {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
  },

  dismissAll() {
    set({ toasts: [] })
  },
}))

export default useToastStore
