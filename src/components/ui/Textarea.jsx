import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

const Textarea = forwardRef(function Textarea(
  { label, error, hint, id, className, rows = 3, ...props },
  ref,
) {
  const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400',
          'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
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

Textarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
}

export default Textarea
