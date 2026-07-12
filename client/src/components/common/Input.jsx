import React from 'react'

const Input = React.forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  icon: Icon,
  disabled = false,
  className = '',
  ...rest
}, ref) => {
  // Support both: 
  // 1. Spreading {...register('fieldName')} directly
  // 2. Passing register={register} as a prop
  const registrationProps = register ? register(name) : {};
  const inputRef = ref || registrationProps.ref;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-base font-semibold text-white">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 transition-colors ${error ? 'text-red-400' : 'text-gray-500 group-focus-within:text-purple-400'}`} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          ref={inputRef}
          {...registrationProps}
          {...rest}
          className={`w-full bg-slate-900/60 backdrop-blur-2xl border rounded-2xl text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
            Icon ? 'pl-14 pr-5' : 'px-5'
          } py-4 ${
            error 
              ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500 focus:bg-red-500/5' 
              : 'border-white/10 focus:ring-purple-500/30 focus:border-purple-500/50 hover:border-white/20 focus:bg-white/5'
          }`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2 font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {typeof error === 'object' ? error.message : error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
