import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Trash2, Wallet } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useExpenses, useDeleteExpense } from '@/hooks/useSales'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { can } from '@/lib/permissions'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/constants'

const PAYMENT_LABEL_KEYS = {
  cash: 'pos.cash',
  card: 'pos.card',
  qr: 'pos.qr',
  bank_transfer: 'pos.bankTransfer',
  mobile_payment: 'pos.mobilePayment',
  credit: 'pos.credit',
  mixed: 'pos.mixed',
}

const CATEGORY_COLORS = {
  Rent: 'info',
  Utilities: 'warning',
  Salaries: 'emerald',
  Supplies: 'neutral',
  Transportation: 'violet',
  Maintenance: 'danger',
  Marketing: 'success',
  Taxes: 'info',
  Other: 'neutral',
}

export default function ExpenseListPage() {
  const { t } = useTranslation()
  usePageTitle('expenses.title')
  const navigate = useNavigate()
  const toast = useToastStore()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const expensesQuery = useExpenses({
    search: search || undefined,
    category: category || undefined,
    paymentMethod: paymentMethod || undefined,
    page,
    perPage: pageSize,
  })
  const deleteExpense = useDeleteExpense()

  const expenses = expensesQuery.data?.items || []
  const total = expensesQuery.data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteExpense.mutateAsync(deleteTarget.id)
      toast.success(t('expenses.deleted'))
      setDeleteTarget(null)
    } catch {
      /* handled by mock error toast */
    }
  }

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const columns = [
    {
      key: 'date',
      header: t('expenses.date'),
      cell: (expense) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDateTime(expense.date)}</span>
      ),
    },
    {
      key: 'description',
      header: t('common.description'),
      cell: (expense) => (
        <span className="font-medium text-slate-800 dark:text-slate-100">{expense.description || '—'}</span>
      ),
    },
    {
      key: 'category',
      header: t('expenses.category'),
      cell: (expense) => (
        <Badge color={CATEGORY_COLORS[expense.category] || 'neutral'}>{expense.category}</Badge>
      ),
    },
    {
      key: 'paymentMethod',
      header: t('expenses.paymentMethod'),
      cell: (expense) => <span className="text-slate-600 dark:text-slate-300">{t(PAYMENT_LABEL_KEYS[expense.paymentMethod] || 'pos.cash')}</span>,
    },
    {
      key: 'amount',
      header: t('expenses.amount'),
      align: 'right',
      sortable: true,
      cell: (expense) => <span className="font-semibold text-rose-500">-{formatCurrency(expense.amount)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      noWrap: true,
      cell: (expense) => (
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
          <DropdownItem icon={Trash2} danger onClick={() => setDeleteTarget(expense)}>
            {t('common.delete')}
          </DropdownItem>
        </Dropdown>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('expenses.title')}
        subtitle={t('expenses.subtitle')}
        breadcrumb={[{ label: t('nav.expenses') }]}
        actions={
          can('expenses.create') ? (
            <Button icon={Plus} onClick={() => navigate('/expenses/create')}>
              {t('expenses.create')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input placeholder={t('common.search')} value={search} onChange={handleFilterChange(setSearch)} className="max-w-64" />
          <Select value={category} onChange={handleFilterChange(setCategory)} className="max-w-44">
            <option value="">{t('expenses.allCategories')}</option>
            {EXPENSE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <Select value={paymentMethod} onChange={handleFilterChange(setPaymentMethod)} className="max-w-44">
            <option value="">{t('expenses.allMethods')}</option>
            {Object.values(PAYMENT_METHODS).map((value) => (
              <option key={value} value={value}>
                {t(PAYMENT_LABEL_KEYS[value] || 'pos.cash')}
              </option>
            ))}
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={expenses}
          loading={expensesQuery.isLoading}
          error={expensesQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => expensesQuery.refetch()}
          rowKey="id"
          emptyTitle={t('expenses.noExpenses')}
          emptyDescription={t('expenses.noExpensesHint')}
          emptyIcon={Wallet}
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
        message={t('expenses.deleteConfirm')}
        confirmLabel={t('common.delete')}
        loading={deleteExpense.isPending}
      />
    </div>
  )
}
