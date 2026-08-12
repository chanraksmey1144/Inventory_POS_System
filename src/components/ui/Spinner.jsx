import PropTypes from 'prop-types'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Spinner({ size = 20, className, label }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="status">
      <Loader2 size={size} className="animate-spin text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      {label ? <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span> : null}
    </span>
  )
}

Spinner.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
  label: PropTypes.node,
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size={32} label="Loading..." />
    </div>
  )
}
