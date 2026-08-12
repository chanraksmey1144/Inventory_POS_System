import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Users } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useSuppliers, useDeleteSupplier } from '@/hooks/usePurchases'
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
import { formatCurrency, initials } from '@/lib/utils'
import { can } from '@/lib/permissions'

export default function SupplierListPage() {
  const { t } = useTranslation()
  usePageTitle('suppliers.title')
  const navigate = useNavigate()
  const toast = useToastStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const suppliersQuery = useSuppliers({ search, status: status || undefined })
  const deleteSupplier = useDeleteSupplier()

  const suppliers = suppliersQuery.data?.items || []

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return suppliers
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) ||
        supplier.email.toLowerCase().includes(term) ||
        supplier.phone.toLowerCase().includes(term),
    )
  }, [suppliers, search])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSupplier.mutateAsync(deleteTarget.id)
      toast.success(t('suppliers.deleted'))
      setDeleteTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('suppliers.company'),
      cell: (supplier) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {initials(supplier.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{supplier.name}</p>
            <p className="text-xs text-slate-400">{supplier.contactPerson}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: t('common.phone'),
      cell: (supplier) => (
        <div>
          <p className="text-slate-700 dark:text-slate-200">{supplier.phone}</p>
          <p className="text-xs text-slate-400">{supplier.email}</p>
        </div>
      ),
    },
    {
      key: 'totalPurchases',
      header: t('suppliers.totalPurchases'),
      align: 'right',
      sortable: true,
      cell: (supplier) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(supplier.totalPurchases)}</span>
      ),
    },
    {
      key: 'outstanding',
      header: t('suppliers.outstanding'),
      align: 'right',
      cell: (supplier) => (
        <span className={supplier.outstanding > 0 ? 'font-semibold text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
          {formatCurrency(supplier.outstanding)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (supplier) => <StatusBadge status={supplier.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (supplier) => (
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
          <DropdownItem icon={Eye} onClick={() => navigate(`/suppliers/${supplier.id}`)}>
            {t('common.view')}
          </DropdownItem>
          {can('suppliers.update') ? (
            <DropdownItem icon={Pencil} onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}>
              {t('common.edit')}
            </DropdownItem>
          ) : null}
          {can('suppliers.delete') ? (
            <>
              <DropdownDivider />
              <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(supplier)}>
                {t('common.delete')}
              </DropdownItem>
            </>
          ) : null}
        </Dropdown>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('suppliers.title')}
        subtitle={t('suppliers.subtitle')}
        breadcrumb={[{ label: t('nav.suppliers') }]}
        actions={
          can('suppliers.create') ? (
            <Button icon={Plus} onClick={() => navigate('/suppliers/create')}>
              {t('suppliers.create')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-64" />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-40">
            <option value="">{t('common.all')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </Select>
          <span className="ml-auto text-sm text-slate-400">
            {filtered.length} {t('common.items')}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={suppliersQuery.isLoading}
          error={suppliersQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => suppliersQuery.refetch()}
          rowKey="id"
          onRowClick={(supplier) => navigate(`/suppliers/${supplier.id}`)}
          emptyTitle={t('suppliers.noSuppliers')}
          emptyDescription={t('suppliers.noSuppliersHint')}
          emptyIcon={Users}
        />
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('suppliers.deleteConfirm')}
        confirmLabel={t('common.delete')}
        loading={deleteSupplier.isPending}
      />
    </div>
  )
}
