export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  pulse = false
}) {
  const variantClasses = {
    success: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    warning: 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10',
    error: 'bg-gradient-to-r from-rose-500/15 to-red-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
    info: 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-300 border-blue-500/30 shadow-sm shadow-blue-500/10',
    primary: 'bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/10',
    secondary: 'bg-gradient-to-r from-slate-500/15 to-slate-600/15 text-slate-300 border-slate-500/30 shadow-sm'
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[10px] gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2'
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded-lg border backdrop-blur-sm transition-all duration-200 hover:scale-105 ${variantClasses[variant]} ${sizeClasses[size]} ${pulse ? 'animate-pulse' : ''}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  )
}
