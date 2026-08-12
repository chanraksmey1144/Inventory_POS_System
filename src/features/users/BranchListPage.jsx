import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, MoreHorizontal, Pencil, Trash2, Building2, MapPin, Phone, Mail } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
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

const EMPTY_FORM = { name: '', code: '', phone: '', email: '', address: '', status: 'active' }

export default function BranchListPage() {
  const { t } = useTranslation()
  usePageTitle('branches.title')
  const toast = useToastStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const branchesQuery = useBranches({ search, status: status || undefined })
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch()
  const deleteBranch = useDeleteBranch()

  const branches = branchesQuery.data?.items || []

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (branch) => {
    setEditing(branch)
    setForm({
      name: branch.name,
      code: branch.code,
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      status: branch.status,
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
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      address: form.address?.trim() || undefined,
      status: form.status,
    }
    try {
      if (editing) {
        await updateBranch.mutateAsync({ id: editing.id, ...payload })
        toast.success(t('branches.updated'))
      } else {
        await createBranch.mutateAsync(payload)
        toast.success(t('branches.created'))
      }
      setFormOpen(false)
    } catch {
      /* handled by mock error toast */
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteBranch.mutateAsync(deleteTarget.id)
      toast.success(t('branches.deleted'))
      setDeleteTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      cell: (branch) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Building2 size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{branch.name}</p>
            <p className="font-mono text-xs text-slate-400">{branch.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('common.phone'),
      cell: (branch) => (
        <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <Phone size={14} className="text-slate-400" />
          {branch.phone || '—'}
        </span>
      ),
    },
    {
      key: 'email',
      header: t('common.email'),
      cell: (branch) => (
        <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <Mail size={14} className="text-slate-400" />
          {branch.email || '—'}
        </span>
      ),
    },
    {
      key: 'address',
      header: t('common.address'),
      cell: (branch) => (
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <MapPin size={14} className="shrink-0 text-slate-400" />
          {branch.address || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (branch) => <StatusBadge status={branch.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (branch) => (
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
            <DropdownItem icon={Pencil} onClick={() => openEdit(branch)}>
              {t('common.edit')}
            </DropdownItem>
          ) : null}
          {can('settings.update') ? (
            <>
              <DropdownDivider />
              <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(branch)}>
                {t('common.delete')}
              </DropdownItem>
            </>
          ) : null}
        </Dropdown>
      ),
    },
  ]

  const isSaving = createBranch.isPending || updateBranch.isPending

  return (
    <div>
      <PageHeader
        title={t('branches.title')}
        subtitle={t('branches.subtitle')}
        breadcrumb={[{ label: t('nav.branches') }]}
        actions={
          can('settings.update') ? (
            <Button icon={Plus} onClick={openCreate}>
              {t('branches.create')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-64" />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-40">
            <option value="">{t('branches.allStatus')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={branches}
          loading={branchesQuery.isLoading}
          error={branchesQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => branchesQuery.refetch()}
          rowKey="id"
          emptyTitle={t('branches.noBranches')}
          emptyDescription={t('branches.noBranchesHint')}
          emptyIcon={Building2}
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t('branches.edit') : t('branches.create')}
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
          <Input label={`${t('branches.code')} *`} name="code" value={form.code} onChange={handleFormChange} />
          <Input label={t('common.phone')} name="phone" value={form.phone} onChange={handleFormChange} />
          <Input label={t('common.email')} name="email" value={form.email} onChange={handleFormChange} />
          <Select label={`${t('common.status')} *`} name="status" value={form.status} onChange={handleFormChange} className="sm:col-span-2">
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
        message={t('branches.deleteConfirm')}
        confirmLabel={t('common.delete')}
        variant="danger"
        loading={deleteBranch.isPending}
      />
    </div>
  )
}
