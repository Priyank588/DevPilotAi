import { useState, useEffect } from 'react'
import {
  HiOutlineCodeBracket,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineBoltSlash,
  HiOutlineShieldExclamation,
  HiOutlineLightBulb,
  HiOutlineArrowPath,
  HiOutlineAdjustmentsHorizontal
} from 'react-icons/hi2'
import { useNotification } from '../context/NotificationContext'
import reviewService from '../services/reviewService'
import CodeToolLayout from '../components/common/CodeToolLayout'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'

const DEFAULT_CODE = `function findMax(arr) {
  if (!arr || arr.length === 0) return null;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}`

// Determine score color based on value
function getScoreColor(value) {
  if (value >= 85) return 'from-emerald-500 to-teal-500'
  if (value >= 70) return 'from-indigo-500 to-violet-500'
  if (value >= 55) return 'from-yellow-500 to-orange-500'
  return 'from-rose-500 to-red-500'
}

// Determine badge variant based on severity
function getSeverityVariant(severity) {
  switch (severity) {
    case 'critical':
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    default:
      return 'info'
  }
}

// Icon selector for suggestion types
function SuggestionIcon({ type, severity }) {
  const iconClass = "w-4 h-4"
  switch (type) {
    case 'security':
      return <HiOutlineShieldExclamation className={iconClass + ' text-red-400'} />
    case 'optimization':
      return <HiOutlineBoltSlash className={iconClass + ' text-yellow-400'} />
    case 'refactor':
      return <HiOutlineArrowPath className={iconClass + ' text-blue-400'} />
    case 'practice':
      return <HiOutlineLightBulb className={iconClass + ' text-amber-400'} />
    default:
      return severity === 'error' || severity === 'critical' ? 
        <HiOutlineExclamationTriangle className={iconClass + ' text-red-400'} /> :
        <HiOutlineCheckCircle className={iconClass + ' text-green-400'} />
  }
}

