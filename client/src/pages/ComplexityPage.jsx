import { useState } from 'react'
import { HiOutlineCpuChip, HiOutlineSparkles } from 'react-icons/hi2'
import { useNotification } from '../context/NotificationContext'
import analysisService from '../services/analysisService'
import CodeToolLayout from '../components/common/CodeToolLayout'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'

const DEFAULT_CODE = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`

function MetricCard({ label, value, variant = 'primary' }) {
  const colors = {
    primary: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/20 text-indigo-300',
    warning: 'from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-300',
    success: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-300'
  }
  return (
    <div className={`rounded-xl bg-gradient-to-br ${colors[variant]} border p-4 text-center`}>
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-white break-words">{value}</p>
    </div>
  )
}

export default function ComplexityPage() {
  const { showToast } = useNotification()
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    if (!code.trim()) return
    try {
      setLoading(true)
      setResult(null)
      const res = await analysisService.analyzeComplexity({ code, language })
      setResult(res.data.data || res.data)
      showToast('Complexity analysis complete!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Analysis failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CodeToolLayout
      icon={HiOutlineCpuChip}
      title="Complexity Analysis"
      subtitle="Understand time and space complexity of your algorithms"
      gradient="from-violet-600 to-purple-600"
      code={code}
      onCodeChange={setCode}
      language={language}
      onLanguageChange={setLanguage}
      onSubmit={handleAnalyze}
      submitLabel="Analyze Complexity"
      submitIcon={HiOutlineSparkles}
      loading={loading}
    >
      {loading && <Skeleton variant="card" count={3} />}

      {!loading && !result && (
        <EmptyState
          icon={HiOutlineCpuChip}
          title="No analysis yet"
          description="Paste your code to see time/space complexity and optimization tips."
        />
      )}

      {!loading && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Time" value={result.timeComplexity} />
            <MetricCard label="Space" value={result.spaceComplexity} variant="success" />
          </div>

          <Card>
            <h3 className="text-sm font-semibold text-white mb-3">Detected Patterns</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 rounded-lg bg-slate-900/50">
                <span className="text-slate-400">Nested Loops</span>
                <Badge variant={result.nestedLoops?.count > 0 ? 'warning' : 'success'} size="sm">
                  {result.nestedLoops?.count || 0}
                </Badge>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900/50">
                <span className="text-slate-400">Recursion</span>
                <Badge variant={result.recursiveCalls?.count > 0 ? 'warning' : 'success'} size="sm">
                  {result.recursiveCalls?.count || 0}
                </Badge>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900/50">
                <span className="text-slate-400">Duplicates</span>
                <Badge variant={result.duplicateCode?.count > 0 ? 'warning' : 'success'} size="sm">
                  {result.duplicateCode?.count || 0}
                </Badge>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900/50">
                <span className="text-slate-400">Unused Vars</span>
                <Badge variant={result.unusedVariables?.count > 0 ? 'warning' : 'success'} size="sm">
                  {result.unusedVariables?.count || 0}
                </Badge>
              </div>
            </div>
          </Card>

          {result.suggestions?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-white mb-3">Suggestions</h3>
              <ul className="space-y-2">
                {result.suggestions.map((tip, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex gap-2 break-words">
                    <span className="text-indigo-400 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </CodeToolLayout>
  )
}
