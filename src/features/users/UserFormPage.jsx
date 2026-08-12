import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import usePageTitle from '@/hooks/usePageTitle'
import { useUsers, useRoles, useBranches, useCreateUser, useUpdateUser } from '@/hooks/useAdmin'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import FormSection from '@/components/ui/FormSection'
import Spinner from '@/components/ui/Spinner'
import { normalizeApiError } from '@/lib/errors'

const userSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Required'),
  branchId: z.string().optional(),
  status: z.string(),
})

const DEFAULTS = {
  name: '',
  email: '',
  phone: '',
  role: '',
  branchId: '',
  status: 'active',
}

export default function UserFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  usePageTitle(isEdit ? 'users.edit' : 'users.create')

  const toast = useToastStore()
  const usersQuery = useUsers({ page: 1, perPage: 1000 })
  const rolesQuery = useRoles()
  const branchesQuery = useBranches()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: DEFAULTS,
  })

  const editingUser = isEdit ? usersQuery.data?.items?.find((user) => user.id === id) : null
  const isLoading = isEdit && (usersQuery.isLoading || !editingUser)

  useEffect(() => {
    if (!editingUser) return
    reset({
      name: editingUser.name,
      email: editingUser.email,
      phone: editingUser.phone || '',
      role: editingUser.role,
      branchId: editingUser.branchId || '',
      status: editingUser.status,
    })
  }, [editingUser, reset])

  const roles = rolesQuery.data?.items || []
  const branches = branchesQuery.data?.items || []

  async function onSubmit(values) {
    setServerError('')
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      role: values.role,
      branchId: values.branchId || undefined,
      status: values.status,
    }
    try {
      if (isEdit) {
        await updateUser.mutateAsync({ id, ...payload })
        toast.success(t('users.updated'))
      } else {
        await createUser.mutateAsync(payload)
        toast.success(t('users.created'))
      }
      navigate('/users', { replace: true })
    } catch (error) {
      setServerError(normalizeApiError(error))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isEdit ? t('users.edit') : t('users.create')}
        breadcrumb={[
          { label: t('nav.users'), to: '/users' },
          { label: isEdit ? t('users.edit') : t('users.create') },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/users')}>
            {t('common.cancel')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError ? (
          <div
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
            role="alert"
          >
            {serverError}
          </div>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeader title={t('users.basicInfo')} />
          <CardBody>
            <FormSection title={t('users.basicInfo')}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label={`${t('users.fullName')} *`} error={errors.name?.message} {...register('name')} />
                <Input label={`${t('common.email')} *`} type="email" error={errors.email?.message} {...register('email')} />
                <Input label={t('common.phone')} error={errors.phone?.message} {...register('phone')} />
                <Select label={`${t('users.role')} *`} error={errors.role?.message} {...register('role')}>
                  <option value="">{t('common.select')}</option>
                  {roles.map((role) => (
                    <option key={role.key} value={role.key}>
                      {role.name}
                    </option>
                  ))}
                </Select>
                <Select label={t('users.branch')} {...register('branchId')}>
                  <option value="">{t('common.none')}</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Select>
                <Select label={`${t('common.status')} *`} {...register('status')}>
                  <option value="active">{t('common.active')}</option>
                  <option value="inactive">{t('common.inactive')}</option>
                </Select>
              </div>
            </FormSection>
          </CardBody>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/users')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
