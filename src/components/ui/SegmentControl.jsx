import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

export default function SegmentControl({ options, value, onChange, className, size = 'md' }) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-1.5',
        className,
      )}
      role="group"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              active
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
            )}
          >
            {option.icon ? <option.icon size={14} aria-hidden="true" /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

SegmentControl.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      icon: PropTypes.elementType,
    }),
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
}
