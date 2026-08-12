import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck, Trash2, ArrowRight } from 'lucide-react'
import useNotificationStore from '@/app/store/useNotificationStore'
import { useNotifications } from '@/hooks/useAdmin'
import { NOTIFICATION_TYPE } from '@/constants'
import { relativeTime } from '@/lib/utils'
import Dropdown from '@/components/ui/Dropdown'

const TYPE_COLORS = {
  [NOTIFICATION_TYPE.LOW_STOCK]: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  [NOTIFICATION_TYPE.OUT_OF_STOCK]: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  [NOTIFICATION_TYPE.PURCHASE]: 'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  [NOTIFICATION_TYPE.SALES]: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  [NOTIFICATION_TYPE.RETURN]: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  [NOTIFICATION_TYPE.PAYMENT]: 'bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
  [NOTIFICATION_TYPE.SYSTEM]: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

function NotificationIcon({ type }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${TYPE_COLORS[type] || TYPE_COLORS[NOTIFICATION_TYPE.SYSTEM]}`}
      aria-hidden="true"
    >
      <Bell size={16} />
    </span>
  )
}

NotificationIcon.propTypes = { type: PropTypes.string }

export default function NotificationCenter() {
  const { t } = useTranslation()
  const { data } = useNotifications()
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore()

  useEffect(() => {
    if (data?.items) {
      setNotifications(data.items)
    }
  }, [data, setNotifications])

  return (
    <Dropdown
      width="w-96"
      trigger={
        <button
          type="button"
          aria-label={`Notifications (${unreadCount} unread)`}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      }
    >
      {() => (
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('nav.notifications')}</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <CheckCheck size={13} aria-hidden="true" />
                {t('notifications.markAllRead')}
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400">{t('notifications.empty')}</p>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${notification.read ? 'opacity-70' : ''}`}
                >
                  <NotificationIcon type={notification.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{notification.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{notification.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{relativeTime(notification.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNotification(notification.id)}
                    aria-label={t('notifications.delete')}
                    className="rounded p-1 text-slate-300 transition-colors hover:text-rose-500 dark:text-slate-600"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
            <Link
              to="/notifications"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {t('common.viewAll')}
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </Dropdown>
  )
}
