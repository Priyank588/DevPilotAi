import { createContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import authService from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAuthenticated = !!user && !!token

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }
      
      try {
        setToken(storedToken)
        const res = await authService.getMe()
        const userData = res.data.data?.user || res.data.data
        setUser(userData)
      } catch (err) {
        // Token invalid/expired - clear everything
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      const res = await authService.login({ email, password })
      const responseData = res.data.data
      const newToken = responseData.token
      const userData = responseData.user
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      return userData
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Login failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    try {
      setError(null)
      setLoading(true)
      const res = await authService.register({ name, email, password })
      const responseData = res.data.data
      const newToken = responseData.token
      const userData = responseData.user
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      
      return userData
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await authService.updateProfile(data)
      const updatedUser = res.data.data
      setUser(updatedUser)
      return res.data
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed'
      throw new Error(message)
    }
  }, [])

  const updateAvatar = useCallback(async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await authService.uploadAvatar(formData)
      const updatedUser = res.data.data
      setUser(prev => ({ ...prev, avatar: updatedUser.avatar }))
      return res.data
    } catch (err) {
      const message = err.response?.data?.message || 'Avatar upload failed'
      throw new Error(message)
    }
  }, [])


  const updateUser = useCallback((userData) => {
    setUser(userData)
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    updateUser,
    setError
  }


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
