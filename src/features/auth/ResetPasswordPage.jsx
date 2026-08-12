import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, KeyRound } from 'lucide-react'
import AuthLayout from './AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import useToastStore from '@/app/store/useToastStore'
import { authService } from '@/services/authService'
import { normalizeApiError } from '@/lib/errors'
import usePageTitle from '@/hooks/usePageTitle'

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToastStore()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetSchema), defaultValues: { password: '', confirmPassword: '' } })

  usePageTitle('auth.resetTitle')

  async function onSubmit(values) {
    setServerError('')
    try {
      await authService.resetPassword(values)
      toast.success(t('profile.passwordChanged'))
      navigate('/login')
    } catch (error) {
      setServerError(normalizeApiError(error))
    }
  }

  return (
    <AuthLayout>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        <KeyRound size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{t('auth.resetTitle')}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('auth.resetSubtitle')}</p>

      {serverError ? (
        <div className="mt-5">
          <Alert variant="error" title={t('toasts.error')}>
            {serverError}
          </Alert>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label={t('auth.newPassword')}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label={t('auth.confirmPassword')}
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          {t('auth.resetPassword')}
        </Button>
      </form>

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
