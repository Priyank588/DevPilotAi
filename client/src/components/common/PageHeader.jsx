export default function PageHeader({ icon: Icon, title, subtitle, gradient = 'from-indigo-600 to-violet-600', action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 min-w-0">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          )}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-400 mt-1.5 sm:mt-2 line-clamp-2 sm:line-clamp-none">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
