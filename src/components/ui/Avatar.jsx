import PropTypes from 'prop-types'
import { cn, initials } from '@/lib/utils'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

const COLORS = [
  'bg-emerald-600',
  'bg-sky-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-teal-600',
]

function colorFor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Avatar({ name = '', src, size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', SIZES[size], className)}
      />
    )
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white',
        SIZES[size],
        colorFor(name || '?'),
        className,
      )}
      aria-hidden="true"
    >
      {initials(name) || '?'}
    </span>
  )
}

Avatar.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
}
