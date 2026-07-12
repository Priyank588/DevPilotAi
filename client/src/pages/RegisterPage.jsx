import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiOutlineUser,
  HiOutlineRocketLaunch,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineBolt
} from 'react-icons/hi2'
import useAuth from '../hooks/useAuth'
import { useNotification } from '../context/NotificationContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

export default function RegisterPage() {
  const { register: registerUser, error: authError } = useAuth()
  const { showToast } = useNotification()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const password = watch('password', '')

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' }
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-blue-500' }
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' }
    return { score: 5, label: 'Very Strong', color: 'bg-emerald-400' }
  }, [password])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await registerUser(data.name, data.email, data.password)
      showToast('Account created successfully!', 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }


  const benefits = [
    { icon: HiOutlineSparkles, text: 'AI-Powered Code Analysis' },
    { icon: HiOutlineShieldCheck, text: 'Security & Bug Detection' },
    { icon: HiOutlineCheckCircle, text: 'Real-time Analytics' },
    { icon: HiOutlineBolt, text: 'Instant Code Reviews' }
  ]

  return (
    <div className="min-h-screen bg-slate-950 grid lg:grid-cols-2">
      {/* Left Side - Premium Gradient */}
      <div className="hidden lg:flex flex-col justify-center p-16 xl:p-24 bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <HiOutlineRocketLaunch className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight">DevPilot</span>
                <span className="text-3xl font-light text-white/80 tracking-tight"> AI</span>
              </div>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              Start Your Journey
              <br />
              with DevPilot AI
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed mb-12">
              Create an account and get access to professional AI developer tools instantly.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/5">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base text-white font-semibold">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-24 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <HiOutlineRocketLaunch className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">DevPilot</span>
              <span className="text-2xl font-light text-purple-400"> AI</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Create an account</h2>
            <p className="text-base text-slate-400">Start analyzing and optimizing your code</p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium"
            >
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              icon={HiOutlineUser}
              error={errors.name?.message}
              register={register}
              disabled={loading}
            />

            {/* Email Address */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={HiOutlineEnvelope}
              error={errors.email?.message}
              register={register}
              disabled={loading}
            />

            {/* Password */}
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={HiOutlineLockClosed}
              error={errors.password?.message}
              register={register}
              disabled={loading}
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="flex items-center gap-2 -mt-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-semibold">{passwordStrength.label}</span>
              </div>
            )}

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              icon={HiOutlineLockClosed}
              error={errors.confirmPassword?.message}
              register={register}
              disabled={loading}
            />

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('terms', { required: 'You must agree to the Terms of Service' })}
                  className="w-5 h-5 mt-0.5 rounded bg-slate-900 border-slate-800 text-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-colors"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                  I agree to the <button type="button" className="text-purple-400 hover:text-purple-300 font-bold">Terms</button> and <button type="button" className="text-purple-400 hover:text-purple-300 font-bold">Privacy Policy</button>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-2 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
