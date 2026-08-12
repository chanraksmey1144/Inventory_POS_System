import api from './api'
import { sales } from '@/mocks/sales'
import { purchases } from '@/mocks/purchases'
import { expenses } from '@/mocks/expenses'
import { products } from '@/mocks/products'
import { getDashboardData } from '@/mocks/dashboard'
import { mockResolve } from '@/mocks/helpers'

function round(value) {
  return Math.round(value * 100) / 100
}

function isWithinRange(date, from, to) {
  const d = new Date(date)
  if (from && d < new Date(from)) return false
  if (to && d > new Date(to)) return false
  return true
}

export const reportService = {
  sales(params = {}) {
    const filtered = sales.filter(
      (sale) =>
        isWithinRange(sale.saleDate, params.from, params.to) &&
        (!params.paymentMethod || sale.paymentMethod === params.paymentMethod),
    )

    const revenue = round(filtered.reduce((sum, sale) => sum + sale.total, 0))
    const cogs = round(
      filtered.reduce(
        (sum, sale) => sum + sale.items.reduce((s, item) => s + item.cost * item.quantity, 0),
        0,
      ),
    )
    const discount = round(filtered.reduce((sum, sale) => sum + sale.discount, 0))
    const tax = round(filtered.reduce((sum, sale) => sum + sale.tax, 0))

    const labels = []
    const values = []
    const byDay = new Map()
    filtered.forEach((sale) => {
      const date = new Date(sale.saleDate)
      const key = `${date.getMonth() + 1}/${date.getDate()}`
      byDay.set(key, (byDay.get(key) || 0) + sale.total)
    })
    Array.from(byDay.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .forEach(([label, value]) => {
        labels.push(label)
        values.push(round(value))
      })

    const byMethod = new Map()
    filtered.forEach((sale) => {
      byMethod.set(sale.paymentMethod, (byMethod.get(sale.paymentMethod) || 0) + sale.total)
    })
    const paymentBreakdown = Array.from(byMethod.entries()).map(([name, value]) => ({
      name,
      value: round(value),
    }))

    return mockResolve({
      summary: {
        revenue,
        orders: filtered.length,
        averageOrder: filtered.length ? round(revenue / filtered.length) : 0,
        discount,
        tax,
        grossProfit: round(revenue - cogs),
      },
      chart: { labels, values },
      paymentBreakdown,
      rows: filtered.slice(0, 50),
    })
  },

  purchases(params = {}) {
    const filtered = purchases.filter((purchase) => isWithinRange(purchase.orderDate, params.from, params.to))
    const total = round(filtered.reduce((sum, purchase) => sum + purchase.total, 0))
    return mockResolve({
      summary: {
        total,
        count: filtered.length,
        items: filtered.reduce((sum, purchase) => sum + purchase.items.length, 0),
      },
      rows: filtered,
    })
  },

  inventory() {
    const totalValue = round(products.reduce((sum, product) => sum + product.cost * product.stock, 0))
    const retailValue = round(products.reduce((sum, product) => sum + product.price * product.stock, 0))
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length
    const outOfStock = products.filter((p) => p.stock === 0).length
    return mockResolve({
      summary: {
        totalItems: products.length,
        totalUnits: products.reduce((sum, product) => sum + product.stock, 0),
        totalValue,
        retailValue,
        lowStock,
        outOfStock,
      },
      rows: products,
    })
  },

  profit(params = {}) {
    const revenue = sales
      .filter((sale) => isWithinRange(sale.saleDate, params.from, params.to))
      .reduce((sum, sale) => sum + sale.total, 0)
    const cogs = sales
      .filter((sale) => isWithinRange(sale.saleDate, params.from, params.to))
      .reduce(
        (sum, sale) => sum + sale.items.reduce((s, item) => s + item.cost * item.quantity, 0),
        0,
      )
    const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return mockResolve({
      summary: {
        revenue: round(revenue),
        cogs: round(cogs),
        grossProfit: round(revenue - cogs),
        expenses: round(expenseTotal),
        netProfit: round(revenue - cogs - expenseTotal),
      },
    })
  },

  financial() {
    return mockResolve({ currency: 'USD', period: 'Last 90 days' })
  },
}

export const settingsService = {
  get() {
    return mockResolve({
      businessName: 'StoreMaster Supermarket',
      businessAddress: 'Street 310, Toul Kork, Phnom Penh',
      businessPhone: '+855 23 999 111',
      businessEmail: 'info@storemaster.com',
      currency: 'USD',
      defaultTaxRate: 10,
      invoicePrefix: 'INV',
      receiptFooter: 'Thank you for shopping with us!',
      receiptShowLogo: true,
      paymentMethods: ['cash', 'card', 'qr', 'bank_transfer', 'mobile_payment', 'credit'],
      lowStockAlert: 10,
      emailNotifications: true,
    })
  },
  update(data) {
    return mockResolve({ ...data })
  },
}
