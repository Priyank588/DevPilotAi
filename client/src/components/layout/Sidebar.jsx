import { NavLink, useLocation } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineFolder,
  HiOutlineCodeBracket,
  HiOutlineBugAnt,
  HiOutlineCpuChip,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlinePencilSquare,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlineUserCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineRocketLaunch,
  HiXMark
} from 'react-icons/hi2'
import useSidebar from '../../hooks/useSidebar'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HiOutlineHome },
  { name: 'Projects', path: '/projects', icon: HiOutlineFolder },
  { name: 'AI Review', path: '/review', icon: HiOutlineCodeBracket },
  { name: 'Bug Detection', path: '/bugs', icon: HiOutlineBugAnt },
  { name: 'Complexity', path: '/complexity', icon: HiOutlineCpuChip },
  { name: 'Documentation', path: '/documentation', icon: HiOutlineDocumentText },
  { name: 'Interview Prep', path: '/interview', icon: HiOutlineAcademicCap },
  { name: 'Notes', path: '/notes', icon: HiOutlinePencilSquare },
  { name: 'Analytics', path: '/analytics', icon: HiOutlineChartBar }
]

const bottomItems = [
  { name: 'Settings', path: '/settings', icon: HiOutlineCog6Tooth },
  { name: 'Profile', path: '/profile', icon: HiOutlineUserCircle }
]

export default function Sidebar({ isOpen, onClose }) {
  const { collapsed, toggleCollapsed } = useSidebar()
  const location = useLocation()

  const sidebarWidth = collapsed ? 'w-20' : 'w-64'

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900/98 via-slate-900/96 to-slate-900/98 backdrop-blur-2xl border-r border-slate-700/30 z-50 transition-all duration-300 flex flex-col shadow-2xl shadow-black/20 ${sidebarWidth} ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className={`flex items-center border-b border-slate-800/50 backdrop-blur-sm ${collapsed ? 'justify-center px-2 py-6' : 'justify-between px-5 py-6'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <HiOutlineRocketLaunch className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            {!collapsed && (
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-xl font-bold text-white truncate tracking-tight">DevPilot</span>
                <span className="text-xl font-light text-indigo-400 tracking-tight">AI</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all lg:hidden cursor-pointer"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'))
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 via-indigo-500/20 to-violet-600/30 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 hover:border hover:border-slate-700/40'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-all ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-2 h-2 flex-shrink-0 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50 animate-pulse" />
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="px-3 py-5 border-t border-slate-700/30 space-y-1.5 bg-gradient-to-t from-slate-800/20 to-transparent">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 via-indigo-500/15 to-violet-500/20 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 hover:shadow-md'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-all ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-400 group-hover:text-indigo-300 group-hover:scale-110'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            )
          })}
          <button
            onClick={toggleCollapsed}
            className={`hidden lg:flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-300 w-full cursor-pointer group hover:shadow-md ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {collapsed ? (
              <HiOutlineChevronRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            ) : (
              <>
                <HiOutlineChevronLeft className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
