import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, MoreHorizontal, Boxes } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useProducts } from '@/hooks/useProducts'
import { productService } from '@/services/productService'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import DataTable from '@/components/ui/DataTable'
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown'
import ProductImage from '@/components/ui/ProductImage'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { can } from '@/lib/permissions'

export default function VariantsPage() {
  const { t } = useTranslation()
  usePageTitle('variants.title')

  const toast = useToastStore()
  const productsQuery = useProducts({ perPage: 100 })
  const products = productsQuery.data?.items || []

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ price: '', stock: '' })
  const [submitting, setSubmitting] = useState(false)

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.flatMap((product) =>
      (product.variants || []).map((variant) => {
        const matches =
          !term ||
          product.name.toLowerCase().includes(term) ||
          variant.name.toLowerCase().includes(term) ||
          variant.sku.toLowerCase().includes(term)
        return matches ? { key: `${product.id}-${variant.id}`, product, variant } : null
      }),
    ).filter(Boolean)
  }, [products, search])

  const handleOpenEdit = ({ product, variant }) => {
    setEditing({ product, variant })
    setForm({ price: variant.price, stock: variant.stock })
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      const { product, variant } = editing
      const variants = product.variants.map((item) =>
        item.id === variant.id
          ? { ...item, price: Number(form.price), stock: Number(form.stock) }
          : item,
      )
      await productService.update(product.id, { variants })
      toast.success(t('variants.updated'))
      productsQuery.refetch()
      setEditing(null)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'product',
      header: t('products.productName'),
      cell: ({ product }) => (
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
      key: 'name',
      header: t('variants.variantName'),
      cell: ({ variant }) => <span className="font-medium text-slate-800 dark:text-slate-100">{variant.name}</span>,
    },
    {
      key: 'sku',
      header: t('products.sku'),
      cell: ({ variant }) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{variant.sku}</span>,
    },
    {
      key: 'barcode',
      header: t('products.barcode'),
      cell: ({ variant }) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{variant.barcode}</span>,
    },
    {
      key: 'price',
      header: t('products.price'),
      align: 'right',
      sortable: true,
      cell: ({ variant }) => <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(variant.price)}</span>,
    },
    {
      key: 'stock',
      header: t('products.stock'),
      align: 'right',
      sortable: true,
      cell: ({ variant }) => (
        <span
          className={cn(
            'font-semibold',
            variant.stock === 0
              ? 'text-rose-500'
              : variant.stock <= 10
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400',
          )}
        >
          {variant.stock}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (row) => (
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
          {can('products.update') ? (
            <DropdownItem icon={Pencil} onClick={() => handleOpenEdit(row)}>
              {t('common.edit')}
            </DropdownItem>
          ) : null}
        </Dropdown>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('variants.title')}
        subtitle={t('variants.subtitle')}
        breadcrumb={[{ label: t('nav.variants') }]}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-64"
          />
          <span className="ml-auto text-sm text-slate-400">
            {rows.length} {t('variants.count')}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          loading={productsQuery.isLoading}
          error={productsQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => productsQuery.refetch()}
          rowKey="key"
          emptyTitle={t('variants.noVariants')}
          emptyIcon={Boxes}
        />
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={t('variants.editVariant')}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} loading={submitting}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-800/60">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {editing.product.name}
                <span className="text-slate-400"> — {editing.variant.name}</span>
              </p>
              <p className="text-xs text-slate-400">{editing.variant.sku}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('products.price')}
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
              <Input
                label={t('products.stock')}
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) => setForm({ ...form, stock: event.target.value })}
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
