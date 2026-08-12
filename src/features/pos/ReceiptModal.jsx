import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Printer, CheckCircle2, Store } from 'lucide-react'
import { useSettings } from '@/hooks/useReports'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function ReceiptModal({ sale, onClose }) {
  const { t } = useTranslation()
  const { settings } = useSettings()

  if (!sale) return null

  const storeName = settings?.storeName || 'StoreMaster'
  const address = settings?.address
  const phone = settings?.phone

  const lineItems = sale.items || []

  return (
    <Modal open onClose={onClose} size="sm" title={t('pos.receipt')} className="receipt-print-area">
      <div className="rounded-lg bg-white font-mono text-[13px] leading-relaxed text-slate-800">
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5">
            <Store size={16} className="text-emerald-600" aria-hidden="true" />
            <span className="text-base font-bold tracking-wide uppercase">{storeName}</span>
          </div>
          {address ? <p className="text-xs text-slate-500">{address}</p> : null}
          {phone ? <p className="text-xs text-slate-500">{phone}</p> : null}
          <p className="mt-1 text-xs text-slate-500">{t('pos.receiptTagline')}</p>
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span>{t('pos.receiptNumber')}</span>
            <span className="font-semibold">{sale.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('pos.receiptDate')}</span>
            <span>{formatDateTime(sale.saleDate || sale.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('pos.customer')}</span>
            <span>{sale.customerName || sale.customer?.name || t('pos.walkInCustomer')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('pos.paymentMethod')}</span>
            <span className="capitalize">{sale.paymentMethod}</span>
          </div>
          {sale.cashierName ? (
            <div className="flex justify-between">
              <span>{t('pos.cashier')}</span>
              <span>{sale.cashierName}</span>
            </div>
          ) : null}
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="space-y-1">
          {lineItems.map((item, index) => (
            <div key={index} className="flex justify-between gap-2 text-xs">
              <span className="min-w-0 flex-1">
                {item.name}
                <span className="text-slate-400"> × {item.quantity}</span>
              </span>
              <span className="shrink-0 font-semibold">
                {formatCurrency((item.price || 0) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>{t('pos.subtotal')}</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 ? (
            <div className="flex justify-between">
              <span>{t('pos.discount')}</span>
              <span>-{formatCurrency((sale.subtotal * sale.discount) / 100)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>{t('pos.tax')} ({sale.tax}%)</span>
            <span>{formatCurrency(sale.total - sale.subtotal + (sale.subtotal * sale.discount) / 100)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-1 text-sm font-bold">
            <span>{t('pos.total')}</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          {sale.paymentMethod !== 'credit' ? (
            <>
              <div className="flex justify-between">
                <span>{t('pos.paid')}</span>
                <span>{formatCurrency(sale.paid)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('pos.change')}</span>
                <span>{formatCurrency(sale.change || 0)}</span>
              </div>
            </>
          ) : null}
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="text-center">
          <p className="text-xs font-semibold">{t('pos.thankYou')}</p>
          <p className="text-xs text-slate-500">{t('pos.seeYouAgain')}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 print:hidden">
        <Button variant="outline" onClick={onClose}>
          {t('common.close')}
        </Button>
        <Button onClick={() => window.print()} icon={Printer}>
          {t('pos.print')}
        </Button>
      </div>

      {sale.paymentMethod === 'credit' ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 print:hidden dark:bg-amber-500/10 dark:text-amber-400">
          <CheckCircle2 size={14} aria-hidden="true" />
          {t('pos.creditReceiptNote')}
        </div>
      ) : null}
    </Modal>
  )
}

ReceiptModal.propTypes = {
  sale: PropTypes.object,
  onClose: PropTypes.func.isRequired,
}
