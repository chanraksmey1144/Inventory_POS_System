import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div
      className={cn('flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-800', className)}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            active === tab.key
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {tab.label}
          {tab.count !== undefined ? (
            <span
              className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                active === tab.key
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
              )}
            >
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      count: PropTypes.number,
    }),
  ).isRequired,
  active: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
}
