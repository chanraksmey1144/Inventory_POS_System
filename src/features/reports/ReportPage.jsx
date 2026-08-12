import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  Package,
  PackageX,
  AlertTriangle,
  ShoppingBag,
  Scale,
  BarChart3,
  Layers,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import usePageTitle from '@/hooks/usePageTitle'
import { useSalesReport, usePurchasesReport, useInventoryReport, useProfitReport } from '@/hooks/useReports'
import { useCustomers } from '@/hooks/useSales'
import { useSuppliers } from '@/hooks/usePurchases'
import StatCard from '@/features/dashboard/StatCard'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Spinner from '@/components/ui/Spinner'
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils'

const CHART_COLORS = ['#059669', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6']

const PAYMENT_LABEL_KEYS = {
  cash: 'pos.cash',
  card: 'pos.card',
  qr: 'pos.qr',
  bank_transfer: 'pos.bankTransfer',
  mobile_payment: 'pos.mobilePayment',
  credit: 'pos.credit',
  mixed: 'pos.mixed',
}

function daysAgoISO(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function SalesReport({ t }) {
  const [from, setFrom] = useState(daysAgoISO(30))
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const report = useSalesReport({ from: new Date(from).toISOString(), to: new Date(to).toISOString() })
  const customersQuery = useCustomers({ page: 1, perPage: 1000 })

  const customerMap = useMemo(
    () => new Map((customersQuery.data?.items || []).map((customer) => [customer.id, customer])),
    [customersQuery.data],
  )

  if (report.isLoading) return <Spinner />

  const data = report.data
  const chartData = data.chart.labels.map((label, index) => ({ name: label, revenue: data.chart.values[index] }))
  const paymentData = data.paymentBreakdown.map((item) => ({
    name: t(PAYMENT_LABEL_KEYS[item.name] || 'pos.cash'),
    value: item.value,
  }))

  const columns = [
    {
      key: 'invoiceNumber',
      header: t('reports.invoice'),
      cell: (sale) => <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{sale.invoiceNumber}</span>,
    },
    {
      key: 'customer',
      header: t('reports.customer'),
      cell: (sale) => <span className="text-slate-700 dark:text-slate-200">{customerMap.get(sale.customerId)?.name || '—'}</span>,
    },
    {
      key: 'saleDate',
      header: t('reports.date'),
      cell: (sale) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDateTime(sale.saleDate)}</span>
      ),
    },
    {
      key: 'items',
      header: t('reports.items'),
      align: 'right',
      cell: (sale) => <span className="text-slate-700 dark:text-slate-200">{sale.items.length}</span>,
    },
    {
      key: 'total',
      header: t('common.total'),
      align: 'right',
      cell: (sale) => <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(sale.total)}</span>,
    },
    {
      key: 'status',
      header: t('reports.status'),
      cell: (sale) => <StatusBadge status={sale.status} />,
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Input label={t('reports.from')} type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-40" />
        <Input label={t('reports.to')} type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-40" />
        <Button icon={BarChart3} onClick={() => report.refetch()}>
          {t('reports.apply')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('reports.revenue')} value={formatCurrency(data.summary.revenue)} icon={DollarSign} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <StatCard label={t('reports.orders')} value={formatNumber(data.summary.orders)} icon={Receipt} iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" />
        <StatCard label={t('reports.averageOrder')} value={formatCurrency(data.summary.averageOrder)} icon={ShoppingBag} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
        <StatCard label={t('reports.grossProfit')} value={formatCurrency(data.summary.grossProfit)} icon={TrendingUp} iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={t('reports.dailySales')} />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} width={52} />
                <ChartTooltip cursor={{ fill: 'rgba(148,163,184,0.08)' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={t('reports.paymentBreakdown')} />
          <CardBody className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} strokeWidth={2}>
                  {paymentData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {paymentData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-slate-500 dark:text-slate-400">{item.name}</span>
                  <span className="ml-auto font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader title={t('reports.recentSales')} />
        <DataTable
          columns={columns}
          data={data.rows}
          rowKey="id"
          emptyTitle={t('reports.noData')}
          emptyDescription={t('reports.noDataHint')}
          emptyIcon={Receipt}
        />
      </Card>
    </div>
  )
}

function PurchasesReport({ t }) {
  const [from, setFrom] = useState(daysAgoISO(30))
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const report = usePurchasesReport({ from: new Date(from).toISOString(), to: new Date(to).toISOString() })
  const suppliersQuery = useSuppliers()

  const supplierMap = useMemo(
    () => new Map((suppliersQuery.data?.items || []).map((supplier) => [supplier.id, supplier])),
    [suppliersQuery.data],
  )

  if (report.isLoading) return <Spinner />

  const data = report.data

  const columns = [
    {
      key: 'purchaseNumber',
      header: t('purchases.purchaseNumber'),
      cell: (purchase) => <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{purchase.purchaseNumber}</span>,
    },
    {
      key: 'supplier',
      header: t('reports.supplier'),
      cell: (purchase) => <span className="text-slate-700 dark:text-slate-200">{supplierMap.get(purchase.supplierId)?.name || '—'}</span>,
    },
    {
      key: 'orderDate',
      header: t('reports.date'),
      cell: (purchase) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDateTime(purchase.orderDate)}</span>
      ),
    },
    {
      key: 'items',
      header: t('reports.items'),
      align: 'right',
      cell: (purchase) => <span className="text-slate-700 dark:text-slate-200">{purchase.items.length}</span>,
    },
    {
      key: 'total',
      header: t('common.total'),
      align: 'right',
      cell: (purchase) => <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(purchase.total)}</span>,
    },
    {
      key: 'status',
      header: t('reports.status'),
      cell: (purchase) => <StatusBadge status={purchase.status} />,
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Input label={t('reports.from')} type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-40" />
        <Input label={t('reports.to')} type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-40" />
        <Button icon={BarChart3} onClick={() => report.refetch()}>
          {t('reports.apply')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t('reports.totalPurchases')} value={formatCurrency(data.summary.total)} icon={ShoppingBag} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <StatCard label={t('reports.count')} value={formatNumber(data.summary.count)} icon={Receipt} iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" />
        <StatCard label={t('reports.items')} value={formatNumber(data.summary.items)} icon={Layers} iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader title={t('reports.recentPurchases')} />
        <DataTable
          columns={columns}
          data={data.rows}
          rowKey="id"
          emptyTitle={t('reports.noData')}
          emptyDescription={t('reports.noDataHint')}
          emptyIcon={ShoppingBag}
        />
      </Card>
    </div>
  )
}

