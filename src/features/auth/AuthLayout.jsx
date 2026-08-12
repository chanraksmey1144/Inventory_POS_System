import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Store, ShoppingCart, Package, TrendingUp } from 'lucide-react'

export default function AuthLayout({ children }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <Store size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-bold">{t('app.name')}</p>
            <p className="text-xs text-emerald-200">{t('app.tagline')}</p>
          </div>
        </div>

        <div>
          <h1 className="max-w-md text-3xl font-bold leading-tight">
            Run your retail business from one powerful system
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-100">
            Inventory, point of sale, purchases, sales, reports and staff management — all in one
            place, ready for any store size.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { icon: ShoppingCart, label: 'POS' },
              { icon: Package, label: 'Inventory' },
              { icon: TrendingUp, label: 'Reports' },
            ].map((feature) => (
              <div key={feature.label} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <feature.icon size={20} className="text-emerald-200" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-emerald-200">
          © {new Date().getFullYear()} {t('app.name')}. All rights reserved.
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}

AuthLayout.propTypes = {
  children: PropTypes.node,
}
