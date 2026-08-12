import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function pageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  const pages = new Set([1, total, current, current - 1, current + 1, 2, total - 1])
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
    .reduce((acc, page, index, array) => {
      if (index > 0 && page - array[index - 1] > 1) {
        acc.push('ellipsis')
      }
      acc.push(page)
      return acc
    }, [])
}

export default function Pagination({ page, totalPages, onPageChange, totalItems, pageSize, onPageSizeChange, className }) {
  if (totalPages <= 1 && !totalItems) return null

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 px-5 py-3', className)}>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {totalItems !== undefined ? <span>{totalItems} items</span> : null}
        {onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Page size"
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          {pageNumbers(page, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Go to page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  'h-8 min-w-8 rounded-md px-2 text-sm font-medium transition-colors',
                  item === page
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

Pagination.propTypes = {
  page: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  onPageSizeChange: PropTypes.func,
  className: PropTypes.string,
}
