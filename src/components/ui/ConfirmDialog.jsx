import { useState } from 'react'
import PropTypes from 'prop-types'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const [confirming, setConfirming] = useState(false)

  async function handleConfirm() {
    setConfirming(true)
    try {
      await onConfirm?.()
      onClose?.()
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm" title={title}>
      <div className="flex items-start gap-3">
        <div
          className={
            variant === 'danger'
              ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
              : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
          }
        >
          <AlertTriangle size={20} aria-hidden="true" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          loading={confirming || loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.node,
  message: PropTypes.node,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning']),
  loading: PropTypes.bool,
}
