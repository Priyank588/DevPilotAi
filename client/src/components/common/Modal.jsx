import { useEffect, useRef } from 'react'
import { HiXMark } from 'react-icons/hi2'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`${sizeClasses[size]} w-full bg-slate-800/95 backdrop-blur-xl border border-slate-700/40 rounded-2xl shadow-2xl modal-enter overflow-hidden`}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-700/40 bg-gradient-to-r from-slate-800/50 to-slate-800">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all cursor-pointer group hover:rotate-90 duration-300"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>
        <div className="p-7 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
