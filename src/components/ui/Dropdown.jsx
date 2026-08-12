import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

export default function Dropdown({ trigger, children, align = 'right', width = 'w-56', closeOnSelect = true }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>
      {open ? (
        <div
          className={cn(
            'absolute z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900',
            align === 'right' ? 'right-0' : 'left-0',
            width,
          )}
          role="menu"
          onClick={() => closeOnSelect && setOpen(false)}
        >
          {typeof children === 'function'
            ? children({ close: () => setOpen(false) })
            : children}
        </div>
      ) : null}
    </div>
  )
}

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  align: PropTypes.oneOf(['left', 'right']),
  width: PropTypes.string,
  closeOnSelect: PropTypes.bool,
}

export function DropdownItem({ icon: Icon, children, onClick, danger = false, className }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
        danger
          ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950'
          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800',
        className,
      )}
    >
      {Icon ? <Icon size={15} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

DropdownItem.propTypes = {
  icon: PropTypes.elementType,
  children: PropTypes.node,
  onClick: PropTypes.func,
  danger: PropTypes.bool,
  className: PropTypes.string,
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
}

export function DropdownLabel({ children }) {
  return (
    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {children}
    </div>
  )
}

DropdownLabel.propTypes = { children: PropTypes.node }
