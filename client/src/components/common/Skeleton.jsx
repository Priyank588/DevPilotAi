export default function Skeleton({ variant = 'text', count = 1 }) {
  const renderSkeleton = (index) => {
    switch (variant) {
      case 'card':
        return (
          <div key={index} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
            <div className="skeleton h-4 w-3/4 rounded"></div>
            <div className="skeleton h-3 w-full rounded"></div>
            <div className="skeleton h-3 w-5/6 rounded"></div>
            <div className="flex gap-2 mt-4">
              <div className="skeleton h-6 w-16 rounded-full"></div>
              <div className="skeleton h-6 w-16 rounded-full"></div>
            </div>
          </div>
        )
      case 'text':
        return (
          <div key={index} className="space-y-2">
            <div className="skeleton h-3 w-full rounded"></div>
            <div className="skeleton h-3 w-4/5 rounded"></div>
          </div>
        )
      case 'circle':
        return (
          <div key={index} className="skeleton w-12 h-12 rounded-full"></div>
        )
      case 'chart':
        return (
          <div key={index} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
            <div className="skeleton h-4 w-1/3 rounded"></div>
            <div className="skeleton h-48 w-full rounded-lg"></div>
          </div>
        )
      case 'stat':
        return (
          <div key={index} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-3">
            <div className="skeleton h-3 w-1/2 rounded"></div>
            <div className="skeleton h-8 w-1/3 rounded"></div>
            <div className="skeleton h-2 w-2/3 rounded"></div>
          </div>
        )
      default:
        return (
          <div key={index} className="skeleton h-4 w-full rounded"></div>
        )
    }
  }

  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }, (_, i) => renderSkeleton(i))}
    </div>
  )
}
