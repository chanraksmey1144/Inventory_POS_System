import PropTypes from 'prop-types'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StatCard({ label, value, icon: Icon, iconClass, delta, deltaLabel }) {
  const positive = delta >= 0
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {delta !== undefined ? (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
                  positive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
                )}
              >
                {positive ? <TrendingUp size={11} aria-hidden="true" /> : <TrendingDown size={11} aria-hidden="true" />}
                {positive ? '+' : ''}
                {delta}%
              </span>
              {deltaLabel ? <span className="text-slate-400">{deltaLabel}</span> : null}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              iconClass || 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
            )}
          >
            <Icon size={20} aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </div>
  )
}

StatCard.propTypes = {
  label: PropTypes.node,
  value: PropTypes.node,
  icon: PropTypes.elementType,
  iconClass: PropTypes.string,
  delta: PropTypes.number,
  deltaLabel: PropTypes.node,
}
