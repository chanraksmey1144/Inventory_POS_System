import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

const STATUS_COLORS = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/30',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30',
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
}

export function Badge({ color = 'neutral', children, className, icon: Icon }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        STATUS_COLORS[color],
        className,
      )}
    >
      {Icon ? <Icon size={12} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}

Badge.propTypes = {
  color: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'neutral', 'violet', 'emerald']),
  children: PropTypes.node,
  className: PropTypes.string,
  icon: PropTypes.elementType,
}

export default Badge
