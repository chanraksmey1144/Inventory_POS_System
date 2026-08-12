import api from './api'

export const inventoryService = {
  list(params = {}) {
    return api.get('/products', {
      search: params.search,
      searchFields: ['name', 'sku'],
      filters: { status: 'active' },
      sortBy: 'name',
      page: params.page,
      perPage: params.perPage,
    })
  },

  movements(params = {}) {
    return api.get('/movements', {
      search: params.search,
      searchFields: ['reference', 'note'],
      filters: { type: params.type, warehouseId: params.warehouseId },
      page: params.page,
      perPage: params.perPage,
    })
  },

  createMovement(data) {
    return api.post('/movements', data)
  },

  adjustStock({ productId, type, quantity, reason, note }) {
    return api.post('/movements', {
      productId,
      type: 'adjustment',
      quantity: type === 'add' ? quantity : -quantity,
      before: 0,
      after: 0,
      warehouseId: 'w-1',
      reference: `ADJ-${Date.now()}`,
      user: 'u-1',
      note: `${reason} - ${note || ''}`,
    })
  },

  transfers(params = {}) {
    return api.get('/transfers', { search: params.search })
  },

  createTransfer(data) {
    return api.post('/transfers', data)
  },

  lowStock(params = {}) {
    return api.get('/products', {
      search: params.search,
      searchFields: ['name', 'sku'],
      lowStock: true,
      page: params.page,
      perPage: params.perPage,
    })
  },
}

export const dashboardService = {
  get() {
    return api.get('/dashboard')
  },
}
