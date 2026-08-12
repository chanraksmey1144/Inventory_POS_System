import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Star, Wallet, ShoppingBag, Receipt } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useCustomer, useCustomerGroups, useSales } from '@/hooks/useSales'
import StatCard from '@/features/dashboard/StatCard'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import DataTable from '@/components/ui/DataTable'
import Spinner from '@/components/ui/Spinner'
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils'
import { can } from '@/lib/permissions'

const PAYMENT_LABEL_KEYS = {
  cash: 'pos.cash',
  card: 'pos.card',
  qr: 'pos.qr',
  bank_transfer: 'pos.bankTransfer',
  mobile_payment: 'pos.mobilePayment',
  credit: 'pos.credit',
  mixed: 'pos.mixed',
}

export default function CustomerDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  usePageTitle('customers.title')

  const customerQuery = useCustomer(id)
  const groupsQuery = useCustomerGroups()
  const salesQuery = useSales({ page: 1, perPage: 1000 })

  const customer = customerQuery.data
  const groups = groupsQuery.data?.items || []
  const group = groups.find((item) => item.id === customer?.groupId)

  const sales = useMemo(
    () => (salesQuery.data?.items || []).filter((sale) => sale.customerId === id),
    [salesQuery.data, id],
  )

  if (customerQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        {t('errors.notFoundHint')}
      </div>
    )
  }

  const columns = [
    {
      key: 'invoiceNumber',
      header: t('sales.invoice'),
      cell: (sale) => (
        <button
          type="button"
          onClick={() => navigate(`/sales/${sale.id}`)}
          className="font-mono text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
        >
          {sale.invoiceNumber}
        </button>
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
      cell: (sale) => <span className="text-slate-600 dark:text-slate-300">{t(PAYMENT_LABEL_KEYS[sale.paymentMethod] || 'pos.cash')}</span>,
    },
    {
      key: 'total',
      header: t('common.total'),
      align: 'right',
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
        title={customer.name}
        subtitle={group?.name}
        breadcrumb={[{ label: t('nav.customers'), to: '/customers' }, { label: customer.name }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/customers')}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t('common.back')}
            </Button>
            {can('customers.update') ? (
              <Button variant="outline" icon={Pencil} onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                {t('common.edit')}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t('customers.totalSpent')} value={formatCurrency(customer.totalSpent)} icon={ShoppingBag} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <StatCard label={t('customers.outstanding')} value={formatCurrency(customer.outstanding)} icon={Wallet} iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" />
        <StatCard label={t('customers.loyaltyPoints')} value={formatNumber(customer.loyaltyPoints)} icon={Star} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title={t('customers.details')} />
          <div className="divide-y divide-slate-100 px-5 py-2 dark:divide-slate-800">
            <div className="flex items-center gap-3 py-3">
              <Mail size={16} className="text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400">{t('common.email')}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{customer.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Phone size={16} className="text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400">{t('common.phone')}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{customer.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <MapPin size={16} className="text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400">{t('common.address')}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{customer.address || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <StatusBadge status={customer.status} />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={t('customers.purchaseHistory')} />
          <DataTable
            columns={columns}
            data={sales}
            loading={salesQuery.isLoading}
            error={salesQuery.isError ? t('errors.loadFailed') : null}
            onRetry={() => salesQuery.refetch()}
            rowKey="id"
            onRowClick={(sale) => navigate(`/sales/${sale.id}`)}
            emptyTitle={t('customers.noSales')}
            emptyIcon={Receipt}
          />
        </Card>
      </div>
    </div>
  )
}
