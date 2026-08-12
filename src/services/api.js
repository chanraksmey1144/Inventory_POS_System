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

const api = {
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
    const record = runMutation(collection, 'create', body)
    return mockResolve(record, 350)
  },

  async put(resource, body) {
    const collection = findCollection(resource)
    if (!collection) return mockReject(`Resource ${resource} not found`)
    const record = runMutation(collection, 'update', body)
    return mockResolve(record, 350)
  },

  async patch(resource, body) {
    return api.put(resource, body)
  },

  async delete(resource, { params = {} } = {}) {
    const collection = findCollection(resource)
    if (!collection) return mockReject(`Resource ${resource} not found`)
    const id = params.id
    const record = collection.find((item) => item.id === id)
    if (!record) return mockReject('Record not found')
    runMutation(collection, 'delete', { id })
    return mockResolve(record, 300)
  },
}

export default api
