import { useTranslation } from 'react-i18next'
import { Languages, Check } from 'lucide-react'
import { LANGUAGES } from '@/constants'
import { setLanguage, getLanguage } from '@/app/providers/i18n'
import Dropdown, { DropdownItem, DropdownLabel } from '@/components/ui/Dropdown'

export default function LanguageSelector() {
  const { t } = useTranslation()
  const current = getLanguage()

  return (
    <Dropdown
      width="w-44"
      trigger={
        <button
          type="button"
          aria-label={t('settings.language')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Languages size={18} aria-hidden="true" />
          <span className="hidden text-sm font-medium sm:inline">{current.toUpperCase()}</span>
        </button>
      }
    >
      {() => (
        <>
          <DropdownLabel>{t('settings.language')}</DropdownLabel>
          {LANGUAGES.map((language) => (
            <DropdownItem
              key={language.code}
              onClick={() => setLanguage(language.code)}
              className={current === language.code ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : ''}
            >
              <span className="flex-1">{language.label}</span>
              {current === language.code ? <Check size={14} aria-hidden="true" /> : null}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  )
}
