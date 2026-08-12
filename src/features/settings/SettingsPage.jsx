import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Building2, Coins, FileText, Receipt, CreditCard, Bell, Palette } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import { useSettings, useUpdateSettings } from '@/hooks/useReports'
import useThemeStore from '@/app/store/useThemeStore'
import useToastStore from '@/app/store/useToastStore'
import { setLanguage, getLanguage } from '@/app/providers/i18n'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
import SegmentControl from '@/components/ui/SegmentControl'
import Spinner from '@/components/ui/Spinner'
import { CURRENCIES, LANGUAGES, THEMES, PAYMENT_METHODS } from '@/constants'

const PAYMENT_LABEL_KEYS = {
  cash: 'pos.cash',
  card: 'pos.card',
  qr: 'pos.qr',
  bank_transfer: 'pos.bankTransfer',
  mobile_payment: 'pos.mobilePayment',
  credit: 'pos.credit',
  mixed: 'pos.mixed',
}

const TABS = [
  { key: 'business', label: 'settings.businessProfile', icon: Building2 },
  { key: 'currency', label: 'settings.currency', icon: Coins },
  { key: 'invoice', label: 'settings.invoice', icon: FileText },
  { key: 'receipt', label: 'settings.receipt', icon: Receipt },
  { key: 'payments', label: 'settings.paymentMethods', icon: CreditCard },
  { key: 'notifications', label: 'settings.notifications', icon: Bell },
  { key: 'appearance', label: 'settings.appearance', icon: Palette },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  usePageTitle('settings.title')
  const toast = useToastStore()
  const { theme, setTheme } = useThemeStore()

  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const [tab, setTab] = useState('business')
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (!settings) return
    setForm((current) => current || { ...settings, paymentMethods: [...(settings.paymentMethods || [])] })
  }, [settings])

  const set = (key) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const togglePaymentMethod = (method) => {
    setForm((current) => {
      const methods = current.paymentMethods.includes(method)
        ? current.paymentMethods.filter((item) => item !== method)
        : [...current.paymentMethods, method]
      return { ...current, paymentMethods: methods }
    })
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form)
      toast.success(t('settings.saved'))
    } catch {
      /* handled by mock error toast */
    }
  }

  if (isLoading || !form) return <Spinner />

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        breadcrumb={[{ label: t('settings.title') }]}
        actions={
          <Button icon={Save} onClick={handleSave} loading={updateSettings.isPending}>
            {t('common.save')}
          </Button>
        }
      />

      <Tabs
        tabs={TABS.map(({ key, label }) => ({ key, label: t(label) }))}
        active={tab}
        onChange={setTab}
        className="mb-4"
      />

      {tab === 'business' ? (
        <Card className="overflow-hidden">
          <CardHeader title={t('settings.businessProfile')} />
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label={`${t('settings.businessName')} *`} value={form.businessName} onChange={set('businessName')} />
              <Input label={t('settings.businessPhone')} value={form.businessPhone} onChange={set('businessPhone')} />
              <Input label={t('settings.businessEmail')} value={form.businessEmail} onChange={set('businessEmail')} className="sm:col-span-2" />
              <Input label={t('settings.businessAddress')} value={form.businessAddress} onChange={set('businessAddress')} className="sm:col-span-2" />
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'currency' ? (
        <Card className="overflow-hidden">
          <CardHeader title={t('settings.currency')} />
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label={`${t('settings.currencyCode')} *`} value={form.currency} onChange={set('currency')}>
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.label}
                  </option>
                ))}
              </Select>
              <Input
                label={`${t('settings.defaultTaxRate')} *`}
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.defaultTaxRate}
                onChange={set('defaultTaxRate')}
              />
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'invoice' ? (
        <Card className="overflow-hidden">
          <CardHeader title={t('settings.invoice')} />
          <CardBody>
            <Input label={`${t('settings.invoicePrefix')} *`} value={form.invoicePrefix} onChange={set('invoicePrefix')} className="max-w-64" />
          </CardBody>
        </Card>
      ) : null}

      {tab === 'receipt' ? (
        <Card className="overflow-hidden">
          <CardHeader title={t('settings.receipt')} />
          <CardBody>
            <Input label={t('settings.receiptFooter')} value={form.receiptFooter} onChange={set('receiptFooter')} />
            <div className="mt-4">
              <Checkbox
                label={t('settings.receiptShowLogo')}
                checked={form.receiptShowLogo}
                onChange={(event) => setForm((current) => ({ ...current, receiptShowLogo: event.target.checked }))}
              />
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'payments' ? (
        <Card className="overflow-hidden">
          <CardHeader title={t('settings.paymentMethods')} />
          <CardBody>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS ? (
                Object.values(PAYMENT_METHODS).map((method) => (
                  <Checkbox
                    key={method}
                    label={t(PAYMENT_LABEL_KEYS[method] || 'pos.cash')}
                    description={t('settings.paymentMethodEnabled')}
                    checked={form.paymentMethods.includes(method)}
                    onChange={() => togglePaymentMethod(method)}
                  />
                ))
              ) : null}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'notifications' ? (
        <Card className="overflow-hidden">
          <CardHeader title={t('settings.notifications')} />
          <CardBody>
            <div className="grid max-w-lg grid-cols-1 gap-4">
              <Input
                label={`${t('settings.lowStockAlert')} *`}
                type="number"
                min={0}
                value={form.lowStockAlert}
                onChange={set('lowStockAlert')}
              />
              <Checkbox
                label={t('settings.emailNotifications')}
                checked={form.emailNotifications}
                onChange={(event) => setForm((current) => ({ ...current, emailNotifications: event.target.checked }))}
              />
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'appearance' ? (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader title={t('settings.theme')} />
            <CardBody>
              <SegmentControl
                options={THEMES.map((option) => ({ value: option.key, label: t(`settings.${option.key}`) }))}
                value={theme}
                onChange={setTheme}
                size="sm"
              />
            </CardBody>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title={t('settings.language')} />
            <CardBody>
              <SegmentControl
                options={LANGUAGES.map((language) => ({ value: language.code, label: language.label }))}
                value={getLanguage()}
                onChange={setLanguage}
                size="sm"
              />
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
