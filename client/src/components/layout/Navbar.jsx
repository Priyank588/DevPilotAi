import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineBars3,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUserCircle,
  HiOutlineCog6Tooth,
  HiOutlineCheckCircle
} from 'react-icons/hi2'
import useAuth from '../../hooks/useAuth'
import useTheme from '../../hooks/useTheme'
import notificationService from '../../services/notificationService'

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications()
        const notifs = res.data.notifications || res.data || []
        setNotifications(notifs.slice(0, 5))
        setUnreadCount(notifs.filter(n => !n.read).length)
      } catch (err) {
        setNotifications([])
      }
    }
    fetchNotifications()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      // silently fail
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-slate-900/60 backdrop-blur-2xl border-b border-slate-700/40 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3.5">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all lg:hidden cursor-pointer shadow-sm hover:shadow-md"
          >
            <HiOutlineBars3 className="w-6 h-6" />
          </button>

          <div className="hidden sm:block relative group">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search projects..."
              className="w-72 bg-slate-800/40 border border-slate-700/40 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-slate-800/60 transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all cursor-pointer shadow-sm hover:shadow-md group"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <HiOutlineSun className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            ) : (
              <HiOutlineMoon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all relative cursor-pointer shadow-sm hover:shadow-md group"
            >
              <HiOutlineBell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg shadow-rose-500/50 animate-pulse px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-700/40 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/40 bg-gradient-to-r from-slate-800/50 to-slate-800">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <HiOutlineCheckCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div
                        key={notif._id || idx}
                        className={`px-4 py-3 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors ${
                          !notif.read ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <p className="text-sm text-slate-200 line-clamp-2">{notif.message || notif.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/70 transition-all cursor-pointer shadow-sm hover:shadow-md group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all group-hover:scale-105">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-200 max-w-28 truncate group-hover:text-white transition-colors">
                {user?.name || 'User'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-3 w-60 bg-slate-800/95 backdrop-blur-xl border border-slate-700/40 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="px-5 py-4 border-b border-slate-700/40 bg-gradient-to-r from-slate-800/50 to-slate-800">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => { navigate('/profile'); setShowUserMenu(false) }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all cursor-pointer group"
                  >
                    <HiOutlineUserCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false) }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all cursor-pointer group"
                  >
                    <HiOutlineCog6Tooth className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <hr className="border-slate-700/40 my-2 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer group"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
