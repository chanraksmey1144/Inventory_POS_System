import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'

export default function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  )
}

Skeleton.propTypes = {
  className: PropTypes.string,
}
