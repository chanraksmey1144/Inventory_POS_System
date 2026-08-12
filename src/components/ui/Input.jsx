import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input(
  { label, error, hint, id, className, rightIcon: RightIcon, ...props },
  ref,
) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400',
            'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500',
            RightIcon && 'pr-10',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {RightIcon ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
            <RightIcon size={16} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
})

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  rightIcon: PropTypes.elementType,
}

export default Input
