import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Archive,
  RotateCcw,
  Trash2,
  Printer,
  Barcode,
  Tag,
  Boxes,
  CreditCard,
  Percent,
} from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useProduct, useCategories, useBrands, useUnits } from '@/hooks/useProducts'
import { useSales } from '@/hooks/useSales'
import { usePurchases } from '@/hooks/usePurchases'
import { useMovements } from '@/hooks/useInventory'
import { productService } from '@/services/productService'
import useToastStore from '@/app/store/useToastStore'
import Card, { CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import StatusBadge from '@/components/ui/StatusBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Spinner from '@/components/ui/Spinner'
import ProductImage from '@/components/ui/ProductImage'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { MOVEMENT_TYPE } from '@/constants'
import { can } from '@/lib/permissions'

function StatCard({ label, value, icon: Icon, accent = 'emerald' }) {
  const accents = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accents[accent]}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </CardBody>
    </Card>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-50 py-2.5 text-sm last:border-0 dark:border-slate-800/60">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-800 dark:text-slate-100">{value || '—'}</span>
    </div>
  )
}

const MOVEMENT_LABELS = {
  [MOVEMENT_TYPE.PURCHASE]: { key: 'inventory.purchase', tone: 'text-emerald-600 dark:text-emerald-400' },
  [MOVEMENT_TYPE.SALE]: { key: 'inventory.sale', tone: 'text-sky-600 dark:text-sky-400' },
  [MOVEMENT_TYPE.RETURN]: { key: 'inventory.return', tone: 'text-violet-600 dark:text-violet-400' },
  [MOVEMENT_TYPE.ADJUSTMENT]: { key: 'inventory.adjustment', tone: 'text-amber-600 dark:text-amber-400' },
  [MOVEMENT_TYPE.TRANSFER]: { key: 'inventory.transfer', tone: 'text-indigo-600 dark:text-indigo-400' },
  [MOVEMENT_TYPE.DAMAGE]: { key: 'inventory.damage', tone: 'text-rose-600 dark:text-rose-400' },
}

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  usePageTitle('products.details')

  const toast = useToastStore()
  const productQuery = useProduct(id)
  const salesQuery = useSales({ perPage: 100 })
  const purchasesQuery = usePurchases({ perPage: 100 })
  const movementsQuery = useMovements({ perPage: 100 })
  const categoriesQuery = useCategories()
  const brandsQuery = useBrands()
  const unitsQuery = useUnits()

  const [tab, setTab] = useState('overview')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const product = productQuery.data

  const category = (categoriesQuery.data?.items || []).find((item) => item.id === product?.categoryId)
  const brand = (brandsQuery.data?.items || []).find((item) => item.id === product?.brandId)
  const unit = (unitsQuery.data?.items || []).find((item) => item.id === product?.unitId)

  const salesHistory = useMemo(() => {
    if (!product) return []
    return (salesQuery.data?.items || [])
      .filter((sale) => sale.items.some((item) => item.productId === product.id))
      .slice(0, 25)
  }, [salesQuery.data, product])

  const purchaseHistory = useMemo(() => {
    if (!product) return []
    return (purchasesQuery.data?.items || [])
      .filter((purchase) => purchase.items.some((item) => item.productId === product.id))
      .slice(0, 25)
  }, [purchasesQuery.data, product])

  const inventoryHistory = useMemo(() => {
    if (!product) return []
    return (movementsQuery.data?.items || []).filter((movement) => movement.productId === product.id)
  }, [movementsQuery.data, product])

  const saleItemHistory = (sale) => sale.items.find((item) => item.productId === product.id)
  const purchaseItemHistory = (purchase) => purchase.items.find((item) => item.productId === product.id)

  const handleArchive = async () => {
    if (product.status === 'archived') {
      await productService.restore(product.id)
      toast.success(t('products.unarchived'))
    } else {
      await productService.archive(product.id)
      toast.success(t('products.archived'))
    }
    productQuery.refetch()
  }

  const handleDelete = async () => {
    await productService.remove(product.id)
    toast.success(t('products.deleted'))
    navigate('/products', { replace: true })
  }

  const handlePrintBarcode = () => {
    toast.info(t('barcodes.printed'))
  }

  if (productQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">{t('errors.notFoundHint')}</div>
    )
  }

  const margin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0
  const stockStatus = product.stock === 0 ? 'out_of_stock' : product.stock <= product.minStock ? 'low_stock' : 'in_stock'

  const tabs = [
    { key: 'overview', label: t('products.overview') },
    { key: 'pricing', label: t('products.pricingTab') },
    { key: 'stock', label: t('products.stockTab') },
    { key: 'variants', label: t('products.variantsTab'), count: product.variants?.length || 0 },
    { key: 'barcode', label: t('products.barcodeTab') },
    { key: 'sales', label: t('products.salesHistory'), count: salesHistory.length },
    { key: 'purchases', label: t('products.purchaseHistory'), count: purchaseHistory.length },
    { key: 'inventory', label: t('products.inventoryHistory'), count: inventoryHistory.length },
  ]

  return (
    <div>
      <Button variant="ghost" size="sm" icon={ArrowLeft} className="mb-3" onClick={() => navigate('/products')}>
        {t('nav.products')}
      </Button>

      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <ProductImage product={product} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{product.name}</h1>
                <StatusBadge status={product.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {product.sku} · {product.barcode || '—'}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {category?.name || ''} {brand ? `· ${brand.name}` : ''} {unit ? `· ${unit.name}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {can('products.update') ? (
              <Button variant="outline" icon={Pencil} onClick={() => navigate(`/products/${product.id}/edit`)}>
                {t('common.edit')}
              </Button>
            ) : null}
            {can('products.update') ? (
              <Button
                variant="outline"
                icon={product.status === 'archived' ? RotateCcw : Archive}
                onClick={handleArchive}
              >
                {product.status === 'archived' ? t('products.restore') : t('products.archive')}
              </Button>
            ) : null}
            {can('products.delete') ? (
              <Button variant="danger-outline" icon={Trash2} onClick={() => setConfirmDelete(true)}>
                {t('common.delete')}
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('products.sellingPrice')} value={formatCurrency(product.price)} icon={CreditCard} />
        <StatCard label={t('products.costPrice')} value={formatCurrency(product.cost)} icon={Tag} accent="slate" />
        <StatCard
          label={t('products.stock')}
          value={product.stock}
          icon={Boxes}
          accent={stockStatus === 'in_stock' ? 'emerald' : stockStatus === 'low_stock' ? 'amber' : 'rose'}
        />
        <StatCard label={t('products.taxRate')} value={`${product.tax}%`} icon={Percent} accent="slate" />
      </div>

      <div className="mt-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div className="mt-4">
        {tab === 'overview' ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title={t('products.details')} />
              <CardBody>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {product.description || t('common.none')}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title={t('products.classification')} />
              <CardBody>
                <InfoRow label={t('products.category')} value={category?.name} />
                <InfoRow label={t('products.brand')} value={brand?.name} />
                <InfoRow label={t('products.unit')} value={unit?.name} />
                <InfoRow label={t('products.trackInventory')} value={product.trackInventory ? t('common.yes') : t('common.no')} />
                <InfoRow label={t('common.createdAt')} value={formatDate(product.createdAt)} />
                <InfoRow label={t('common.updatedAt')} value={formatDate(product.updatedAt)} />
              </CardBody>
            </Card>
          </div>
        ) : null}

        {tab === 'pricing' ? (
          <Card>
            <CardHeader title={t('products.pricing')} />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('products.costPrice')}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(product.cost)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('products.sellingPrice')}</p>
                  <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(product.price)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('products.wholesalePrice')}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {product.wholesalePrice ? formatCurrency(product.wholesalePrice) : '—'}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-500/10">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">{t('products.margin')}</p>
                  <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">{margin.toFixed(1)}%</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === 'stock' ? (
          <Card>
            <CardHeader title={t('products.stockTab')} />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('products.stock')}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{product.stock}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('products.minStock')}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{product.minStock}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('products.maxStock')}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{product.maxStock}</p>
                </div>
              </div>
              <div className="mt-4">
                <StatusBadge status={stockStatus} />
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === 'variants' ? (
          <Card>
            <CardHeader title={t('products.variantsTab')} />
            <CardBody>
              {product.variants?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <th className="px-3 py-2">{t('variants.variantName')}</th>
                        <th className="px-3 py-2">{t('products.sku')}</th>
                        <th className="px-3 py-2">{t('products.barcode')}</th>
                        <th className="px-3 py-2 text-right">{t('products.price')}</th>
                        <th className="px-3 py-2 text-right">{t('products.stock')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => (
                        <tr key={variant.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                          <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">{variant.name}</td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{variant.sku}</td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{variant.barcode}</td>
                          <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(variant.price)}</td>
                          <td className="px-3 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">{variant.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">{t('variants.noVariants')}</p>
              )}
            </CardBody>
          </Card>
        ) : null}

        {tab === 'barcode' ? (
          <Card>
            <CardHeader
              title={t('products.barcodeTab')}
              actions={
                <Button size="sm" variant="outline" icon={Printer} onClick={handlePrintBarcode}>
                  {t('barcodes.print')}
                </Button>
              }
            />
            <CardBody className="flex flex-col items-center py-10">
              <Barcode size={160} className="text-slate-800 dark:text-slate-100" aria-hidden="true" />
              <p className="mt-3 font-mono text-lg font-semibold tracking-widest text-slate-800 dark:text-slate-100">
                {product.barcode || t('barcodes.noBarcode')}
              </p>
              <p className="mt-1 text-xs text-slate-400">{product.name}</p>
              <p className="text-xs text-slate-400">{product.sku}</p>
            </CardBody>
          </Card>
        ) : null}

        {tab === 'sales' ? (
          <Card>
            <CardHeader title={t('products.salesHistory')} />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                      <th className="px-4 py-3">{t('pos.receiptNumber')}</th>
                      <th className="px-4 py-3">{t('pos.receiptDate')}</th>
                      <th className="px-4 py-3 text-right">{t('common.quantity')}</th>
                      <th className="px-4 py-3 text-right">{t('common.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                          {t('products.noHistory')}
                        </td>
                      </tr>
                    ) : (
                      salesHistory.map((sale) => {
                        const item = saleItemHistory(sale)
                        return (
                          <tr key={sale.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{sale.invoiceNumber}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(sale.saleDate)}</td>
                            <td className="px-4 py-3 text-right">{item?.quantity}</td>
                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item?.price * item?.quantity)}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === 'purchases' ? (
          <Card>
            <CardHeader title={t('products.purchaseHistory')} />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                      <th className="px-4 py-3">{t('common.reference')}</th>
                      <th className="px-4 py-3">{t('common.date')}</th>
                      <th className="px-4 py-3 text-right">{t('common.quantity')}</th>
                      <th className="px-4 py-3 text-right">{t('common.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                          {t('products.noHistory')}
                        </td>
                      </tr>
                    ) : (
                      purchaseHistory.map((purchase) => {
                        const item = purchaseItemHistory(purchase)
                        return (
                          <tr key={purchase.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{purchase.purchaseNumber}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(purchase.orderDate)}</td>
                            <td className="px-4 py-3 text-right">{item?.quantity}</td>
                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item?.cost * item?.quantity)}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {tab === 'inventory' ? (
          <Card>
            <CardHeader title={t('products.inventoryHistory')} />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                      <th className="px-4 py-3">{t('common.date')}</th>
                      <th className="px-4 py-3">{t('common.type')}</th>
                      <th className="px-4 py-3 text-right">{t('common.quantity')}</th>
                      <th className="px-4 py-3 text-right">{t('common.before')}</th>
                      <th className="px-4 py-3 text-right">{t('common.after')}</th>
                      <th className="px-4 py-3">{t('common.reference')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                          {t('products.noHistory')}
                        </td>
                      </tr>
                    ) : (
                      inventoryHistory.map((movement) => {
                        const config = MOVEMENT_LABELS[movement.type] || { key: movement.type, tone: '' }
                        return (
                          <tr key={movement.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(movement.date)}</td>
                            <td className={`px-4 py-3 font-medium ${config.tone}`}>{t(config.key)}</td>
                            <td className={`px-4 py-3 text-right font-semibold ${movement.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                              {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{movement.before}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-100">{movement.after}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{movement.reference}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title={t('products.deleteTitle')}
        message={t('products.deleteConfirm', { name: product.name })}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
