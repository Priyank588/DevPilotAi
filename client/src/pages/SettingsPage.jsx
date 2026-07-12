import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle
} from 'react-icons/hi2'
import { useNotification } from '../context/NotificationContext'
import useTheme from '../hooks/useTheme'
import useAuth from '../hooks/useAuth'
import authService from '../services/authService'
import ConfirmDialog from '../components/common/ConfirmDialog'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { showToast } = useNotification()
  const { darkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    reviewAlerts: true,
    weeklyDigest: false
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm()

  const newPassword = watch('newPassword')

  const handlePasswordChange = async (data) => {
    try {
      setLoading(true)
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      showToast('Password changed successfully!', 'success')
      reset()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    showToast('Notification preferences updated', 'success')
  }

  const handleDeleteAccount = async () => {
    try {
      await authService.deleteAccount()
      showToast('Account deleted successfully', 'success')
      logout()
      navigate('/')
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete account', 'error')
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Settings</h1>
          <p className="text-lg text-gray-400">Manage your account preferences and security</p>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <HiOutlineUser className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 glass rounded-xl border-white/10">
              <div>
                <p className="text-base font-semibold text-white mb-1">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="px-5 py-2.5 rounded-xl glass border-white/10 text-white text-sm font-semibold hover:border-white/20 transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              {darkMode ? (
                <HiOutlineMoon className="w-6 h-6 text-blue-400" />
              ) : (
                <HiOutlineSun className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">Appearance</h2>
          </div>

          <div className="flex items-center justify-between p-4 glass rounded-xl border-white/10">
            <div>
              <p className="text-base font-semibold text-white mb-1">Dark Mode</p>
              <p className="text-sm text-gray-400">
                {darkMode ? 'Currently using dark theme' : 'Switch to dark theme'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                darkMode ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                  darkMode ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <HiOutlineLockClosed className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
          </div>

          <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-white mb-3">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                {...register('currentPassword', { required: 'Current password is required' })}
                className="w-full glass border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 hover:border-white/20 transition-all"
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-400 mt-2">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold text-white mb-3">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full glass border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 hover:border-white/20 transition-all"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-400 mt-2">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold text-white mb-3">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                className="w-full glass border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 hover:border-white/20 transition-all"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-400 mt-2">{errors.confirmPassword.message}</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Changing Password...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <HiOutlineCheckCircle className="w-6 h-6" />
                  Change Password
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <HiOutlineBell className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 glass rounded-xl border-white/10">
                <div>
                  <p className="text-base font-semibold text-white mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-400">
                    {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                    {key === 'projectUpdates' && 'Get notified when your projects are analyzed'}
                    {key === 'reviewAlerts' && 'Alerts for new code reviews'}
                    {key === 'weeklyDigest' && 'Weekly summary of your activity'}
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange(key)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    value ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                      value ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <HiOutlineShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Privacy & Security</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 glass rounded-xl border-white/10">
              <p className="text-base font-semibold text-white mb-2">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account</p>
              <button className="px-5 py-2.5 rounded-xl glass border-white/10 text-white text-sm font-semibold hover:border-white/20 transition-all">
                Enable 2FA
              </button>
            </div>

            <div className="p-4 glass rounded-xl border-white/10">
              <p className="text-base font-semibold text-white mb-2">Active Sessions</p>
              <p className="text-sm text-gray-400 mb-4">Manage your active login sessions</p>
              <button className="px-5 py-2.5 rounded-xl glass border-white/10 text-white text-sm font-semibold hover:border-white/20 transition-all">
                View Sessions
              </button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-8 border-2 border-red-500/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
          </div>

          <div className="p-6 glass rounded-xl border border-red-500/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-base font-semibold text-white mb-2">Delete Account</p>
                <p className="text-sm text-gray-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all"
            >
              <HiOutlineTrash className="w-5 h-5" />
              Delete Account
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
        confirmText="Delete Account"
        confirmButtonClass="bg-red-600 hover:bg-red-500"
      />
    </div>
  )
}
