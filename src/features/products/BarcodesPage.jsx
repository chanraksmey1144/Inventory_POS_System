import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, RefreshCw, Barcode } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useProducts } from '@/hooks/useProducts'
import { productService } from '@/services/productService'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ProductImage from '@/components/ui/ProductImage'
import Spinner from '@/components/ui/Spinner'

function generateBarcode() {
  let code = '899'
  for (let i = 0; i < 10; i += 1) code += Math.floor(Math.random() * 10)
  return code
}

export default function BarcodesPage() {
  const { t } = useTranslation()
  usePageTitle('barcodes.title')

  const toast = useToastStore()
  const productsQuery = useProducts({ perPage: 100 })
  const products = productsQuery.data?.items || []

  const [search, setSearch] = useState('')
  const [generating, setGenerating] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.barcode || '').includes(term),
    )
  }, [products, search])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      for (const product of filtered) {
        if (!product.barcode) {
          await productService.update(product.id, { barcode: generateBarcode() })
        }
      }
      toast.success(t('barcodes.generated'))
      productsQuery.refetch()
    } finally {
      setGenerating(false)
    }
  }

  const handlePrint = () => {
    toast.info(t('barcodes.printed'))
    setTimeout(() => window.print(), 200)
  }

  return (
    <div>
      <PageHeader
        title={t('barcodes.title')}
        subtitle={t('barcodes.subtitle')}
        breadcrumb={[{ label: t('nav.barcodes') }]}
        actions={
          <>
            <Button variant="outline" icon={RefreshCw} onClick={handleGenerate} loading={generating}>
              {t('barcodes.generate')}
            </Button>
            <Button icon={Printer} onClick={handlePrint}>
              {t('barcodes.print')}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <Input
            placeholder={t('barcodes.scanToSearch')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-64"
          />
          <span className="ml-auto text-sm text-slate-400">
            {filtered.length} {t('pos.items')}
          </span>
        </div>

        <div className="receipt-print-area bg-white p-6 dark:bg-slate-950">
          {productsQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 p-4 text-center print:border-slate-400 dark:border-slate-700"
                >
                  <ProductImage product={product} size="sm" />
                  <p className="line-clamp-2 min-h-8 text-xs font-medium text-slate-800 dark:text-slate-100">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{product.sku}</p>
                  <div className="rounded bg-white p-1.5 dark:bg-slate-900">
                    <Barcode size={110} className="text-slate-900 dark:text-slate-100" aria-hidden="true" />
                    <p className="mt-0.5 font-mono text-[10px] font-semibold tracking-widest text-slate-800 dark:text-slate-100">
                      {product.barcode || '--------'}
                    </p>
                  </div>
                  {product.barcode ? null : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      {t('barcodes.missing')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
