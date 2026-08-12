import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      resolved: 'light',

      setTheme(theme) {
        const resolved = resolveTheme(theme)
        set({ theme, resolved })
        applyTheme(resolved)
      },

      init() {
        const { theme } = get()
        set({ resolved: resolveTheme(theme) })
        applyTheme(resolveTheme(theme))

        const media = window.matchMedia?.('(prefers-color-scheme: dark)')
        media?.addEventListener?.('change', (event) => {
          if (get().theme === 'system') {
            const resolved = event.matches ? 'dark' : 'light'
            set({ resolved })
            applyTheme(resolved)
          }
        })
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)

function applyTheme(resolved) {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export default useThemeStore
