export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DRAFT: 'draft',
}

export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  INACTIVE: 'inactive',
}

export const SALE_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  HOLD: 'hold',
}

export const PURCHASE_STATUS = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  PARTIALLY_RECEIVED: 'partially_received',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
}

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  UNPAID: 'unpaid',
  REFUNDED: 'refunded',
}

export const MOVEMENT_TYPE = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  RETURN: 'return',
  DAMAGE: 'damage',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
}

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  QR: 'qr',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_PAYMENT: 'mobile_payment',
  CREDIT: 'credit',
  MIXED: 'mixed',
}

export const TRANSFER_STATUS = {
  DRAFT: 'draft',
  REQUESTED: 'requested',
  APPROVED: 'approved',
  IN_TRANSIT: 'in_transit',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
}

export const NOTIFICATION_TYPE = {
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  PURCHASE: 'purchase',
  SALES: 'sales',
  RETURN: 'return',
  PAYMENT: 'payment',
  SYSTEM: 'system',
}

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Supplies',
  'Transportation',
  'Maintenance',
  'Marketing',
  'Taxes',
  'Other',
]

export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ARCHIVE: 'archive',
  LOGIN: 'login',
  LOGOUT: 'logout',
  RECEIVE: 'receive',
  RETURN: 'return',
  ADJUST: 'adjust',
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  CANCEL: 'cancel',
  EXPORT: 'export',
}

export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'KHR', label: 'Khmer Riel (៛)', symbol: '៛' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'THB', label: 'Thai Baht (฿)', symbol: '฿' },
  { code: 'VND', label: 'Vietnamese Dong (₫)', symbol: '₫' },
]

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'km', label: 'ភាសាខ្មែរ' },
]

export const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
]
