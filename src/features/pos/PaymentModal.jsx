import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
  Banknote,
  CreditCard,
  QrCode,
  Landmark,
  Smartphone,
  HandCoins,
  Layers,
  ChevronLeft,
} from 'lucide-react'
import useCartStore from '@/app/store/useCartStore'
import useAuthStore from '@/app/store/useAuthStore'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PAYMENT_METHODS, SALE_STATUS, PAYMENT_STATUS } from '@/constants'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const PAYMENT_OPTIONS = [
  { key: PAYMENT_METHODS.CASH, label: 'pos.payCash', icon: Banknote },
  { key: PAYMENT_METHODS.CARD, label: 'pos.payCard', icon: CreditCard },
  { key: PAYMENT_METHODS.QR, label: 'pos.payQR', icon: QrCode },
  { key: PAYMENT_METHODS.MOBILE_PAYMENT, label: 'pos.payMobile', icon: Smartphone },
  { key: PAYMENT_METHODS.BANK_TRANSFER, label: 'pos.payBank', icon: Landmark },
  { key: PAYMENT_METHODS.CREDIT, label: 'pos.payCredit', icon: HandCoins },
]

const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100]

export default function PaymentModal({ open, onClose, onComplete, onOpenReceipt }) {
  const { t } = useTranslation()
  const store = useCartStore()
  const user = useAuthStore((state) => state.user)
  const [method, setMethod] = useState(PAYMENT_METHODS.CASH)
  const [tendered, setTendered] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const subtotal = store.getSubtotal()
  const total = store.getTotal()
  const discountAmount = store.getDiscountAmount()

  useEffect(() => {
    if (open) {
      setMethod(PAYMENT_METHODS.CASH)
      setTendered(total ? String(total.toFixed(2)) : '')
      setError('')
      setSubmitting(false)
    }
  }, [open, total])

  const tenderedValue = parseFloat(tendered) || 0
  const change = tenderedValue - total

  const needsCustomer = method === PAYMENT_METHODS.CREDIT && !store.customer
  const canSubmit =
    store.items.length > 0 &&
    tenderedValue > 0 &&
    (method === PAYMENT_METHODS.CREDIT ? Boolean(store.customer) : true) &&
    tenderedValue >= total - 0.001

  const quickAmounts = useMemo(() => {
    const amounts = QUICK_AMOUNTS.filter((amount) => amount >= total)
    if (amounts.length === 0) return [Math.ceil(total * 2 / 5) * 5]
    return amounts
  }, [total])

  const buildSale = () => {
    const now = new Date().toISOString()
    const paid =
      method === PAYMENT_METHODS.CREDIT ? 0 : Math.min(tenderedValue, total)
    return {
      invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`,
      customerId: store.customer?.id || null,
      customerName: store.customer?.name || t('pos.walkInCustomer'),
      cashierId: user?.id || 'u-1',
      saleDate: now,
      items: store.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
        tax: item.tax,
      })),
      subtotal,
      discount: store.discount,
      tax: store.tax,
      total,
      paid: method === PAYMENT_METHODS.CREDIT ? 0 : paid,
      change: method === PAYMENT_METHODS.CREDIT ? 0 : Math.max(0, change),
      paymentMethod: method,
      status: method === PAYMENT_METHODS.CREDIT ? SALE_STATUS.PENDING : SALE_STATUS.COMPLETED,
      paymentStatus:
        method === PAYMENT_METHODS.CREDIT
          ? PAYMENT_STATUS.UNPAID
          : change < -0.001
            ? PAYMENT_STATUS.PARTIAL
            : PAYMENT_STATUS.PAID,
      notes: '',
      createdAt: now,
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError(t('pos.paymentInsufficient'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const sale = await onComplete(buildSale())
      store.clearCart()
      setSubmitting(false)
      onClose()
      if (onOpenReceipt) onOpenReceipt(sale)
    } catch {
      setError(t('pos.paymentFailed'))
      setSubmitting(false)
    }
  }

  const handleTendered = (value) => {
    setTendered(String(value))
    setError('')
  }

  return (
    <Modal open={open} onClose={onClose} title={t('pos.payment')} size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('pos.totalDue')}</span>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(total)}
          </span>
        </div>

        {store.discount > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('pos.quickDiscount')}
            </span>
            {[5, 10, 15, 20].map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => store.setDiscount(percent)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors',
                  store.discount === percent
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                -{percent}%
              </button>
            ))}
            <button
              type="button"
              onClick={() => store.setDiscount(0)}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {t('pos.noDiscount')}
            </button>
            <span className="ml-auto text-xs font-semibold text-emerald-600">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t('pos.paymentMethod')}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {PAYMENT_OPTIONS.map((option) => {
              const Icon = option.icon
              const active = method === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setMethod(option.key)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all',
                    active
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                >
                  <Icon size={22} aria-hidden="true" />
                  {t(option.label)}
                </button>
              )
            })}
          </div>
        </div>

        {method === PAYMENT_METHODS.CREDIT && !store.customer ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            {t('pos.creditNeedsCustomer')}
          </div>
        ) : null}

        {method !== PAYMENT_METHODS.CREDIT ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('pos.received')}
              type="number"
              min="0"
              step="0.01"
              value={tendered}
              onChange={(event) => handleTendered(event.target.value)}
              autoFocus
            />
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('pos.change')}
              </p>
              <div
                className={cn(
                  'rounded-lg border border-dashed px-3 py-2 text-sm font-bold',
                  change >= 0
                    ? 'border-slate-200 text-emerald-700 dark:border-slate-700 dark:text-emerald-400'
                    : 'border-rose-200 text-rose-500 dark:border-rose-500/40',
                )}
              >
                {change >= 0 ? formatCurrency(change) : formatCurrency(Math.abs(change)) + ' ' + t('pos.short')}
              </div>
            </div>
          </div>
        ) : null}

        {method === PAYMENT_METHODS.CASH ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('pos.quickAmounts')}
            </span>
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleTendered(amount)}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {formatCurrency(amount)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleTendered(total.toFixed(2))}
              className="rounded-md border border-emerald-600 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            >
              {t('pos.exactAmount')}
            </button>
          </div>
        ) : null}

        {error ? (
          <p className="text-sm font-medium text-rose-500">{error}</p>
        ) : null}

        <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="outline" icon={ChevronLeft} onClick={onClose}>
            {t('common.back')}
          </Button>
          <Button
            className="flex-1"
            size="lg"
            icon={method === PAYMENT_METHODS.CREDIT ? HandCoins : Layers}
            onClick={handleSubmit}
            disabled={submitting || store.items.length === 0 || needsCustomer}
          >
            {submitting
              ? t('pos.processing')
              : method === PAYMENT_METHODS.CREDIT
                ? t('pos.confirmCredit')
                : t('pos.confirmPayment')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

PaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onOpenReceipt: PropTypes.func,
}
