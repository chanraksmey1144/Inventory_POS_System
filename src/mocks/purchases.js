import { products } from './products'
import { PURCHASE_STATUS, PAYMENT_STATUS } from '@/constants'

const STATUSES = [
  PURCHASE_STATUS.RECEIVED,
  PURCHASE_STATUS.RECEIVED,
  PURCHASE_STATUS.RECEIVED,
  PURCHASE_STATUS.PARTIALLY_RECEIVED,
  PURCHASE_STATUS.ORDERED,
]

function buildItem(product, received) {
  return {
    productId: product.id,
    variantId: null,
    name: product.name,
    sku: product.sku,
    cost: product.cost,
    quantity: 24,
    receivedQuantity: received ? 24 : 0,
  }
}

const SUPPLIER_MAP = {
  'cat-1': 's-1',
  'cat-2': 's-2',
  'cat-3': 's-5',
  'cat-4': 's-4',
  'cat-5': 's-3',
  'cat-6': 's-6',
  'cat-7': 's-2',
  'cat-8': 's-2',
}

const rawPurchases = [
  ['PO-2026-0001', 62, 4, 5, 0, 'draft'],
  ['PO-2026-0002', 60, 4, 8, 1, 'ordered'],
  ['PO-2026-0003', 58, 4, 8, 2, 'received'],
  ['PO-2026-0004', 56, 3, 6, 4, 'received'],
  ['PO-2026-0005', 54, 3, 6, 6, 'received'],
  ['PO-2026-0006', 50, 2, 5, 8, 'received'],
  ['PO-2026-0007', 47, 2, 5, 10, 'received'],
  ['PO-2026-0008', 43, 1, 4, 12, 'received'],
  ['PO-2026-0009', 39, 1, 4, 14, 'received'],
  ['PO-2026-0010', 36, 1, 4, 18, 'received'],
  ['PO-2026-0011', 32, 1, 3, 21, 'received'],
  ['PO-2026-0012', 28, 1, 3, 25, 'received'],
  ['PO-2026-0013', 25, 1, 3, 30, 'received'],
  ['PO-2026-0014', 20, 1, 3, 38, 'received'],
  ['PO-2026-0015', 15, 1, 2, 45, 'received'],
]

function dateFromDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(9, 0, 0, 0)
  return date.toISOString()
}

export const purchases = rawPurchases.map(([number, days, supplierOffset, productStart, productCount, status], index) => {
  const supplierIndex = (index + supplierOffset) % 6
  const supplier = ['s-1', 's-2', 's-3', 's-4', 's-5', 's-6'][supplierIndex]
  const productList = products.slice(productStart, productStart + productCount)
  const received = status === PURCHASE_STATUS.RECEIVED
  const items = productList.map((product) => buildItem(product, received))
  const subtotal = items.reduce((sum, item) => sum + item.cost * item.quantity, 0)
  const discount = 0
  const tax = subtotal * 0.05
  const total = subtotal + tax
  const orderDate = dateFromDaysAgo(days)
  const receivedAt = received ? orderDate : null

  return {
    id: `po-${index + 1}`,
    purchaseNumber: number,
    supplierId: supplier,
    branchId: 'b-1',
    warehouseId: 'w-1',
    orderDate,
    expectedDate: dateFromDaysAgo(days - 2),
    receivedAt,
    items,
    subtotal: round(subtotal),
    discount,
    tax: round(tax),
    total: round(total),
    status,
    paymentStatus:
      status === PURCHASE_STATUS.RECEIVED
        ? PAYMENT_STATUS.PAID
        : PAYMENT_STATUS.UNPAID,
    notes: status === 'ordered' ? 'Awaiting supplier delivery' : '',
    createdBy: 'u-1',
    createdAt: orderDate,
    updatedAt: receivedAt || orderDate,
  }
})

function round(value) {
  return Math.round(value * 100) / 100
}
