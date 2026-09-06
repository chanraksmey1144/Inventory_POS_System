import { request } from '@/lib/api'
import { products as productSeed } from '@/mocks/products'
import { categories as categorySeed, brands as brandSeed, units as unitSeed } from '@/mocks/catalog'
import { customers as customerSeed, customerGroups } from '@/mocks/customers'
import { branches as branchSeed, warehouses as warehouseSeed, registers as registerSeed, suppliers as supplierSeed } from '@/mocks/branches'
import { purchases as purchaseSeed } from '@/mocks/purchases'
import { sales as saleSeed } from '@/mocks/sales'
import { expenses as expenseSeed } from '@/mocks/expenses'
import { users as userSeed, roles as roleSeed } from '@/mocks/users'
import { notifications as notificationSeed, auditLogs as auditLogSeed } from '@/mocks/notifications'
import { stockMovements as movementSeed, stockTransfers as transferSeed } from '@/mocks/inventory'
import { getDashboardData } from '@/mocks/dashboard'
import { mockResolve, mockReject } from '@/mocks/helpers'
import { uid } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Resources backed by the Laravel API (routes/api.php)
// ---------------------------------------------------------------------------

const BACKEND_RESOURCES = new Set([
  'branches',
  'warehouses',
  'registers',
  'roles',
  'users',
  'customer-groups',
  'customers',
  'suppliers',
  'categories',
  'brands',
  'units',
  'products',
  'product-variants',
  'sales',
  'sale-items',
  'held-sales',
  'returns',
  'return-items',
  'purchases',
  'auth',
])

const RESOURCE_ALIASES = {
  customerGroups: 'customer-groups',
}

const QUERY_FILTER_MAP = {
  role: 'role_id',
  roleId: 'role_id',
  branchId: 'branch_id',
  categoryId: 'category_id',
  brandId: 'brand_id',
  groupId: 'group_id',
  cashierId: 'cashier_id',
  customerId: 'customer_id',
  supplierId: 'supplier_id',
  warehouseId: 'warehouse_id',
  paymentMethod: 'payment_method',
  paymentStatus: 'payment_status',
  fromDate: 'from_date',
  toDate: 'to_date',
}

function isBackendResource(resource) {
  const base = resource.replace(/^\/+|\/+$/g, '').split('/')[0]
  return BACKEND_RESOURCES.has(RESOURCE_ALIASES[base] || base)
}

function backendPath(resource) {
  const clean = resource.replace(/^\/+|\/+$/g, '')
  const parts = clean.split('/')
  parts[0] = RESOURCE_ALIASES[parts[0]] || parts[0]
  return `/${parts.join('/')}`
}

// ---------------------------------------------------------------------------
// Key / field conversion (camelCase <-> snake_case)
// ---------------------------------------------------------------------------

function toSnake(value) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function toCamel(value) {
  return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function convertKeys(value, converter) {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeys(item, converter))
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [converter(key), convertKeys(item, converter)]),
    )
  }
  return value
}

function normalizeResponse(value) {
  return convertKeys(value, toCamel)
}

function toBackendBody(value) {
  const body = convertKeys(value, (key) => {
    const snake = key === 'role' ? 'role_id' : toSnake(key)
    return snake
  })
  return body
}

// ---------------------------------------------------------------------------
// Query param builder for backend list endpoints
// ---------------------------------------------------------------------------

function buildQueryParams(query = {}) {
  const params = {}
  if (query.search) params.search = query.search
  if (query.page != null) params.page = query.page
  if (query.perPage != null) params.per_page = query.perPage
  if (query.sortBy) {
    params.sort_by = query.sortBy
    params.sort_dir = query.sortDir === 'desc' ? 'desc' : 'asc'
  }
  if (query.lowStock) params.low_stock = 1
  if (query.filters) {
    Object.entries(query.filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      const mapped = QUERY_FILTER_MAP[key] || toSnake(key)
      params[mapped] = value
    })
  }
  return params
}

// ---------------------------------------------------------------------------
// Backend adapter
// ---------------------------------------------------------------------------

function unwrapData(response) {
  if (response && typeof response === 'object' && Object.prototype.hasOwnProperty.call(response, 'data')) {
    return response.data
  }
  return response
}

async function backendGet(resource, query = {}) {
  const path = backendPath(resource)

  if (query.detail) {
    const id = query.params?.[query.detail]
    const data = await request(`${path}/${id}`)
    return normalizeResponse(unwrapData(data))
  }

  if (query.params?.id != null && Object.keys(query.params ?? {}).length === 1) {
    const data = await request(`${path}/${query.params.id}`)
    return normalizeResponse(unwrapData(data))
  }

  const data = await request(path, { params: buildQueryParams(query) })

  if (Array.isArray(unwrapData(data))) {
    const items = normalizeResponse(unwrapData(data))
    const total = data?.meta?.total ?? items.length
    return { items, total }
  }

  return normalizeResponse(unwrapData(data))
}

async function backendSend(method, resource, body = {}) {
  const path = backendPath(resource)
  const payload = toBackendBody(body)
  const id = payload.id
  delete payload.id
  const url = id != null ? `${path}/${id}` : path

  const data = await request(url, { method, body: payload })
  return normalizeResponse(unwrapData(data))
}

// ---------------------------------------------------------------------------
// Mock engine (fallback for resources not yet available on the backend)
// ---------------------------------------------------------------------------

