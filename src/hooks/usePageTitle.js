import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function usePageTitle(key) {
  const { t } = useTranslation()
  useEffect(() => {
    const page = key ? t(key) : null
    document.title = page ? `${page} · ${t('app.name')}` : t('app.name')
  }, [key, t])
}
