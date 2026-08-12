import { products } from './products'
import { MOVEMENT_TYPE } from '@/constants'

const TYPES = [
  MOVEMENT_TYPE.PURCHASE,
  MOVEMENT_TYPE.PURCHASE,
  MOVEMENT_TYPE.SALE,
  MOVEMENT_TYPE.SALE,
  MOVEMENT_TYPE.SALE,
  MOVEMENT_TYPE.ADJUSTMENT,
  MOVEMENT_TYPE.TRANSFER,
  MOVEMENT_TYPE.RETURN,
  MOVEMENT_TYPE.DAMAGE,
]

function dateFromDaysAgo(days, hour) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
  return date.toISOString()
}

export const stockMovements = Array.from({ length: 80 }, (_, index) => {
  const type = TYPES[index % TYPES.length]
  const product = products[index % products.length]
  const quantity = (index % 5) + 1
  const before = 10 + (index % 90)
  const incoming = [MOVEMENT_TYPE.PURCHASE, MOVEMENT_TYPE.RETURN, MOVEMENT_TYPE.ADJUSTMENT, MOVEMENT_TYPE.TRANSFER].includes(type)
  const after = incoming ? before + quantity : before - quantity

  return {
    id: `mv-${index + 1}`,
    date: dateFromDaysAgo(90 - index, 9 + (index % 8)),
    productId: product.id,
    type,
    quantity: incoming ? quantity : -quantity,
    before,
    after,
    warehouseId: 'w-1',
    reference: type === MOVEMENT_TYPE.PURCHASE ? 'PO-2026-' + String(15 + index).padStart(4, '0') : type === MOVEMENT_TYPE.SALE ? 'INV-2026-' + String(4000 + index).padStart(4, '0') : 'ADJ-' + String(index + 1).padStart(4, '0'),
    user: index % 2 === 0 ? 'u-2' : 'u-3',
    note: type === MOVEMENT_TYPE.ADJUSTMENT ? 'Stock count discrepancy resolved' : type === MOVEMENT_TYPE.DAMAGE ? 'Damaged in transit' : '',
  }
}).sort((a, b) => new Date(b.date) - new Date(a.date))

export const stockTransfers = [
  {
    id: 'tr-1',
    transferNumber: 'TRF-2026-0001',
    sourceWarehouseId: 'w-3',
    destinationWarehouseId: 'w-1',
    itemCount: 2,
    status: 'received',
    createdAt: dateFromDaysAgo(12, 9),
    createdBy: 'u-1',
    notes: 'Replenish Main Warehouse',
  },
  {
    id: 'tr-2',
    transferNumber: 'TRF-2026-0002',
    sourceWarehouseId: 'w-1',
    destinationWarehouseId: 'w-2',
    itemCount: 3,
    status: 'in_transit',
    createdAt: dateFromDaysAgo(3, 14),
    createdBy: 'u-2',
    notes: '',
  },
  {
    id: 'tr-3',
    transferNumber: 'TRF-2026-0003',
    sourceWarehouseId: 'w-1',
    destinationWarehouseId: 'w-3',
    itemCount: 1,
    status: 'requested',
    createdAt: dateFromDaysAgo(1, 10),
    createdBy: 'u-3',
    notes: 'Emergency restock',
  },
  {
    id: 'tr-4',
    transferNumber: 'TRF-2026-0004',
    sourceWarehouseId: 'w-2',
    destinationWarehouseId: 'w-1',
    itemCount: 4,
    status: 'draft',
    createdAt: dateFromDaysAgo(0, 8),
    createdBy: 'u-2',
    notes: '',
  },
]
