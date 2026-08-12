import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Receipt, RotateCcw } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useSales, useCustomers } from '@/hooks/useSales'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime, initials } from '@/lib/utils'
import { SALE_STATUS } from '@/constants'

const PAYMENT_LABEL_KEYS = {
  cash: 'pos.cash',
  card: 'pos.card',
  qr: 'pos.qr',
  bank_transfer: 'pos.bankTransfer',
  mobile_payment: 'pos.mobilePayment',
  credit: 'pos.credit',
  mixed: 'pos.mixed',
}

const PAYMENT_COLORS = {
  cash: 'success',
  card: 'info',
  qr: 'violet',
  bank_transfer: 'neutral',
  mobile_payment: 'warning',
  credit: 'warning',
  mixed: 'neutral',
}

export default function SalesListPage() {
  const { t } = useTranslation()
  usePageTitle('sales.title')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const salesQuery = useSales({ page: 1, perPage: 1000 })
  const customersQuery = useCustomers({ page: 1, perPage: 1000 })

  const sales = salesQuery.data?.items || []
  const customers = customersQuery.data?.items || []

  const customerMap = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers])

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filtered = sales.filter((sale) => {
      const customer = customerMap.get(sale.customerId)
      const customerName = customer?.name || ''
      const paymentLabel = t(PAYMENT_LABEL_KEYS[sale.paymentMethod] || 'pos.cash').toLowerCase()
      if (status && sale.status !== status) return false
      if (!term) return true
      return (
        sale.invoiceNumber.toLowerCase().includes(term) ||
        customerName.toLowerCase().includes(term) ||
        paymentLabel.includes(term)
      )
    })
    return filtered.map((sale) => ({ ...sale, customerName: customerMap.get(sale.customerId)?.name || '—' }))
  }, [sales, search, status, customerMap, t])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pageRows = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)

  const columns = [
    {
      key: 'invoiceNumber',
      header: t('sales.invoice'),
      cell: (sale) => (
        <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{sale.invoiceNumber}</span>
      ),
    },
    {
      key: 'customer',
      header: t('sales.customer'),
      cell: (sale) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {initials(sale.customerName === '—' ? '?' : sale.customerName)}
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-200">{sale.customerName}</span>
        </div>
      ),
    },
    {
      key: 'saleDate',
      header: t('sales.saleDate'),
      cell: (sale) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDateTime(sale.saleDate)}</span>
      ),
    },
    {
      key: 'items',
      header: t('sales.items'),
      align: 'right',
      cell: (sale) => <span className="text-slate-700 dark:text-slate-200">{sale.items.length}</span>,
    },
    {
      key: 'paymentMethod',
      header: t('sales.paymentMethod'),
      cell: (sale) => (
        <Badge color={PAYMENT_COLORS[sale.paymentMethod] || 'neutral'}>
          {t(PAYMENT_LABEL_KEYS[sale.paymentMethod] || 'pos.cash')}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: t('common.total'),
      align: 'right',
      sortable: true,
      cell: (sale) => <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(sale.total)}</span>,
    },
    {
      key: 'status',
      header: t('sales.status'),
      cell: (sale) => <StatusBadge status={sale.status} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('sales.title')}
        subtitle={t('sales.subtitle')}
        breadcrumb={[{ label: t('nav.sales') }]}
        actions={
          <>
            <Button variant="outline" icon={RotateCcw} onClick={() => navigate('/sales/returns')}>
              {t('sales.returnSale')}
            </Button>
            <Button icon={Plus} onClick={() => navigate('/pos')}>
              {t('sales.create')}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('sales.searchPlaceholder')} value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-72" />
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            className="max-w-44"
          >
            <option value="">{t('sales.allStatus')}</option>
            {Object.values(SALE_STATUS).map((value) => (
              <option key={value} value={value}>
                {t(`sales.${value}`)}
              </option>
            ))}
          </Select>
          <span className="ml-auto text-sm text-slate-400">
            {rows.length} {t('common.items')}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={pageRows}
          loading={salesQuery.isLoading}
          error={salesQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => salesQuery.refetch()}
          rowKey="id"
          onRowClick={(sale) => navigate(`/sales/${sale.id}`)}
          emptyTitle={t('sales.noSales')}
          emptyDescription={t('sales.noSalesHint')}
          emptyIcon={Receipt}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={rows.length}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </Card>
    </div>
  )
}
