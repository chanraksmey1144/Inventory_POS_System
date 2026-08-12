import { create } from 'zustand'
import {
  buildCartItem,
  cartItemTax,
  cartItemTotal,
  cartSubtotal,
  cartTotal,
  orderDiscountAmount,
  orderTaxAmount,
  orderTotal,
} from '@/lib/cart'

const DEFAULT_DISCOUNT = 0
const DEFAULT_TAX = 10

const useCartStore = create((set, get) => ({
  items: [],
  customer: null,
  discount: DEFAULT_DISCOUNT,
  tax: DEFAULT_TAX,
  payment: null,
  heldSales: [],

  addItem(product, options = {}) {
    const item = buildCartItem(product, options)
    const existingIndex = get().items.findIndex(
      (cartItem) =>
        cartItem.productId === item.productId && cartItem.variantId === item.variantId,
    )

    if (existingIndex >= 0) {
      const items = [...get().items]
      const existing = items[existingIndex]
      const maxStock = existing.stock
      items[existingIndex] = {
        ...existing,
        quantity: Math.min(existing.quantity + item.quantity, maxStock > 0 ? maxStock : Infinity),
      }
      set({ items })
    } else {
      set({ items: [...get().items, item] })
    }
  },

  setQuantity(productId, variantId, quantity) {
    set({
      items: get().items.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          const qty = Math.max(1, Number(quantity) || 1)
          const maxStock = item.stock
          return { ...item, quantity: Math.min(qty, maxStock > 0 ? maxStock : qty) }
        }
        return item
      }),
    })
  },

  increment(productId, variantId) {
    const item = get().items.find(
      (cartItem) => cartItem.productId === productId && cartItem.variantId === variantId,
    )
    if (item) get().setQuantity(productId, variantId, item.quantity + 1)
  },

  decrement(productId, variantId) {
    const item = get().items.find(
      (cartItem) => cartItem.productId === productId && cartItem.variantId === variantId,
    )
    if (item) {
      if (item.quantity <= 1) {
        get().removeItem(productId, variantId)
      } else {
        get().setQuantity(productId, variantId, item.quantity - 1)
      }
    }
  },

  removeItem(productId, variantId) {
    set({
      items: get().items.filter(
        (item) => !(item.productId === productId && item.variantId === variantId),
      ),
    })
  },

  clearCart() {
    set({ items: [], customer: null, discount: DEFAULT_DISCOUNT, tax: DEFAULT_TAX, payment: null })
  },

  setCustomer(customer) {
    set({ customer })
  },

  setDiscount(discount) {
    set({ discount: Number(discount) || 0 })
  },

  setTax(tax) {
    set({ tax: Number(tax) || 0 })
  },

  setPayment(payment) {
    set({ payment })
  },

  holdSale() {
    const state = get()
    if (state.items.length === 0) return
    const subtotal = cartSubtotal(state.items)
    const total = orderTotal(subtotal, state.discount, state.tax)
    const heldSale = {
      id: `HOLD-${Date.now().toString(36).toUpperCase()}`,
      customer: state.customer,
      items: state.items,
      discount: state.discount,
      tax: state.tax,
      total,
      createdAt: new Date().toISOString(),
    }
    set({ heldSales: [...state.heldSales, heldSale] })
    get().clearCart()
  },

  resumeSale(heldSale) {
    set({
      items: heldSale.items,
      customer: heldSale.customer,
      discount: heldSale.discount,
      tax: heldSale.tax,
      payment: null,
      heldSales: get().heldSales.filter((sale) => sale.id !== heldSale.id),
    })
  },

  deleteHeldSale(heldSaleId) {
    set({ heldSales: get().heldSales.filter((sale) => sale.id !== heldSaleId) })
  },

  clearPayment() {
    set({ payment: null })
  },

  // Derived values
  getSubtotal() {
    return cartSubtotal(get().items)
  },
  getDiscountAmount() {
    return orderDiscountAmount(cartSubtotal(get().items), get().discount)
  },
  getTaxAmount() {
    const subtotal = cartSubtotal(get().items)
    return orderTaxAmount(subtotal, get().discount, get().tax)
  },
  getTotal() {
    return orderTotal(cartSubtotal(get().items), get().discount, get().tax)
  },
  getItemCount() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
  getItemSubtotal(item) {
    return item.price * item.quantity
  },
  getItemTax(item) {
    return cartItemTax(item)
  },
  getItemTotal(item) {
    return cartItemTotal(item)
  },
}))

export default useCartStore
