import { sales } from './sales'
import { purchases } from './purchases'
import { products } from './products'
import { categories } from './catalog'
import { customers } from './customers'
import { stockMovements } from './inventory'
import { PAYMENT_METHODS } from '@/constants'

function round(value) {
  return Math.round(value * 100) / 100
}

function isSameDay(a, b) {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

function isWithinDays(date, days) {
  const target = new Date()
  target.setDate(target.getDate() - days)
  return new Date(date) >= target
}

export function getDashboardData() {
  const now = new Date()
  const todaySales = sales.filter((sale) => isSameDay(sale.saleDate, now) && sale.status === 'completed')
  const recentSales = sales.filter((sale) => isWithinDays(sale.saleDate, 90))

  const todaysRevenue = round(todaySales.reduce((sum, sale) => sum + sale.total, 0))
  const todaysOrders = todaySales.length
  const cogs = todaySales.reduce(
    (sum, sale) =>
      sum + sale.items.reduce((itemSum, item) => itemSum + item.cost * item.quantity, 0),
    0,
  )
  const grossProfit = round(todaysRevenue - cogs)

  const avgOrderValue = todaysOrders > 0 ? round(todaysRevenue / todaysOrders) : 0
  const totalProducts = products.length
  const lowStockCount = products.filter(
    (product) => product.status === 'active' && product.stock > 0 && product.stock <= product.minStock,
  ).length
  const outOfStockCount = products.filter(
    (product) => product.status === 'active' && product.stock === 0,
  ).length
  const outstandingPayments = round(
    customers.reduce((sum, customer) => sum + (customer.outstanding || 0), 0),
  )

  const last30DaysSales = sales.filter((sale) => isWithinDays(sale.saleDate, 30))
  const chartLabels = []
  const dailyRevenue = []
  const dailyOrders = []
  const dailyProfit = []
  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const daySales = last30DaysSales.filter((sale) => isSameDay(sale.saleDate, date))
    const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0)
    const profit = daySales.reduce(
      (sum, sale) => sum + sale.total - sale.items.reduce((s, item) => s + item.cost * item.quantity, 0),
      0,
    )
    chartLabels.push(`${date.getMonth() + 1}/${date.getDate()}`)
    dailyRevenue.push(round(revenue))
    dailyOrders.push(daySales.length)
    dailyProfit.push(round(profit))
  }

  const salesByCategory = categories.map((category) => {
    const catProducts = products.filter((product) => product.categoryId === category.id)
    const catIds = new Set(catProducts.map((product) => product.id))
    const value = recentSales
      .filter((sale) => sale.items.some((item) => catIds.has(item.productId)))
      .reduce(
        (sum, sale) =>
          sum +
          sale.items
            .filter((item) => catIds.has(item.productId))
            .reduce((s, item) => s + item.price * item.quantity, 0),
        0,
      )
    return { name: category.name, value: round(value) }
  }).filter((item) => item.value > 0)

  const topProducts = []
  const productMap = new Map()
  recentSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const key = item.productId
      if (!productMap.has(key)) {
        productMap.set(key, {
          productId: item.productId,
          name: item.name,
          quantity: 0,
          revenue: 0,
        })
      }
      const entry = productMap.get(key)
      entry.quantity += item.quantity
      entry.revenue += item.price * item.quantity
    })
  })
  productMap.forEach((entry) => {
    topProducts.push({ ...entry, revenue: round(entry.revenue) })
  })
  topProducts.sort((a, b) => b.revenue - a.revenue)

  const paymentBreakdown = Object.values(PAYMENT_METHODS).map((method) => {
    const total = recentSales
      .filter((sale) => sale.paymentMethod === method)
      .reduce((sum, sale) => sum + sale.total, 0)
    return { name: method, value: round(total) }
  }).filter((item) => item.value > 0)

  const last30Purchases = purchases.filter((purchase) => isWithinDays(purchase.orderDate, 30))
  const purchaseTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dayPurchases = last30Purchases.filter((purchase) => isSameDay(purchase.orderDate, date))
    return {
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      value: round(dayPurchases.reduce((sum, purchase) => sum + purchase.total, 0)),
    }
  })

  return {
    metrics: {
      todaysRevenue,
      todaysOrders,
      grossProfit,
      avgOrderValue,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      outstandingPayments,
    },
    charts: {
      salesTrend: { labels: chartLabels, revenue: dailyRevenue, orders: dailyOrders, profit: dailyProfit },
      salesByCategory,
      topProducts: topProducts.slice(0, 5),
      paymentBreakdown,
      purchaseTrend,
    },
    recentSales: recentSales.slice(0, 6),
    recentPurchases: [...purchases].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 5),
    recentMovements: stockMovements.slice(0, 6),
  }
}
