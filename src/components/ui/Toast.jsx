import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import useToastStore from '@/app/store/useToastStore'

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-500" aria-hidden="true" />,
  error: <XCircle size={18} className="text-rose-500" aria-hidden="true" />,
  info: <Info size={18} className="text-sky-500" aria-hidden="true" />,
  warning: <AlertTriangle size={18} className="text-amber-500" aria-hidden="true" />,
}

export default function ToastViewport() {
  const { toasts, dismiss } = useToastStore()

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="mt-0.5 shrink-0">{ICONS[toast.type] || ICONS.info}</div>
          <div className="min-w-0 flex-1">
            {toast.title ? (
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{toast.title}</p>
            ) : null}
            <p className="text-sm text-slate-600 dark:text-slate-300">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
