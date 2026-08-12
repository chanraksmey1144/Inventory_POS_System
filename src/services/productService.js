import api from './api'

export const productService = {
  list(params = {}) {
    return api.get('/products', {
      search: params.search,
      searchFields: ['name', 'sku', 'barcode'],
      filters: {
        categoryId: params.categoryId,
        brandId: params.brandId,
        status: params.status,
      },
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      page: params.page,
      perPage: params.perPage,
    })
  },

  get(id) {
    return api.get('/products', { detail: 'id', params: { id } })
  },

  create(data) {
    return api.post('/products', data)
  },

  update(id, data) {
    return api.put('/products', { ...data, id })
  },

  remove(id) {
    return api.delete('/products', { params: { id } })
  },

  archive(id) {
    return api.patch('/products', { id, status: 'archived' })
  },

  restore(id) {
    return api.patch('/products', { id, status: 'active' })
  },
}

export const categoryService = {
  list(params = {}) {
    return api.get('/categories', {
      search: params.search,
      filters: { status: params.status },
    })
  },
  create(data) {
    return api.post('/categories', data)
  },
  update(id, data) {
    return api.put('/categories', { ...data, id })
  },
  remove(id) {
    return api.delete('/categories', { params: { id } })
  },
}

export const brandService = {
  list(params = {}) {
    return api.get('/brands', { search: params.search, filters: { status: params.status } })
  },
  create(data) {
    return api.post('/brands', data)
  },
  update(id, data) {
    return api.put('/brands', { ...data, id })
  },
  remove(id) {
    return api.delete('/brands', { params: { id } })
  },
}

export const unitService = {
  list(params = {}) {
    return api.get('/units', { search: params.search, filters: { status: params.status } })
  },
  create(data) {
    return api.post('/units', data)
  },
  update(id, data) {
    return api.put('/units', { ...data, id })
  },
  remove(id) {
    return api.delete('/units', { params: { id } })
  },
}
