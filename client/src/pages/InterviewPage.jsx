import { useState, useEffect, useContext } from 'react'
import {
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineLightBulb,
  HiOutlineCodeBracket,
  HiOutlineUserGroup,
  HiOutlineCpuChip,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineClock
} from 'react-icons/hi2'
import { NotificationContext } from '../context/NotificationContext'
import interviewService from '../services/interviewService'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'

const TABS = [
  { key: 'mcqs', label: 'MCQs', icon: HiOutlineCheckCircle },
  { key: 'coding', label: 'Coding', icon: HiOutlineCodeBracket },
  { key: 'hr', label: 'HR', icon: HiOutlineUserGroup },
  { key: 'technical', label: 'Technical', icon: HiOutlineCpuChip },
  { key: 'followUp', label: 'Follow-up', icon: HiOutlineChatBubbleLeftRight }
]

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard']
const LANGUAGE_OPTIONS = ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'C#', 'Ruby', 'PHP']

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
      >
        {open ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
        {title}
      </button>
      {open && (
        <div className="mt-2 pl-6 text-sm text-slate-300 bg-slate-900/40 rounded-lg p-3 border border-slate-700/30 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

export default function InterviewPage() {
  const { showToast } = useContext(NotificationContext)

  // Form state
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [language, setLanguage] = useState('JavaScript')
  const [generating, setGenerating] = useState(false)

  // Results state
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('mcqs')
  const [revealedAnswers, setRevealedAnswers] = useState({})

  // History state
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const res = await interviewService.getInterviews()
      setHistory(res.data.data || res.data || [])
    } catch (err) {
      showToast('Failed to load interview history', 'error')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('Please enter a topic', 'warning')
      return
    }
    try {
      setGenerating(true)
      setResults(null)
      setRevealedAnswers({})
      setActiveTab('mcqs')
      const res = await interviewService.generateQuestions({ topic, difficulty, language })
      setResults(res.data.data || res.data)
      showToast('Questions generated successfully!', 'success')
      fetchHistory()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate questions', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await interviewService.deleteInterview(deleteTarget)
      setHistory(prev => prev.filter(h => h._id !== deleteTarget))
      showToast('Question set deleted', 'success')
    } catch (err) {
      showToast('Failed to delete question set', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const toggleAnswer = (key) => {
    setRevealedAnswers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const loadFromHistory = async (id) => {
    try {
      const res = await interviewService.getInterview(id)
      const data = res.data.data || res.data
      setResults(data)
      setActiveTab('mcqs')
      setRevealedAnswers({})
      if (data.topic) setTopic(data.topic)
      if (data.difficulty) setDifficulty(data.difficulty)
      if (data.language) setLanguage(data.language)
    } catch (err) {
      showToast('Failed to load question set', 'error')
    }
  }

  const getTabData = () => {
    if (!results) return []
    const questions = results.questions || results
    switch (activeTab) {
      case 'mcqs': return questions.mcqs || questions.mcq || []
      case 'coding': return questions.coding || []
      case 'hr': return questions.hr || []
      case 'technical': return questions.technical || []
      case 'followUp': return questions.followUp || questions.followup || []
      default: return []
    }
  }

  const renderMCQ = (q, idx) => (
    <Card key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
          {idx + 1}
        </span>
        <p className="text-slate-200 font-medium leading-relaxed">{q.question}</p>
      </div>
      <div className="space-y-2 ml-11">
        {(q.options || []).map((opt, i) => {
          const isRevealed = revealedAnswers[`mcq-${idx}`]
          const isCorrect = isRevealed && (
            q.correctAnswer === i ||
            q.correctAnswer === opt ||
            q.answer === i ||
            q.answer === opt ||
            q.correct === i ||
            q.correct === opt
          )
          return (
            <div
              key={i}
              className={`px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900/40 border-slate-700/30 text-slate-300'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </div>
          )
        })}
      </div>
      <div className="mt-4 ml-11">
        <button
          onClick={() => toggleAnswer(`mcq-${idx}`)}
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          {revealedAnswers[`mcq-${idx}`] ? 'Hide Answer' : 'Show Answer'}
        </button>
        {revealedAnswers[`mcq-${idx}`] && q.explanation && (
          <p className="mt-2 text-sm text-slate-400 bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
            <span className="font-semibold text-emerald-400">Explanation:</span> {q.explanation}
          </p>
        )}
      </div>
    </Card>
  )

  const renderCoding = (q, idx) => (
    <Card key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start gap-3 mb-2">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
          {idx + 1}
        </span>
        <div>
          <p className="text-slate-200 font-medium leading-relaxed">{q.question || q.title || q.problem}</p>
          {q.difficulty && <Badge variant={q.difficulty === 'hard' ? 'error' : q.difficulty === 'medium' ? 'warning' : 'success'} size="sm">{q.difficulty}</Badge>}
        </div>
      </div>
      <CollapsibleSection title="Hint">
        <p>{q.hint || 'No hint available.'}</p>
      </CollapsibleSection>
      <CollapsibleSection title="Solution">
        <pre className="whitespace-pre-wrap font-mono text-xs">{q.solution || q.answer || 'No solution available.'}</pre>
      </CollapsibleSection>
    </Card>
  )

  const renderHR = (q, idx) => (
    <Card key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start gap-3 mb-2">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">
          {idx + 1}
        </span>
        <p className="text-slate-200 font-medium leading-relaxed">{q.question}</p>
      </div>
      <CollapsibleSection title="Sample Answer">
        <p>{q.sampleAnswer || q.answer || 'No sample answer available.'}</p>
      </CollapsibleSection>
      <CollapsibleSection title="Tips">
        <p>{q.tips || 'No tips available.'}</p>
      </CollapsibleSection>
    </Card>
  )

  const renderTechnical = (q, idx) => (
    <Card key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start gap-3 mb-2">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
          {idx + 1}
        </span>
        <p className="text-slate-200 font-medium leading-relaxed">{q.question}</p>
      </div>
      <CollapsibleSection title="Answer">
        <p>{q.answer || 'No answer available.'}</p>
      </CollapsibleSection>
    </Card>
  )

  const renderFollowUp = (q, idx) => (
    <Card key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start gap-3 mb-2">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-sm font-bold text-pink-400">
          {idx + 1}
        </span>
        <p className="text-slate-200 font-medium leading-relaxed">{q.question}</p>
      </div>
      {q.context && (
        <div className="ml-11 mt-2 text-sm text-slate-400 bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
          <span className="font-semibold text-blue-400">Context:</span> {q.context}
        </div>
      )}
      <CollapsibleSection title="Expected Answer">
        <p>{q.expectedAnswer || q.answer || 'No expected answer available.'}</p>
      </CollapsibleSection>
    </Card>
  )

  const tabData = getTabData()

  const renderTabContent = () => {
    if (tabData.length === 0) {
      return (
        <EmptyState
          icon={HiOutlineLightBulb}
          title={`No ${activeTab} questions`}
          description="Try generating questions with a different topic or difficulty."
        />
      )
    }
    switch (activeTab) {
      case 'mcqs': return <div className="space-y-4">{tabData.map(renderMCQ)}</div>
      case 'coding': return <div className="space-y-4">{tabData.map(renderCoding)}</div>
      case 'hr': return <div className="space-y-4">{tabData.map(renderHR)}</div>
      case 'technical': return <div className="space-y-4">{tabData.map(renderTechnical)}</div>
      case 'followUp': return <div className="space-y-4">{tabData.map(renderFollowUp)}</div>
      default: return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <HiOutlineAcademicCap className="w-5 h-5 text-white" />
          </div>
          Interview Preparation
        </h1>
        <p className="text-slate-400 mt-2">Generate AI-powered interview questions for any topic</p>
      </div>

      {/* Form Section */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Hooks, System Design..."
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
            >
              {DIFFICULTY_OPTIONS.map(d => (
                <option key={d} value={d} className="bg-slate-800">
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map(l => (
                <option key={l} value={l} className="bg-slate-800">{l}</option>
              ))}
            </select>
          </div>
        </div>
        <Button
          variant="primary"
          icon={HiOutlineSparkles}
          loading={generating}
          onClick={handleGenerate}
          disabled={!topic.trim()}
        >
          Generate Questions
        </Button>
      </Card>

      {/* Results Section */}
      {generating && (
        <div className="space-y-4">
          <Skeleton variant="card" count={3} />
        </div>
      )}

      {results && !generating && (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      )}

      {/* Previous Question Sets */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <HiOutlineClock className="w-5 h-5 text-indigo-400" />
          Previous Question Sets
        </h2>
        {loadingHistory ? (
          <Skeleton variant="card" count={2} />
        ) : history.length === 0 ? (
          <EmptyState
            icon={HiOutlineAcademicCap}
            title="No previous sessions"
            description="Generate your first set of interview questions above!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <Card key={item._id} hover className="group">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => loadFromHistory(item._id)}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <h3 className="text-white font-medium group-hover:text-indigo-300 transition-colors">
                      {item.topic || 'Interview Session'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {item.difficulty && (
                        <Badge
                          variant={item.difficulty === 'hard' ? 'error' : item.difficulty === 'medium' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {item.difficulty}
                        </Badge>
                      )}
                      {item.language && (
                        <Badge variant="info" size="sm">{item.language}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : 'Recently'}
                    </p>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(item._id) }}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Question Set"
        message="Are you sure you want to delete this question set? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
