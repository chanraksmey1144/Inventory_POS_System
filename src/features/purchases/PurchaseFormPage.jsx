import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, FileText } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { usePurchases, useSuppliers, useCreatePurchase } from '@/hooks/usePurchases'
import { useProducts } from '@/hooks/useProducts'
import { useWarehouses } from '@/hooks/useAdmin'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import FormSection from '@/components/ui/FormSection'
import ProductImage from '@/components/ui/ProductImage'
import { formatCurrency, uid } from '@/lib/utils'
import { normalizeApiError } from '@/lib/errors'

const DEFAULT_LINE = { id: uid('line'), productId: '', quantity: '24', cost: '' }

export default function PurchaseFormPage() {
  const { t } = useTranslation()
  usePageTitle('purchases.create')
  const navigate = useNavigate()
  const toast = useToastStore()

  const [supplierId, setSupplierId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10))
  const [expectedDate, setExpectedDate] = useState('')
  const [lines, setLines] = useState([DEFAULT_LINE])
  const [discount, setDiscount] = useState('0')
  const [notes, setNotes] = useState('')
  const [serverError, setServerError] = useState('')

  const createPurchase = useCreatePurchase()
  const suppliersQuery = useSuppliers()
  const productsQuery = useProducts({ page: 1, perPage: 1000 })
  const warehousesQuery = useWarehouses()
  const purchasesQuery = usePurchases({ page: 1, perPage: 1 })

  const suppliers = suppliersQuery.data?.items || []
  const products = productsQuery.data?.items || []
  const warehouses = warehousesQuery.data?.items || []
  const purchasesCount = purchasesQuery.data?.total || 0

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])

  const addLine = () => setLines((current) => [...current, { ...DEFAULT_LINE, id: uid('line') }])

  const updateLine = (lineId, patch) =>
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)))

  const removeLine = (lineId) => setLines((current) => current.filter((line) => line.id !== lineId))

  const selectProduct = (lineId, productId) => {
    const product = productMap.get(productId)
    updateLine(lineId, {
      productId,
      cost: product ? String(product.cost) : '',
    })
  }

  const items = lines.map((line) => {
    const product = productMap.get(line.productId)
    const quantity = Number(line.quantity) || 0
    const cost = Number(line.cost) || 0
    return { line, product, quantity, cost }
  })

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.cost, 0)
  const discountValue = Number(discount) || 0
  const tax = subtotal * 0.05
  const total = Math.max(0, subtotal - discountValue) + tax

  const validLines = items.filter((item) => item.product && item.quantity > 0 && item.cost >= 0)
  const canSubmit = supplierId && warehouseId && orderDate && validLines.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setServerError('')
    const number = `PO-${new Date().getFullYear()}-${String(purchasesCount + 1).padStart(4, '0')}`
    const payload = {
      purchaseNumber: number,
      supplierId,
      warehouseId,
      branchId: 'b-1',
      orderDate: new Date(orderDate).toISOString(),
      expectedDate: expectedDate ? new Date(expectedDate).toISOString() : undefined,
      items: validLines.map(({ product, quantity, cost }) => ({
        productId: product.id,
        variantId: null,
        name: product.name,
        sku: product.sku,
        cost,
        quantity,
        receivedQuantity: 0,
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      discount: discountValue,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      status: 'draft',
      paymentStatus: 'unpaid',
      notes: notes.trim() || undefined,
      createdBy: 'u-1',
    }
    try {
      const created = await createPurchase.mutateAsync(payload)
      toast.success(t('purchases.created'))
      navigate(`/purchases/${created.id}`, { replace: true })
    } catch (error) {
      setServerError(normalizeApiError(error))
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t('purchases.create')}
        breadcrumb={[{ label: t('nav.purchases'), to: '/purchases' }, { label: t('purchases.create') }]}
        actions={
          <Button variant="outline" onClick={() => navigate('/purchases')}>
            {t('common.cancel')}
          </Button>
        }
      />

      {serverError ? (
        <div
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
          role="alert"
        >
          {serverError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <FormSection title={t('purchases.purchaseDetails')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label={`${t('purchases.supplier')} *`} value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
                <option value="">{t('common.select')}</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
              <Select label={`${t('purchases.warehouse')} *`} value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}>
                <option value="">{t('common.select')}</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </Select>
              <Input label={`${t('purchases.orderDate')} *`} type="date" value={orderDate} onChange={(event) => setOrderDate(event.target.value)} />
              <Input label={t('purchases.expectedDate')} type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} />
            </div>
          </FormSection>

          <FormSection
            title={t('purchases.items')}
            actions={
              <Button size="sm" variant="outline" icon={Plus} onClick={addLine}>
                {t('purchases.addItem')}
              </Button>
            }
          >
            <div className="space-y-2">
              {lines.map((line) => {
                const product = productMap.get(line.productId)
                return (
                  <div key={line.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                    <div className="flex min-w-56 flex-1 items-center gap-2">
                      {product ? <ProductImage product={product} size="sm" /> : null}
                      <Select
                        value={line.productId}
                        onChange={(event) => selectProduct(line.id, event.target.value)}
                        aria-label={t('products.productName')}
                      >
                        <option value="">{t('common.select')}</option>
                        {products.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} — {item.sku}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(event) => updateLine(line.id, { quantity: event.target.value })}
                      className="w-24"
                      aria-label={t('common.quantity')}
                    />
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.cost}
                        onChange={(event) => updateLine(line.id, { cost: event.target.value })}
                        className="w-28 pl-6"
                        aria-label={t('products.costPrice')}
                      />
                    </div>
                    <span className="w-28 text-right text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency((Number(line.quantity) || 0) * (Number(line.cost) || 0))}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeLine(line.id)} aria-label={t('common.remove')}>
                      <Trash2 size={15} aria-hidden="true" />
                    </Button>
                  </div>
                )
              })}
              {lines.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 py-8 text-slate-400 dark:border-slate-700">
                  <FileText size={20} aria-hidden="true" />
                  <p className="text-sm">{t('purchases.noItemsHint')}</p>
                </div>
              ) : null}
            </div>
          </FormSection>

          <FormSection title={t('common.notes')}>
            <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t('purchases.notesPlaceholder')} />
          </FormSection>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title={t('purchases.totals')} />
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t('purchases.subtotal')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t('purchases.discount')}</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    className="w-28"
                    aria-label={t('purchases.discount')}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t('purchases.tax')}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(tax)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('purchases.total')}</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/purchases')}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} loading={createPurchase.isPending} disabled={!canSubmit}>
              {t('purchases.create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
