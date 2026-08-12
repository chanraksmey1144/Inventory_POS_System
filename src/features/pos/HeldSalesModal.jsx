import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Play, Trash2, ShoppingBasket } from 'lucide-react'
import useCartStore from '@/app/store/useCartStore'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function HeldSalesModal({ open, onClose }) {
  const { t } = useTranslation()
  const { heldSales, resumeSale, deleteHeldSale } = useCartStore()

  const handleResume = (heldSale) => {
    resumeSale(heldSale)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('pos.heldSales')}
      description={t('pos.heldSalesHint')}
    >
      {heldSales.length === 0 ? (
        <EmptyState
          title={t('pos.noHeldSales')}
          description={t('pos.noHeldSalesHint')}
          icon={ShoppingBasket}
        />
      ) : (
        <div className="space-y-3">
          {heldSales.map((heldSale) => (
            <div
              key={heldSale.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {heldSale.id}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {heldSale.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    {t('pos.items')}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {heldSale.customer?.name || t('pos.walkInCustomer')} ·{' '}
                  {formatDateTime(heldSale.createdAt)}
                </p>
                <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(heldSale.total)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  icon={Play}
                  onClick={() => handleResume(heldSale)}
                  aria-label={t('pos.resume')}
                >
                  {t('pos.resume')}
                </Button>
                <button
                  type="button"
                  onClick={() => deleteHeldSale(heldSale.id)}
                  aria-label={t('pos.deleteHeld')}
                  className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

HeldSalesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
