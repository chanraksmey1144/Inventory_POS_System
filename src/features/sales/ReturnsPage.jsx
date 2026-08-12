import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Receipt, Search } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useSales, useReturns, useProcessReturn, useCustomers } from '@/hooks/useSales'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import ProductImage from '@/components/ui/ProductImage'
import { formatCurrency, formatDateTime, initials } from '@/lib/utils'
import { SALE_STATUS, PAYMENT_METHODS } from '@/constants'

const PAYMENT_LABEL_KEYS = {
  cash: 'pos.cash',
  card: 'pos.card',
  qr: 'pos.qr',
  bank_transfer: 'pos.bankTransfer',
  mobile_payment: 'pos.mobilePayment',
  credit: 'pos.credit',
  mixed: 'pos.mixed',
}

export default function ReturnsPage() {
  const { t } = useTranslation()
  usePageTitle('returns.title')
  const navigate = useNavigate()
  const toast = useToastStore()
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState('find')
  const [search, setSearch] = useState(searchParams.get('invoice') || '')
  const [sale, setSale] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [included, setIncluded] = useState({})
  const [refundMethod, setRefundMethod] = useState(PAYMENT_METHODS.CASH)

  const salesQuery = useSales({ page: 1, perPage: 1000 })
  const returnsQuery = useReturns()
  const customersQuery = useCustomers({ page: 1, perPage: 1000 })
  const processReturn = useProcessReturn()

  const customers = customersQuery.data?.items || []
  const customerMap = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers])

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return []
    return salesQuery.data?.items?.filter((item) => {
      const customerName = customerMap.get(item.customerId)?.name || ''
      return item.status === SALE_STATUS.COMPLETED &&
        (item.invoiceNumber.toLowerCase().includes(term) || customerName.toLowerCase().includes(term))
    }) || []
  }, [salesQuery.data, search, customerMap])

  const returns = returnsQuery.data?.items || []
  const returnSaleMap = useMemo(
    () => new Map(salesQuery.data?.items?.map((item) => [item.id, item]) || []),
    [salesQuery.data],
  )

  const selectSale = (selected) => {
    setSale(selected)
    const initialQty = {}
    const initialIncluded = {}
    selected.items.forEach((item) => {
      initialQty[item.productId] = item.quantity
      initialIncluded[item.productId] = true
    })
    setQuantities(initialQty)
    setIncluded(initialIncluded)
    setStep('select')
  }

  const selectedItems = sale?.items.filter((item) => included[item.productId] && (quantities[item.productId] || 0) > 0) || []
  const refundAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.productId] || 0),
    0,
  )

  const handleProcess = async () => {
    if (!sale || selectedItems.length === 0) return
    const items = selectedItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      sku: item.sku,
      price: item.price,
      quantity: quantities[item.productId] || 0,
      discount: item.discount || 0,
      tax: item.tax || 0,
    }))
    try {
      await processReturn.mutateAsync({ saleId: sale.id, items })
      toast.success(t('returns.processed'))
      setSale(null)
      setSearch('')
      setStep('find')
    } catch {
      /* handled by mock error toast */
    }
  }

  const returnColumns = [
    {
      key: 'invoice',
      header: t('sales.invoice'),
      cell: (record) => {
        const saleRecord = returnSaleMap.get(record.saleId)
        return (
          <button
            type="button"
            onClick={() => saleRecord && navigate(`/sales/${saleRecord.id}`)}
            className="font-mono text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            {saleRecord?.invoiceNumber || record.saleId}
          </button>
        )
      },
    },
    {
      key: 'date',
      header: t('returns.date'),
      cell: (record) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDateTime(record.createdAt)}</span>
      ),
    },
    {
      key: 'items',
      header: t('returns.items'),
      align: 'right',
      cell: (record) => <span className="text-slate-700 dark:text-slate-200">{record.items.length}</span>,
    },
    {
      key: 'amount',
      header: t('returns.refundAmount'),
      align: 'right',
      cell: (record) => (
        <span className="font-semibold text-rose-500">
          -{formatCurrency(record.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
        </span>
      ),
    },
    {
      key: 'customer',
      header: t('returns.customer'),
      cell: (record) => {
        const saleRecord = returnSaleMap.get(record.saleId)
        const customer = customerMap.get(saleRecord?.customerId)
        return <span className="text-slate-700 dark:text-slate-200">{customer?.name || '—'}</span>
      },
    },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t('returns.title')}
        subtitle={t('returns.subtitle')}
        breadcrumb={[{ label: t('nav.sales'), to: '/sales' }, { label: t('returns.title') }]}
        actions={
          <Button variant="outline" onClick={() => navigate('/sales')}>
            <ArrowLeft size={16} aria-hidden="true" />
            {t('common.back')}
          </Button>
        }
      />

      <Card>
        <CardHeader
          title={step === 'find' ? t('returns.findSale') : step === 'select' ? t('returns.selectItems') : t('returns.confirmation')}
        />
        <CardBody>
          {step === 'find' ? (
            <div className="space-y-4">
              <div className="relative max-w-xl">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <Input
                  autoFocus
                  className="pl-9"
                  placeholder={t('returns.searchInvoice')}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {search && matches.length > 0 ? (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                  {matches.slice(0, 8).map((item) => {
                    const customer = customerMap.get(item.customerId)
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => selectSale(item)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {initials(customer?.name || '?')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.invoiceNumber}</p>
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{customer?.name || '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(item.total)}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(item.saleDate)}</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 dark:text-slate-600" aria-hidden="true" />
                      </button>
                    )
                  })}
                </div>
              ) : search ? (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  {t('returns.saleNotFound')}
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 'select' && sale ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                <div>
                  <p className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{sale.invoiceNumber}</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{customerMap.get(sale.customerId)?.name || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.total')}</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(sale.total)}</p>
                </div>
              </div>

              <div className="space-y-2">
                {sale.items.map((item) => (
                  <div key={item.productId} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(included[item.productId])}
                      onChange={(event) => setIncluded((current) => ({ ...current, [item.productId]: event.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
                      aria-label={t('returns.selectItems')}
                    />
                    <ProductImage product={item} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                      <p className="font-mono text-xs text-slate-400">{item.sku}</p>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {t('returns.soldQty')}: <span className="font-semibold text-slate-700 dark:text-slate-200">{item.quantity}</span>
                    </span>
                    <Input
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={quantities[item.productId] || ''}
                      onChange={(event) => {
                        const value = Math.max(0, Math.min(item.quantity, Number(event.target.value) || 0))
                        setQuantities((current) => ({ ...current, [item.productId]: value }))
                      }}
                      disabled={!included[item.productId]}
                      className="w-24"
                      aria-label={t('returns.returnQty')}
                    />
                    <span className="w-24 text-right text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency(item.price * (quantities[item.productId] || 0))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{t('returns.refundMethod')}</p>
                  <Select value={refundMethod} onChange={(event) => setRefundMethod(event.target.value)}>
                    {Object.values(PAYMENT_METHODS).filter((method) => method !== PAYMENT_METHODS.MIXED).map((method) => (
                      <option key={method} value={method}>
                        {t(PAYMENT_LABEL_KEYS[method] || 'pos.cash')}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep('find')}>
                    {t('common.back')}
                  </Button>
                  <Button onClick={() => setStep('confirm')} disabled={selectedItems.length === 0}>
                    {t('common.next')}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 'confirm' && sale ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                      <th className="px-4 py-2">{t('products.productName')}</th>
                      <th className="px-4 py-2 text-right">{t('returns.returnQty')}</th>
                      <th className="px-4 py-2 text-right">{t('common.total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedItems.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-100">{item.name}</td>
                        <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{quantities[item.productId]}</td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-800 dark:text-slate-100">
                          {formatCurrency(item.price * (quantities[item.productId] || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('returns.refundTo')}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{t(PAYMENT_LABEL_KEYS[refundMethod] || 'pos.cash')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('returns.refundAmount')}</p>
                  <p className="text-xl font-bold text-rose-500">-{formatCurrency(refundAmount)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep('select')}>
                  {t('common.back')}
                </Button>
                <Button onClick={handleProcess} loading={processReturn.isPending} icon={Check}>
                  {t('returns.confirm')}
                </Button>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <CardHeader title={t('returns.recentReturns')} />
        <DataTable
          columns={returnColumns}
          data={returns.slice(0, 10)}
          loading={returnsQuery.isLoading}
          error={returnsQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => returnsQuery.refetch()}
          rowKey="id"
          emptyTitle={t('returns.noReturns')}
          emptyDescription={t('returns.noReturnsHint')}
          emptyIcon={Receipt}
        />
      </Card>
    </div>
  )
}
