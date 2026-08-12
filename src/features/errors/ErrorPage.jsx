import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FileQuestion, ShieldAlert, ServerCrash, WifiOff, Home, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

const CONFIGS = {
  404: {
    icon: FileQuestion,
    title: 'errors.notFound',
    hint: 'errors.notFoundHint',
  },
  403: {
    icon: ShieldAlert,
    title: 'errors.forbidden',
    hint: 'errors.forbiddenHint',
  },
  500: {
    icon: ServerCrash,
    title: 'errors.serverError',
    hint: 'errors.serverErrorHint',
  },
  network: {
    icon: WifiOff,
    title: 'errors.networkError',
    hint: 'errors.networkErrorHint',
  },
}

export default function ErrorPage({ code = 404 }) {
  const { t } = useTranslation()
  const config = CONFIGS[code] || CONFIGS[404]
  const Icon = config.icon

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon size={40} aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-slate-900 dark:text-slate-100">{code}</h1>
      <h2 className="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-200">{t(config.title)}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{t(config.hint)}</p>
      <div className="mt-8 flex gap-3">
        <Link to="/dashboard">
          <Button icon={Home}>{t('errors.goHome')}</Button>
        </Link>
        <Button variant="outline" icon={ArrowLeft} onClick={() => window.history.back()}>
          {t('errors.back')}
        </Button>
      </div>
    </div>
  )
}
