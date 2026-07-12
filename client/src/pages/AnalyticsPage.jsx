import { useState, useEffect, useContext } from 'react'
import {
  HiOutlineChartBarSquare,
  HiOutlineFolder,
  HiOutlineCodeBracket,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineBugAnt,
  HiOutlineArrowTrendingUp
} from 'react-icons/hi2'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { NotificationContext } from '../context/NotificationContext'
import analyticsService from '../services/analyticsService'
import Card from '../components/common/Card'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'

const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  accent: '#f59e0b',
  rose: '#f43f5e'
}




const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-sm font-medium text-slate-200 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { showToast } = useContext(NotificationContext)
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, analyticsRes] = await Promise.allSettled([
          analyticsService.getSummary(),
          analyticsService.getAnalytics()
        ])

        if (summaryRes.status === 'fulfilled') {
          setSummary(summaryRes.value.data.data || summaryRes.value.data)
        }

        if (analyticsRes.status === 'fulfilled') {
          const data = analyticsRes.value.data.data || analyticsRes.value.data
          if (data && Array.isArray(data.monthly) && data.monthly.length > 0) {
            setChartData(data.monthly)
          } else if (data && Array.isArray(data) && data.length > 0) {
            setChartData(data)
          }
        }
      } catch (err) {
        showToast('Failed to load analytics', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const displayData = chartData || []
  const hasData = displayData.length > 0 || 
                  (summary?.totalProjects > 0) || 
                  (summary?.totalReviews > 0) || 
                  (summary?.totalDocs > 0) || 
                  (summary?.totalInterviews > 0)


  const statCards = [
    {
      title: 'Total Projects',
      value: summary?.totalProjects || summary?.projects || 0,
      icon: HiOutlineFolder,
      gradient: 'from-indigo-500 to-blue-500',
      bg: 'bg-indigo-500/10',
      color: '#818cf8'
    },
    {
      title: 'AI Reviews',
      value: summary?.totalReviews || summary?.reviews || 0,
      icon: HiOutlineCodeBracket,
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-500/10',
      color: '#a78bfa'
    },
    {
      title: 'Docs Generated',
      value: summary?.totalDocs || summary?.documentation || 0,
      icon: HiOutlineDocumentText,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10',
      color: '#34d399'
    },
    {
      title: 'Interview Sessions',
      value: summary?.totalInterviews || summary?.interviews || 0,
      icon: HiOutlineAcademicCap,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      color: '#fbbf24'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" count={1} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="stat" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="chart" count={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <HiOutlineChartBarSquare className="w-5 h-5 text-white" />
          </div>
          Developer Analytics
        </h1>
        <p className="text-slate-400 mt-2">
          Track your development activity and progress
        </p>

      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            hover
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <HiOutlineArrowTrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400 mt-1">{stat.title}</p>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects Created - BarChart */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineFolder className="w-5 h-5 text-indigo-400" />
              Projects Created
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                  <Bar dataKey="projects" name="Projects" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Reviews Per Month - LineChart */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineCodeBracket className="w-5 h-5 text-violet-400" />
              Reviews Per Month
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="reviews"
                    name="Reviews"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.secondary, r: 4, strokeWidth: 2, stroke: '#1e293b' }}
                    activeDot={{ r: 6, stroke: CHART_COLORS.secondary, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Interview Questions - AreaChart */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-emerald-400" />
              Interview Questions
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="interviews"
                    name="Interviews"
                    stroke={CHART_COLORS.success}
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    dot={{ fill: CHART_COLORS.success, r: 4, strokeWidth: 2, stroke: '#1e293b' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Code Quality Trend - LineChart */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineArrowTrendingUp className="w-5 h-5 text-amber-400" />
              Code Quality Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} domain={[60, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    name="Quality Score"
                    stroke={CHART_COLORS.accent}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.accent, r: 4, strokeWidth: 2, stroke: '#1e293b' }}
                    activeDot={{ r: 6, stroke: CHART_COLORS.accent, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bug Detection Trend - BarChart (full width) */}
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineBugAnt className="w-5 h-5 text-rose-400" />
              Bug Detection Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData}>
                  <defs>
                    <linearGradient id="bugGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.rose} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={CHART_COLORS.rose} stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#475569' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }} />
                  <Bar dataKey="bugs" name="Bugs Found" fill="url(#bugGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8">
          <EmptyState
            icon={HiOutlineChartBarSquare}
            title="No activity recorded yet"
            description="Your analytical graphs will populate automatically as you create projects, run AI code reviews, generate documentation, and practice technical interview questions."
          />
        </Card>
      )}
    </div>
  )
}
