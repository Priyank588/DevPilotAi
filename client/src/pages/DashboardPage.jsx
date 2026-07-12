import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineFolder,
  HiOutlineCodeBracket,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCalendarDays,
  HiOutlineBell,
  HiOutlineChartBarSquare
} from 'react-icons/hi2'
import useAuth from '../hooks/useAuth'
import { useNotification } from '../context/NotificationContext'
import analyticsService from '../services/analyticsService'
import notificationService from '../services/notificationService'
import Card from '../components/common/Card'
import Skeleton from '../components/common/Skeleton'

export default function DashboardPage() {
  const { user } = useAuth()
  const { showToast } = useNotification()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifsRes] = await Promise.allSettled([
          analyticsService.getSummary(),
          notificationService.getNotifications()
        ])
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data)
        }
        if (notifsRes.status === 'fulfilled') {
          const notifs = notifsRes.value.data.notifications || notifsRes.value.data || []
          setRecentNotifications(notifs.slice(0, 5))
        }
      } catch (err) {
        showToast('Failed to load dashboard data', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || stats?.projects || 0,
      icon: HiOutlineFolder,
      gradient: 'from-indigo-500 to-blue-500',
      bg: 'bg-indigo-500/10'
    },
    {
      title: 'AI Reviews',
      value: stats?.totalReviews || stats?.reviews || 0,
      icon: HiOutlineCodeBracket,
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-500/10'
    },
    {
      title: 'Docs Generated',
      value: stats?.totalDocs || stats?.documentation || 0,
      icon: HiOutlineDocumentText,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: "Interview Q's",
      value: stats?.totalInterviews || stats?.interviews || 0,
      icon: HiOutlineAcademicCap,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10'
    }
  ]

  const quickActions = [
    { title: 'New Project', icon: HiOutlineFolder, path: '/projects/new', color: 'from-indigo-600 to-blue-600' },
    { title: 'AI Review', icon: HiOutlineCodeBracket, path: '/review', color: 'from-violet-600 to-purple-600' },
    { title: 'Generate Docs', icon: HiOutlineDocumentText, path: '/documentation', color: 'from-emerald-600 to-teal-600' },
    { title: 'Practice Interview', icon: HiOutlineAcademicCap, path: '/interview', color: 'from-amber-600 to-orange-600' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" count={1} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="stat" count={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <Card glass className="relative overflow-hidden border-slate-700/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 via-violet-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative">
          <div className="flex items-center gap-2.5 text-sm text-slate-400 mb-3">
            <HiOutlineCalendarDays className="w-5 h-5 text-indigo-400" />
            <span className="font-medium">{today}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            Welcome back, <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">{user?.name || 'Developer'}</span>! 👋
          </h1>
          <p className="text-slate-400 text-base">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            hover
            gradient
            className="animate-slide-up group shadow-lg hover:shadow-2xl"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center backdrop-blur-sm border border-white/5 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-7 h-7 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} style={{ color: stat.gradient.includes('indigo') ? '#818cf8' : stat.gradient.includes('violet') ? '#a78bfa' : stat.gradient.includes('emerald') ? '#34d399' : '#fbbf24' }} />
              </div>
              <HiOutlineChartBarSquare className="w-6 h-6 text-slate-600 group-hover:text-slate-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-white tracking-tight mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400 font-medium">{stat.title}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <HiOutlineBell className="w-6 h-6 text-indigo-400" />
              </div>
              Recent Activity
            </h3>
          </div>
          {recentNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-700/30 flex items-center justify-center mx-auto mb-4">
                <HiOutlineBell className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 font-medium">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotifications.map((notif, idx) => (
                <div
                  key={notif._id || idx}
                  className="flex items-start gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-700/40 transition-all duration-200 border border-transparent hover:border-slate-600/40 group"
                >
                  <div className="w-2.5 h-2.5 mt-2 rounded-full bg-indigo-400 flex-shrink-0 shadow-lg shadow-indigo-400/50 group-hover:scale-125 transition-transform"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium line-clamp-1 group-hover:text-white transition-colors">{notif.message || notif.title || 'Activity update'}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <HiOutlineSparkles className="w-6 h-6 text-violet-400" />
              </div>
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors text-center">{action.title}</span>
                <HiOutlineArrowRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
