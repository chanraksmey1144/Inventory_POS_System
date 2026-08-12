import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Truck, XCircle, PackageCheck, Building2, Warehouse, FileText, CalendarDays, Wallet, MessageSquareText } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { usePurchase, useSuppliers, useReceivePurchase, useCancelPurchase } from '@/hooks/usePurchases'
import { useWarehouses } from '@/hooks/useAdmin'
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
import { can } from '@/lib/permissions'

export default function PurchaseDetailPage() {
  const { t } = useTranslation()
  usePageTitle('purchases.title')
  const navigate = useNavigate()
  const toast = useToastStore()
  const { id } = useParams()

  const [receiveOpen, setReceiveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const purchaseQuery = usePurchase(id)
  const suppliersQuery = useSuppliers()
  const warehousesQuery = useWarehouses()
  const receivePurchase = useReceivePurchase()
  const cancelPurchase = useCancelPurchase()

  const purchase = purchaseQuery.data
  const suppliers = suppliersQuery.data?.items || []
  const warehouses = warehousesQuery.data?.items || []
  const supplier = suppliers.find((item) => item.id === purchase?.supplierId)
  const warehouse = warehouses.find((item) => item.id === purchase?.warehouseId)

  if (purchaseQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        {t('errors.notFoundHint')}
      </div>
    )
  }

  const canReceive = ['draft', 'ordered', 'partially_received'].includes(purchase.status)
  const canCancel = !['received', 'cancelled'].includes(purchase.status)

  const handleReceive = async () => {
    try {
      await receivePurchase.mutateAsync({ id: purchase.id, items: purchase.items })
      toast.success(t('purchases.received'))
      setReceiveOpen(false)
    } catch {
      /* handled by mock error toast */
    }
  }

  const handleCancel = async () => {
    try {
      await cancelPurchase.mutateAsync(purchase.id)
      toast.success(t('purchases.cancelled'))
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
      header: t('purchases.orderedQty'),
      align: 'right',
      cell: (item) => <span className="text-slate-700 dark:text-slate-200">{item.quantity}</span>,
    },
    {
      key: 'receivedQuantity',
      header: t('purchases.receivedQty'),
      align: 'right',
      cell: (item) => (
        <span className={item.receivedQuantity >= item.quantity ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}>
          {item.receivedQuantity}
        </span>
      ),
    },
    {
      key: 'cost',
      header: t('products.costPrice'),
      align: 'right',
      cell: (item) => <span className="text-slate-700 dark:text-slate-200">{formatCurrency(item.cost)}</span>,
    },
    {
      key: 'subtotal',
      header: t('purchases.subtotal'),
      align: 'right',
      cell: (item) => <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(item.cost * item.quantity)}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title={purchase.purchaseNumber}
        subtitle={supplier?.name}
        breadcrumb={[{ label: t('nav.purchases'), to: '/purchases' }, { label: purchase.purchaseNumber }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/purchases')}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t('common.back')}
            </Button>
            {canCancel ? (
              <Button variant="outline" icon={XCircle} onClick={() => setCancelOpen(true)}>
                {t('common.cancel')}
              </Button>
            ) : null}
            {canReceive && can('purchases.receive') ? (
              <Button icon={Truck} onClick={() => setReceiveOpen(true)}>
                {t('purchases.receiveItems')}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader title={t('purchases.items')} />
            <DataTable
              columns={columns}
              data={purchase.items}
              rowKey="productId"
              emptyTitle={t('purchases.noItemsHint')}
              emptyIcon={FileText}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('purchases.purchaseDetails')} />
            <CardBody>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('purchases.supplier')}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{supplier?.name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Warehouse size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('purchases.warehouse')}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{warehouse?.name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('purchases.orderDate')}</p>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{formatDateTime(purchase.orderDate)}</p>
                  </div>
                </div>
                {purchase.expectedDate ? (
                  <div className="flex items-center gap-3">
                    <CalendarDays size={16} className="text-slate-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-400">{t('purchases.expectedDate')}</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{formatDateTime(purchase.expectedDate)}</p>
                    </div>
                  </div>
                ) : null}
                {purchase.receivedAt ? (
                  <div className="flex items-center gap-3">
                    <PackageCheck size={16} className="text-slate-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-400">{t('purchases.receivedAt')}</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{formatDateTime(purchase.receivedAt)}</p>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center gap-3">
                  <Wallet size={16} className="text-slate-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-slate-400">{t('purchases.paymentStatus')}</p>
                    <StatusBadge status={purchase.paymentStatus} />
                  </div>
                </div>
                {purchase.notes ? (
                  <div className="flex items-start gap-3">
                    <MessageSquareText size={16} className="mt-0.5 text-slate-400" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-400">{t('common.notes')}</p>
                      <p className="whitespace-pre-line font-medium text-slate-700 dark:text-slate-200">{purchase.notes}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('purchases.totals')} />
            <CardBody>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('purchases.subtotal')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(purchase.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('purchases.discount')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(purchase.discount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('purchases.tax')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(purchase.tax)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{t('purchases.total')}</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatCurrency(purchase.total)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        onConfirm={handleReceive}
        variant="warning"
        title={t('purchases.receiveItems')}
        message={t('purchases.receiveConfirm')}
        confirmLabel={t('purchases.receiveItems')}
        loading={receivePurchase.isPending}
      />
      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title={t('purchases.cancelTitle')}
        message={t('purchases.cancelConfirm')}
        confirmLabel={t('common.cancel')}
        loading={cancelPurchase.isPending}
      />
    </div>
  )
}
