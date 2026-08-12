import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { usePurchases, useSuppliers } from '@/hooks/usePurchases'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { can } from '@/lib/permissions'
import { PURCHASE_STATUS } from '@/constants'

export default function PurchaseListPage() {
  const { t } = useTranslation()
  usePageTitle('purchases.title')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const purchasesQuery = usePurchases({
    search,
    status: status || undefined,
    supplierId: supplierId || undefined,
    page,
    perPage: pageSize,
  })
  const suppliersQuery = useSuppliers()

  const purchases = purchasesQuery.data?.items || []
  const total = purchasesQuery.data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const suppliers = suppliersQuery.data?.items || []
  const supplierMap = new Map(suppliers.map((supplier) => [supplier.id, supplier]))

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const columns = [
    {
      key: 'purchaseNumber',
      header: t('purchases.purchaseNumber'),
      cell: (purchase) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{purchase.purchaseNumber}</span>
      ),
    },
    {
      key: 'supplier',
      header: t('purchases.supplier'),
      cell: (purchase) => (
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {supplierMap.get(purchase.supplierId)?.name || '—'}
        </span>
      ),
    },
    {
      key: 'orderDate',
      header: t('purchases.orderDate'),
      cell: (purchase) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(purchase.orderDate)}</span>
      ),
    },
    {
      key: 'items',
      header: t('purchases.items'),
      align: 'right',
      cell: (purchase) => <span className="text-slate-700 dark:text-slate-200">{purchase.items.length}</span>,
    },
    {
      key: 'total',
      header: t('common.total'),
      align: 'right',
      sortable: true,
      cell: (purchase) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(purchase.total)}</span>
      ),
    },
    {
      key: 'status',
      header: t('purchases.status'),
      cell: (purchase) => <StatusBadge status={purchase.status} />,
    },
    {
      key: 'paymentStatus',
      header: t('purchases.paymentStatus'),
      cell: (purchase) => <StatusBadge status={purchase.paymentStatus} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('purchases.title')}
        subtitle={t('purchases.subtitle')}
        breadcrumb={[{ label: t('nav.purchases') }]}
        actions={
          can('purchases.create') ? (
            <Button icon={Plus} onClick={() => navigate('/purchases/create')}>
              {t('purchases.create')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={handleFilterChange(setSearch)} className="max-w-64" />
          <Select value={supplierId} onChange={handleFilterChange(setSupplierId)} className="max-w-48">
            <option value="">{t('purchases.allSuppliers')}</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={handleFilterChange(setStatus)} className="max-w-44">
            <option value="">{t('purchases.allStatus')}</option>
            {Object.values(PURCHASE_STATUS).map((value) => (
              <option key={value} value={value}>
                {t(`purchases.${value}`)}
              </option>
            ))}
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={purchases}
          loading={purchasesQuery.isLoading}
          error={purchasesQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => purchasesQuery.refetch()}
          rowKey="id"
          onRowClick={(purchase) => navigate(`/purchases/${purchase.id}`)}
          emptyTitle={t('purchases.noPurchases')}
          emptyDescription={t('purchases.noPurchasesHint')}
          emptyIcon={FileText}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
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
