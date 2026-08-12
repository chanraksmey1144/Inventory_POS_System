import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Package,
  AlertTriangle,
  PackageX,
  Wallet,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { useDashboard } from '@/hooks/useInventory'
import usePageTitle from '@/hooks/usePageTitle'
import StatCard from './StatCard'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import Badge from '@/components/ui/Badge'
import ProductImage from '@/components/ui/ProductImage'
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils'
import { PAYMENT_METHODS, MOVEMENT_TYPE } from '@/constants'

const CHART_COLORS = ['#059669', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6']

const PAYMENT_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.CARD]: 'Card',
  [PAYMENT_METHODS.QR]: 'QR Pay',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.MOBILE_PAYMENT]: 'Mobile Payment',
  [PAYMENT_METHODS.CREDIT]: 'Credit',
}

const MOVEMENT_LABELS = {
  [MOVEMENT_TYPE.PURCHASE]: 'Purchase',
  [MOVEMENT_TYPE.SALE]: 'Sale',
  [MOVEMENT_TYPE.RETURN]: 'Return',
  [MOVEMENT_TYPE.DAMAGE]: 'Damage',
  [MOVEMENT_TYPE.ADJUSTMENT]: 'Adjustment',
  [MOVEMENT_TYPE.TRANSFER]: 'Transfer',
}

function ChartTooltipCard({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-slate-500 dark:text-slate-400">
          {entry.name}: <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size={30} label="Loading dashboard..." />
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, error, refetch } = useDashboard()

  usePageTitle('dashboard.title')

  if (isLoading) return <DashboardLoading />
  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      </div>
    )
  }
  if (!data) return <DashboardLoading />

  const { metrics, charts, recentSales, recentPurchases, recentMovements } = data

  const paymentData = charts.paymentBreakdown.map((item) => ({
    ...item,
    name: PAYMENT_LABELS[item.name] || item.name,
  }))

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <Link
            to="/pos"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <ShoppingBag size={16} aria-hidden="true" />
            {t('nav.pos')}
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label={t('dashboard.todaysRevenue')}
          value={formatCurrency(metrics.todaysRevenue)}
          icon={DollarSign}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          delta={12.5}
          deltaLabel="vs yesterday"
        />
        <StatCard
          label={t('dashboard.todaysOrders')}
          value={formatNumber(metrics.todaysOrders)}
          icon={ShoppingBag}
          iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
          delta={8.3}
          deltaLabel="vs yesterday"
        />
        <StatCard
          label={t('dashboard.grossProfit')}
          value={formatCurrency(metrics.grossProfit)}
          icon={TrendingUp}
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          delta={5.1}
          deltaLabel="vs yesterday"
        />
        <StatCard
          label={t('dashboard.avgOrderValue')}
          value={formatCurrency(metrics.avgOrderValue)}
          icon={Receipt}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <StatCard
          label={t('dashboard.totalProducts')}
          value={formatNumber(metrics.totalProducts)}
          icon={Package}
          iconClass="bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400"
        />
        <StatCard
          label={t('dashboard.lowStock')}
          value={formatNumber(metrics.lowStockCount)}
          icon={AlertTriangle}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <StatCard
          label={t('dashboard.outOfStock')}
          value={formatNumber(metrics.outOfStockCount)}
          icon={PackageX}
          iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        />
        <StatCard
          label={t('dashboard.outstandingPayments')}
          value={formatCurrency(metrics.outstandingPayments)}
          icon={Wallet}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={t('dashboard.salesTrend')} subtitle={t('common.last30Days')} />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.salesTrend.labels.map((label, index) => ({ name: label, revenue: charts.salesTrend.revenue[index], profit: charts.salesTrend.profit[index] }))}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} width={52} />
                <ChartTooltip content={<ChartTooltipCard />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" strokeWidth={2} fill="url(#revenueGradient)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#0ea5e9" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('dashboard.salesByCategory')} />
          <CardBody className="h-72">
            {charts.salesByCategory.length === 0 ? (
              <EmptyState title={t('common.noResults')} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.salesByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    strokeWidth={2}
                  >
                    {charts.salesByCategory.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                  />
                  <ChartTooltip content={<ChartTooltipCard />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title={t('dashboard.topProducts')} />
          <CardBody className="space-y-3">
            {charts.topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {index + 1}
                </span>
                <ProductImage product={product} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.quantity} sold</p>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(product.revenue)}</span>
              </div>
            ))}
            {charts.topProducts.length === 0 ? <EmptyState title={t('common.noResults')} /> : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('dashboard.paymentMethods')} />
          <CardBody className="h-64">
            {paymentData.length === 0 ? (
              <EmptyState title={t('common.noResults')} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={90} />
                  <ChartTooltip content={<ChartTooltipCard />} />
                  <Bar dataKey="value" name="Total" fill="#059669" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('dashboard.purchaseTrend')} subtitle={t('common.last30Days')} />
          <CardBody className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.purchaseTrend}>
                <defs>
                  <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={44} />
                <ChartTooltip content={<ChartTooltipCard />} />
                <Area type="monotone" dataKey="value" name="Purchases" stroke="#8b5cf6" strokeWidth={2} fill="url(#purchaseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t('dashboard.recentSales')}
            actions={
              <Link to="/sales" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                {t('dashboard.viewAll')}
              </Link>
            }
          />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentSales.map((sale) => (
                <Link key={sale.id} to={`/sales/${sale.id}`} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{sale.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(sale.saleDate)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge color="success">${sale.total}</Badge>
                  </div>
                </Link>
              ))}
              {recentSales.length === 0 ? <EmptyState title={t('common.noResults')} /> : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t('dashboard.alerts')}
            actions={
              <Link to="/inventory/low-stock" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                {t('dashboard.viewAll')}
              </Link>
            }
          />
          <CardBody className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-500/10">
              <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {metrics.lowStockCount} {t('dashboard.lowStockItems')}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900 dark:bg-rose-500/10">
              <PackageX size={18} className="shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <p className="text-sm text-rose-800 dark:text-rose-300">
                {metrics.outOfStockCount} {t('dashboard.outOfStock')}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
              <Receipt size={18} className="shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {recentPurchases.filter((p) => p.status !== 'received').length} {t('dashboard.pendingPurchases')}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
              <Wallet size={18} className="shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {formatCurrency(metrics.outstandingPayments)} {t('dashboard.paymentsDue')}
              </p>
            </div>

            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('dashboard.recentMovements')}</p>
              <div className="space-y-1.5">
                {recentMovements.slice(0, 4).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-slate-600 dark:text-slate-300">
                      {MOVEMENT_LABELS[movement.type] || movement.type}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-slate-400">{movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
