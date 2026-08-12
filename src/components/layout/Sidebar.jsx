import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Store } from 'lucide-react'
import { NAVIGATION } from '@/constants/navigation'
import { can } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import useSidebarStore from '@/app/store/useSidebarStore'

function NavItem({ item, collapsed, onNavigate, depth = 0 }) {
  const { t } = useTranslation()
  const location = useLocation()
  const [expanded, setExpanded] = useState(
    () => item.children?.some((child) => location.pathname.startsWith(child.path)) || false,
  )

  useEffect(() => {
    if (item.children?.some((child) => location.pathname.startsWith(child.path))) {
      setExpanded(true)
    }
  }, [location.pathname, item.children])

  const hasChildren = item.children?.length > 0
  const isActive = item.children
    ? item.children.some((child) => location.pathname.startsWith(child.path))
    : location.pathname === item.path

  if (collapsed && hasChildren) {
    return (
      <Link
        to={item.children[0].path}
        onClick={onNavigate}
        title={t(item.label)}
        className={cn(
          'flex items-center justify-center rounded-lg p-2.5 transition-colors',
          isActive
            ? 'bg-emerald-600 text-white'
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        )}
      >
        <item.icon size={20} aria-hidden="true" />
      </Link>
    )
  }

  return (
    <div>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
          )}
        >
          <item.icon size={18} className="shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-left">{t(item.label)}</span>
          <ChevronDown
            size={15}
            className={cn('shrink-0 text-slate-400 transition-transform', expanded && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      ) : (
        <Link
          to={item.path}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
          )}
        >
          <item.icon size={18} className="shrink-0" aria-hidden="true" />
          {!collapsed ? <span className="truncate">{t(item.label)}</span> : null}
        </Link>
      )}

      {hasChildren && expanded && !collapsed ? (
        <div className="mt-1 space-y-1 pl-4">
          {item.children.map((child) => {
            if (child.permission && !can(child.permission)) return null
            const childActive = location.pathname.startsWith(child.path)
            return (
              <Link
                key={child.key}
                to={child.path}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-2 rounded-lg border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors',
                  childActive
                    ? 'border-emerald-500 bg-emerald-50/60 font-medium text-emerald-700 dark:bg-emerald-500/5 dark:text-emerald-300'
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                )}
              >
                <span className="truncate">{t(child.label)}</span>
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
  collapsed: PropTypes.bool,
  onNavigate: PropTypes.func,
  depth: PropTypes.number,
}

export default function Sidebar({ mobile = false }) {
  const { t } = useTranslation()
  const { collapsed, mobileOpen, setMobileOpen } = useSidebarStore()
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, setMobileOpen])

  const content = (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800', collapsed && !mobile && 'justify-center px-2')}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Store size={18} aria-hidden="true" />
        </span>
        {!collapsed || mobile ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{t('app.name')}</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">{t('app.tagline')}</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {NAVIGATION.map((group, index) => {
          const items = group.items.filter(
            (item) => !item.permission || can(item.permission),
          )
          if (items.length === 0) return null

          return (
            <div key={index}>
              {group.section && !collapsed ? (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {t(group.section)}
                </p>
              ) : null}
              <div className="space-y-1">
                {items.map((item) => (
                  <NavItem
                    key={item.key}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={() => mobile && setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </div>
  )

  if (mobile) {
    return (
      <>
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl dark:bg-slate-900">
              {content}
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-900 lg:block',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {content}
    </aside>
  )
}
