import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { History, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useMovements } from '@/hooks/useInventory'
import { useProducts } from '@/hooks/useProducts'
import { useWarehouses } from '@/hooks/useAdmin'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import ProductImage from '@/components/ui/ProductImage'
import { formatDateTime } from '@/lib/utils'
import { MOVEMENT_TYPE } from '@/constants'

const TYPE_COLORS = {
  [MOVEMENT_TYPE.PURCHASE]: 'success',
  [MOVEMENT_TYPE.SALE]: 'info',
  [MOVEMENT_TYPE.RETURN]: 'violet',
  [MOVEMENT_TYPE.ADJUSTMENT]: 'warning',
  [MOVEMENT_TYPE.TRANSFER]: 'neutral',
  [MOVEMENT_TYPE.DAMAGE]: 'danger',
}

export default function MovementsPage() {
  const { t } = useTranslation()
  usePageTitle('inventory.movementsTitle')

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const movementsQuery = useMovements({ page: 1, perPage: 1000 })
  const productsQuery = useProducts({ page: 1, perPage: 1000 })
  const warehousesQuery = useWarehouses()

  const movements = movementsQuery.data?.items || []
  const products = productsQuery.data?.items || []
  const warehouses = warehousesQuery.data?.items || []

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])
  const warehouseMap = useMemo(() => new Map(warehouses.map((warehouse) => [warehouse.id, warehouse])), [warehouses])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return movements.filter((movement) => {
      if (type && movement.type !== type) return false
      if (!term) return true
      const product = productMap.get(movement.productId)
      return (
        (product?.name.toLowerCase().includes(term) ?? false) ||
        (product?.sku.toLowerCase().includes(term) ?? false) ||
        movement.reference.toLowerCase().includes(term) ||
        (movement.note || '').toLowerCase().includes(term)
      )
    })
  }, [movements, search, type, productMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
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
      key: 'type',
      header: t('inventory.type'),
      cell: (movement) => (
        <Badge color={TYPE_COLORS[movement.type]}>{t(`inventory.${movement.type}`)}</Badge>
      ),
    },
    {
      key: 'quantity',
      header: t('common.quantity'),
      align: 'right',
      cell: (movement) =>
        movement.quantity >= 0 ? (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowDownToLine size={13} aria-hidden="true" />
            +{movement.quantity}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
            <ArrowUpFromLine size={13} aria-hidden="true" />
            {movement.quantity}
          </span>
        ),
    },
    {
      key: 'stock',
      header: t('inventory.before'),
      align: 'right',
      cell: (movement) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {movement.before} <span className="text-slate-300 dark:text-slate-600">→</span>{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{movement.after}</span>
        </span>
      ),
    },
    {
      key: 'reference',
      header: t('inventory.reference'),
      cell: (movement) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{movement.reference}</span>,
    },
    {
      key: 'warehouse',
      header: t('common.warehouse'),
      cell: (movement) => warehouseMap.get(movement.warehouseId)?.name || '—',
    },
    {
      key: 'note',
      header: t('common.note'),
      cell: (movement) => movement.note || <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('inventory.movementsTitle')}
        subtitle={t('inventory.movementsSubtitle')}
        breadcrumb={[{ label: t('nav.inventory') }, { label: t('nav.movements') }]}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            className="max-w-64"
          />
          <Select value={type} onChange={(event) => setType(event.target.value)} className="max-w-44">
            <option value="">{t('inventory.allTypes')}</option>
            {Object.values(MOVEMENT_TYPE).map((value) => (
              <option key={value} value={value}>
                {t(`inventory.${value}`)}
              </option>
            ))}
          </Select>
          <span className="ml-auto text-sm text-slate-400">
            {filtered.length} {t('common.items')}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={paged}
          loading={movementsQuery.isLoading}
          error={movementsQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => movementsQuery.refetch()}
          rowKey="id"
          emptyTitle={t('inventory.noMovements')}
          emptyDescription={t('inventory.noMovementsHint')}
          emptyIcon={History}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filtered.length}
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
