import PropTypes from 'prop-types'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Stepper({ value, onChange, min = 1, max, size = 'md' }) {
  const step = (delta) => {
    const next = value + delta
    if (max !== undefined && next > max) return
    if (next < min) return
    onChange(next)
  }

  const btnSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'

  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => step(-1)}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          btnSize,
        )}
      >
        <Minus size={size === 'sm' ? 12 : 14} aria-hidden="true" />
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isNaN(next)) return
          if (max !== undefined && next > max) return
          if (next < min) return
          onChange(next)
        }}
        className={cn(
          'w-12 border-x border-slate-300 bg-white text-center text-sm font-medium text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          size === 'sm' ? 'h-6' : 'h-8',
        )}
        aria-label="Quantity"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => step(1)}
        disabled={max !== undefined && value >= max}
        className={cn(
          'flex items-center justify-center bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          btnSize,
        )}
      >
        <Plus size={size === 'sm' ? 12 : 14} aria-hidden="true" />
      </button>
    </div>
  )
}

Stepper.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md']),
}
