import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
  className,
}) {
  const panelRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => panelRef.current?.focus(), 50)

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      clearTimeout(timer)
      previousFocusRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-700',
          SIZES[size],
          className,
        )}
      >
        {title ? (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
              {description ? (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

Modal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  footer: PropTypes.node,
  className: PropTypes.string,
}
