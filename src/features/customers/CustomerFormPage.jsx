import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import usePageTitle from '@/hooks/usePageTitle'
import { useCustomer, useCustomerGroups, useCreateCustomer, useUpdateCustomer } from '@/hooks/useSales'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import FormSection from '@/components/ui/FormSection'
import { normalizeApiError } from '@/lib/errors'

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.union([z.literal(''), z.string().email()]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  groupId: z.string().optional(),
  status: z.string(),
})

export default function CustomerFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToastStore()
  const { id } = useParams()
  const isEdit = Boolean(id)

  usePageTitle(isEdit ? 'customers.edit' : 'customers.create')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', groupId: '', status: 'active' },
  })

  const customerQuery = useCustomer(id)
  const groupsQuery = useCustomerGroups()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  useEffect(() => {
    if (customerQuery.data) {
      reset({
        name: customerQuery.data.name,
        email: customerQuery.data.email || '',
        phone: customerQuery.data.phone || '',
        address: customerQuery.data.address || '',
        groupId: customerQuery.data.groupId || '',
        status: customerQuery.data.status,
      })
    }
  }, [customerQuery.data, reset])

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, groupId: values.groupId || null }
      if (isEdit) {
        const updated = await updateCustomer.mutateAsync({ id, data: payload })
        toast.success(t('customers.updated'))
        navigate(`/customers/${updated.id}`)
      } else {
        const created = await createCustomer.mutateAsync(payload)
        toast.success(t('customers.created'))
        navigate(`/customers/${created.id}`)
      }
    } catch (error) {
      toast.error(normalizeApiError(error))
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isEdit ? t('customers.edit') : t('customers.create')}
        breadcrumb={[
          { label: t('nav.customers'), to: '/customers' },
          { label: isEdit ? t('customers.edit') : t('customers.create') },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/customers')}>
            {t('common.cancel')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <FormSection title={t('customers.basicInfo')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label={`${t('customers.fullName')} *`} error={errors.name?.message} placeholder={t('customers.fullName')} {...register('name')} />
              </div>
              <Input label={t('common.email')} type="email" error={errors.email?.message} {...register('email')} />
              <Input label={t('common.phone')} error={errors.phone?.message} {...register('phone')} />
              <Select label={t('customers.group')} {...register('groupId')}>
                <option value="">{t('common.select')}</option>
                {groupsQuery.data?.items?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
              <Select label={`${t('common.status')} *`} {...register('status')}>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </Select>
              <div className="sm:col-span-2">
                <Textarea rows={3} label={t('common.address')} {...register('address')} />
              </div>
            </div>
          </FormSection>
        </Card>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={createCustomer.isPending || updateCustomer.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
