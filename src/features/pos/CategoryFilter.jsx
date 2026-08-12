import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export default function CategoryFilter({ categories, active, onSelect }) {
  const { t } = useTranslation()
  const items = [{ id: 'all', name: t('pos.categoryAll') }, ...categories]

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id === 'all' ? null : category.id)}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            active === category.id
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object),
  active: PropTypes.string,
  onSelect: PropTypes.func,
}
