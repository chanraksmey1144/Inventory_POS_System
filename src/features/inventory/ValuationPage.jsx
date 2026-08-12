import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet, ShoppingCart, TrendingUp, Layers } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useInventory } from '@/hooks/useInventory'
import { useCategories } from '@/hooks/useProducts'
import StatCard from '@/features/dashboard/StatCard'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import DataTable from '@/components/ui/DataTable'
import ProductImage from '@/components/ui/ProductImage'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function ValuationPage() {
  const { t } = useTranslation()
  usePageTitle('inventory.valuationTitle')

  const [search, setSearch] = useState('')

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
    if (!term) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.barcode || '').includes(term),
    )
  }, [products, search])

  const totals = useMemo(() => {
    const costValue = filtered.reduce((sum, product) => sum + product.stock * product.cost, 0)
    const retailValue = filtered.reduce((sum, product) => sum + product.stock * product.price, 0)
    return { costValue, retailValue, profit: retailValue - costValue }
  }, [filtered])

  const byCategory = useMemo(() => {
    const map = new Map()
    for (const product of filtered) {
      const category = categoryMap.get(product.categoryId)
      const name = category?.name || '—'
      const entry = map.get(name) || { name, costValue: 0, retailValue: 0 }
      entry.costValue += product.stock * product.cost
      entry.retailValue += product.stock * product.price
      map.set(name, entry)
    }
    const rows = [...map.values()]
      .map((entry) => ({ ...entry, profit: entry.retailValue - entry.costValue }))
      .sort((a, b) => b.costValue - a.costValue)
    const max = Math.max(1, rows[0]?.costValue || 1)
    return { rows, max }
  }, [filtered, categoryMap])

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
      cell: (product) => <span className="font-medium text-slate-700 dark:text-slate-200">{formatNumber(product.stock)}</span>,
    },
    {
      key: 'cost',
      header: t('products.costPrice'),
      align: 'right',
      cell: (product) => <span className="text-slate-500 dark:text-slate-400">{formatCurrency(product.cost)}</span>,
    },
    {
      key: 'costValue',
      header: t('inventory.costValue'),
      align: 'right',
      sortable: true,
      cell: (product) => <span className="text-slate-700 dark:text-slate-200">{formatCurrency(product.stock * product.cost)}</span>,
    },
    {
      key: 'retailValue',
      header: t('inventory.retailValue'),
      align: 'right',
      sortable: true,
      cell: (product) => <span className="text-slate-700 dark:text-slate-200">{formatCurrency(product.stock * product.price)}</span>,
    },
    {
      key: 'profit',
      header: t('inventory.potentialProfit'),
      align: 'right',
      sortable: true,
      cell: (product) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(product.stock * (product.price - product.cost))}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('inventory.valuationTitle')}
        subtitle={t('inventory.valuationSubtitle')}
        breadcrumb={[{ label: t('nav.inventory') }, { label: t('nav.valuation') }]}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t('inventory.costValue')}
          value={formatCurrency(totals.costValue)}
          icon={Wallet}
          iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
        />
        <StatCard
          label={t('inventory.retailValue')}
          value={formatCurrency(totals.retailValue)}
          icon={ShoppingCart}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          label={t('inventory.potentialProfit')}
          value={formatCurrency(totals.profit)}
          icon={TrendingUp}
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
        />
        <StatCard
          label={t('inventory.itemsCount')}
          value={formatNumber(filtered.length)}
          icon={Layers}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title={t('inventory.byCategory')} subtitle={t('inventory.byCategorySubtitle')} />
          <CardBody className="space-y-4">
            {byCategory.rows.map((row) => (
              <div key={row.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{row.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{formatCurrency(row.costValue)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(row.costValue / byCategory.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
            <Input
              placeholder={t('common.search')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-64"
            />
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
            emptyTitle={t('products.noProducts')}
            emptyDescription={t('products.noProductsHint')}
            emptyIcon={Layers}
          />
        </Card>
      </div>
    </div>
  )
}
