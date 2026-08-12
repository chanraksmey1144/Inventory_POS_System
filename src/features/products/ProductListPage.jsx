import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Eye, Pencil, Archive, RotateCcw, Trash2, Download, PackageOpen } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useProducts, useCategories, useBrands, useDeleteProduct } from '@/hooks/useProducts'
import { productService } from '@/services/productService'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Dropdown, { DropdownItem, DropdownDivider } from '@/components/ui/Dropdown'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ProductImage from '@/components/ui/ProductImage'
import { formatCurrency, formatDate, exportCsv } from '@/lib/utils'
import { can } from '@/lib/permissions'

export default function ProductListPage() {
  const { t } = useTranslation()
  usePageTitle('nav.products')
  const navigate = useNavigate()
  const toast = useToastStore()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkDelete, setBulkDelete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const categoriesQuery = useCategories()
  const brandsQuery = useBrands()
  const productsQuery = useProducts({
    search: debouncedSearch,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    status: status || undefined,
    page,
    perPage: pageSize,
    sortBy,
    sortDir,
  })
  const deleteProduct = useDeleteProduct()

  const categories = categoriesQuery.data?.items || []
  const brands = brandsQuery.data?.items || []
  const products = productsQuery.data?.items || []
  const total = productsQuery.data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteProduct.mutateAsync(deleteTarget.id)
      toast.success(t('products.deleted'))
      setDeleteTarget(null)
    }
  }

  const handleBulkDelete = async () => {
    await Promise.all(selected.map((id) => deleteProduct.mutateAsync(id)))
    toast.success(t('products.deleted'))
    setBulkDelete(false)
    setSelected([])
  }

  const handleBulkArchive = async () => {
    await Promise.all(selected.filter((id) => products.find((product) => product.id === id)?.status !== 'archived').map((id) => productService.archive(id)))
    toast.success(t('products.archived'))
    productsQuery.refetch()
    setSelected([])
  }

  const handleExport = () => {
    const rows = products.map((product) => ({
      Name: product.name,
      SKU: product.sku,
      Barcode: product.barcode,
      Category: categoryMap.get(product.categoryId)?.name || '',
      Price: product.price,
      Cost: product.cost,
      Stock: product.stock,
      Status: product.status,
    }))
    exportCsv(`products-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

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
      key: 'price',
      header: t('products.price'),
      align: 'right',
      sortable: true,
      cell: (product) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {formatCurrency(product.price)}
        </span>
      ),
    },
    {
      key: 'cost',
      header: t('products.costPrice'),
      align: 'right',
      sortable: true,
      cell: (product) => <span className="text-slate-500 dark:text-slate-400">{formatCurrency(product.cost)}</span>,
    },
    {
      key: 'stock',
      header: t('products.stock'),
      align: 'right',
      sortable: true,
      cell: (product) => {
        const outOfStock = product.stock === 0
        const lowStock = !outOfStock && product.stock <= product.minStock
        return (
          <span
            className={`font-semibold ${outOfStock ? 'text-rose-500' : lowStock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
          >
            {product.stock}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: t('products.status'),
      cell: (product) => <StatusBadge status={product.status} />,
    },
    {
      key: 'updatedAt',
      header: t('common.updated'),
      cell: (product) => (
        <span className="text-slate-500 dark:text-slate-400">{formatDate(product.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (product) => (
        <Dropdown
          trigger={
            <button
              type="button"
              aria-label={t('common.actions')}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <MoreHorizontal size={16} aria-hidden="true" />
            </button>
          }
        >
          <DropdownItem icon={Eye} onClick={() => navigate(`/products/${product.id}`)}>
            {t('common.view')}
          </DropdownItem>
          {can('products.update') ? (
            <DropdownItem icon={Pencil} onClick={() => navigate(`/products/${product.id}/edit`)}>
              {t('common.edit')}
            </DropdownItem>
          ) : null}
          {can('products.update') ? (
            product.status === 'archived' ? (
              <DropdownItem icon={RotateCcw} onClick={() => handleToggleArchive(product)}>
                {t('products.restore')}
              </DropdownItem>
            ) : (
              <DropdownItem icon={Archive} onClick={() => handleToggleArchive(product)}>
                {t('products.archive')}
              </DropdownItem>
            )
          ) : null}
          {can('products.delete') ? (
            <>
              <DropdownDivider />
              <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(product)}>
                {t('common.delete')}
              </DropdownItem>
            </>
          ) : null}
        </Dropdown>
      ),
    },
  ]

  const handleToggleArchive = async (product) => {
    if (product.status === 'archived') {
      await productService.restore(product.id)
      toast.success(t('products.unarchived'))
    } else {
      await productService.archive(product.id)
      toast.success(t('products.archived'))
    }
    productsQuery.refetch()
  }

  return (
    <div>
      <PageHeader
        title={t('nav.products')}
        subtitle={t('products.manage')}
        breadcrumb={[{ label: t('nav.products') }]}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={handleExport}>
              {t('common.export')}
            </Button>
            {can('products.create') ? (
              <Button icon={Plus} onClick={() => navigate('/products/create')}>
                {t('products.create')}
              </Button>
            ) : null}
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="max-w-64"
          />
          <Select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value)
              setPage(1)
            }}
            className="max-w-48"
          >
            <option value="">{t('products.allCategories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select
            value={brandId}
            onChange={(event) => {
              setBrandId(event.target.value)
              setPage(1)
            }}
            className="max-w-48"
          >
            <option value="">{t('products.allBrands')}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            className="max-w-40"
          >
            <option value="">{t('products.allStatus')}</option>
            <option value="active">{t('products.active')}</option>
            <option value="archived">{t('products.archived')}</option>
            <option value="draft">{t('products.draft')}</option>
          </Select>
        </div>

        {selected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-emerald-50/60 px-4 py-3 dark:border-slate-800 dark:bg-emerald-500/5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {selected.length} {t('products.selected')}
            </span>
            <div className="flex gap-2">
              {can('products.update') ? (
                <Button size="sm" variant="outline" icon={Archive} onClick={handleBulkArchive}>
                  {t('products.archive')}
                </Button>
              ) : null}
              {can('products.delete') ? (
                <Button size="sm" variant="danger-outline" icon={Trash2} onClick={() => setBulkDelete(true)}>
                  {t('common.delete')}
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                {t('common.clear')}
              </Button>
            </div>
          </div>
        ) : null}

        <DataTable
          columns={columns}
          data={products}
          loading={productsQuery.isLoading}
          error={productsQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => productsQuery.refetch()}
          rowKey="id"
          onRowClick={(product) => navigate(`/products/${product.id}`)}
          selection={can('products.delete') || can('products.update') ? { selected, onSelect: setSelected } : undefined}
          emptyTitle={t('products.noProducts')}
          emptyDescription={t('products.noProductsHint')}
          emptyIcon={PackageOpen}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSortBy(key)
            setSortDir(dir)
          }}
        />
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('products.deleteTitle')}
        message={t('products.deleteConfirm', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        loading={deleteProduct.isPending}
      />
      <ConfirmDialog
        open={bulkDelete}
        onClose={() => setBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title={t('products.deleteTitle')}
        message={t('products.bulkDeleteConfirm', { count: selected.length })}
        confirmLabel={t('common.delete')}
        loading={deleteProduct.isPending}
      />
    </div>
  )
}
