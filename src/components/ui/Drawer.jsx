import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  size = 'md',
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => panelRef.current?.focus(), 50)

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  const widthMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className={cn(
          'absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity',
          side === 'right' ? 'animate-[fadeIn_0.15s_ease-out]' : '',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Drawer'}
        tabIndex={-1}
        className={cn(
          'absolute flex h-full w-full flex-col bg-white shadow-2xl outline-none dark:bg-slate-900 dark:ring-1 dark:ring-slate-700',
          side === 'right' ? 'right-0' : 'left-0',
          widthMap[size],
        )}
      >
        {title ? (
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

Drawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  side: PropTypes.oneOf(['left', 'right']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
}
