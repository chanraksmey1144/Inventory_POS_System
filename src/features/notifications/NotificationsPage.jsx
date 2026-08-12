import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  PackageX,
  ShoppingBag,
  Receipt,
  Undo2,
  CreditCard,
} from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'
import {
  useNotifications,
  useUpdateNotificationRead,
  useDeleteNotification,
} from '@/hooks/useAdmin'
import useToastStore from '@/app/store/useToastStore'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { relativeTime } from '@/lib/utils'

const TYPE_CONFIG = {
  low_stock: { icon: AlertTriangle, color: 'warning', label: 'notifications.lowStock' },
  out_of_stock: { icon: PackageX, color: 'danger', label: 'notifications.outOfStock' },
  purchase: { icon: ShoppingBag, color: 'emerald', label: 'notifications.purchase' },
  sales: { icon: Receipt, color: 'info', label: 'notifications.sales' },
  return: { icon: Undo2, color: 'violet', label: 'notifications.return' },
  payment: { icon: CreditCard, color: 'info', label: 'notifications.payment' },
  system: { icon: Bell, color: 'neutral', label: 'notifications.system' },
}

export default function NotificationsPage() {
  const { t } = useTranslation()
  usePageTitle('notifications.title')
  const navigate = useNavigate()
  const toast = useToastStore()
  const { data, isLoading } = useNotifications()
  const markReadMutation = useUpdateNotificationRead()
  const deleteMutation = useDeleteNotification()

  const items = data?.items || []
  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items])

  const handleMarkRead = (notification) => {
    markReadMutation.mutate({ id: notification.id, read: true })
  }

  const handleDelete = (notification) => {
    deleteMutation.mutate(notification.id, {
      onSuccess: () => toast.success(t('notifications.deleted')),
    })
  }

  const handleMarkAllRead = () => {
    const unread = items.filter((item) => !item.read)
    if (!unread.length) return
    Promise.all(unread.map((item) => markReadMutation.mutateAsync({ id: item.id, read: true })))
      .then(() => toast.success(t('notifications.markAllReadDone')))
      .catch(() => toast.error(t('common.error')))
  }

  const handleDeleteAll = () => {
    if (!items.length) return
    Promise.all(items.map((item) => deleteMutation.mutateAsync(item.id)))
      .then(() => toast.success(t('notifications.deletedAll')))
      .catch(() => toast.error(t('common.error')))
  }

  return (
    <div>
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        breadcrumb={[{ label: t('notifications.title') }]}
        actions={
          <>
            <Button variant="outline" icon={CheckCheck} onClick={handleMarkAllRead} disabled={!unreadCount || markReadMutation.isPending}>
              {t('notifications.markAllRead')}
            </Button>
            <Button variant="danger" outline icon={Trash2} onClick={handleDeleteAll} disabled={!items.length || deleteMutation.isPending}>
              {t('notifications.deleteAll')}
            </Button>
          </>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Bell size={32} aria-hidden="true" />
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('notifications.empty')}</p>
          </CardBody>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((notification) => {
                const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system
                const Icon = config.icon
                return (
                  <li
                    key={notification.id}
                    className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    onClick={() => navigate(notification.link || '/dashboard')}
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{notification.title}</p>
                        {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{notification.message}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge color={config.color}>{t(config.label)}</Badge>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{relativeTime(notification.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Check}
                          title={t('notifications.markRead')}
                          onClick={() => handleMarkRead(notification)}
                          disabled={markReadMutation.isPending}
                        >
                          {t('notifications.markRead')}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
                        onClick={() => handleDelete(notification)}
                        disabled={deleteMutation.isPending}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
