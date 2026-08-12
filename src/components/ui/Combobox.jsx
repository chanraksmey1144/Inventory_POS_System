import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Search, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Combobox({
  items = [],
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  getLabel = (item) => item?.name || item?.label || '',
  getSubLabel,
  getValue = (item) => item?.id,
  icon: Icon,
  clearable = true,
  autoFocus = false,
  className,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = items.find((item) => getValue(item) === value)

  useEffect(() => {
    if (!open) return undefined

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function handleFocus() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSelect(item) {
    onChange(getValue(item))
    setOpen(false)
    setQuery('')
  }

  const filtered = query
    ? items.filter((item) => getLabel(item).toLowerCase().includes(query.toLowerCase()))
    : items

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleFocus}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
      >
        {Icon ? <Icon size={15} className="text-slate-400" aria-hidden="true" /> : null}
        <span className="min-w-0 flex-1 truncate">
          {selected ? getLabel(selected) : <span className="text-slate-400">{placeholder}</span>}
        </span>
        {clearable && value ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear selection"
            onClick={(event) => {
              event.stopPropagation()
              onChange(null)
            }}
            className="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={14} aria-hidden="true" />
          </span>
        ) : (
          <ChevronDown size={15} className="text-slate-400" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="relative border-b border-slate-100 dark:border-slate-800">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                onSearch?.(event.target.value)
              }}
              placeholder={placeholder}
              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-slate-400">No results</li>
            ) : (
              filtered.map((item) => {
                const itemValue = getValue(item)
                const isSelected = itemValue === value
                return (
                  <li key={String(itemValue)} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex w-full flex-col px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
                        isSelected && 'bg-emerald-50 dark:bg-emerald-500/10',
                      )}
                    >
                      <span className={cn('text-slate-800 dark:text-slate-100', isSelected && 'text-emerald-700 dark:text-emerald-300')}>
                        {getLabel(item)}
                      </span>
                      {getSubLabel ? (
                        <span className="text-xs text-slate-400">{getSubLabel(item)}</span>
                      ) : null}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

Combobox.propTypes = {
  items: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  getLabel: PropTypes.func,
  getSubLabel: PropTypes.func,
  getValue: PropTypes.func,
  icon: PropTypes.elementType,
  clearable: PropTypes.bool,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
}
