import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, PackageX, Package, Layers } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useLowStock } from '@/hooks/useInventory'
import { useCategories } from '@/hooks/useProducts'
import StatCard from '@/features/dashboard/StatCard'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import ProductImage from '@/components/ui/ProductImage'
import Button from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { can } from '@/lib/permissions'

function stockStatus(product) {
  if (product.stock === 0) return 'out_of_stock'
  return 'low_stock'
}

export default function LowStockPage() {
  const { t } = useTranslation()
  usePageTitle('inventory.lowStockTitle')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const lowStockQuery = useLowStock({ page: 1, perPage: 1000 })
  const categoriesQuery = useCategories()

  const categories = categoriesQuery.data?.items || []
  const products = lowStockQuery.data?.items || []

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      if (categoryId && product.categoryId !== categoryId) return false
      if (!term) return true
      return (
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.barcode || '').includes(term)
      )
    })
  }, [products, search, categoryId])

  const lowCount = filtered.filter((product) => stockStatus(product) === 'low_stock').length
  const outCount = filtered.filter((product) => stockStatus(product) === 'out_of_stock').length

  const columns = [
    {
      key: 'product',
      header: t('products.productName'),
      cell: (product) => (
        <div className="flex items-center gap-3">
          <ProductImage product={product} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
            <p className="text-xs text-slate-400">{product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('products.category'),
      cell: (product) => categoryMap.get(product.categoryId)?.name || '—',
    },
    {
      key: 'stock',
      header: t('products.stock'),
      align: 'right',
      sortable: true,
      cell: (product) => (
        <span
          className={`font-bold ${
            product.stock === 0 ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {formatNumber(product.stock)}
        </span>
      ),
    },
    {
      key: 'minStock',
      header: t('inventory.minimumStock'),
      align: 'right',
      cell: (product) => <span className="text-slate-500 dark:text-slate-400">{formatNumber(product.minStock)}</span>,
    },
    {
      key: 'reorder',
      header: t('inventory.reorderQty'),
      align: 'right',
      cell: (product) => (
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {formatNumber(Math.max(0, product.minStock - product.stock))}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (product) => <StatusBadge status={stockStatus(product)} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('inventory.lowStockTitle')}
        subtitle={t('inventory.lowStockSubtitle')}
        breadcrumb={[{ label: t('nav.inventory') }, { label: t('nav.lowStock') }]}
        actions={
          can('products.create') ? (
            <Button icon={Plus} onClick={() => navigate('/purchases/create')}>
              {t('purchases.create')}
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label={t('inventory.lowStock')}
          value={formatNumber(lowCount)}
          icon={AlertTriangle}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <StatCard
          label={t('inventory.outOfStock')}
          value={formatNumber(outCount)}
          icon={PackageX}
          iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        />
        <StatCard
          label={t('inventory.totalProducts')}
          value={formatNumber(filtered.length)}
          icon={Package}
          iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
        />
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-64"
          />
          <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="max-w-48">
            <option value="">{t('products.allCategories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <span className="ml-auto text-sm text-slate-400">
            {filtered.length} {t('common.items')}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={lowStockQuery.isLoading}
          error={lowStockQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => lowStockQuery.refetch()}
          rowKey="id"
          onRowClick={(product) => navigate(`/products/${product.id}`)}
          emptyTitle={t('inventory.noLowStock')}
          emptyDescription={t('inventory.noLowStockHint')}
          emptyIcon={Layers}
        />
      </Card>
    </div>
  )
}
