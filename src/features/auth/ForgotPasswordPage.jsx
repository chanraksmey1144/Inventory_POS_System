import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MailCheck } from 'lucide-react'
import AuthLayout from './AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { authService } from '@/services/authService'
import { normalizeApiError } from '@/lib/errors'
import usePageTitle from '@/hooks/usePageTitle'

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } })

  usePageTitle('auth.forgotTitle')

  async function onSubmit(values) {
    setServerError('')
    try {
      await authService.forgotPassword(values)
      setSent(true)
    } catch (error) {
      setServerError(normalizeApiError(error))
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('auth.forgotTitle')}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('auth.forgotSubtitle')}</p>

      {sent ? (
        <div className="mt-6">
          <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center dark:border-emerald-900 dark:bg-emerald-500/10">
            <MailCheck size={40} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
              {t('auth.resetLinkSent')}
            </p>
            <Link to="/login" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
              <ArrowLeft size={14} aria-hidden="true" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {serverError ? (
            <div className="mt-5">
              <Alert variant="error" title={t('toasts.error')}>
                {serverError}
              </Alert>
            </div>
          ) : null}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              {t('auth.sendResetLink')}
            </Button>
          </form>
        </>
      )}

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {t('auth.backToLogin')}
      </Link>
    </AuthLayout>
  )
}
