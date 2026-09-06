import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Pencil, Trash2, KeyRound, UserRound, UserRoundCheck } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import {
  useUsers,
  useRoles,
  useBranches,
  useDeleteUser,
  useResetPassword,
  useUpdateUser,
} from '@/hooks/useAdmin'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Avatar from '@/components/ui/Avatar'
import Dropdown, { DropdownItem, DropdownDivider } from '@/components/ui/Dropdown'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { relativeTime } from '@/lib/utils'
import { can } from '@/lib/permissions'

export default function UserListPage() {
  const { t } = useTranslation()
  usePageTitle('users.title')
  const navigate = useNavigate()
  const toast = useToastStore()

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)

  const usersQuery = useUsers({
    search,
    role: role || undefined,
    status: status || undefined,
    page,
    perPage: pageSize,
  })
  const rolesQuery = useRoles()
  const branchesQuery = useBranches()
  const deleteUser = useDeleteUser()
  const resetPassword = useResetPassword()
  const updateUser = useUpdateUser()

  const users = usersQuery.data?.items || []
  const total = usersQuery.data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const roles = rolesQuery.data?.items || []
  const branches = branchesQuery.data?.items || []
  const roleMap = new Map(roles.map((item) => [item.key, item]))
  const branchMap = new Map(branches.map((item) => [item.id, item]))

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser.mutateAsync(deleteTarget.id)
      toast.success(t('users.deleted'))
      setDeleteTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const handleStatusToggle = async () => {
    if (!statusTarget) return
    const nextStatus = statusTarget.status === 'active' ? 'inactive' : 'active'
    try {
      await updateUser.mutateAsync({ id: statusTarget.id, status: nextStatus })
      toast.success(t(nextStatus === 'active' ? 'users.activated' : 'users.deactivated'))
      setStatusTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const handleResetPassword = async () => {
    if (!resetTarget) return
    try {
      await resetPassword.mutateAsync(resetTarget.id)
      toast.success(t('users.passwordReset'))
      setResetTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('users.fullName'),
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('users.role'),
      cell: (user) => <span className="text-slate-700 dark:text-slate-200">{roleMap.get(user.role)?.name || user.role}</span>,
    },
    {
      key: 'branch',
      header: t('users.branch'),
      cell: (user) => <span className="text-slate-700 dark:text-slate-200">{branchMap.get(user.branchId)?.name || '—'}</span>,
    },
    {
      key: 'lastLogin',
      header: t('users.lastLogin'),
      cell: (user) =>
        user.lastLogin ? (
          <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{relativeTime(user.lastLogin)}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'status',
      header: t('users.status'),
      cell: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (user) => (
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
          {can('users.update') ? (
            <DropdownItem icon={Pencil} onClick={() => navigate(`/users/${user.id}/edit`)}>
              {t('common.edit')}
            </DropdownItem>
          ) : null}
          <DropdownItem icon={KeyRound} onClick={() => setResetTarget(user)}>
            {t('users.resetPassword')}
          </DropdownItem>
          {user.status === 'active' ? (
            <DropdownItem icon={UserRound} onClick={() => setStatusTarget(user)}>
              {t('users.deactivate')}
            </DropdownItem>
          ) : (
            <DropdownItem icon={UserRoundCheck} onClick={() => setStatusTarget(user)}>
              {t('users.activate')}
            </DropdownItem>
          )}
          {can('users.delete') ? (
            <>
              <DropdownDivider />
              <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(user)}>
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
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        breadcrumb={[{ label: t('nav.users') }]}
        actions={
          can('users.create') ? (
            <Button icon={Plus} onClick={() => navigate('/users/create')}>
              {t('users.create')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={handleFilterChange(setSearch)} className="max-w-64" />
          <Select value={role} onChange={handleFilterChange(setRole)} className="max-w-44">
            <option value="">{t('users.allRoles')}</option>
            {roles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={handleFilterChange(setStatus)} className="max-w-40">
            <option value="">{t('users.allStatus')}</option>
            <option value="active">{t('users.active')}</option>
            <option value="inactive">{t('users.inactive')}</option>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={users}
          loading={usersQuery.isLoading}
          error={usersQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => usersQuery.refetch()}
          rowKey="id"
          emptyTitle={t('users.noUsers')}
          emptyDescription={t('users.noUsersHint')}
          emptyIcon={UserRound}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('users.deleteConfirm')}
        confirmLabel={t('common.delete')}
        variant="danger"
        loading={deleteUser.isPending}
      />
      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusToggle}
        title={statusTarget?.status === 'active' ? t('users.deactivate') : t('users.activate')}
        message={statusTarget?.status === 'active' ? t('users.deactivateConfirm') : t('users.activateConfirm')}
        confirmLabel={statusTarget?.status === 'active' ? t('users.deactivate') : t('users.activate')}
        variant={statusTarget?.status === 'active' ? 'danger' : 'warning'}
        loading={updateUser.isPending}
      />
      <ConfirmDialog
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        onConfirm={handleResetPassword}
        title={t('users.resetPassword')}
        message={t('users.resetPasswordConfirm')}
        confirmLabel={t('users.resetPassword')}
        variant="warning"
        loading={resetPassword.isPending}
      />
    </div>
  )
}
