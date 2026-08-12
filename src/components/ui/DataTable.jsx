import PropTypes from 'prop-types'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Checkbox from './Checkbox'
import Skeleton from './Skeleton'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import Pagination from './Pagination'

function SortIcon({ direction }) {
  if (direction === 'asc') return <ArrowUp size={13} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
  if (direction === 'desc') return <ArrowDown size={13} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
  return <ArrowUpDown size={13} className="text-slate-300 dark:text-slate-600" aria-hidden="true" />
}

function LoadingRows({ columns, rowCount = 6 }) {
  return Array.from({ length: rowCount }).map((_, rowIndex) => (
    <tr key={`skeleton-${rowIndex}`} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      {columns.map((column, columnIndex) => (
        <td key={columnIndex} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  ))
}

export default function DataTable({
  columns,
  data = [],
  loading = false,
  error = null,
  onRetry,
  rowKey = 'id',
  onRowClick,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyIcon,
  selection,
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  sortBy,
  sortDir,
  onSortChange,
  className,
  dense = false,
}) {
  const showSelection = Boolean(selection)

  function toggleAll() {
    const allSelected = data.every((row) => selection.selected.includes(row[rowKey]))
    if (allSelected) {
      selection.onSelect([])
    } else {
      selection.onSelect(data.map((row) => row[rowKey]))
    }
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              {showSelection ? (
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={data.length > 0 && data.every((row) => selection.selected.includes(row[rowKey]))}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
                    dense ? 'py-2' : 'py-3',
                    column.align === 'right' && 'text-right',
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSortChange?.(
                          column.key,
                          sortBy === column.key && sortDir === 'asc' ? 'desc' : 'asc',
                        )
                      }
                      className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      {column.header}
                      <SortIcon direction={sortBy === column.key ? sortDir : null} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRows columns={columns} />
            ) : data.length === 0 ? null : (
              data.map((row) => {
                const rowId = row[rowKey]
                const isSelected = selection?.selected.includes(rowId)
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-slate-100 transition-colors last:border-0 dark:border-slate-800',
                      onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      isSelected && 'bg-emerald-50/60 dark:bg-emerald-500/5',
                    )}
                  >
                    {showSelection ? (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={(event) => {
                            if (event.target.checked) {
                              selection.onSelect([...selection.selected, rowId])
                            } else {
                              selection.onSelect(selection.selected.filter((id) => id !== rowId))
                            }
                          }}
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 text-sm text-slate-700 dark:text-slate-200',
                          dense ? 'py-2' : 'py-3',
                          column.align === 'right' && 'text-right',
                          column.noWrap && 'whitespace-nowrap',
                        )}
                      >
                        {column.cell ? column.cell(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
      ) : null}

      {!loading && error ? <ErrorState message={error} onRetry={onRetry} /> : null}

      {page !== undefined ? (
        <Pagination
          page={page}
          totalPages={totalPages || 1}
          onPageChange={onPageChange}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          className="border-t border-slate-100 dark:border-slate-800"
        />
      ) : null}
    </div>
  )
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node.isRequired,
      cell: PropTypes.func,
      sortable: PropTypes.bool,
      align: PropTypes.oneOf(['left', 'right']),
      noWrap: PropTypes.bool,
    }),
  ).isRequired,
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.node,
  onRetry: PropTypes.func,
  rowKey: PropTypes.string,
  onRowClick: PropTypes.func,
  emptyTitle: PropTypes.node,
  emptyDescription: PropTypes.node,
  emptyIcon: PropTypes.elementType,
  selection: PropTypes.shape({
    selected: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    onSelect: PropTypes.func,
  }),
  page: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  onPageSizeChange: PropTypes.func,
  sortBy: PropTypes.string,
  sortDir: PropTypes.string,
  onSortChange: PropTypes.func,
  className: PropTypes.string,
  dense: PropTypes.bool,
}
