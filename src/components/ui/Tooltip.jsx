import { useState } from 'react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

export default function Tooltip({ label, children, side = 'top', shortcut }) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && label ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900',
            side === 'top' && 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
            side === 'bottom' && 'left-1/2 top-full mt-1.5 -translate-x-1/2',
            side === 'left' && 'right-full top-1/2 mr-1.5 -translate-y-1/2',
            side === 'right' && 'left-full top-1/2 ml-1.5 -translate-y-1/2',
          )}
        >
          {label}
          {shortcut ? <kbd className="ml-1.5 rounded bg-slate-700 px-1 text-[10px] dark:bg-slate-300">{shortcut}</kbd> : null}
        </span>
      ) : null}
    </span>
  )
}

Tooltip.propTypes = {
  label: PropTypes.node,
  children: PropTypes.node.isRequired,
  side: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  shortcut: PropTypes.string,
}
