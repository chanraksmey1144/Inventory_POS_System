import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Mail, Phone, MapPin, FileText, Wallet, DollarSign, ShoppingBag } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useSupplier, usePurchases } from '@/hooks/usePurchases'
import StatCard from '@/features/dashboard/StatCard'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import DataTable from '@/components/ui/DataTable'
import Spinner from '@/components/ui/Spinner'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { can } from '@/lib/permissions'

export default function SupplierDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  usePageTitle('suppliers.title')

  const supplierQuery = useSupplier(id)
  const purchasesQuery = usePurchases({ supplierId: id, page: 1, perPage: 100 })

  const supplier = supplierQuery.data
  const purchases = purchasesQuery.data?.items || []

  const totals = useMemo(
    () => purchases.reduce((acc, purchase) => acc + purchase.total, 0),
    [purchases],
  )

  if (supplierQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        {t('errors.notFoundHint')}
      </div>
    )
  }

  const columns = [
    {
      key: 'purchaseNumber',
      header: t('purchases.purchaseNumber'),
      cell: (purchase) => (
        <button
          type="button"
          onClick={() => navigate(`/purchases/${purchase.id}`)}
          className="font-mono text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
        >
          {purchase.purchaseNumber}
        </button>
      ),
    },
    {
      key: 'orderDate',
      header: t('purchases.orderDate'),
      cell: (purchase) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDateTime(purchase.orderDate)}</span>
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
      cell: (purchase) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(purchase.total)}</span>
      ),
    },
    {
      key: 'status',
      header: t('purchases.paymentStatus'),
      cell: (purchase) => <StatusBadge status={purchase.paymentStatus} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title={supplier.name}
        subtitle={supplier.contactPerson}
        breadcrumb={[{ label: t('nav.suppliers'), to: '/suppliers' }, { label: supplier.name }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/suppliers')}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t('common.back')}
            </Button>
            {can('suppliers.update') ? (
              <Button variant="outline" icon={Pencil} onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}>
                {t('common.edit')}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t('suppliers.totalPurchases')} value={formatCurrency(totals)} icon={ShoppingBag} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <StatCard label={t('suppliers.outstanding')} value={formatCurrency(supplier.outstanding)} icon={Wallet} iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" />
        <StatCard label={t('purchases.title')} value={purchases.length} icon={FileText} iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title={t('suppliers.details')} />
          <div className="divide-y divide-slate-100 px-5 py-2 dark:divide-slate-800">
            <div className="flex items-center gap-3 py-3">
              <Mail size={16} className="text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400">{t('common.email')}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{supplier.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Phone size={16} className="text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400">{t('common.phone')}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{supplier.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <FileText size={16} className="text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400">{t('suppliers.taxNumber')}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{supplier.taxNumber || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <MapPin size={16} className="text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400">{t('common.address')}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{supplier.address || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <DollarSign size={16} className="text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400">{t('common.status')}</p>
                <StatusBadge status={supplier.status} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={t('suppliers.purchaseHistory')} />
          <DataTable
            columns={columns}
            data={purchases}
            loading={purchasesQuery.isLoading}
            error={purchasesQuery.isError ? t('errors.loadFailed') : null}
            onRetry={() => purchasesQuery.refetch()}
            rowKey="id"
            onRowClick={(purchase) => navigate(`/purchases/${purchase.id}`)}
            emptyTitle={t('suppliers.noPurchases')}
            emptyIcon={FileText}
          />
        </Card>
      </div>
    </div>
  )
}
