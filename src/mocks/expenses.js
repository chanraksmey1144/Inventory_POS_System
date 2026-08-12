import { PAYMENT_METHODS } from '@/constants'

const CATEGORIES = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Transportation', 'Maintenance', 'Marketing', 'Other']

function dateFromDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(10, 0, 0, 0)
  return date.toISOString()
}

const raw = [
  [30, 'Rent', 450, PAYMENT_METHODS.BANK_TRANSFER, 'Monthly store rent for Main Branch'],
  [28, 'Utilities', 85, PAYMENT_METHODS.CASH, 'Electricity bill'],
  [25, 'Salaries', 1200, PAYMENT_METHODS.BANK_TRANSFER, 'Cashier salaries for the month'],
  [21, 'Supplies', 45, PAYMENT_METHODS.CASH, 'Receipt paper and plastic bags'],
  [18, 'Transportation', 35, PAYMENT_METHODS.CASH, 'Delivery fuel'],
  [15, 'Maintenance', 60, PAYMENT_METHODS.CASH, 'Fridge compressor repair'],
  [12, 'Marketing', 90, PAYMENT_METHODS.QR, 'Facebook ads promotion'],
  [9, 'Utilities', 72, PAYMENT_METHODS.BANK_TRANSFER, 'Water and internet bill'],
  [6, 'Supplies', 28, PAYMENT_METHODS.CASH, 'Cleaning supplies'],
  [3, 'Other', 40, PAYMENT_METHODS.CASH, 'Miscellaneous store costs'],
]

export const expenses = raw.map(([days, category, amount, paymentMethod, description], index) => ({
  id: `exp-${index + 1}`,
  category,
  amount,
  paymentMethod,
  branchId: 'b-1',
  date: dateFromDaysAgo(days),
  description,
  receipt: null,
  createdBy: 'u-1',
  createdAt: dateFromDaysAgo(days),
}))
