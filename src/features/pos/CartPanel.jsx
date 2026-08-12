import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { User, Pause, Eraser, CreditCard, ShoppingBasket } from 'lucide-react'
import useCartStore from '@/app/store/useCartStore'
import CartItemRow from './CartItemRow'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Combobox from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'

export default function CartPanel({
  customers,
  onSelectCustomer,
  onHold,
  onClear,
  onPay,
  onOpenHeldSales,
  heldCount,
  activeItemIndex,
  onActivateItem,
}) {
  const { t } = useTranslation()
  const store = useCartStore()

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <ShoppingBasket size={16} className="text-emerald-600" aria-hidden="true" />
          {t('pos.cart')}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {store.getItemCount()}
          </span>
        </h2>
        <Button variant="ghost" size="sm" onClick={onOpenHeldSales}>
          <span className="relative mr-1 inline-flex">
            {t('pos.heldSales')}
            {heldCount > 0 ? (
              <span className="absolute -right-3 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                {heldCount}
              </span>
            ) : null}
          </span>
        </Button>
      </div>

      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <Combobox
          items={customers}
          value={store.customer?.id || null}
          onChange={(id) => onSelectCustomer(id)}
          placeholder={t('pos.selectCustomer')}
          icon={User}
          getLabel={(customer) => customer?.name}
          getSubLabel={(customer) => customer?.phone || customer?.email}
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {store.items.length === 0 ? (
          <EmptyState
            title={t('pos.emptyCart')}
            description={t('pos.emptyCartHint')}
            icon={ShoppingBasket}
          />
        ) : (
          store.items.map((item, index) => (
            <CartItemRow
              key={`${item.productId}-${item.variantId || 'base'}`}
              item={item}
              active={index === activeItemIndex}
              onActivate={() => onActivateItem(index)}
            />
          ))
        )}
      </div>

      <div className="space-y-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('pos.discountPercent')}
            type="number"
            min="0"
            max="100"
            value={store.discount}
            onChange={(event) => store.setDiscount(event.target.value)}
          />
          <Input
            label={t('pos.taxPercent')}
            type="number"
            min="0"
            max="100"
            value={store.tax}
            onChange={(event) => store.setTax(event.target.value)}
          />
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{t('pos.subtotal')}</span>
            <span>{formatCurrency(store.getSubtotal())}</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{t('pos.discount')}</span>
            <span>-{formatCurrency(store.getDiscountAmount())}</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{t('pos.tax')}</span>
            <span>{formatCurrency(store.getTaxAmount())}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 dark:border-slate-700">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{t('pos.total')}</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(store.getTotal())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="warning-outline" onClick={onHold} icon={Pause} disabled={store.items.length === 0}>
            {t('pos.hold')}
          </Button>
          <Button variant="outline" onClick={onClear} icon={Eraser} disabled={store.items.length === 0}>
            {t('pos.clear')}
          </Button>
          <Button onClick={onPay} icon={CreditCard} size="lg" disabled={store.items.length === 0} className="col-span-1">
            {t('pos.payNow')}
          </Button>
        </div>
      </div>
    </div>
  )
}

CartPanel.propTypes = {
  customers: PropTypes.array,
  onSelectCustomer: PropTypes.func,
  onHold: PropTypes.func,
  onClear: PropTypes.func,
  onPay: PropTypes.func,
  onOpenHeldSales: PropTypes.func,
  heldCount: PropTypes.number,
  activeItemIndex: PropTypes.number,
  onActivateItem: PropTypes.func,
}
