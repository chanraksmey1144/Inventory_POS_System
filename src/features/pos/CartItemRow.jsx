import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import useCartStore from '@/app/store/useCartStore'
import Stepper from '@/components/ui/Stepper'
import { cn } from '@/lib/utils'

export default function CartItemRow({ item, active, onActivate }) {
  const { t } = useTranslation()
  const { removeItem } = useCartStore()

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border px-2.5 py-2 transition-colors',
        active
          ? 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-500 dark:bg-emerald-500/5'
          : 'border-slate-100 dark:border-slate-800',
      )}
      onClick={onActivate}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
        <p className="text-xs text-slate-400">
          ${Number(item.price).toFixed(2)} × {item.quantity}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
          ${Number(item.price * item.quantity).toFixed(2)}
        </span>
        <div className="flex items-center gap-1.5">
          <Stepper
            size="sm"
            value={item.quantity}
            onChange={(quantity) => useCartStore.getState().setQuantity(item.productId, item.variantId, quantity)}
            max={item.stock > 0 ? item.stock : undefined}
          />
          <button
            type="button"
            onClick={() => removeItem(item.productId, item.variantId)}
            aria-label={t('pos.removeItem')}
            className="rounded-md p-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-950"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

CartItemRow.propTypes = {
  item: PropTypes.object.isRequired,
  active: PropTypes.bool,
  onActivate: PropTypes.func,
}
