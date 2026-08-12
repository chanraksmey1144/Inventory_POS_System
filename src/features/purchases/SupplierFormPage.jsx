import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import usePageTitle from '@/hooks/usePageTitle'
import { useSupplier, useCreateSupplier, useUpdateSupplier } from '@/hooks/usePurchases'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import FormSection from '@/components/ui/FormSection'
import Spinner from '@/components/ui/Spinner'
import { normalizeApiError } from '@/lib/errors'

const supplierSchema = z.object({
  name: z.string().min(1, 'Required'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  status: z.string(),
})

const DEFAULTS = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  taxNumber: '',
  address: '',
  status: 'active',
}

export default function SupplierFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  usePageTitle(isEdit ? 'suppliers.edit' : 'suppliers.create')

  const toast = useToastStore()
  const supplierQuery = useSupplier(id)
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()

  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: DEFAULTS,
  })

  useEffect(() => {
    if (!isEdit) return
    if (!supplierQuery.data) return
    const supplier = supplierQuery.data
    reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      taxNumber: supplier.taxNumber || '',
      address: supplier.address || '',
      status: supplier.status,
    })
  }, [isEdit, supplierQuery.data, reset])

  async function onSubmit(values) {
    setServerError('')
    const payload = {
      name: values.name.trim(),
      contactPerson: values.contactPerson?.trim() || undefined,
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      taxNumber: values.taxNumber?.trim() || undefined,
      address: values.address?.trim() || undefined,
      status: values.status,
    }
    try {
      if (isEdit) {
        const updated = await updateSupplier.mutateAsync({ id, data: payload })
        toast.success(t('suppliers.updated'))
        navigate(`/suppliers/${updated.id}`, { replace: true })
      } else {
        const created = await createSupplier.mutateAsync(payload)
        toast.success(t('suppliers.created'))
        navigate(`/suppliers/${created.id}`, { replace: true })
      }
    } catch (error) {
      setServerError(normalizeApiError(error))
    }
  }

  if (isEdit && supplierQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isEdit ? t('suppliers.edit') : t('suppliers.create')}
        breadcrumb={[
          { label: t('nav.suppliers'), to: '/suppliers' },
          { label: isEdit ? t('suppliers.edit') : t('suppliers.create') },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(isEdit ? `/suppliers/${id}` : '/suppliers')}>
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
          <CardHeader title={t('suppliers.basicInfo')} />
          <CardBody>
            <FormSection title={t('suppliers.basicInfo')}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={`${t('suppliers.company')} *`}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label={t('suppliers.contactPerson')}
                  error={errors.contactPerson?.message}
                  {...register('contactPerson')}
                />
                <Input
                  label={t('common.email')}
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label={t('common.phone')}
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input
                  label={t('suppliers.taxNumber')}
                  error={errors.taxNumber?.message}
                  {...register('taxNumber')}
                />
                <Select label={`${t('common.status')} *`} {...register('status')}>
                  <option value="active">{t('common.active')}</option>
                  <option value="inactive">{t('common.inactive')}</option>
                </Select>
              </div>
              <div className="mt-4">
                <Textarea
                  label={t('common.address')}
                  rows={3}
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>
            </FormSection>
          </CardBody>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(isEdit ? `/suppliers/${id}` : '/suppliers')}>
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
