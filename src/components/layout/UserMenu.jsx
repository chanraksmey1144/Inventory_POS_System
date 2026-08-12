import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import useAuthStore from '@/app/store/useAuthStore'
import useToastStore from '@/app/store/useToastStore'
import { authService } from '@/services/authService'
import Avatar from '@/components/ui/Avatar'
import Dropdown, { DropdownItem, DropdownDivider, DropdownLabel } from '@/components/ui/Dropdown'

export default function UserMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const toast = useToastStore()

  async function handleLogout() {
    await authService.logout()
    logout()
    toast.info(t('common.logout'))
    navigate('/login')
  }

  return (
    <Dropdown
      width="w-56"
      trigger={
        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Avatar name={user?.name || 'User'} size="sm" />
          <span className="hidden text-left md:block">
            <span className="block max-w-32 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {user?.name || 'User'}
            </span>
            <span className="block text-[11px] capitalize text-slate-400">{user?.role || ''}</span>
          </span>
          <ChevronDown size={14} className="hidden text-slate-400 md:block" aria-hidden="true" />
        </button>
      }
    >
      {() => (
        <>
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email || ''}</p>
          </div>
          <DropdownLabel>{t('profile.title')}</DropdownLabel>
          <DropdownItem icon={User} onClick={() => navigate('/profile')}>
            {t('nav.profile')}
          </DropdownItem>
          <DropdownItem icon={Settings} onClick={() => navigate('/settings')}>
            {t('nav.settings')}
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={LogOut} danger onClick={handleLogout}>
            {t('nav.logout')}
          </DropdownItem>
        </>
      )}
    </Dropdown>
  )
}
