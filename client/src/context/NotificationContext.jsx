import { createContext, useState, useCallback, useContext } from 'react'
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineInformationCircle, HiOutlineExclamationTriangle, HiXMark } from 'react-icons/hi2'

export const NotificationContext = createContext(null)

let toastIdCounter = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastIdCounter
    setNotifications(prev => [...prev, { id, type, message, duration, exiting: false }])
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, exiting: true } : n)
    )
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 300)
  }, [])

  const iconMap = {
    success: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <HiOutlineXCircle className="w-5 h-5 text-rose-400" />,
    info: <HiOutlineInformationCircle className="w-5 h-5 text-blue-400" />,
    warning: <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-400" />
  }

  const bgMap = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-rose-500/30 bg-rose-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10'
  }

  return (
    <NotificationContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${bgMap[notification.type] || bgMap.info} ${notification.exiting ? 'toast-exit' : 'toast-enter'}`}
          >
            {iconMap[notification.type] || iconMap.info}
            <p className="flex-1 text-sm font-medium text-slate-200">
              {notification.message}
            </p>
            <button
              onClick={() => removeToast(notification.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
