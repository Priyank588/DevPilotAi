import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '../context/SidebarContext'
import useSidebar from '../hooks/useSidebar'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function DashboardShell() {
  const { collapsed, openMobile, closeMobile } = useSidebar()

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      <Sidebar isOpen={openMobile} onClose={closeMobile} />
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Navbar onMenuToggle={openMobile} />
        <main className="flex-1 px-4 lg:px-6 py-4 sm:py-6 min-w-0">
          <div className="max-w-7xl mx-auto animate-fade-in w-full min-w-0">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardShell />
    </SidebarProvider>
  )
}
