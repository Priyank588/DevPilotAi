import { motion } from 'framer-motion'
import { HiArrowPath } from 'react-icons/hi2'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = ''
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden'


  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white hover:from-[#6D28D9] hover:to-[#7C3AED] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:shadow-2xl border border-purple-400/20',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm',
    outline: 'border-2 border-purple-500/50 text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 backdrop-blur-sm',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/30',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/30'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3'
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <HiArrowPath className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </motion.button>
  )
}
