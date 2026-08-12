import PropTypes from 'prop-types'
import Breadcrumb from './Breadcrumb'

export default function PageHeader({ title, subtitle, breadcrumb, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {breadcrumb ? (
          <div className="mb-2">
            <Breadcrumb items={breadcrumb} />
          </div>
        ) : null}
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  breadcrumb: PropTypes.array,
  actions: PropTypes.node,
}
