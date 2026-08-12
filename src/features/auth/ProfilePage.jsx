import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/app/store/useAuthStore'
import useToastStore from '@/app/store/useToastStore'
import { authService } from '@/services/authService'
import { normalizeApiError } from '@/lib/errors'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import FormSection from '@/components/ui/FormSection'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Alert from '@/components/ui/Alert'
import usePageTitle from '@/hooks/usePageTitle'

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'At least 6 characters'),
    newPassword: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string().min(6, 'At least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, setUser } = useAuthStore()
  const toast = useToastStore()

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  usePageTitle('profile.title')

  async function onSaveProfile(values) {
    try {
      setUser({ ...user, ...values })
      toast.success(t('profile.profileUpdated'))
    } catch (error) {
      toast.error(normalizeApiError(error))
    }
  }

  async function onChangePassword(values) {
    try {
      await authService.changePassword(values)
      toast.success(t('profile.passwordChanged'))
      passwordForm.reset()
    } catch (error) {
      passwordForm.setError('currentPassword', { message: normalizeApiError(error) })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('profile.title')} breadcrumb={[{ label: t('profile.title') }]} />

      <div className="space-y-6">
        <Card>
          <CardBody className="flex items-center gap-4">
            <Avatar name={user?.name} size="lg" />
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
            <div className="ml-auto hidden flex-col items-end gap-1 sm:flex">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {user?.role || '—'}
              </span>
              <span className="text-xs text-slate-400">{t('profile.branch')}: Main Branch</span>
            </div>
          </CardBody>
        </Card>

        <FormSection title={t('profile.title')} description={t('common.updatedAt')}>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Input
              label={t('common.name')}
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
            <Input
              label={t('auth.email')}
              type="email"
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register('email')}
            />
            <Input
              label={t('profile.phone')}
              error={profileForm.formState.errors.phone?.message}
              {...profileForm.register('phone')}
            />
            <div className="flex items-end">
              <Button type="submit" loading={profileForm.formState.isSubmitting} className="w-full sm:w-auto">
                {t('common.saveChanges')}
              </Button>
            </div>
          </form>
        </FormSection>

        <FormSection title={t('profile.changePassword')}>
          <Alert variant="info" className="mb-4">
            {t('auth.demoHint')}
          </Alert>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Input
              label={t('profile.currentPassword')}
              type="password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <Input
              label={t('profile.newPassword')}
              type="password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
            <div className="flex items-end">
              <Button type="submit" variant="outline" loading={passwordForm.formState.isSubmitting}>
                {t('profile.changePassword')}
              </Button>
            </div>
          </form>
        </FormSection>
      </div>
    </div>
  )
}
