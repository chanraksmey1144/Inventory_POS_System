import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import ProductImage from '@/components/ui/ProductImage'
import { cn } from '@/lib/utils'

export default function ProductCard({ product, onAdd }) {
  const { t } = useTranslation()
  const outOfStock = product.stock === 0
  const lowStock = !outOfStock && product.stock <= product.minStock

  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      disabled={outOfStock}
      className={cn(
        'group relative flex flex-col rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500',
        outOfStock && 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="flex items-start justify-between">
        <ProductImage product={product} size="md" />
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
            outOfStock
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400',
          )}
        >
          <Plus size={14} aria-hidden="true" />
        </span>
      </div>

      <p className="mt-2.5 line-clamp-2 min-h-8 text-sm font-medium text-slate-800 dark:text-slate-100">
        {product.name}
      </p>

      <div className="mt-auto flex items-end justify-between pt-2">
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
          ${Number(product.price).toFixed(2)}
        </span>
        <span
          className={cn(
            'text-[11px] font-medium',
            outOfStock
              ? 'text-rose-500'
              : lowStock
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-400',
          )}
        >
          {outOfStock ? t('pos.outOfStock') : t('pos.unitsLeft', { count: product.stock })}
        </span>
      </div>
    </button>
  )
}

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
}
