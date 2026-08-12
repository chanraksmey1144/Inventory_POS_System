import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, RotateCcw, XCircle, Receipt, User, Wallet, CalendarDays, Store, Printer } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useSale, useCancelSale, useCustomers } from '@/hooks/useSales'
import { useUsers, useRegisters, useBranches } from '@/hooks/useAdmin'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import DataTable from '@/components/ui/DataTable'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ProductImage from '@/components/ui/ProductImage'
import Spinner from '@/components/ui/Spinner'
import { formatCurrency, formatDateTime } from '@/lib/utils'
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

export default function SaleDetailPage() {
  const { t } = useTranslation()
  usePageTitle('sales.title')
  const navigate = useNavigate()
  const toast = useToastStore()
  const { id } = useParams()

  const [cancelOpen, setCancelOpen] = useState(false)

  const saleQuery = useSale(id)
  const customersQuery = useCustomers({ page: 1, perPage: 1000 })
  const usersQuery = useUsers({ page: 1, perPage: 100 })
  const registersQuery = useRegisters()
  const branchesQuery = useBranches()
  const cancelSale = useCancelSale()

  const sale = saleQuery.data
  const customers = customersQuery.data?.items || []
  const users = usersQuery.data?.items || []
  const registers = registersQuery.data?.items || []
  const branches = branchesQuery.data?.items || []

  const customer = customers.find((item) => item.id === sale?.customerId)
  const cashier = users.find((item) => item.id === sale?.cashierId)
  const register = registers.find((item) => item.id === sale?.registerId)
  const branch = branches.find((item) => item.id === sale?.branchId)

  if (saleQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        {t('errors.notFoundHint')}
      </div>
    )
  }

  const canCancel = ![SALE_STATUS.CANCELLED, SALE_STATUS.REFUNDED].includes(sale.status)
  const canReturn = sale.status === SALE_STATUS.COMPLETED

  const handleCancel = async () => {
    try {
      await cancelSale.mutateAsync(sale.id)
      toast.success(t('sales.cancelled'))
      setCancelOpen(false)
    } catch {
      /* handled by mock error toast */
    }
  }

  const columns = [
    {
      key: 'product',
      header: t('products.productName'),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <ProductImage product={item} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
            <p className="font-mono text-xs text-slate-400">{item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: t('common.quantity'),
      align: 'right',
      cell: (item) => <span className="text-slate-700 dark:text-slate-200">{item.quantity}</span>,
    },
    {
      key: 'price',
      header: t('pos.total'),
      align: 'right',
      cell: (item) => <span className="text-slate-700 dark:text-slate-200">{formatCurrency(item.price)}</span>,
    },
    {
      key: 'subtotal',
      header: t('sales.subtotal'),
      align: 'right',
      cell: (item) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(item.price * item.quantity)}</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={sale.invoiceNumber}
        subtitle={customer?.name}
        breadcrumb={[{ label: t('nav.sales'), to: '/sales' }, { label: sale.invoiceNumber }]}
        actions={
          <>
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>
              {t('common.print')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/sales')}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t('common.back')}
            </Button>
            {canReturn ? (
              <Button variant="outline" icon={RotateCcw} onClick={() => navigate(`/sales/returns?invoice=${encodeURIComponent(sale.invoiceNumber)}`)}>
                {t('sales.returnSale')}
              </Button>
            ) : null}
            {canCancel ? (
              <Button variant="outline" icon={XCircle} onClick={() => setCancelOpen(true)}>
                {t('sales.cancelSale')}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader title={t('sales.items')} />
            <DataTable
              columns={columns}
              data={sale.items}
              rowKey="productId"
              emptyTitle={t('sales.noItems')}
              emptyIcon={Receipt}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('sales.paymentInfo')} />
            <CardBody>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('sales.customer')}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{customer?.name || t('pos.walkInCustomer')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('sales.cashier')}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{cashier?.name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Store size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('sales.register')}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {register?.name || '—'}
                      {branch ? ` · ${branch.name}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('sales.saleDate')}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{formatDateTime(sale.saleDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wallet size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('sales.paymentMethod')}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{t(PAYMENT_LABEL_KEYS[sale.paymentMethod] || 'pos.cash')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={sale.status} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('sales.totals')} />
            <CardBody>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('sales.subtotal')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(sale.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('pos.discount')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(sale.discount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('pos.tax')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(sale.tax)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{t('sales.total')}</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatCurrency(sale.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('pos.paid')}</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.paid)}</span>
                </div>
                {sale.change > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t('pos.change')}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(sale.change)}</span>
                  </div>
                ) : null}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title={t('sales.cancelSale')}
        message={t('sales.cancelConfirm')}
        confirmLabel={t('common.cancel')}
        loading={cancelSale.isPending}
      />
    </div>
  )
}
