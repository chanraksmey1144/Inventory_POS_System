import PropTypes from 'prop-types'

export default function FormSection({ title, description, children, actions }) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

FormSection.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  actions: PropTypes.node,
}
