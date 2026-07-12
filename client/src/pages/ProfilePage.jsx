import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineBuildingOffice2,
  HiOutlineCodeBracket,
  HiOutlinePencil,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineCamera
} from 'react-icons/hi2'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import useAuth from '../hooks/useAuth'
import { useNotification } from '../context/NotificationContext'
import authService from '../services/authService'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { showToast } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null)
  const [skills, setSkills] = useState(user?.skills || [])
  const [skillInput, setSkillInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      college: user?.college || '',
      githubUrl: user?.githubUrl || '',
      linkedinUrl: user?.linkedinUrl || '',
      bio: user?.bio || ''
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        college: user.college || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        bio: user.bio || ''
      })
      setSkills(user.skills || [])
      setImagePreview(user.profileImage || null)
    }
  }, [user, reset])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error')
        return
      }
      setProfileImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
        setSkillInput('')
      }
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const formData = new FormData()
      
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
      
      formData.append('skills', JSON.stringify(skills))
      
      if (profileImage) {
        formData.append('profileImage', profileImage)
      }

      const response = await authService.updateProfile(formData)
      updateUser(response.data.user)
      showToast('Profile updated successfully!', 'success')
      setIsEditing(false)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setSkills(user?.skills || [])
    setImagePreview(user?.profileImage || null)
    setProfileImage(null)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">My Profile</h1>
            <p className="text-lg text-gray-400">Manage your account information</p>
          </div>
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <HiOutlinePencil className="w-5 h-5" />
              Edit Profile
            </motion.button>
          )}
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Profile Picture</h2>
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-2xl">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 flex items-center justify-center cursor-pointer shadow-lg transition-colors"
                  >
                    <HiOutlineCamera className="w-5 h-5 text-white" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{user?.name}</h3>
                <p className="text-base text-gray-400 mb-1">{user?.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-white mb-3">
                  Full Name
                </label>
                <div className="relative group">
                  <HiOutlineUser className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    disabled={!isEditing}
                    className="w-full glass border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                {errors.name && <p className="text-sm text-red-400 mt-2">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-base font-semibold text-white mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <HiOutlineEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    {...register('email')}
                    disabled
                    className="w-full glass border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-base text-gray-500 bg-white/5 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-white mb-3">
                  College/University
                </label>
                <div className="relative group">
                  <HiOutlineBuildingOffice2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Your college or university"
                    {...register('college')}
                    disabled={!isEditing}
                    className="w-full glass border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Skills</h2>
            {isEditing && (
              <div className="mb-6">
                <div className="relative group">
                  <HiOutlineCodeBracket className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Press Enter to add skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="w-full glass border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border-white/10 text-base text-white font-medium"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills added yet</p>
              )}
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Social Links</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-white mb-3">
                  GitHub URL
                </label>
                <div className="relative group">
                  <FaGithub className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    {...register('githubUrl')}
                    disabled={!isEditing}
                    className="w-full glass border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-white mb-3">
                  LinkedIn URL
                </label>
                <div className="relative group">
                  <FaLinkedin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    {...register('linkedinUrl')}
                    disabled={!isEditing}
                    className="w-full glass border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Bio</h2>
            <textarea
              rows={6}
              placeholder="Tell us about yourself..."
              {...register('bio')}
              disabled={!isEditing}
              className="w-full glass border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all resize-none"
            />
          </motion.div>

          {/* Action Buttons */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <motion.button
                type="button"
                onClick={handleCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-8 py-4 rounded-2xl glass border-white/10 text-white font-semibold hover:border-white/20 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <HiOutlineXMark className="w-6 h-6" />
                  Cancel
                </span>
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <HiOutlineCheckCircle className="w-6 h-6" />
                    Save Changes
                  </span>
                )}
              </motion.button>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  )
}
