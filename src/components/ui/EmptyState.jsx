import PropTypes from 'prop-types'
import { PackageOpen } from 'lucide-react'
import Button from './Button'

export default function EmptyState({ title = 'No data yet', description, actionLabel, onAction, icon: Icon = PackageOpen }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon size={26} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

EmptyState.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  actionLabel: PropTypes.node,
  onAction: PropTypes.func,
  icon: PropTypes.elementType,
}
