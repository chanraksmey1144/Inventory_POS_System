import { NOTIFICATION_TYPE } from '@/constants'

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

export const notifications = [
  {
    id: 'n-1',
    type: NOTIFICATION_TYPE.LOW_STOCK,
    title: 'Low stock alert',
    message: 'Body Soap 250g is below the minimum stock level.',
    read: false,
    link: '/inventory/low-stock',
    createdAt: minutesAgo(25),
  },
  {
    id: 'n-2',
    type: NOTIFICATION_TYPE.OUT_OF_STOCK,
    title: 'Out of stock',
    message: 'Mineral Water 500ml is now out of stock.',
    read: false,
    link: '/inventory',
    createdAt: minutesAgo(80),
  },
  {
    id: 'n-3',
    type: NOTIFICATION_TYPE.SALES,
    title: 'New sale completed',
    message: 'Invoice INV-2026-4119 completed for $12.40.',
    read: false,
    link: '/sales',
    createdAt: minutesAgo(120),
  },
  {
    id: 'n-4',
    type: NOTIFICATION_TYPE.PURCHASE,
    title: 'Purchase received',
    message: 'PO-2026-0012 marked as received.',
    read: true,
    link: '/purchases',
    createdAt: minutesAgo(60 * 6),
  },
  {
    id: 'n-5',
    type: NOTIFICATION_TYPE.PAYMENT,
    title: 'Payment due',
    message: 'Customer Sreypov Chan has an outstanding balance of $320.75.',
    read: true,
    link: '/customers',
    createdAt: minutesAgo(60 * 26),
  },
  {
    id: 'n-6',
    type: NOTIFICATION_TYPE.RETURN,
    title: 'Return processed',
    message: 'Refund of $5.50 processed for invoice INV-2026-4102.',
    read: true,
    link: '/sales/returns',
    createdAt: minutesAgo(60 * 48),
  },
  {
    id: 'n-7',
    type: NOTIFICATION_TYPE.SYSTEM,
    title: 'System update',
    message: 'StoreMaster frontend updated to version 1.4.0.',
    read: true,
    link: '/settings',
    createdAt: minutesAgo(60 * 70),
  },
]

export const auditLogs = [
  { id: 'a-1', date: minutesAgo(15), userId: 'u-1', action: 'login', module: 'auth', record: '—', description: 'Signed in to the system' },
  { id: 'a-2', date: minutesAgo(30), userId: 'u-2', action: 'create', module: 'sales', record: 'INV-2026-4119', description: 'Completed a new sale' },
  { id: 'a-3', date: minutesAgo(75), userId: 'u-2', action: 'payment', module: 'sales', record: 'INV-2026-4118', description: 'Received cash payment of $8.25' },
  { id: 'a-4', date: minutesAgo(130), userId: 'u-4', action: 'update', module: 'products', record: 'p-1', description: 'Updated stock level for Coca-Cola 500ml' },
  { id: 'a-5', date: minutesAgo(240), userId: 'u-5', action: 'create', module: 'expenses', record: 'exp-9', description: 'Recorded a new expense of $28' },
  { id: 'a-6', date: minutesAgo(360), userId: 'u-1', action: 'update', module: 'settings', record: 'settings', description: 'Changed default tax rate to 10%' },
  { id: 'a-7', date: minutesAgo(500), userId: 'u-2', action: 'hold', module: 'sales', record: 'HOLD-001', description: 'Held a sale for later' },
  { id: 'a-8', date: minutesAgo(700), userId: 'u-4', action: 'adjust', module: 'inventory', record: 'mv-12', description: 'Adjusted stock: -3 for Instant Noodles 5-Pack' },
  { id: 'a-9', date: minutesAgo(900), userId: 'u-3', action: 'receive', module: 'purchases', record: 'PO-2026-0011', description: 'Received purchase order items' },
  { id: 'a-10', date: minutesAgo(1100), userId: 'u-1', action: 'archive', module: 'products', record: 'p-20', description: 'Archived product Dish Soap 750ml' },
]
