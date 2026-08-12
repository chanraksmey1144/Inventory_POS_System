import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import useCartStore from '@/app/store/useCartStore'
import Modal from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'

export default function VariantPicker({ product, onClose }) {
  const { t } = useTranslation()
  const addItem = useCartStore((state) => state.addItem)

  if (!product) return null

  const handlePick = (variant) => {
    addItem(product, { variant, quantity: 1 })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={product.name} description={t('pos.selectVariant')}>
      <div className="space-y-2">
        {product.variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            disabled={variant.stock === 0}
            onClick={() => handlePick(variant)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50/40 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/5"
          >
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{variant.name}</p>
              <p className="text-xs text-slate-400">
                {variant.stock === 0 ? t('pos.outOfStock') : `${variant.stock} ${t('pos.left')}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(variant.price)}
              </span>
              <Plus size={16} className="text-slate-300" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </Modal>
  )
}

VariantPicker.propTypes = {
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
}