function InventoryReport({ t }) {
  const report = useInventoryReport()

  if (report.isLoading) return <Spinner />

  const data = report.data

  const columns = [
    {
      key: 'name',
      header: t('reports.productName'),
      cell: (product) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
          <p className="font-mono text-xs text-slate-400">{product.sku}</p>
        </div>
      ),
    },
    {
      key: 'stock',
      header: t('reports.stock'),
      align: 'right',
      cell: (product) => <span className="text-slate-700 dark:text-slate-200">{formatNumber(product.stock)}</span>,
    },
    {
      key: 'cost',
      header: t('products.costPrice'),
      align: 'right',
      cell: (product) => <span className="text-slate-700 dark:text-slate-200">{formatCurrency(product.cost)}</span>,
    },
    {
      key: 'price',
      header: t('products.sellingPrice'),
      align: 'right',
      cell: (product) => <span className="text-slate-700 dark:text-slate-200">{formatCurrency(product.price)}</span>,
    },
    {
      key: 'value',
      header: t('reports.value'),
      align: 'right',
      cell: (product) => <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(product.cost * product.stock)}</span>,
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t('reports.totalItems')} value={formatNumber(data.summary.totalItems)} icon={Package} iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" />
        <StatCard label={t('reports.totalUnits')} value={formatNumber(data.summary.totalUnits)} icon={Layers} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <StatCard label={t('reports.stockValue')} value={formatCurrency(data.summary.totalValue)} icon={Scale} iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
        <StatCard label={t('reports.retailValue')} value={formatCurrency(data.summary.retailValue)} icon={DollarSign} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
        <StatCard label={t('reports.lowStock')} value={formatNumber(data.summary.lowStock)} icon={AlertTriangle} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
        <StatCard label={t('reports.outOfStock')} value={formatNumber(data.summary.outOfStock)} icon={PackageX} iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" />
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader title={t('reports.inventoryTitle')} />
        <DataTable
          columns={columns}
          data={data.rows}
          rowKey="id"
          emptyTitle={t('reports.noData')}
          emptyIcon={Package}
        />
      </Card>
    </div>
  )
}

function ProfitReport({ t }) {
  const [from, setFrom] = useState(daysAgoISO(30))
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const report = useProfitReport({ from: new Date(from).toISOString(), to: new Date(to).toISOString() })

  if (report.isLoading) return <Spinner />

  const data = report.data

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Input label={t('reports.from')} type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-40" />
        <Input label={t('reports.to')} type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-40" />
        <Button icon={BarChart3} onClick={() => report.refetch()}>
          {t('reports.apply')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t('reports.revenue')} value={formatCurrency(data.summary.revenue)} icon={DollarSign} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <StatCard label={t('reports.cogs')} value={formatCurrency(data.summary.cogs)} icon={TrendingDown} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
        <StatCard label={t('reports.grossProfit')} value={formatCurrency(data.summary.grossProfit)} icon={TrendingUp} iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
        <StatCard label={t('reports.expenses')} value={formatCurrency(data.summary.expenses)} icon={TrendingDown} iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" />
        <StatCard label={t('reports.netProfit')} value={formatCurrency(data.summary.netProfit)} icon={Scale} iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" />
      </div>
    </div>
  )
}

function FinancialReport({ t }) {
  return (
    <Card>
      <CardHeader title={t('reports.financialTitle')} />
      <CardBody>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('reports.financialHint')}</p>
      </CardBody>
    </Card>
  )
}

export default function ReportPage() {
  const { t } = useTranslation()
  usePageTitle('reports.title')
  const navigate = useNavigate()
  const location = useLocation()

  const titleKey = location.pathname.includes('purchases')
    ? 'reports.purchasesTitle'
    : location.pathname.includes('inventory')
      ? 'reports.inventoryTitle'
      : location.pathname.includes('profit')
        ? 'reports.profitTitle'
        : location.pathname.includes('financial')
          ? 'reports.financialTitle'
          : 'reports.salesTitle'

  let content
  if (location.pathname.includes('purchases')) {
    content = <PurchasesReport t={t} />
  } else if (location.pathname.includes('inventory')) {
    content = <InventoryReport t={t} />
  } else if (location.pathname.includes('profit')) {
    content = <ProfitReport t={t} />
  } else if (location.pathname.includes('financial')) {
    content = <FinancialReport t={t} />
  } else {
    content = <SalesReport t={t} />
  }

  return (
    <div>
      <PageHeader
        title={t(titleKey)}
        subtitle={t('reports.period')}
        breadcrumb={[{ label: t('nav.reports') }, { label: t(titleKey) }]}
        actions={
          <Button variant="outline" onClick={() => navigate('/')}>
            {t('common.back')}
          </Button>
        }
      />
      {content}
    </div>
  )
}
