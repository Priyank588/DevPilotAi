import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'p-6',
  gradient = false,
  onClick
}) {
  const baseClasses = 'rounded-2xl border transition-all duration-300'
  
  const bgClasses = glass
    ? 'bg-slate-900/60 backdrop-blur-2xl border-white/10 shadow-2xl'
    : 'bg-white/5 border-white/10 backdrop-blur-sm shadow-md'
  
  const hoverClasses = hover
    ? 'hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer border border-white/10'
    : 'border-white/10'


  const Component = hover ? motion.div : 'div'
  
  const motionProps = hover ? {
    whileHover: { y: -4 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  } : {}

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${bgClasses} ${hoverClasses} ${padding} ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  )
}
