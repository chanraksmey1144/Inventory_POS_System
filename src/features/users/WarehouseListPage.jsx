import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, MoreHorizontal, Pencil, Trash2, Warehouse, MapPin } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import {
  useWarehouses,
  useBranches,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
} from '@/hooks/useAdmin'
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
import Modal from '@/components/ui/Modal'
import { can } from '@/lib/permissions'

const EMPTY_FORM = { name: '', code: '', branchId: '', address: '', status: 'active' }

export default function WarehouseListPage() {
  const { t } = useTranslation()
  usePageTitle('warehouses.title')
  const toast = useToastStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const warehousesQuery = useWarehouses({ search, status: status || undefined })
  const branchesQuery = useBranches()
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse()
  const deleteWarehouse = useDeleteWarehouse()

  const warehouses = warehousesQuery.data?.items || []
  const branches = branchesQuery.data?.items || []
  const branchMap = new Map(branches.map((branch) => [branch.id, branch]))

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (warehouse) => {
    setEditing(warehouse)
    setForm({
      name: warehouse.name,
      code: warehouse.code,
      branchId: warehouse.branchId || '',
      address: warehouse.address || '',
      status: warehouse.status,
    })
    setFormOpen(true)
  }

  const handleFormChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      branchId: form.branchId || undefined,
      address: form.address?.trim() || undefined,
      status: form.status,
    }
    try {
      if (editing) {
        await updateWarehouse.mutateAsync({ id: editing.id, ...payload })
        toast.success(t('warehouses.updated'))
      } else {
        await createWarehouse.mutateAsync(payload)
        toast.success(t('warehouses.created'))
      }
      setFormOpen(false)
    } catch {
      /* handled by mock error toast */
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteWarehouse.mutateAsync(deleteTarget.id)
      toast.success(t('warehouses.deleted'))
      setDeleteTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      cell: (warehouse) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Warehouse size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{warehouse.name}</p>
            <p className="font-mono text-xs text-slate-400">{warehouse.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: t('warehouses.branch'),
      cell: (warehouse) => <span className="text-slate-700 dark:text-slate-200">{branchMap.get(warehouse.branchId)?.name || '—'}</span>,
    },
    {
      key: 'address',
      header: t('common.address'),
      cell: (warehouse) => (
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <MapPin size={14} className="shrink-0 text-slate-400" />
          {warehouse.address || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (warehouse) => <StatusBadge status={warehouse.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (warehouse) => (
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
          {can('settings.update') ? (
            <DropdownItem icon={Pencil} onClick={() => openEdit(warehouse)}>
              {t('common.edit')}
            </DropdownItem>
          ) : null}
          {can('settings.update') ? (
            <>
              <DropdownDivider />
              <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(warehouse)}>
                {t('common.delete')}
              </DropdownItem>
            </>
          ) : null}
        </Dropdown>
      ),
    },
  ]

  const isSaving = createWarehouse.isPending || updateWarehouse.isPending

  return (
    <div>
      <PageHeader
        title={t('warehouses.title')}
        subtitle={t('warehouses.subtitle')}
        breadcrumb={[{ label: t('nav.warehouses') }]}
        actions={
          can('settings.update') ? (
            <Button icon={Plus} onClick={openCreate}>
              {t('warehouses.create')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-64" />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-40">
            <option value="">{t('warehouses.allStatus')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={warehouses}
          loading={warehousesQuery.isLoading}
          error={warehousesQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => warehousesQuery.refetch()}
          rowKey="id"
          emptyTitle={t('warehouses.noWarehouses')}
          emptyDescription={t('warehouses.noWarehousesHint')}
          emptyIcon={Warehouse}
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t('warehouses.edit') : t('warehouses.create')}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} loading={isSaving} disabled={!form.name.trim() || !form.code.trim()}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label={`${t('common.name')} *`} name="name" value={form.name} onChange={handleFormChange} />
          <Input label={`${t('warehouses.code')} *`} name="code" value={form.code} onChange={handleFormChange} />
          <Select label={t('warehouses.branch')} name="branchId" value={form.branchId} onChange={handleFormChange}>
            <option value="">{t('common.none')}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
          <Select label={`${t('common.status')} *`} name="status" value={form.status} onChange={handleFormChange}>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </Select>
          <Input
            label={t('common.address')}
            name="address"
            value={form.address}
            onChange={handleFormChange}
            className="sm:col-span-2"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('warehouses.deleteConfirm')}
        confirmLabel={t('common.delete')}
        variant="danger"
        loading={deleteWarehouse.isPending}
      />
    </div>
  )
}
