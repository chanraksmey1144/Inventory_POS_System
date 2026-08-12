import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANT_STYLES = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:hover:bg-emerald-600 shadow-sm',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-sm',
  outline:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 disabled:hover:bg-rose-600 shadow-sm',
  'danger-outline':
    'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950',
  'warning-outline':
    'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:bg-slate-900 dark:text-amber-400 dark:hover:bg-amber-950',
}

const SIZE_STYLES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-8 w-8 p-0',
}

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    className,
    children,
    disabled,
    icon: Icon,
    iconRight: IconRight,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : Icon ? <Icon size={16} aria-hidden="true" /> : null}
      {children}
      {IconRight && !loading ? <IconRight size={16} aria-hidden="true" /> : null}
    </button>
  )
})

Button.propTypes = {
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'danger-outline',
    'warning-outline',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon', 'icon-sm']),
  loading: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  iconRight: PropTypes.elementType,
}

export default Button
