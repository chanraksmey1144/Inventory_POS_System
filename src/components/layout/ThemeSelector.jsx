import { useState } from 'react'
import PropTypes from 'prop-types'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useThemeStore from '@/app/store/useThemeStore'
import Dropdown, { DropdownItem, DropdownDivider, DropdownLabel } from '@/components/ui/Dropdown'

const OPTIONS = [
  { key: 'light', label: 'settings.light', icon: Sun },
  { key: 'dark', label: 'settings.dark', icon: Moon },
  { key: 'system', label: 'settings.system', icon: Monitor },
]

export default function ThemeSelector({ compact = false }) {
  const { t } = useTranslation()
  const { theme, setTheme } = useThemeStore()

  const current = OPTIONS.find((option) => option.key === theme) || OPTIONS[2]

  return (
    <Dropdown
      width="w-48"
      trigger={
        <button
          type="button"
          aria-label={t('settings.appearance')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {theme === 'dark' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
        </button>
      }
    >
      {() => (
        <>
          <DropdownLabel>{t('settings.appearance')}</DropdownLabel>
          {OPTIONS.map((option) => (
            <DropdownItem
              key={option.key}
              icon={option.icon}
              onClick={() => setTheme(option.key)}
              className={theme === option.key ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : ''}
            >
              {t(option.label)}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  )
}

ThemeSelector.propTypes = { compact: PropTypes.bool }
