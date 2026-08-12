/**
 * @param {...(string | undefined | null | false)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

let uidCounter = 0

export function uid(prefix = 'id') {
  uidCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${uidCounter}`
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce(fn, wait = 300) {
  let timer
  return function debounced(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
}

export function formatNumber(value, options = {}) {
  const num = Number(value ?? 0)
  if (Number.isNaN(num)) return '0'
  return new Intl.NumberFormat(options.locale || 'en-US', {
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }).format(num)
}

export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

export function formatPercent(value, digits = 1) {
  return `${formatNumber(value, { maximumFractionDigits: digits })}%`
}

export function formatDate(value, options = {}) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(options.locale || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(value, options = {}) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(options.locale || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function relativeTime(value, now = new Date()) {
  const date = new Date(value)
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(value)
}

export function paginate(items, page, perPage) {
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

export function exportCsv(filename, rows) {
  const headers = Object.keys(rows[0] || {})
  const escape = (value) => {
    const text = String(value ?? '')
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
    return text
  }
  const lines = [headers.map(escape).join(',')]
  rows.forEach((row) => lines.push(headers.map((h) => escape(row[h])).join(',')))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename)
}

export function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type })
  triggerDownload(blob, filename)
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function truncate(text, length = 40) {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length)}...` : text
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
