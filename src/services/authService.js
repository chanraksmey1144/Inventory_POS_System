import api from './api'
import { mockResolve, mockReject } from '@/mocks/helpers'

export const authService = {
  async login({ email, password, rememberMe }) {
    const result = await api.post('/auth/login', { email, password, rememberMe })

    const token = result.token
    if (token) {
      localStorage.setItem('access_token', token)
    }

    const role = result.user?.role?.key
    return {
      user: result.user,
      token,
      role,
      permissions: result.permissions || [],
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      /* token already invalid or backend unreachable */
    }
    localStorage.removeItem('access_token')
    return null
  },

  async me() {
    const result = await api.get('/auth/me')
    return {
      user: result.user,
      role: result.user?.role?.key,
      permissions: result.permissions || [],
    }
  },

  async forgotPassword(email) {
    await mockResolve(null, 700)
    return { sent: true, email }
  },

  async resetPassword({ password }) {
    await mockResolve(null, 700)
    return { success: true }
  },

  async changePassword({ currentPassword, newPassword }) {
    await mockResolve(null, 500)
    if (currentPassword !== 'password') {
      return mockReject('Current password is incorrect')
    }
    return { success: true }
  },
}