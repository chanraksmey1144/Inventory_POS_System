import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSidebarStore = create(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,

      toggleCollapsed() {
        set((state) => ({ collapsed: !state.collapsed }))
      },
      setCollapsed(collapsed) {
        set({ collapsed })
      },
      setMobileOpen(open) {
        set({ mobileOpen: open })
      },
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ collapsed: state.collapsed }),
    },
  ),
)

export default useSidebarStore
