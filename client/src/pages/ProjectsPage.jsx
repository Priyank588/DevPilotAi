import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineFolder,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineGlobeAlt,
  HiOutlineLockClosed,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass
} from 'react-icons/hi2'
import projectService from '../services/projectService'
import { useNotification } from '../context/NotificationContext'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import Skeleton from '../components/common/Skeleton'
import ConfirmDialog from '../components/common/ConfirmDialog'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { showToast } = useNotification()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects()
      const projectList = res.data.data || res.data.projects || res.data
      setProjects(Array.isArray(projectList) ? projectList : [])
    } catch (err) {
      showToast('Failed to load projects', 'error')
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await projectService.deleteProject(deleteId)
      setProjects(prev => prev.filter(p => p._id !== deleteId))
      showToast('Project deleted successfully', 'success')
    } catch (err) {
      showToast('Failed to delete project', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-32 rounded"></div>
          <div className="skeleton h-10 w-36 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button
          variant="primary"
          icon={HiOutlinePlus}
          onClick={() => navigate('/projects/new')}
        >
          New Project
        </Button>
      </div>

      {projects.length > 0 && (
        <div className="relative max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
      )}

      {filteredProjects.length === 0 && projects.length === 0 ? (
        <EmptyState
          icon={HiOutlineFolder}
          title="No projects yet"
          description="Create your first project to start using AI-powered code analysis tools."
          actionLabel="Create Project"
          onAction={() => navigate('/projects/new')}
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={HiOutlineMagnifyingGlass}
          title="No matching projects"
          description="Try a different search term."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project._id} hover className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <HiOutlineFolder className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white truncate max-w-[180px]">{project.name}</h3>
                  </div>
                </div>
                <Badge variant={project.visibility === 'private' ? 'warning' : 'success'} size="sm">
                  {project.visibility === 'private' ? (
                    <span className="flex items-center gap-1"><HiOutlineLockClosed className="w-3 h-3" /> Private</span>
                  ) : (
                    <span className="flex items-center gap-1"><HiOutlineGlobeAlt className="w-3 h-3" /> Public</span>
                  )}
                </Badge>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
                {project.description || 'No description provided.'}
              </p>

              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.slice(0, 4).map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/30">
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-700/50 text-slate-400">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/projects/${project._id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 transition-all"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(project._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-all cursor-pointer"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
