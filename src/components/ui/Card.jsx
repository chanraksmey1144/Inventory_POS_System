import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

export function CardHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800', className)}>
      <div>
        {title ? <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3> : null}
        {subtitle ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

CardHeader.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
}

export function CardBody({ className, children }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

CardBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('border-t border-slate-100 px-5 py-3 dark:border-slate-800', className)}>
      {children}
    </div>
  )
}

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

export default Card
