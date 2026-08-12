import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Store } from 'lucide-react'
import AuthLayout from './AuthLayout'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import useAuthStore from '@/app/store/useAuthStore'
import useToastStore from '@/app/store/useToastStore'
import { authService } from '@/services/authService'
import { normalizeApiError } from '@/lib/errors'
import usePageTitle from '@/hooks/usePageTitle'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setSession } = useAuthStore()
  const toast = useToastStore()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@storemaster.com', password: 'password', rememberMe: true },
  })

  usePageTitle('auth.login')

  async function onSubmit(values) {
    setServerError('')
    try {
      const result = await authService.login(values)
      setSession(result)
      toast.success(t('toasts.success'), t('auth.login'))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(normalizeApiError(error))
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center lg:hidden">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Store size={24} aria-hidden="true" />
        </span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('auth.loginTitle')}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('auth.loginSubtitle')}</p>

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
          placeholder="demo@storemaster.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex items-center justify-between">
          <Checkbox label={t('auth.rememberMe')} {...register('rememberMe')} />
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          {t('auth.login')}
        </Button>
      </form>

      <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        {t('auth.demoHint')}
      </p>
    </AuthLayout>
  )
}
