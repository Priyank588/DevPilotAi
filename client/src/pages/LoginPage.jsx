import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
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

export default function LoginPage() {
  const { login, error: authError } = useAuth()
  const { showToast } = useNotification()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await login(data.email, data.password)
      showToast('Welcome back! Login successful.', 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }


  const features = [
    { icon: HiOutlineCheckCircle, text: 'AI-Powered Code Review' },
    { icon: HiOutlineSparkles, text: 'Real-time Bug Detection' },
    { icon: HiOutlineShieldCheck, text: 'Security Analysis' },
    { icon: HiOutlineBolt, text: 'Instant Complexity Insights' }
  ]

  return (
    <div className="min-h-screen bg-slate-950 grid lg:grid-cols-2">
      {/* Left Side - Premium Gradient with Features */}
      <div className="hidden lg:flex flex-col justify-center p-16 xl:p-24 bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-700 relative overflow-hidden">
        {/* Gradient Orbs */}
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
              Build Better Code
              <br />
              with AI-Powered Tools
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed mb-12">
              Join thousands of developers who are shipping better code with our AI-powered platform.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/5">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base text-white font-semibold">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-12 mt-16 pt-12 border-t border-white/20"
          >
            <div>
              <p className="text-3xl font-black text-white mb-1">50K+</p>
              <p className="text-sm text-white/70 font-medium">Developers</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white mb-1">99.9%</p>
              <p className="text-sm text-white/70 font-medium">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white mb-1">4.9★</p>
              <p className="text-sm text-white/70 font-medium">Rating</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome back</h2>
            <p className="text-base text-slate-400">Sign in to your DevPilot AI account</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
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

            {/* Password Input */}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded bg-slate-900 border-slate-800 text-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-colors"
                />
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors font-medium">Remember me</span>
              </label>
              <button 
                type="button" 
                className="text-sm text-purple-400 hover:text-purple-300 font-bold transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
