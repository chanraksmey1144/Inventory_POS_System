import { ROLE_PERMISSIONS } from '@/constants/permissions'

function getStoredPermissions() {
  try {
    const raw = localStorage.getItem('auth_permissions')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Frontend permission check (UX only).
 * Real enforcement must happen on the Laravel backend.
 *
 * @param {string} permission
 * @returns {boolean}
 */
export function can(permission) {
  const stored = getStoredPermissions()
  if (stored) {
    return stored.includes('*') || stored.includes(permission)
  }

  const role = localStorage.getItem('auth_role')
  if (!role) return false

  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(permission)
}

export function hasAny(permissions) {
  return permissions.some((permission) => can(permission))
}
