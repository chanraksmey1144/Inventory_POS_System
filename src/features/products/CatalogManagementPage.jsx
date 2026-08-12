import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, MoreHorizontal, Boxes } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import {
  useCategories,
  useBrands,
  useUnits,
} from '@/hooks/useProducts'
import { categoryService, brandService, unitService } from '@/services/productService'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Select from '@/components/ui/Select'
import { can } from '@/lib/permissions'

const CONFIG = {
  categories: {
    title: 'categories.title',
    create: 'categories.create',
    edit: 'categories.edit',
    created: 'categories.created',
    updated: 'categories.updated',
    deleted: 'categories.deleted',
    deleteConfirm: 'categories.deleteConfirm',
    navKey: 'nav.categories',
    fields: [
      { key: 'name', label: 'categories.name' },
      { key: 'code', label: 'categories.code' },
    ],
    service: categoryService,
    hook: useCategories,
  },
  brands: {
    title: 'brands.title',
    create: 'brands.create',
    edit: 'brands.edit',
    created: 'brands.created',
    updated: 'brands.updated',
    deleted: 'brands.deleted',
    deleteConfirm: 'brands.deleteConfirm',
    navKey: 'nav.brands',
    fields: [
      { key: 'name', label: 'brands.name' },
      { key: 'code', label: 'brands.code' },
    ],
    service: brandService,
    hook: useBrands,
  },
  units: {
    title: 'units.title',
    create: 'units.create',
    edit: 'units.edit',
    created: 'units.created',
    updated: 'units.updated',
    deleted: 'units.deleted',
    deleteConfirm: 'units.deleteConfirm',
    navKey: 'nav.units',
    fields: [
      { key: 'name', label: 'units.name' },
      { key: 'shortName', label: 'units.shortName' },
    ],
    service: unitService,
    hook: useUnits,
  },
}

export default function CatalogManagementPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const type = location.pathname.startsWith('/brands')
    ? 'brands'
    : location.pathname.startsWith('/units')
      ? 'units'
      : 'categories'
  const config = CONFIG[type]
  usePageTitle(config.title)

  const toast = useToastStore()
  const query = config.hook()
  const items = query.data?.items || []

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setEditing(null)
    setSearch('')
  }, [type])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) =>
      config.fields.some((field) => String(item[field.key] || '').toLowerCase().includes(term)),
    )
  }, [items, search, config])

  const handleOpenCreate = () => {
    setEditing(null)
    setForm({})
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditing(item)
    setForm({ ...item })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      const payload = Object.fromEntries(config.fields.map((field) => [field.key, form[field.key]?.trim()]))
      if (editing) {
        await config.service.update(editing.id, payload)
        toast.success(t(config.updated))
      } else {
        await config.service.create(payload)
        toast.success(t(config.created))
      }
      query.refetch()
      setModalOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await config.service.remove(deleteTarget.id)
      toast.success(t(config.deleted))
      query.refetch()
      setDeleteTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const columns = [
    {
      key: 'name',
      header: t(config.fields[0].label),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Boxes size={16} aria-hidden="true" />
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{item[config.fields[0].key]}</span>
        </div>
      ),
    },
    ...config.fields
      .slice(1)
      .map((field) => ({
        key: field.key,
        header: t(field.label),
        cell: (item) => <span className="text-slate-500 dark:text-slate-400">{item[field.key] || '—'}</span>,
      })),
  ]

  if (type === 'categories') {
    columns.push({
      key: 'productsCount',
      header: t('categories.productsCount'),
      align: 'right',
      cell: (item) => <span className="font-semibold">{item.productsCount ?? '—'}</span>,
    })
  }

  columns.push({
    key: 'status',
    header: t('products.status'),
    cell: (item) => <StatusBadge status={item.status} />,
  })
  columns.push({
    key: 'actions',
    header: '',
    align: 'right',
    noWrap: true,
    cell: (item) => (
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
          <DropdownItem icon={Pencil} onClick={() => handleOpenEdit(item)}>
            {t('common.edit')}
          </DropdownItem>
        ) : null}
        {can('products.delete') ? (
          <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(item)}>
            {t('common.delete')}
          </DropdownItem>
        ) : null}
      </Dropdown>
    ),
  })

  return (
    <div>
      <PageHeader
        title={t(config.title)}
        breadcrumb={[{ label: t(config.navKey) }]}
        actions={
          can('products.create') ? (
            <Button icon={Plus} onClick={handleOpenCreate}>
              {t(config.create)}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-64"
          />
          {type === 'categories' || type === 'brands' ? (
            <Button variant="ghost" size="sm" onClick={() => navigate('/categories')}>
              {t('nav.categories')}
            </Button>
          ) : null}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={query.isLoading}
          error={query.isError ? t('errors.loadFailed') : null}
          onRetry={() => query.refetch()}
          rowKey="id"
          emptyTitle={t('common.noResults')}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t(config.edit) : t(config.create)}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} loading={submitting}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {config.fields.map((field) => (
            <Input
              key={field.key}
              label={t(field.label)}
              value={form[field.key] || ''}
              onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
            />
          ))}
          <Select
            label={t('products.status')}
            value={form.status || 'active'}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option value="active">{t('products.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t(config.deleteConfirm)}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
