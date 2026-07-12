import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowLeft,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineCodeBracket,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineBugAnt,
  HiOutlineCpuChip,
  HiOutlineInformationCircle
} from 'react-icons/hi2'
import useAuth from '../hooks/useAuth'
import { useNotification } from '../context/NotificationContext'
import projectService from '../services/projectService'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useNotification()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const res = await projectService.getProject(id)
      setProject(res.data.data || res.data)
    } catch (err) {
      showToast('Failed to load project', 'error')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      setDeleting(true)
      await projectService.deleteProject(id)
      showToast('Project deleted successfully', 'success')
      navigate('/projects')
    } catch (err) {
      showToast('Failed to delete project', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiOutlineInformationCircle },
    { id: 'reviews', label: 'Reviews', icon: HiOutlineCodeBracket },
    { id: 'complexity', label: 'Complexity', icon: HiOutlineCpuChip },
    { id: 'bugs', label: 'Bugs', icon: HiOutlineBugAnt },
    { id: 'docs', label: 'Documentation', icon: HiOutlineDocumentText },
    { id: 'interview', label: 'Interviews', icon: HiOutlineAcademicCap }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" count={1} />
        <Skeleton variant="card" count={3} />
      </div>
    )
  }

  if (!project) {
    return (
      <EmptyState
        icon={HiOutlineCodeBracket}
        title="Project not found"
        description="The project you're looking for doesn't exist."
        actionLabel="Back to Projects"
        onAction={() => navigate('/projects')}
      />
    )
  }

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Project Name</p>
                  <p className="text-white font-semibold">{project.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Visibility</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${project.visibility === 'public' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <p className="text-white font-semibold capitalize">{project.visibility}</p>
                  </div>
                </div>
                {project.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-400 mb-1">Description</p>
                    <p className="text-slate-200">{project.description}</p>
                  </div>
                )}
                {project.githubUrl && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-400 mb-1">GitHub Repository</p>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 break-all">
                      {project.githubUrl}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {project.techStack && project.techStack.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm">
                      {tech}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {project.tags && project.tags.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm">
                      {tag}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Created</p>
                  <p className="text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Last Updated</p>
                  <p className="text-white">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'reviews':
        return (
          <Card className="p-6">
            <EmptyState
              icon={HiOutlineCodeBracket}
              title="No reviews yet"
              description="Start an AI code review to analyze this project."
              actionLabel="Start Review"
              onAction={() => navigate(`/review?project=${id}`)}
            />
          </Card>
        )

      case 'complexity':
        return (
          <Card className="p-6">
            <EmptyState
              icon={HiOutlineCpuChip}
              title="No complexity analysis"
              description="Analyze code complexity to understand your algorithms better."
              actionLabel="Analyze Complexity"
              onAction={() => navigate(`/complexity?project=${id}`)}
            />
          </Card>
        )

      case 'bugs':
        return (
          <Card className="p-6">
            <EmptyState
              icon={HiOutlineBugAnt}
              title="No bugs detected"
              description="Run bug detection on your code to find potential issues."
              actionLabel="Detect Bugs"
              onAction={() => navigate(`/bugs?project=${id}`)}
            />
          </Card>
        )

      case 'docs':
        return (
          <Card className="p-6">
            <EmptyState
              icon={HiOutlineDocumentText}
              title="No documentation"
              description="Generate comprehensive documentation for this project."
              actionLabel="Generate Docs"
              onAction={() => navigate(`/documentation?project=${id}`)}
            />
          </Card>
        )

      case 'interview':
        return (
          <Card className="p-6">
            <EmptyState
              icon={HiOutlineAcademicCap}
              title="No interview questions"
              description="Generate practice questions based on this project."
              actionLabel="Generate Questions"
              onAction={() => navigate(`/interview?project=${id}`)}
            />
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-slate-400 mt-1">Project details and analysis</p>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={deleting}
          icon={HiOutlineTrash}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-2 border-b border-slate-700/50 pb-0 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <TabContent />
    </div>
  )
}
