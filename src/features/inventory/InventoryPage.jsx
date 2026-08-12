import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Package, PackageCheck, PackageX, AlertTriangle, Wallet, Layers } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useInventory } from '@/hooks/useInventory'
import { useCategories } from '@/hooks/useProducts'
import StatCard from '@/features/dashboard/StatCard'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import ProductImage from '@/components/ui/ProductImage'
import { formatCurrency, formatNumber } from '@/lib/utils'

function stockStatus(product) {
  if (product.stock === 0) return 'out_of_stock'
  if (product.stock <= product.minStock) return 'low_stock'
  return 'in_stock'
}

export default function InventoryPage() {
  const { t } = useTranslation()
  usePageTitle('inventory.title')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const inventoryQuery = useInventory({ page: 1, perPage: 1000 })
  const categoriesQuery = useCategories()

  const categories = categoriesQuery.data?.items || []
  const products = inventoryQuery.data?.items || []

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

  const stats = useMemo(() => {
    const inStock = filtered.filter((product) => stockStatus(product) === 'in_stock').length
    const lowStock = filtered.filter((product) => stockStatus(product) === 'low_stock').length
    const outOfStock = filtered.filter((product) => stockStatus(product) === 'out_of_stock').length
    const totalValue = filtered.reduce((sum, product) => sum + product.stock * product.cost, 0)
    return { inStock, lowStock, outOfStock, totalValue }
  }, [filtered])

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
          className={`font-semibold ${
            product.stock === 0
              ? 'text-rose-500'
              : product.stock <= product.minStock
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
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
      key: 'status',
      header: t('common.status'),
      cell: (product) => <StatusBadge status={stockStatus(product)} />,
    },
    {
      key: 'cost',
      header: t('products.costPrice'),
      align: 'right',
      cell: (product) => <span className="text-slate-500 dark:text-slate-400">{formatCurrency(product.cost)}</span>,
    },
    {
      key: 'value',
      header: t('inventory.totalValue'),
      align: 'right',
      sortable: true,
      cell: (product) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {formatCurrency(product.stock * product.cost)}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('inventory.title')}
        subtitle={t('inventory.subtitle')}
        breadcrumb={[{ label: t('nav.inventory') }, { label: t('nav.stockOverview') }]}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t('inventory.totalProducts')}
          value={formatNumber(products.length)}
          icon={Package}
          iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
        />
        <StatCard
          label={t('inventory.inStock')}
          value={formatNumber(stats.inStock)}
          icon={PackageCheck}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          label={t('inventory.lowStock')}
          value={formatNumber(stats.lowStock)}
          icon={AlertTriangle}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <StatCard
          label={t('inventory.outOfStock')}
          value={formatNumber(stats.outOfStock)}
          icon={PackageX}
          iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t('inventory.stockValue')}
          value={formatCurrency(stats.totalValue)}
          icon={Wallet}
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
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
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="max-w-48"
          >
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
          loading={inventoryQuery.isLoading}
          error={inventoryQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => inventoryQuery.refetch()}
          rowKey="id"
          onRowClick={(product) => navigate(`/products/${product.id}`)}
          emptyTitle={t('inventory.noProducts')}
          emptyDescription={t('inventory.noProductsHint')}
          emptyIcon={Layers}
        />
      </Card>
    </div>
  )
}
