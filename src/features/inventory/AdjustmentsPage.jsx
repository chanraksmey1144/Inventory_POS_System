import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Minus, SlidersHorizontal, History } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useAdjustStock, useMovements } from '@/hooks/useInventory'
import { useProducts } from '@/hooks/useProducts'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import SegmentControl from '@/components/ui/SegmentControl'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import ProductImage from '@/components/ui/ProductImage'
import { formatDateTime, formatNumber } from '@/lib/utils'
import { can } from '@/lib/permissions'
import { MOVEMENT_TYPE } from '@/constants'

export default function AdjustmentsPage() {
  const { t } = useTranslation()
  usePageTitle('inventory.adjustmentsTitle')
  const toast = useToastStore()

  const [productId, setProductId] = useState('')
  const [mode, setMode] = useState('add')
  const [quantity, setQuantity] = useState('1')
  const [reason, setReason] = useState('')

  const adjustStock = useAdjustStock()
  const productsQuery = useProducts({ page: 1, perPage: 1000 })
  const movementsQuery = useMovements({ type: MOVEMENT_TYPE.ADJUSTMENT, page: 1, perPage: 50 })

  const products = productsQuery.data?.items || []
  const movements = movementsQuery.data?.items || []

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])
  const selectedProduct = productMap.get(productId)

  const qty = Number(quantity) || 0
  const newStock = selectedProduct
    ? mode === 'add'
      ? selectedProduct.stock + qty
      : selectedProduct.stock - qty
    : 0

  const canSubmit = selectedProduct && qty > 0 && newStock >= 0

  const resetForm = () => {
    setProductId('')
    setMode('add')
    setQuantity('1')
    setReason('')
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await adjustStock.mutateAsync({
        productId: selectedProduct.id,
        type: mode,
        quantity: qty,
        reason: reason.trim() || t('inventory.adjustmentReasonDefault'),
      })
      toast.success(t('inventory.adjustmentCompleted'))
      resetForm()
    } finally {
      /* errors surfaced by toast */
    }
  }

  const columns = [
    {
      key: 'date',
      header: t('common.date'),
      cell: (movement) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDateTime(movement.date)}</span>
      ),
    },
    {
      key: 'product',
      header: t('products.productName'),
      cell: (movement) => {
        const product = productMap.get(movement.productId)
        return product ? (
          <div className="flex items-center gap-3">
            <ProductImage product={product} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
              <p className="text-xs text-slate-400">{product.sku}</p>
            </div>
          </div>
        ) : (
          <span className="text-slate-400">{movement.productId}</span>
        )
      },
    },
    {
      key: 'quantity',
      header: t('common.quantity'),
      align: 'right',
      cell: (movement) =>
        movement.quantity >= 0 ? (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <Plus size={13} aria-hidden="true" />
            {movement.quantity}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
            <Minus size={13} aria-hidden="true" />
            {movement.quantity}
          </span>
        ),
    },
    {
      key: 'before',
      header: t('inventory.before'),
      align: 'right',
      cell: (movement) => <span className="text-slate-500 dark:text-slate-400">{movement.before}</span>,
    },
    {
      key: 'after',
      header: t('inventory.after'),
      align: 'right',
      cell: (movement) => <span className="font-medium text-slate-700 dark:text-slate-200">{movement.after}</span>,
    },
    {
      key: 'reference',
      header: t('inventory.reference'),
      cell: (movement) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{movement.reference}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('inventory.adjustmentsTitle')}
        subtitle={t('inventory.adjustmentsSubtitle')}
        breadcrumb={[{ label: t('nav.inventory') }, { label: t('nav.adjustments') }]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title={t('inventory.adjustment')} subtitle={t('inventory.adjustmentHint')} />
          <CardBody>
            <div className="space-y-4">
              <Select label={t('products.productName')} value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="">{t('common.select')}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {product.sku} ({formatNumber(product.stock)})
                  </option>
                ))}
              </Select>

              <SegmentControl
                options={[
                  { value: 'add', label: t('inventory.add'), icon: Plus },
                  { value: 'remove', label: t('inventory.remove'), icon: Minus },
                ]}
                value={mode}
                onChange={setMode}
              />

              <Input
                label={t('inventory.adjustmentQty')}
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />

              <Textarea
                label={t('common.reason')}
                placeholder={t('inventory.reasonPlaceholder')}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
              />

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('inventory.currentStock')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatNumber(selectedProduct?.stock ?? 0)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{t('inventory.newStock')}</span>
                  <span
                    className={`font-semibold ${newStock < 0 ? 'text-rose-500' : newStock === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                  >
                    {formatNumber(newStock)}
                  </span>
                </div>
              </div>

              {can('inventory.adjust') ? (
                <Button className="w-full" onClick={handleSubmit} loading={adjustStock.isPending} disabled={!canSubmit}>
                  {t('inventory.confirmAdjustment')}
                </Button>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={t('inventory.recentAdjustments')} actions={<Badge color="warning">{movements.length}</Badge>} />
          <DataTable
            columns={columns}
            data={movements}
            loading={movementsQuery.isLoading}
            error={movementsQuery.isError ? t('errors.loadFailed') : null}
            onRetry={() => movementsQuery.refetch()}
            rowKey="id"
            emptyTitle={t('inventory.noAdjustments')}
            emptyIcon={History}
          />
        </Card>
      </div>
    </div>
  )
}
