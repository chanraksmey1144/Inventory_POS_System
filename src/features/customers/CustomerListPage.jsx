import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Users } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useCustomers, useCustomerGroups, useDeleteCustomer } from '@/hooks/useSales'
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
import { formatCurrency, formatNumber, initials } from '@/lib/utils'
import { can } from '@/lib/permissions'

export default function CustomerListPage() {
  const { t } = useTranslation()
  usePageTitle('customers.title')
  const navigate = useNavigate()
  const toast = useToastStore()

  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const customersQuery = useCustomers({ page: 1, perPage: 1000 })
  const groupsQuery = useCustomerGroups()
  const deleteCustomer = useDeleteCustomer()

  const customers = customersQuery.data?.items || []
  const groups = groupsQuery.data?.items || []
  const groupMap = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return customers.filter((customer) => {
      if (groupId && customer.groupId !== groupId) return false
      if (!term) return true
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term)
      )
    })
  }, [customers, search, groupId])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCustomer.mutateAsync(deleteTarget.id)
      toast.success(t('customers.deleted'))
      setDeleteTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('customers.fullName'),
      cell: (customer) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            {initials(customer.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{customer.name}</p>
            <p className="text-xs text-slate-400">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('common.phone'),
      cell: (customer) => <span className="text-slate-700 dark:text-slate-200">{customer.phone}</span>,
    },
    {
      key: 'group',
      header: t('customers.group'),
      cell: (customer) => {
        const group = groupMap.get(customer.groupId)
        return group ? <StatusBadge status={group.name.toLowerCase()} label={group.name} /> : <span className="text-slate-400">—</span>
      },
    },
    {
      key: 'totalSpent',
      header: t('customers.totalSpent'),
      align: 'right',
      sortable: true,
      cell: (customer) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(customer.totalSpent)}</span>
      ),
    },
    {
      key: 'loyaltyPoints',
      header: t('customers.loyaltyPoints'),
      align: 'right',
      cell: (customer) => <span className="text-slate-700 dark:text-slate-200">{formatNumber(customer.loyaltyPoints)}</span>,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (customer) => <StatusBadge status={customer.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (customer) => (
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
          <DropdownItem icon={Eye} onClick={() => navigate(`/customers/${customer.id}`)}>
            {t('common.view')}
          </DropdownItem>
          {can('customers.update') ? (
            <DropdownItem icon={Pencil} onClick={() => navigate(`/customers/${customer.id}/edit`)}>
              {t('common.edit')}
            </DropdownItem>
          ) : null}
          {can('customers.delete') ? (
            <>
              <DropdownDivider />
              <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(customer)}>
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
        title={t('customers.title')}
        subtitle={t('customers.subtitle')}
        breadcrumb={[{ label: t('nav.customers') }]}
        actions={
          can('customers.create') ? (
            <Button icon={Plus} onClick={() => navigate('/customers/create')}>
              {t('customers.create')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-64" />
          <Select value={groupId} onChange={(event) => setGroupId(event.target.value)} className="max-w-44">
            <option value="">{t('customers.allGroups')}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
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
          loading={customersQuery.isLoading}
          error={customersQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => customersQuery.refetch()}
          rowKey="id"
          onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
          emptyTitle={t('customers.noCustomers')}
          emptyDescription={t('customers.noCustomersHint')}
          emptyIcon={Users}
        />
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('customers.deleteConfirm')}
        confirmLabel={t('common.delete')}
        loading={deleteCustomer.isPending}
      />
    </div>
  )
}
