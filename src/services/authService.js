import api from './api'
import { mockResolve, mockReject } from '@/mocks/helpers'
import { ROLE_PERMISSIONS } from '@/constants/permissions'
import { users } from '@/mocks/users'

const DEMO_EMAIL = 'demo@storemaster.com'
const DEMO_PASSWORD = 'password'

export const authService = {
  async login({ email, password, rememberMe }) {
    await mockResolve(null, 600)

    const normalized = email.trim().toLowerCase()
    if (normalized === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const user = users[0]
      const permissions = ROLE_PERMISSIONS[user.role]
      return {
        user,
        token: `mock-token-${Date.now()}`,
        permissions,
      }
    }

    const found = users.find((record) => record.email.toLowerCase() === normalized)
    if (found && password === 'password') {
      return {
        user: found,
        token: `mock-token-${Date.now()}`,
        permissions: ROLE_PERMISSIONS[found.role],
      }
    }

    throw new Error('Invalid email or password')
  },

  async logout() {
    await mockResolve(null, 200)
    return null
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

  async me() {
    const { user } = await api.get('/users', { detail: 'id', params: { id: 'u-1' } })
    return user
  },
}
