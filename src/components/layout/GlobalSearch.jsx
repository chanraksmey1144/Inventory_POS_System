import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Package, Users, Truck, Receipt, ArrowRight, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/productService'
import { customerService } from '@/services/salesService'
import { supplierService } from '@/services/purchaseService'
import { salesService } from '@/services/salesService'
import { debounce } from '@/lib/utils'
import ProductImage from '@/components/ui/ProductImage'

function useGlobalSearch(query) {
  const enabled = query.length >= 2

  const products = useQuery({
    queryKey: ['global-search', 'products', query],
    queryFn: () => productService.list({ search: query, perPage: 4 }),
    enabled,
  })

  const customers = useQuery({
    queryKey: ['global-search', 'customers', query],
    queryFn: () => customerService.list({ search: query, perPage: 4 }),
    enabled,
  })

  const suppliers = useQuery({
    queryKey: ['global-search', 'suppliers', query],
    queryFn: () => supplierService.list({ search: query }),
    enabled,
  })

  const sales = useQuery({
    queryKey: ['global-search', 'sales', query],
    queryFn: () => salesService.list({ search: query, perPage: 4 }),
    enabled,
  })

  return { products, customers, suppliers, sales }
}

export default function GlobalSearch({ open, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const results = useGlobalSearch(query)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const searching = query.length >= 2

  function go(path) {
    onClose()
    navigate(path)
  }

  const sections = [
    {
      key: 'products',
      label: t('search.products'),
      icon: Package,
      items: results.products.data?.items?.slice(0, 4) || [],
      render: (item) => (
        <div className="flex items-center gap-3">
          <ProductImage product={item} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
            <p className="truncate text-xs text-slate-400">
              {item.sku} · ${item.price}
            </p>
          </div>
        </div>
      ),
      path: (item) => `/products/${item.id}`,
    },
    {
      key: 'customers',
      label: t('search.customers'),
      icon: Users,
      items: results.customers.data?.items?.slice(0, 4) || [],
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            {item.name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
            <p className="truncate text-xs text-slate-400">{item.phone || item.email}</p>
          </div>
        </div>
      ),
      path: (item) => `/customers/${item.id}`,
    },
    {
      key: 'suppliers',
      label: t('search.suppliers'),
      icon: Truck,
      items: results.suppliers.data?.items?.slice(0, 4) || [],
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
            {item.name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
            <p className="truncate text-xs text-slate-400">{item.contactPerson || item.email}</p>
          </div>
        </div>
      ),
      path: (item) => `/suppliers/${item.id}`,
    },
    {
      key: 'sales',
      label: t('search.sales'),
      icon: Receipt,
      items: results.sales.data?.items?.slice(0, 4) || [],
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Receipt size={16} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.invoiceNumber}</p>
            <p className="truncate text-xs text-slate-400">${item.total}</p>
          </div>
        </div>
      ),
      path: (item) => `/sales/${item.id}`,
    },
  ]

  const hasAnyResults = sections.some((section) => section.items.length > 0)

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24" role="dialog" aria-modal="true" aria-label={t('search.placeholder')}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-700">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
          <Search size={18} className="text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full bg-transparent py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto py-2">
          {!searching ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">{t('search.hint')}</p>
          ) : !hasAnyResults ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">{t('search.noResults')}</p>
          ) : (
            sections
              .filter((section) => section.items.length > 0)
              .map((section) => (
                <div key={section.key} className="mb-2">
                  <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <section.icon size={13} aria-hidden="true" />
                    {section.label}
                  </div>
                  {section.items.map((item) => (
                    <button
                      key={`${section.key}-${item.id}`}
                      type="button"
                      onClick={() => go(section.path(item))}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {section.render(item)}
                      <ArrowRight size={15} className="shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
