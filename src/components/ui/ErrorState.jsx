import PropTypes from 'prop-types'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <AlertCircle size={26} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {message ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
      ) : null}
      {onRetry ? (
        <Button variant="outline" className="mt-5" onClick={onRetry} icon={RefreshCw}>
          Try Again
        </Button>
      ) : null}
    </div>
  )
}

ErrorState.propTypes = {
  title: PropTypes.node,
  message: PropTypes.node,
  onRetry: PropTypes.func,
}
