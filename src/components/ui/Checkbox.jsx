import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

const Checkbox = forwardRef(function Checkbox({ label, error, className, description, ...props }, ref) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-emerald-600',
          'focus:outline-2 focus:outline-offset-2 focus:outline-emerald-500',
          'dark:border-slate-700 dark:bg-slate-900',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      <div>
        {label ? (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        ) : null}
        {description ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        ) : null}
        {error ? (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
})

Checkbox.propTypes = {
  label: PropTypes.node,
  error: PropTypes.string,
  className: PropTypes.string,
  description: PropTypes.string,
}

export default Checkbox
