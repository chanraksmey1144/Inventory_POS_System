import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import Badge from './Badge'

const STATUS_CONFIG = {
  active: { color: 'success', key: 'billing' },
  inactive: { color: 'neutral', key: 'billing' },
  archived: { color: 'neutral', key: 'common' },
  completed: { color: 'success', key: 'sales' },
  pending: { color: 'warning', key: 'sales' },
  cancelled: { color: 'danger', key: 'sales' },
  refunded: { color: 'info', key: 'sales' },
  hold: { color: 'violet', key: 'sales' },
  paid: { color: 'success', key: 'billing' },
  partial: { color: 'warning', key: 'billing' },
  unpaid: { color: 'danger', key: 'billing' },
  received: { color: 'success', key: 'billing' },
  ordered: { color: 'info', key: 'billing' },
  'partially_received': { color: 'warning', key: 'billing' },
  draft: { color: 'neutral', key: 'billing' },
  in_transit: { color: 'info', key: 'billing' },
  requested: { color: 'warning', key: 'billing' },
  approved: { color: 'success', key: 'billing' },
  in_stock: { color: 'success', key: 'inventory' },
  low_stock: { color: 'warning', key: 'inventory' },
  out_of_stock: { color: 'danger', key: 'inventory' },
}

export default function StatusBadge({ status, label }) {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[status]

  if (!config) {
    return <Badge color="neutral">{label || status}</Badge>
  }

  let translated = label
  if (!translated) {
    const key = status.includes('_') ? status : `${status}`
    const candidates = [
      `billing.${key}`,
      `sales.${key}`,
      `inventory.${key}`,
      `common.${key}`,
    ]
    for (const candidate of candidates) {
      const value = t(candidate, { defaultValue: null })
      if (value) {
        translated = value
        break
      }
    }
  }

  return <Badge color={config.color}>{translated || status}</Badge>
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  label: PropTypes.string,
}
