import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { History } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useAuditLogs, useUsers } from '@/hooks/useAdmin'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'

const ACTION_COLORS = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  archive: 'neutral',
  login: 'info',
  logout: 'neutral',
  receive: 'emerald',
  return: 'violet',
  adjust: 'warning',
  transfer: 'info',
  payment: 'success',
  cancel: 'danger',
  export: 'neutral',
}

const ACTION_OPTIONS = ['create', 'update', 'delete', 'archive', 'login', 'logout', 'receive', 'return', 'adjust', 'transfer', 'payment', 'cancel', 'export']

const MODULE_OPTIONS = ['auth', 'sales', 'products', 'expenses', 'settings', 'inventory', 'purchases', 'customers', 'users', 'branches', 'warehouses', 'registers', 'notifications', 'reports', 'pos']

function titleCase(value) {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function AuditLogsPage() {
  const { t } = useTranslation()
  usePageTitle('auditLogs.title')

  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [module, setModule] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const logsQuery = useAuditLogs({
    search,
    action: action || undefined,
    module: module || undefined,
    page,
    perPage: pageSize,
  })
  const usersQuery = useUsers({ page: 1, perPage: 1000 })

  const logs = logsQuery.data?.items || []
  const total = logsQuery.data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const users = usersQuery.data?.items || []
  const userMap = new Map(users.map((user) => [user.id, user]))

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const columns = [
    {
      key: 'date',
      header: t('auditLogs.date'),
      cell: (log) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDateTime(log.date)}</span>
      ),
    },
    {
      key: 'user',
      header: t('auditLogs.user'),
      cell: (log) => (
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {userMap.get(log.userId)?.name || t('auditLogs.unknownUser')}
        </span>
      ),
    },
    {
      key: 'action',
      header: t('auditLogs.action'),
      cell: (log) => <Badge color={ACTION_COLORS[log.action] || 'neutral'}>{titleCase(log.action)}</Badge>,
    },
    {
      key: 'module',
      header: t('auditLogs.module'),
      cell: (log) => <Badge color="neutral">{titleCase(log.module)}</Badge>,
    },
    {
      key: 'record',
      header: t('auditLogs.record'),
      cell: (log) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{log.record || '—'}</span>
      ),
    },
    {
      key: 'description',
      header: t('auditLogs.description'),
      cell: (log) => <span className="text-slate-700 dark:text-slate-200">{log.description}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('auditLogs.title')}
        subtitle={t('auditLogs.subtitle')}
        breadcrumb={[{ label: t('nav.notifications') }, { label: t('auditLogs.title') }]}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={handleFilterChange(setSearch)} className="max-w-64" />
          <Select value={action} onChange={handleFilterChange(setAction)} className="max-w-44">
            <option value="">{t('auditLogs.allActions')}</option>
            {ACTION_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </Select>
          <Select value={module} onChange={handleFilterChange(setModule)} className="max-w-44">
            <option value="">{t('auditLogs.allModules')}</option>
            {MODULE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          loading={logsQuery.isLoading}
          error={logsQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => logsQuery.refetch()}
          rowKey="id"
          emptyTitle={t('auditLogs.noLogs')}
          emptyDescription={t('auditLogs.noLogsHint')}
          emptyIcon={History}
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
    </div>
  )
}
