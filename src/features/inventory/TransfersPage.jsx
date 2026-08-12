import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRightLeft, Plus, Trash2, ArrowLeftRight } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useTransfers, useCreateTransfer } from '@/hooks/useInventory'
import { useProducts } from '@/hooks/useProducts'
import { useWarehouses } from '@/hooks/useAdmin'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDateTime, formatNumber, uid } from '@/lib/utils'
import { can } from '@/lib/permissions'
import { TRANSFER_STATUS } from '@/constants'

export default function TransfersPage() {
  const { t } = useTranslation()
  usePageTitle('inventory.transfersTitle')
  const toast = useToastStore()

  const transfersQuery = useTransfers()
  const createTransfer = useCreateTransfer()
  const productsQuery = useProducts({ page: 1, perPage: 1000 })
  const warehousesQuery = useWarehouses()

  const transfers = transfersQuery.data?.items || []
  const products = productsQuery.data?.items || []
  const warehouses = warehousesQuery.data?.items || []

  const [modalOpen, setModalOpen] = useState(false)
  const [sourceId, setSourceId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [lines, setLines] = useState([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const productMap = new Map(products.map((product) => [product.id, product]))

  const resetModal = () => {
    setSourceId('')
    setDestinationId('')
    setLines([])
    setNotes('')
  }

  const openModal = () => {
    setSourceId(warehouses[0]?.id || '')
    setDestinationId(warehouses[1]?.id || '')
    setLines([{ id: uid('line'), productId: '', quantity: '1' }])
    setNotes('')
    setModalOpen(true)
  }

  const addLine = () => setLines((current) => [...current, { id: uid('line'), productId: '', quantity: '1' }])

  const updateLine = (lineId, patch) =>
    setLines((current) => current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)))

  const removeLine = (lineId) => setLines((current) => current.filter((line) => line.id !== lineId))

  const validLines = lines.filter(
    (line) => line.productId && Number(line.quantity) > 0 && (productMap.get(line.productId)?.stock || 0) >= Number(line.quantity),
  )
  const canSubmit = sourceId && destinationId && sourceId !== destinationId && validLines.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const number = `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(4, '0')}`
      await createTransfer.mutateAsync({
        transferNumber: number,
        sourceWarehouseId: sourceId,
        destinationWarehouseId: destinationId,
        itemCount: validLines.length,
        status: TRANSFER_STATUS.REQUESTED,
        createdAt: new Date().toISOString(),
        createdBy: 'u-1',
        notes: notes.trim(),
      })
      toast.success(t('inventory.transferCompleted'))
      setModalOpen(false)
      resetModal()
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'transferNumber',
      header: t('inventory.transferNumber'),
      cell: (transfer) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
          {transfer.transferNumber}
        </span>
      ),
    },
    {
      key: 'route',
      header: t('inventory.route'),
      cell: (transfer) => {
        const source = warehouses.find((warehouse) => warehouse.id === transfer.sourceWarehouseId)?.name
        const destination = warehouses.find((warehouse) => warehouse.id === transfer.destinationWarehouseId)?.name
        return (
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span>{source || '—'}</span>
            <ArrowLeftRight size={14} className="text-slate-400" aria-hidden="true" />
            <span>{destination || '—'}</span>
          </span>
        )
      },
    },
    {
      key: 'itemCount',
      header: t('inventory.itemsCount'),
      align: 'right',
      cell: (transfer) => <span className="font-medium text-slate-700 dark:text-slate-200">{transfer.itemCount}</span>,
    },
    {
      key: 'status',
      header: t('inventory.transferStatus'),
      cell: (transfer) => <StatusBadge status={transfer.status} />,
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      cell: (transfer) => (
        <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDateTime(transfer.createdAt)}</span>
      ),
    },
    {
      key: 'notes',
      header: t('common.note'),
      cell: (transfer) => transfer.notes || <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('inventory.transfersTitle')}
        subtitle={t('inventory.transfersSubtitle')}
        breadcrumb={[{ label: t('nav.inventory') }, { label: t('nav.transfers') }]}
        actions={
          can('inventory.transfer') ? (
            <Button icon={Plus} onClick={openModal}>
              {t('inventory.newTransfer')}
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={transfers}
          loading={transfersQuery.isLoading}
          error={transfersQuery.isError ? t('errors.loadFailed') : null}
          onRetry={() => transfersQuery.refetch()}
          rowKey="id"
          emptyTitle={t('inventory.noTransfers')}
          emptyIcon={ArrowRightLeft}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('inventory.newTransfer')}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={!canSubmit}>
              {t('inventory.transferCompleted')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label={t('inventory.sourceWarehouse')} value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </Select>
            <Select
              label={t('inventory.destinationWarehouse')}
              value={destinationId}
              onChange={(event) => setDestinationId(event.target.value)}
            >
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('inventory.items')}</span>
              <Button size="sm" variant="outline" icon={Plus} onClick={addLine}>
                {t('inventory.addItem')}
              </Button>
            </div>
            <div className="space-y-2">
              {lines.map((line) => {
                const product = productMap.get(line.productId)
                return (
                  <div key={line.id}>
                    <div className="flex items-start gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                      <Select
                        value={line.productId}
                        onChange={(event) => updateLine(line.id, { productId: event.target.value })}
                        className="flex-1"
                      >
                        <option value="">{t('common.select')}</option>
                        {products.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} — {item.sku} ({formatNumber(item.stock)})
                          </option>
                        ))}
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(event) => updateLine(line.id, { quantity: event.target.value })}
                        className="w-24"
                        aria-label={t('common.quantity')}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(line.id)}
                        aria-label={t('common.remove')}
                        className="mt-0.5"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </Button>
                    </div>
                    {product && product.stock < Number(line.quantity) ? (
                      <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
                        {t('inventory.exceedsStock', { stock: formatNumber(product.stock) })}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          <Textarea
            label={t('common.note')}
            placeholder={t('inventory.transferNotePlaceholder')}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
          />
        </div>
      </Modal>
    </div>
  )
}
