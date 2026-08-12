import PropTypes from 'prop-types'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProductImage({ product, size = 'md', className }) {
  const image = product?.image
  const label = image?.label || product?.name?.[0] || 'P'
  const color = image?.color || '#334155'

  const sizes = {
    xs: 'h-8 w-8 rounded-md text-xs',
    sm: 'h-10 w-10 rounded-lg text-sm',
    md: 'h-12 w-12 rounded-lg text-base',
    lg: 'h-16 w-16 rounded-xl text-xl',
    xl: 'h-24 w-24 rounded-xl text-2xl',
  }

  if (!image) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
          sizes[size],
          className,
        )}
        aria-hidden="true"
      >
        <Package size={sizes[size] ? Math.min(24, parseInt(sizes[size], 10) / 2) : 18} />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center font-semibold text-white',
        sizes[size],
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}

ProductImage.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    image: PropTypes.shape({ label: PropTypes.string, color: PropTypes.string }),
  }),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
}
