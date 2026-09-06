import api from './api'

export const userService = {
  list(params = {}) {
    return api.get('/users', {
      search: params.search,
      searchFields: ['name', 'email'],
      filters: { role: params.role, status: params.status },
      page: params.page,
      perPage: params.perPage,
    })
  },
  create(data) {
    return api.post('/users', data)
  },
  update(id, data) {
    return api.put('/users', { ...data, id })
  },
  remove(id) {
    return api.delete('/users', { params: { id } })
  },
  resetPassword(id) {
    const password = `P@ss${Math.random().toString(36).slice(2, 8)}`
    return api.patch('/users', { id, password, must_change_password: true })
  },
}

export const roleService = {
  list() {
    return api.get('/roles')
  },
  permissions(roleId) {
    return api.get(`/roles/${roleId}/permissions`)
  },
  updatePermissions(roleId, permissions) {
    return api.put(`/roles/${roleId}/permissions`, { permissions })
  },
}

export const branchService = {
  list(params = {}) {
    return api.get('/branches', { search: params.search, filters: { status: params.status } })
  },
  create(data) {
    return api.post('/branches', data)
  },
  update(id, data) {
    return api.put('/branches', { ...data, id })
  },
  remove(id) {
    return api.delete('/branches', { params: { id } })
  },
}

export const warehouseService = {
  list(params = {}) {
    return api.get('/warehouses', { search: params.search, filters: { status: params.status } })
  },
  create(data) {
    return api.post('/warehouses', data)
  },
  update(id, data) {
    return api.put('/warehouses', { ...data, id })
  },
  remove(id) {
    return api.delete('/warehouses', { params: { id } })
  },
}

export const registerService = {
  list(params = {}) {
    return api.get('/registers', { search: params.search, filters: { status: params.status } })
  },
  create(data) {
    return api.post('/registers', data)
  },
  update(id, data) {
    return api.put('/registers', { ...data, id })
  },
  remove(id) {
    return api.delete('/registers', { params: { id } })
  },
}

export const notificationService = {
  list() {
    return api.get('/notifications')
  },
  updateRead(id, read) {
    return api.put('/notifications', { id, read })
  },
  remove(id) {
    return api.delete('/notifications', { params: { id } })
  },
  auditLogs(params = {}) {
    return api.get('/auditLogs', {
      search: params.search,
      filters: { action: params.action, module: params.module },
      sortBy: 'date',
      sortDir: 'desc',
      page: params.page,
      perPage: params.perPage,
    })
  },
}
