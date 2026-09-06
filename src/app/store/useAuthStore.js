import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setSession({ user, token, role, permissions }) {
        localStorage.setItem('auth_role', role || user?.role || '')
        if (permissions) {
          localStorage.setItem('auth_permissions', JSON.stringify(permissions))
        }
        if (token) {
          localStorage.setItem('access_token', token)
        }
        set({ user, token, isAuthenticated: true })
      },

      setUser(user) {
        localStorage.setItem('auth_role', user?.role || '')
        set({ user })
      },

      setLoading(loading) {
        set({ isLoading: loading })
      },

      logout() {
        localStorage.removeItem('auth_role')
        localStorage.removeItem('auth_permissions')
        localStorage.removeItem('access_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export default useAuthStore
