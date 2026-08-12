import PropTypes from 'prop-types'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: XCircle,
    wrapper: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-500/10 dark:text-rose-300',
    iconColor: 'text-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    wrapper: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: Info,
    wrapper: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-500/10 dark:text-sky-300',
    iconColor: 'text-sky-500',
  },
}

export default function Alert({ variant = 'info', title, children, onClose, className }) {
  const config = VARIANTS[variant]
  const Icon = config.icon
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-lg border p-3.5 text-sm', config.wrapper, className)}
    >
      <Icon size={18} className={cn('mt-0.5 shrink-0', config.iconColor)} aria-hidden="true" />
      <div className="flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? 'mt-0.5' : ''}>{children}</div> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={15} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

Alert.propTypes = {
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.node,
  children: PropTypes.node,
  onClose: PropTypes.func,
  className: PropTypes.string,
}
