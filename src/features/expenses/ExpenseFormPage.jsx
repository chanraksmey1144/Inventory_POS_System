import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import usePageTitle from '@/hooks/usePageTitle'
import { useCreateExpense } from '@/hooks/useSales'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import FormSection from '@/components/ui/FormSection'
import { normalizeApiError } from '@/lib/errors'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/constants'

const PAYMENT_LABEL_KEYS = {
  cash: 'pos.cash',
  card: 'pos.card',
  qr: 'pos.qr',
  bank_transfer: 'pos.bankTransfer',
  mobile_payment: 'pos.mobilePayment',
  credit: 'pos.credit',
  mixed: 'pos.mixed',
}

const expenseSchema = z.object({
  date: z.string().min(1),
  category: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  paymentMethod: z.string().min(1),
  description: z.string().optional(),
})

export default function ExpenseFormPage() {
  const { t } = useTranslation()
  usePageTitle('expenses.create')
  const navigate = useNavigate()
  const toast = useToastStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      category: EXPENSE_CATEGORIES[0],
      amount: '',
      paymentMethod: PAYMENT_METHODS.CASH,
      description: '',
    },
  })

  const createExpense = useCreateExpense()

  const onSubmit = async (values) => {
    try {
      const created = await createExpense.mutateAsync({
        ...values,
        branchId: 'b-1',
        date: new Date(values.date).toISOString(),
        createdBy: 'u-1',
      })
      toast.success(t('expenses.created'))
      navigate(`/expenses?created=${created.id}`)
    } catch (error) {
      toast.error(normalizeApiError(error))
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t('expenses.create')}
        breadcrumb={[{ label: t('nav.expenses'), to: '/expenses' }, { label: t('expenses.create') }]}
        actions={
          <Button variant="outline" onClick={() => navigate('/expenses')}>
            {t('common.cancel')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <FormSection title={t('expenses.details')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label={`${t('expenses.date')} *`} type="date" error={errors.date?.message} {...register('date')} />
              <Select label={`${t('expenses.category')} *`} error={errors.category?.message} {...register('category')}>
                {EXPENSE_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
              <Input label={`${t('expenses.amount')} *`} type="number" min="0.01" step="0.01" error={errors.amount?.message} {...register('amount')} />
              <Select label={`${t('expenses.paymentMethod')} *`} error={errors.paymentMethod?.message} {...register('paymentMethod')}>
                {Object.values(PAYMENT_METHODS).map((value) => (
                  <option key={value} value={value}>
                    {t(PAYMENT_LABEL_KEYS[value] || 'pos.cash')}
                  </option>
                ))}
              </Select>
              <div className="sm:col-span-2">
                <Textarea rows={3} label={t('common.description')} {...register('description')} />
              </div>
            </div>
          </FormSection>
        </Card>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/expenses')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={createExpense.isPending}>
            {t('expenses.create')}
          </Button>
        </div>
      </form>
    </div>
  )
}
