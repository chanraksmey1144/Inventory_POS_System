import api from './api'

export const purchaseService = {
  list(params = {}) {
    return api.get('/purchases', {
      search: params.search,
      searchFields: ['purchaseNumber', 'notes'],
      filters: { status: params.status, supplierId: params.supplierId },
      sortBy: 'orderDate',
      sortDir: 'desc',
      page: params.page,
      perPage: params.perPage,
    })
  },

  get(id) {
    return api.get('/purchases', { detail: 'id', params: { id } })
  },

  create(data) {
    return api.post('/purchases', data)
  },

  update(id, data) {
    return api.put('/purchases', { ...data, id })
  },

  remove(id) {
    return api.delete('/purchases', { params: { id } })
  },

  receive(id, items) {
    return api.patch('/purchases', { id, items, status: 'received', receivedAt: new Date().toISOString() })
  },

  cancel(id) {
    return api.patch('/purchases', { id, status: 'cancelled' })
  },
}

export const supplierService = {
  list(params = {}) {
    return api.get('/suppliers', {
      search: params.search,
      searchFields: ['name', 'company', 'email', 'phone'],
      filters: { status: params.status },
    })
  },
  get(id) {
    return api.get('/suppliers', { detail: 'id', params: { id } })
  },
  create(data) {
    return api.post('/suppliers', data)
  },
  update(id, data) {
    return api.put('/suppliers', { ...data, id })
  },
  remove(id) {
    return api.delete('/suppliers', { params: { id } })
  },
}
