import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import useAuthStore from '@/app/store/useAuthStore'
import { can } from '@/lib/permissions'
import ForbiddenPage from '@/features/errors/ForbiddenPage'

export function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

RequireAuth.propTypes = { children: PropTypes.node }

export function RequirePermission({ permission, children }) {
  if (!can(permission)) {
    return <ForbiddenPage />
  }
  return children
}

RequirePermission.propTypes = {
  permission: PropTypes.string,
  children: PropTypes.node,
}

export function GuestOnly({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

GuestOnly.propTypes = { children: PropTypes.node }
