import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
      <Link to="/dashboard" className="inline-flex items-center gap-1 rounded hover:text-slate-800 dark:hover:text-slate-200">
        <Home size={13} aria-hidden="true" />
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <ChevronRight size={13} className="text-slate-300 dark:text-slate-600" aria-hidden="true" />
          {item.path ? (
            <Link to={item.path} className="rounded transition-colors hover:text-slate-800 dark:hover:text-slate-200">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700 dark:text-slate-200" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      path: PropTypes.string,
    }),
  ),
}
