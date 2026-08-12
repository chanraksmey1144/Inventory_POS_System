import { products } from './products'
import { customers } from './customers'
import { PAYMENT_METHODS, SALE_STATUS } from '@/constants'
import { seededRandom } from './helpers'

const rng = seededRandom(20260701)

function round(value) {
  return Math.round(value * 100) / 100
}

function randomItem(product) {
  const quantity = rng() < 0.7 ? 1 : 2
  return {
    productId: product.id,
    variantId: null,
    name: product.name,
    sku: product.sku,
    price: product.price,
    cost: product.cost,
    quantity,
    discount: 0,
    tax: product.tax,
  }
}

function buildSale(index) {
  const daysAgo = Math.floor(rng() * 90)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(8 + Math.floor(rng() * 12), Math.floor(rng() * 60), 0, 0)

  const itemCount = 1 + Math.floor(rng() * 5)
  const itemList = [...products]
  const items = []
  const used = new Set()
  for (let i = 0; i < itemCount; i += 1) {
    let product
    do {
      product = itemList[Math.floor(rng() * itemList.length)]
    } while (used.has(product.id))
    used.add(product.id)
    items.push(randomItem(product))
  }

  const subtotal = round(items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const discountPercent = subtotal > 30 ? 5 : 0
  const discount = round((subtotal * discountPercent) / 100)
  const afterDiscount = subtotal - discount
  const tax = round(afterDiscount * 0.1)
  const total = round(afterDiscount + tax)

  const methodRoll = rng()
  const paymentMethod =
    methodRoll < 0.45
      ? PAYMENT_METHODS.CASH
      : methodRoll < 0.65
        ? PAYMENT_METHODS.CARD
        : methodRoll < 0.8
          ? PAYMENT_METHODS.QR
          : methodRoll < 0.9
            ? PAYMENT_METHODS.MOBILE_PAYMENT
            : PAYMENT_METHODS.BANK_TRANSFER

  const paid = paymentMethod === PAYMENT_METHODS.CARD || rng() > 0.3 ? total : round(total - 5)

  return {
    id: `sale-${index + 1}`,
    invoiceNumber: `INV-2026-${String(4000 + index).padStart(4, '0')}`,
    customerId: customers[Math.floor(rng() * customers.length)].id,
    cashierId: rng() < 0.5 ? 'u-2' : 'u-3',
    branchId: 'b-1',
    registerId: rng() < 0.5 ? 'r-1' : 'r-2',
    saleDate: date.toISOString(),
    items,
    subtotal,
    discount,
    tax,
    total,
    paid,
    change: paid >= total ? round(paid - total) : 0,
    paymentMethod,
    status: SALE_STATUS.COMPLETED,
    notes: '',
    createdBy: rng() < 0.5 ? 'u-2' : 'u-3',
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  }
}

export const sales = Array.from({ length: 120 }, (_, index) => buildSale(index))
  .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))

export const heldSales = [
  {
    id: 'HOLD-001',
    customerId: 'c-3',
    items: [
      { productId: 'p-6', variantId: null, name: 'Arabica Coffee Beans 250g', sku: 'AC-250G', price: 6.0, quantity: 2, discount: 0, tax: 10 },
      { productId: 'p-9', variantId: null, name: 'Potato Chips 80g', sku: 'PC-80G', price: 0.9, quantity: 3, discount: 0, tax: 10 },
    ],
    discount: 0,
    tax: 10,
    total: 14.85,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    cashierId: 'u-2',
  },
]
