import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const Select = forwardRef(function Select(
  { label, error, hint, id, className, children, placeholder, ...props },
  ref,
) {
  const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm text-slate-900 shadow-sm transition-colors',
            'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute inset-y-0 right-3 my-auto text-slate-400"
          aria-hidden="true"
        />
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

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  placeholder: PropTypes.string,
}

export default Select
