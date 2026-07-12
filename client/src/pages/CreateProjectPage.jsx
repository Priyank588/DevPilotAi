import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentArrowUp,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineGlobeAlt,
  HiOutlineLockClosed
} from 'react-icons/hi2'
import { useNotification } from '../context/NotificationContext'
import projectService from '../services/projectService'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Input from '../components/common/Input'

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const { showToast } = useNotification()
  const [loading, setLoading] = useState(false)
  const [techStackInput, setTechStackInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [zipFile, setZipFile] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      techStack: [],
      githubUrl: '',
      visibility: 'private',
      tags: []
    }
  })

  const techStack = watch('techStack', [])
  const tags = watch('tags', [])

  const handleAddTechStack = () => {
    if (techStackInput.trim()) {
      const newTechStack = [...techStack, techStackInput.trim()]
      setValue('techStack', newTechStack)
      setTechStackInput('')
    }
  }

  const handleRemoveTechStack = (index) => {
    const newTechStack = techStack.filter((_, i) => i !== index)
    setValue('techStack', newTechStack)
  }

  const handleAddTag = () => {
    if (tagsInput.trim()) {
      const newTags = [...tags, tagsInput.trim()]
      setValue('tags', newTags)
      setTagsInput('')
    }
  }

  const handleRemoveTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index)
    setValue('tags', newTags)
  }

  const handleZipChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showToast('ZIP file size must be less than 50MB', 'error')
        return
      }
      if (!file.name.endsWith('.zip')) {
        showToast('Please upload a ZIP file', 'error')
        return
      }
      setZipFile(file)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const formData = new FormData()

      Object.keys(data).forEach(key => {
        if (key === 'techStack' || key === 'tags') {
          formData.append(key, JSON.stringify(data[key]))
        } else {
          formData.append(key, data[key])
        }
      })

      if (zipFile) {
        formData.append('zipFile', zipFile)
      }

      const res = await projectService.createProject(formData)
      const createdProject = res.data.data || res.data
      showToast('Project created successfully!', 'success')
      navigate(`/projects/${createdProject._id}`)


    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create project', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Project</h1>
          <p className="text-slate-400 mt-1">Add a new project to analyze with AI</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-400">1</span>
            </div>
            Basic Information
          </h2>

          <div className="space-y-5">
            <Input
              label="Project Name"
              placeholder="e.g., My Awesome App"
              {...register('name', { required: 'Project name is required' })}
              error={errors.name?.message}
            />

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Describe your project..."
                rows="4"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <Input
              label="GitHub Repository URL"
              type="url"
              placeholder="https://github.com/username/repo"
              {...register('githubUrl')}
              error={errors.githubUrl?.message}
            />

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Repository Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'private', label: 'Private', icon: HiOutlineLockClosed },
                  { value: 'public', label: 'Public', icon: HiOutlineGlobeAlt }
                ].map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-3 p-4 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-all has-[:checked]:border-indigo-500/50 has-[:checked]:bg-indigo-500/10"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('visibility')}
                      className="w-4 h-4"
                    />
                    <opt.icon className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300 font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-400">2</span>
            </div>
            Tech Stack & Tags
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                Technologies Used
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechStack())}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={handleAddTechStack}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-indigo-400 font-medium transition-all"
                >
                  <HiOutlinePlus className="w-5 h-5" />
                </button>
              </div>

              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTechStack(idx)}
                        className="hover:text-indigo-200"
                      >
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                Project Tags
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="e.g., web-app, api, production"
                  className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-lg text-violet-400 font-medium transition-all"
                >
                  <HiOutlinePlus className="w-5 h-5" />
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="hover:text-violet-200"
                      >
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-400">3</span>
            </div>
            Upload Source Code
          </h2>

          <div className="border-2 border-dashed border-slate-700/50 rounded-lg p-8 text-center hover:border-slate-600/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".zip"
              onChange={handleZipChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <HiOutlineDocumentArrowUp className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-200 font-semibold mb-1">
                  {zipFile ? zipFile.name : 'Drop your ZIP file here'}
                </p>
                <p className="text-sm text-slate-500">or click to browse (max 50MB)</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-4 pt-4">
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/projects')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
