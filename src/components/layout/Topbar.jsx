import { useTranslation } from 'react-i18next'
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import useSidebarStore from '@/app/store/useSidebarStore'
import NotificationCenter from './NotificationCenter'
import LanguageSelector from './LanguageSelector'
import ThemeSelector from './ThemeSelector'
import UserMenu from './UserMenu'
import Tooltip from '@/components/ui/Tooltip'

export default function Topbar({ onOpenSearch }) {
  const { t } = useTranslation()
  const { collapsed, toggleCollapsed, setMobileOpen } = useSidebarStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <Tooltip label={collapsed ? t('nav.expand') : t('nav.collapse')} side="bottom">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:inline-flex"
        >
          {collapsed ? <PanelLeftOpen size={19} aria-hidden="true" /> : <PanelLeftClose size={19} aria-hidden="true" />}
        </button>
      </Tooltip>

      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden h-9 w-full max-w-md items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-slate-600 sm:flex"
      >
        <Search size={15} aria-hidden="true" />
        <span className="flex-1 text-left">{t('search.placeholder')}</span>
        <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label={t('search.placeholder')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:hidden"
        >
          <Search size={18} aria-hidden="true" />
        </button>
        <NotificationCenter />
        <LanguageSelector />
        <ThemeSelector />
        <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden="true" />
        <UserMenu />
      </div>
    </header>
  )
}