function ScoreBar({ label, value }) {
  const scoreColor = getScoreColor(value)
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">{value}/100</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-700/50 overflow-hidden shadow-sm">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${scoreColor} transition-all duration-700 shadow-lg`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

function SuggestionList({ title, items, type, emptyText = 'No issues found.' }) {
  if (!items?.length) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <SuggestionIcon type={type} />
          {title}
        </h3>
        <p className="text-sm text-slate-500">{emptyText}</p>
      </div>
    )
  }
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <SuggestionIcon type={type} />
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-lg bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/40 p-3 hover:border-slate-600/60 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-slate-200 break-words">{item.title}</p>
              {(item.severity || item.impact) && (
                <Badge
                  variant={getSeverityVariant(item.severity || item.impact)}
                  size="sm"
                >
                  {item.severity || item.impact}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 break-words leading-relaxed">{item.description}</p>
            {item.codeSnippet && (
              <pre className="mt-2 p-2 bg-slate-950/50 rounded border border-slate-700/50 text-xs text-slate-300 overflow-x-auto">
                <code>{item.codeSnippet}</code>
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AIReviewPage() {
  const { showToast } = useNotification()
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    practices: true,
    security: true,
    optimizations: true
  })

  useEffect(() => {
    fetchHistory()
    // Add keyboard shortcut for quick submission (Ctrl+Enter or Cmd+Enter)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && code.trim()) {
        handleReview()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [code, loading])

  const fetchHistory = async () => {
    try {
      const res = await reviewService.getReviews()
      setHistory(res.data.data || res.data || [])
    } catch {
      showToast('Failed to load review history', 'error')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleReview = async () => {
    if (!code.trim()) return
    try {
      setLoading(true)
      setResult(null)
      const res = await reviewService.createReview({ code, language })
      const data = res.data.data || res.data
      setResult(data)
      showToast('Code review complete!', 'success')
      fetchHistory()
    } catch (err) {
      showToast(err.response?.data?.message || 'Review failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await reviewService.deleteReview(deleteId)
      setHistory(prev => prev.filter(r => r._id !== deleteId))
      if (result?._id === deleteId) setResult(null)
      showToast('Review deleted', 'success')
    } catch {
      showToast('Failed to delete review', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  const loadReview = async (id) => {
    try {
      const res = await reviewService.getReview(id)
      const data = res.data.data || res.data
      setResult(data)
      if (data.code) setCode(data.code)
      if (data.language) setLanguage(data.language)
    } catch {
      showToast('Failed to load review', 'error')
    }
  }

  return (
    <>
      <CodeToolLayout
        icon={HiOutlineCodeBracket}
        title="AI Code Review"
        subtitle="Get instant feedback on code quality, readability, and best practices"
        gradient="from-indigo-600 to-violet-600"
        code={code}
        onCodeChange={setCode}
        language={language}
        onLanguageChange={setLanguage}
        onSubmit={handleReview}
        submitLabel="Run Review"
        submitIcon={HiOutlineSparkles}
        loading={loading}
      >
        {loading && <Skeleton variant="card" count={3} />}

        {!loading && !result && (
          <EmptyState
            icon={HiOutlineCodeBracket}
            title="No review yet"
            description="Paste your code and click Run Review (or press Ctrl+Enter) to see quality scores and suggestions."
          />
        )}

        {!loading && result && (
          <div className="space-y-4 animate-fade-in">
            {/* Overall Score Card */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-indigo-500/20">
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-1">Overall Score</h2>
                    <p className="text-xs text-slate-400">Comprehensive code quality analysis</p>
                  </div>
                  <div className={`text-4xl font-bold bg-gradient-to-br ${getScoreColor(result.overallRating)} bg-clip-text text-transparent`}>
                    {result.overallRating}/100
                  </div>
                </div>
                <div className="space-y-4">
                  <ScoreBar label="Code Quality" value={result.codeQuality || 0} />
                  <ScoreBar label="Readability" value={result.readability || 0} />
                  <ScoreBar label="Maintainability" value={result.maintainability || 0} />
                </div>
                {result.summary && (
                  <div className="mt-4 p-3 bg-slate-950/50 rounded-lg border border-slate-700/40">
                    <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Best Practices */}
            <Card>
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, practices: !prev.practices }))}
                className="w-full text-left"
              >
                <SuggestionList 
                  title="Best Practices" 
                  items={expandedSections.practices ? result.bestPractices : []}
                  type="practice"
                />
              </button>
            </Card>

            {/* Security Suggestions */}
            <Card>
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, security: !prev.security }))}
                className="w-full text-left"
              >
                <SuggestionList 
                  title="Security Issues" 
                  items={expandedSections.security ? result.securitySuggestions : []}
                  type="security"
                  emptyText="No security concerns detected."
                />
              </button>
            </Card>

            {/* Optimization Suggestions */}
            <Card>
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, optimizations: !prev.optimizations }))}
                className="w-full text-left"
              >
                <SuggestionList 
                  title="Performance Optimizations" 
                  items={expandedSections.optimizations ? result.optimizationSuggestions : []}
                  type="optimization"
                  emptyText="No optimization suggestions."
                />
              </button>
            </Card>

            {/* Refactoring Suggestions */}
            {result.refactoringSuggestions?.length > 0 && (
              <Card>
                <SuggestionList 
                  title="Refactoring Opportunities" 
                  items={result.refactoringSuggestions}
                  type="refactor"
                />
              </Card>
            )}

            {/* Naming Suggestions */}
            {result.namingSuggestions?.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-purple-400" />
                  Naming Improvements
                </h3>
                <div className="space-y-2">
                  {result.namingSuggestions.map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-800/30 border border-slate-700/40 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs px-2 py-1 bg-slate-950 rounded text-emerald-400">{item.current}</code>
                        <span className="text-slate-500">→</span>
                        <code className="text-xs px-2 py-1 bg-slate-950 rounded text-cyan-400">{item.suggested}</code>
                      </div>
                      <p className="text-xs text-slate-400">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Recent Reviews */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <HiOutlineClock className="w-4 h-4 text-indigo-400" />
            Recent Reviews ({history.length})
          </h3>
          {loadingHistory ? (
            <Skeleton variant="card" count={2} />
          ) : history.length === 0 ? (
            <p className="text-sm text-slate-500">No past reviews yet.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {history.slice(0, 10).map((review) => (
                <div
                  key={review._id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-slate-700/30 transition-colors border border-slate-700/20 hover:border-slate-600/40 group cursor-pointer"
                  onClick={() => loadReview(review._id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate font-medium">
                      {review.language || 'javascript'} · Score {review.overallRating}/100
                    </p>
                    <p className="text-xs text-slate-500">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Recently'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(review._id)
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </CodeToolLayout>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review?"
        confirmText="Delete"
      />
    </>
  )
}
