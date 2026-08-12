import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Barcode, ShoppingBag } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useCustomers, useCreateSale } from '@/hooks/useSales'
import useIsMobile from '@/hooks/useIsMobile'
import useCartStore from '@/app/store/useCartStore'
import useToastStore from '@/app/store/useToastStore'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'
import CartPanel from './CartPanel'
import PaymentModal from './PaymentModal'
import ReceiptModal from './ReceiptModal'
import HeldSalesModal from './HeldSalesModal'
import VariantPicker from './VariantPicker'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'

export default function POSPage() {
  const { t } = useTranslation()
  usePageTitle('nav.pos')

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [variantProduct, setVariantProduct] = useState(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptSale, setReceiptSale] = useState(null)
  const [heldSalesOpen, setHeldSalesOpen] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState(-1)
  const [cartVisible, setCartVisible] = useState(false)
  const searchInputRef = useRef(null)
  const isMobile = useIsMobile()

  const cartItems = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const heldSales = useCartStore((state) => state.heldSales)
  const store = useCartStore()

  const toast = useToastStore()
  const createSale = useCreateSale()

  const productsQuery = useProducts({ perPage: 100, status: 'active' })
  const categoriesQuery = useCategories()
  const customersQuery = useCustomers({ perPage: 100 })

  const products = productsQuery.data?.items || []
  const categories = categoriesQuery.data?.items || []
  const customers = customersQuery.data?.items || []

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = !categoryId || product.categoryId === categoryId
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        (product.barcode || '').includes(query)
      return matchesCategory && matchesSearch
    })
  }, [products, search, categoryId])

  const handleAdd = (product) => {
    if (product.stock === 0) return
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product)
      return
    }
    addItem(product, { quantity: 1 })
    const index = useCartStore
      .getState()
      .items.findIndex(
        (item) => item.productId === product.id && item.variantId === null,
      )
    setActiveItemIndex(index >= 0 ? index : cartItems.length)
    if (isMobile) setCartVisible(true)
  }

  const handleBarcodeAdd = async (barcode) => {
    const query = barcode.trim()
    if (!query) return
    const result = await productsQuery.refetch().catch(() => null)
    const all = result?.data?.items || products
    const match = all.find((product) => product.barcode === query)
    if (match) {
      handleAdd(match)
      toast.success(`${match.name} ${t('pos.productAdded')}`)
    } else {
      toast.error(t('pos.productNotFound'))
    }
  }

  const handleHold = () => {
    if (cartItems.length === 0) return
    store.holdSale()
    toast.info(t('pos.saleHold'))
  }

  const handleClear = () => {
    store.clearCart()
    setActiveItemIndex(-1)
    toast.info(t('pos.cartCleared'))
  }

  const handlePay = () => {
    if (cartItems.length > 0) setPaymentOpen(true)
  }

  const handleComplete = async (salePayload) => {
    const sale = await createSale.mutateAsync(salePayload)
    return sale
  }

  const handleSelectCustomer = (customerId) => {
    const customer = customers.find((item) => item.id === customerId)
    store.setCustomer(customer || null)
  }

  const removeActiveItem = () => {
    const item = cartItems[activeItemIndex]
    if (!item) return
    store.removeItem(item.productId, item.variantId)
    setActiveItemIndex((index) =>
      Math.min(Math.max(index - 1, 0), cartItems.length - 2),
    )
  }

  const handleKeyDown = (event) => {
    const target = event.target
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable

    if (event.key === 'F2') {
      event.preventDefault()
      searchInputRef.current?.focus()
      return
    }
    if (event.key === 'F4') {
      event.preventDefault()
      setHeldSalesOpen(true)
      return
    }
    if (event.key === 'F6') {
      event.preventDefault()
      handleHold()
      return
    }
    if (event.key === 'F8') {
      event.preventDefault()
      handlePay()
      return
    }
    if (isTyping) return

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      removeActiveItem()
      return
    }
    if (event.key === 'ArrowUp' && cartItems.length > 0) {
      event.preventDefault()
      setActiveItemIndex((index) => (index <= 0 ? cartItems.length - 1 : index - 1))
      return
    }
    if (event.key === 'ArrowDown' && cartItems.length > 0) {
      event.preventDefault()
      setActiveItemIndex((index) => (index >= cartItems.length - 1 ? 0 : index + 1))
      return
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const loading = productsQuery.isLoading || categoriesQuery.isLoading
  const error = productsQuery.isError || categoriesQuery.isError

  const renderProductArea = () => (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex gap-2">
        <Input
          ref={searchInputRef}
          rightIcon={Search}
          placeholder={`${t('pos.searchPlaceholder')} (F2)`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Input
          rightIcon={Barcode}
          placeholder={t('pos.scanBarcode')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleBarcodeAdd(event.target.value)
              event.target.value = ''
            }
          }}
          className="hidden max-w-52 sm:block"
        />
      </div>

      <CategoryFilter
        categories={categories}
        active={categoryId}
        onSelect={setCategoryId}
      />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState
          title={t('errors.loadFailed')}
          onRetry={() => {
            productsQuery.refetch()
            categoriesQuery.refetch()
          }}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title={t('pos.noProducts')}
          description={t('pos.noProductsHint')}
          icon={ShoppingBag}
        />
      ) : (
        <div className="grid flex-1 auto-rows-min grid-cols-2 gap-2.5 overflow-y-auto pb-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  )

  const renderCart = () => (
    <CartPanel
      customers={customers}
      onSelectCustomer={handleSelectCustomer}
      onHold={handleHold}
      onClear={handleClear}
      onPay={handlePay}
      onOpenHeldSales={() => setHeldSalesOpen(true)}
      heldCount={heldSales.length}
      activeItemIndex={activeItemIndex}
      onActivateItem={setActiveItemIndex}
    />
  )

  return (
    <>
      <div className="flex h-full min-h-0 gap-4">
        <div className={isMobile && cartVisible ? 'hidden' : 'min-w-0 flex-1'}>
          {renderProductArea()}
        </div>
        <div className={isMobile ? 'fixed inset-0 z-40 bg-white p-3 dark:bg-slate-950' : 'hidden w-[360px] shrink-0 xl:block'}>
          {renderCart()}
        </div>
      </div>

      {isMobile ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 print:hidden">
          <button
            type="button"
            onClick={() => setCartVisible((visible) => !visible)}
            className="flex w-full items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
          >
            <span>
              {cartVisible ? t('pos.backToProducts') : `${store.getItemCount()} ${t('pos.items')}`}
            </span>
            <span>{formatCurrency(store.getTotal())}</span>
          </button>
        </div>
      ) : null}

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onComplete={handleComplete}
        onOpenReceipt={(sale) => setReceiptSale(sale)}
      />
      <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
      <HeldSalesModal open={heldSalesOpen} onClose={() => setHeldSalesOpen(false)} />
      <VariantPicker product={variantProduct} onClose={() => setVariantProduct(null)} />
    </>
  )
}
