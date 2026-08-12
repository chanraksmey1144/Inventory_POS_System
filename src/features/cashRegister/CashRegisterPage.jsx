import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Banknote, CalendarClock, LockOpen, Lock, RefreshCcw, Store, TrendingDown, TrendingUp } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useRegisters } from '@/hooks/useAdmin'
import { useSales, useReturns, useExpenses } from '@/hooks/useSales'
import useToastStore from '@/app/store/useToastStore'
import StatCard from '@/features/dashboard/StatCard'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { PAYMENT_METHODS, SALE_STATUS } from '@/constants'

const SESSION_KEY = 'cash_register_session'

function isToday(iso) {
  if (!iso) return false
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default function CashRegisterPage() {
  const { t } = useTranslation()
  usePageTitle('cashRegister.title')
  const navigate = useNavigate()
  const toast = useToastStore()

  const [registerId, setRegisterId] = useState('')
  const [openingCash, setOpeningCash] = useState('0')
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [actualCash, setActualCash] = useState('')
  const [cashIn, setCashIn] = useState('0')
  const [cashOut, setCashOut] = useState('0')
  const [closeOpen, setCloseOpen] = useState(false)

  const registersQuery = useRegisters()
  const salesQuery = useSales({ page: 1, perPage: 1000 })
  const returnsQuery = useReturns()
  const expensesQuery = useExpenses({ page: 1, perPage: 1000 })

  const registers = registersQuery.data?.items || []

  const metrics = useMemo(() => {
    const sales = salesQuery.data?.items || []
    const cashSales = sales
      .filter((sale) => sale.status === SALE_STATUS.COMPLETED && sale.paymentMethod === PAYMENT_METHODS.CASH && isToday(sale.saleDate))
      .reduce((sum, sale) => sum + sale.total, 0)
    const refunds = (returnsQuery.data?.items || [])
      .filter((record) => isToday(record.createdAt))
      .reduce((sum, record) => sum + record.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0), 0)
    const cashOutTotal = (expensesQuery.data?.items || [])
      .filter((expense) => expense.paymentMethod === PAYMENT_METHODS.CASH && isToday(expense.date))
      .reduce((sum, expense) => sum + expense.amount, 0)
    return { cashSales, refunds, cashOut: cashOutTotal }
  }, [salesQuery.data, returnsQuery.data, expensesQuery.data])

  useEffect(() => {
    if (session) {
      setActualCash(String((Number(session.openingCash) + metrics.cashSales - metrics.refunds).toFixed(2)))
    }
  }, [session, metrics.cashSales, metrics.refunds])

  const opening = Number(session?.openingCash) || 0
  const inValue = Number(cashIn) || 0
  const outValue = Number(cashOut) || 0
  const expected = opening + metrics.cashSales + inValue - metrics.refunds - outValue - metrics.cashOut
  const actual = Number(actualCash) || 0
  const difference = actual - expected

  const openRegister = () => {
    if (!registerId) return
    const next = { registerId, openingCash: Number(openingCash) || 0, openedAt: new Date().toISOString() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
    toast.success(t('cashRegister.opened'))
  }

  const closeRegister = () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setActualCash('')
    toast.success(t('cashRegister.closed'))
    setCloseOpen(false)
  }

  const register = registers.find((item) => item.id === (session?.registerId || registerId))

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title={t('cashRegister.title')}
          subtitle={t('cashRegister.openSubtitle')}
          breadcrumb={[{ label: t('cashRegister.title') }]}
          actions={
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t('common.back')}
            </Button>
          }
        />
        <Card>
          <CardHeader title={t('cashRegister.open')} />
          <CardBody>
            <div className="grid grid-cols-1 gap-4">
              <Select label={t('cashRegister.selectRegister')} value={registerId} onChange={(event) => setRegisterId(event.target.value)}>
                <option value="">{t('common.select')}</option>
                {registers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.code}
                  </option>
                ))}
              </Select>
              <Input
                label={t('cashRegister.openingCash')}
                type="number"
                min="0"
                step="0.01"
                value={openingCash}
                onChange={(event) => setOpeningCash(event.target.value)}
              />
              <Button onClick={openRegister} disabled={!registerId} icon={LockOpen}>
                {t('cashRegister.open')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={t('cashRegister.title')}
        subtitle={register?.name}
        breadcrumb={[{ label: t('cashRegister.title') }]}
        actions={
          <>
            <Button variant="outline" icon={Lock} onClick={() => setCloseOpen(true)}>
              {t('cashRegister.close')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t('common.back')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('cashRegister.openingCash')} value={formatCurrency(opening)} icon={Banknote} iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" />
        <StatCard label={t('cashRegister.cashSales')} value={formatCurrency(metrics.cashSales)} icon={TrendingUp} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <StatCard label={t('cashRegister.refunds')} value={formatCurrency(metrics.refunds)} icon={RefreshCcw} iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
        <StatCard label={t('cashRegister.cashOut')} value={formatCurrency(metrics.cashOut)} icon={TrendingDown} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={t('cashRegister.sessionDetails')} />
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                <Store size={16} className="text-slate-400" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-400">{t('cashRegister.selectRegister')}</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{register?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
                <CalendarClock size={16} className="text-slate-400" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-400">{t('cashRegister.openedAt')}</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{formatDateTime(session.openedAt)}</p>
                </div>
              </div>
              <Input label={t('cashRegister.cashIn')} type="number" min="0" step="0.01" value={cashIn} onChange={(event) => setCashIn(event.target.value)} />
              <Input label={t('cashRegister.cashOut')} type="number" min="0" step="0.01" value={cashOut} onChange={(event) => setCashOut(event.target.value)} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('cashRegister.closingSummary')} />
          <CardBody>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t('cashRegister.expectedCash')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(expected)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">{t('cashRegister.actualCash')}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={actualCash}
                  onChange={(event) => setActualCash(event.target.value)}
                  className="w-32"
                  aria-label={t('cashRegister.actualCash')}
                />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('cashRegister.difference')}</span>
                <span
                  className={
                    Math.abs(difference) < 0.01
                      ? 'text-base font-bold text-emerald-600 dark:text-emerald-400'
                      : 'text-base font-bold text-rose-500'
                  }
                >
                  {formatCurrency(difference)}
                </span>
              </div>
              <Button className="w-full" variant="outline" icon={Lock} onClick={() => setCloseOpen(true)}>
                {t('cashRegister.close')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={closeRegister}
        title={t('cashRegister.close')}
        message={t('cashRegister.closeConfirm')}
        confirmLabel={t('cashRegister.close')}
      />
    </div>
  )
}
