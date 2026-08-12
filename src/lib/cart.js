export const DEFAULT_TAX_RATE = 10
export const DEFAULT_DISCOUNT = 0

export function cartItemSubtotal(item) {
  return (Number(item.price) || 0) * (Number(item.quantity) || 0)
}

export function cartItemDiscount(item) {
  return cartItemSubtotal(item) * (Number(item.discount) || 0) / 100
}

export function cartItemTaxable(item) {
  return cartItemSubtotal(item) - cartItemDiscount(item)
}

export function cartItemTax(item) {
  return cartItemTaxable(item) * (Number(item.tax) || 0) / 100
}

export function cartItemTotal(item) {
  return cartItemTaxable(item) + cartItemTax(item)
}

export function cartSubtotal(items) {
  return items.reduce((sum, item) => sum + cartItemSubtotal(item), 0)
}

export function cartDiscount(items) {
  return items.reduce((sum, item) => sum + cartItemDiscount(item), 0)
}

export function cartTax(items) {
  return items.reduce((sum, item) => sum + cartItemTax(item), 0)
}

export function cartTotal(items) {
  return items.reduce((sum, item) => sum + cartItemTotal(item), 0)
}

export function orderDiscountAmount(subtotal, discountPercent) {
  return subtotal * (Number(discountPercent) || 0) / 100
}

export function orderTaxAmount(subtotal, discountPercent, taxPercent) {
  const afterDiscount = subtotal - orderDiscountAmount(subtotal, discountPercent)
  return afterDiscount * (Number(taxPercent) || 0) / 100
}

export function orderTotal(subtotal, discountPercent, taxPercent) {
  const discount = orderDiscountAmount(subtotal, discountPercent)
  const afterDiscount = subtotal - discount
  const tax = orderTaxAmount(subtotal, discountPercent, taxPercent)
  return afterDiscount + tax
}

export function changeDue(total, received) {
  const value = Number(received || 0) - Number(total || 0)
  return value > 0 ? value : 0
}

export function remainingBalance(total, paid) {
  const value = Number(total || 0) - Number(paid || 0)
  return value > 0 ? value : 0
}

export function buildCartItem(product, { variant = null, quantity = 1 } = {}) {
  const price = variant ? variant.price : product.price
  return {
    productId: product.id,
    variantId: variant ? variant.id : null,
    name: variant ? `${product.name} (${variant.name})` : product.name,
    sku: variant ? variant.sku : product.sku,
    barcode: variant ? variant.barcode : product.barcode,
    price: Number(price) || 0,
    cost: Number(variant ? variant.cost : product.cost) || 0,
    quantity,
    discount: 0,
    tax: product.tax ?? DEFAULT_TAX_RATE,
    stock: variant ? variant.stock : product.stock,
    image: product.image || null,
  }
}
