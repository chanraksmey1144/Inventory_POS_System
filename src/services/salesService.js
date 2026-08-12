import api from './api'

export const salesService = {
  list(params = {}) {
    return api.get('/sales', {
      search: params.search,
      searchFields: ['invoiceNumber', 'customerName'],
      filters: {
        status: params.status,
        paymentMethod: params.paymentMethod,
        cashierId: params.cashierId,
      },
      sortBy: 'saleDate',
      sortDir: 'desc',
      page: params.page,
      perPage: params.perPage,
    })
  },

  get(id) {
    return api.get('/sales', { detail: 'id', params: { id } })
  },

  create(data) {
    return api.post('/sales', data)
  },

  cancel(id) {
    return api.patch('/sales', { id, status: 'cancelled' })
  },

  processReturn(saleId, items) {
    return api.post('/returns', { saleId, items, createdAt: new Date().toISOString() })
  },

  returns(params = {}) {
    return api.get('/returns', { search: params.search })
  },
}

export const customerService = {
  list(params = {}) {
    return api.get('/customers', {
      search: params.search,
      searchFields: ['name', 'email', 'phone'],
      filters: { groupId: params.groupId, status: params.status },
      sortBy: 'name',
      page: params.page,
      perPage: params.perPage,
    })
  },
  get(id) {
    return api.get('/customers', { detail: 'id', params: { id } })
  },
  create(data) {
    return api.post('/customers', data)
  },
  update(id, data) {
    return api.put('/customers', { ...data, id })
  },
  remove(id) {
    return api.delete('/customers', { params: { id } })
  },
  groups() {
    return api.get('/customerGroups')
  },
}

export const expenseService = {
  list(params = {}) {
    return api.get('/expenses', {
      search: params.search,
      searchFields: ['description'],
      filters: { category: params.category, paymentMethod: params.paymentMethod },
      sortBy: 'date',
      sortDir: 'desc',
      page: params.page,
      perPage: params.perPage,
    })
  },
  create(data) {
    return api.post('/expenses', data)
  },
  update(id, data) {
    return api.put('/expenses', { ...data, id })
  },
  remove(id) {
    return api.delete('/expenses', { params: { id } })
  },
}