const db = {
  products: [...productSeed],
  categories: [...categorySeed],
  brands: [...brandSeed],
  units: [...unitSeed],
  customers: [...customerSeed],
  customerGroups,
  branches: [...branchSeed],
  warehouses: [...warehouseSeed],
  registers: [...registerSeed],
  suppliers: [...supplierSeed],
  purchases: [...purchaseSeed],
  sales: [...saleSeed],
  expenses: [...expenseSeed],
  users: [...userSeed],
  roles: roleSeed,
  notifications: [...notificationSeed],
  auditLogs: [...auditLogSeed],
  movements: [...movementSeed],
  transfers: [...transferSeed],
  returns: [],
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function findCollection(resource) {
  const key = resource.replace(/^\/+|\/+$/g, '')
  return db[key]
}

function matchesFilter(record, filters) {
  if (!filters) return true
  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined || value === null || value === '') return true
    const recordValue = record[key]
    if (recordValue === undefined || recordValue === null) return false
    if (typeof value === 'string' && typeof recordValue === 'string') {
      return recordValue.toLowerCase().includes(value.toLowerCase())
    }
    if (typeof value === 'string' && Array.isArray(recordValue)) {
      return recordValue.includes(value)
    }
    return recordValue === value
  })
}

function filterSearch(record, search, fields) {
  if (!search) return true
  const term = search.toLowerCase()
  return (fields || Object.keys(record)).some((field) => {
    const value = record[field]
    if (value == null) return false
    return String(value).toLowerCase().includes(term)
  })
}

function applyQuery(collection, query = {}) {
  let result = [...collection]

  if (query.filters) {
    result = result.filter((record) => matchesFilter(record, query.filters))
  }

  if (query.search) {
    const fields = query.searchFields
    result = result.filter((record) => filterSearch(record, query.search, fields))
  }

  if (query.lowStock) {
    result = result.filter((record) => record.trackInventory && record.stock <= record.minStock)
  }

  if (query.sortBy) {
    const direction = query.sortDir === 'desc' ? -1 : 1
    const sortBy = query.sortBy
    result.sort((a, b) => {
      if (a[sortBy] == null) return 1
      if (b[sortBy] == null) return -1
      if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
        return (a[sortBy] - b[sortBy]) * direction
      }
      return String(a[sortBy]).localeCompare(String(b[sortBy])) * direction
    })
  }

  const total = result.length
  if (query.page && query.perPage) {
    const start = (query.page - 1) * query.perPage
    result = result.slice(start, start + query.perPage)
  }

  return { items: clone(result), total }
}

function runMutation(collection, operation, payload, idKey = 'id') {
  const index = collection.findIndex((record) => record[idKey] === payload[idKey])
  switch (operation) {
    case 'create': {
      const record = { id: uid('rec'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...payload }
      collection.unshift(record)
      return clone(record)
    }
    case 'update': {
      if (index === -1) throw new Error('Record not found')
      collection[index] = { ...collection[index], ...payload, updatedAt: new Date().toISOString() }
      return clone(collection[index])
    }
    case 'delete': {
      if (index === -1) throw new Error('Record not found')
      const [removed] = collection.splice(index, 1)
      return clone(removed)
    }
    default:
      throw new Error('Unknown operation')
  }
}

const mockApi = {
  async get(resource, query = {}) {
    if (resource === '/dashboard') return mockResolve(getDashboardData())
    const collection = findCollection(resource)
    if (!collection) return mockReject(`Resource ${resource} not found`)
    if (query.detail) {
      const key = query.detail
      const value = query.params?.[key]
      const record = collection.find((item) => item[key] === value)
      if (!record) return mockReject(`Record not found`, 150)
      return mockResolve(clone(record))
    }
    if (query.params?.id && Object.keys(query.params).length === 1) {
      const record = collection.find((item) => item.id === query.params.id)
      if (!record) return mockReject('Record not found')
      return mockResolve(clone(record))
    }
    return mockResolve(applyQuery(collection, query))
  },

  async post(resource, body) {
    const collection = findCollection(resource)
    if (!collection) return mockReject(`Resource ${resource} not found`)
    return mockResolve(runMutation(collection, 'create', body), 350)
  },

  async put(resource, body) {
    const collection = findCollection(resource)
    if (!collection) return mockReject(`Resource ${resource} not found`)
    return mockResolve(runMutation(collection, 'update', body), 350)
  },

  async patch(resource, body) {
    return mockApi.put(resource, body)
  },

  async delete(resource, { params = {} } = {}) {
    const collection = findCollection(resource)
    if (!collection) return mockReject(`Resource ${resource} not found`)
    const record = collection.find((item) => item.id === params.id)
    if (!record) return mockReject('Record not found')
    runMutation(collection, 'delete', { id: params.id })
    return mockResolve(clone(record), 300)
  },
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const api = {
  async get(resource, query = {}) {
    if (isBackendResource(resource)) {
      return backendGet(resource, query)
    }
    return mockApi.get(resource, query)
  },

  async post(resource, body = {}) {
    if (isBackendResource(resource)) {
      return backendSend('POST', resource, body)
    }
    return mockApi.post(resource, body)
  },

  async put(resource, body = {}) {
    if (isBackendResource(resource)) {
      return backendSend('PUT', resource, body)
    }
    return mockApi.put(resource, body)
  },

  async patch(resource, body = {}) {
    if (isBackendResource(resource)) {
      return backendSend('PATCH', resource, body)
    }
    return mockApi.patch(resource, body)
  },

  async delete(resource, options = {}) {
    if (isBackendResource(resource)) {
      const id = options?.params?.id
      return request(backendPath(resource) + `/${id}`, { method: 'DELETE' })
    }
    return mockApi.delete(resource, options)
  },
}

export default api