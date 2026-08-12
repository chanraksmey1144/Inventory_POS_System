import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, MoreHorizontal, Pencil, Trash2, Monitor } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import {
  useRegisters,
  useBranches,
  useCreateRegister,
  useUpdateRegister,
  useDeleteRegister,
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

const EMPTY_FORM = { name: '', code: '', branchId: '', status: 'active' }

export default function RegisterListPage() {
  const { t } = useTranslation()
  usePageTitle('registers.title')
  const toast = useToastStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const registersQuery = useRegisters({ search, status: status || undefined })
  const branchesQuery = useBranches()
  const createRegister = useCreateRegister()
  const updateRegister = useUpdateRegister()
  const deleteRegister = useDeleteRegister()

  const registers = registersQuery.data?.items || []
  const branches = branchesQuery.data?.items || []
  const branchMap = new Map(branches.map((branch) => [branch.id, branch]))

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (register) => {
    setEditing(register)
    setForm({
      name: register.name,
      code: register.code,
      branchId: register.branchId || '',
      status: register.status,
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
      status: form.status,
    }
    try {
      if (editing) {
        await updateRegister.mutateAsync({ id: editing.id, ...payload })
        toast.success(t('registers.updated'))
      } else {
        await createRegister.mutateAsync(payload)
        toast.success(t('registers.created'))
      }
      setFormOpen(false)
    } catch {
      /* handled by mock error toast */
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteRegister.mutateAsync(deleteTarget.id)
      toast.success(t('registers.deleted'))
      setDeleteTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      cell: (register) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Monitor size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{register.name}</p>
            <p className="font-mono text-xs text-slate-400">{register.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: t('registers.branch'),
      cell: (register) => <span className="text-slate-700 dark:text-slate-200">{branchMap.get(register.branchId)?.name || '—'}</span>,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (register) => <StatusBadge status={register.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (register) => (
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
            <DropdownItem icon={Pencil} onClick={() => openEdit(register)}>
              {t('common.edit')}
            </DropdownItem>
          ) : null}
          {can('settings.update') ? (
            <>
              <DropdownDivider />
              <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(register)}>
                {t('common.delete')}
              </DropdownItem>
            </>
          ) : null}
        </Dropdown>
      ),
    },
  ]

  const isSaving = createRegister.isPending || updateRegister.isPending

  return (
    <div>
      <PageHeader
        title={t('registers.title')}
        subtitle={t('registers.subtitle')}
        breadcrumb={[{ label: t('nav.registers') }]}
        actions={
          can('settings.update') ? (
            <Button icon={Plus} onClick={openCreate}>
              {t('registers.create')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-64" />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-40">
            <option value="">{t('registers.allStatus')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={registers}
          loading={registersQuery.isLoading}
          error={registersQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => registersQuery.refetch()}
          rowKey="id"
          emptyTitle={t('registers.noRegisters')}
          emptyDescription={t('registers.noRegistersHint')}
          emptyIcon={Monitor}
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t('registers.edit') : t('registers.create')}
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
          <Input label={`${t('registers.code')} *`} name="code" value={form.code} onChange={handleFormChange} />
          <Select label={t('registers.branch')} name="branchId" value={form.branchId} onChange={handleFormChange}>
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
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('registers.deleteConfirm')}
        confirmLabel={t('common.delete')}
        variant="danger"
        loading={deleteRegister.isPending}
      />
    </div>
  )
}
