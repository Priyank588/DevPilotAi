import { useState } from 'react'
import { HiOutlineBugAnt, HiOutlineSparkles } from 'react-icons/hi2'
import { useNotification } from '../context/NotificationContext'
import analysisService from '../services/analysisService'
import CodeToolLayout from '../components/common/CodeToolLayout'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'

const DEFAULT_CODE = `function processData(data) {
  if (data.length == 0) return;
  var result = null;
  for (var i = 0; i < data.length; i++) {
    result = data[i].value + result;
  }
  console.log(result);
  return result;
}`

const BUG_CATEGORIES = [
  { key: 'logicalBugs', label: 'Logical Bugs', color: 'error' },
  { key: 'syntaxIssues', label: 'Syntax Issues', color: 'warning' },
  { key: 'nullPointerRisks', label: 'Null Risks', color: 'error' },
  { key: 'infiniteLoopRisks', label: 'Loop Risks', color: 'warning' },
  { key: 'memoryIssues', label: 'Memory Issues', color: 'warning' },
  { key: 'unusedImports', label: 'Unused Imports', color: 'info' },
  { key: 'deadCode', label: 'Dead Code', color: 'info' }
]

function BugSection({ label, items }) {
  if (!items?.length) return null
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-2">{label}</h3>
      <div className="space-y-2">
        {items.map((bug, idx) => (
          <div key={idx} className="rounded-lg bg-slate-900/50 border border-slate-700/40 p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-slate-200 break-words">{bug.title}</p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {bug.line > 0 && (
                  <span className="text-[10px] text-slate-500">L{bug.line}</span>
                )}
                {bug.severity && (
                  <Badge variant={bug.severity === 'error' ? 'error' : bug.severity === 'warning' ? 'warning' : 'info'} size="sm">
                    {bug.severity}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 break-words">{bug.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BugDetectionPage() {
  const { showToast } = useNotification()
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleDetect = async () => {
    if (!code.trim()) return
    try {
      setLoading(true)
      setResult(null)
      const res = await analysisService.detectBugs({ code, language })
      setResult(res.data.data || res.data)
      showToast('Bug scan complete!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Bug detection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const hasBugs = result && result.totalBugs > 0

  return (
    <CodeToolLayout
      icon={HiOutlineBugAnt}
      title="Bug Detection"
      subtitle="Find logical errors, security risks, and code smells before they ship"
      gradient="from-rose-600 to-pink-600"
      code={code}
      onCodeChange={setCode}
      language={language}
      onLanguageChange={setLanguage}
      onSubmit={handleDetect}
      submitLabel="Scan for Bugs"
      submitIcon={HiOutlineSparkles}
      loading={loading}
    >
      {loading && <Skeleton variant="card" count={3} />}

      {!loading && !result && (
        <EmptyState
          icon={HiOutlineBugAnt}
          title="No scan yet"
          description="Paste your code and run a bug scan to find potential issues."
        />
      )}

      {!loading && result && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Scan Results</h2>
                <p className="text-sm text-slate-400 mt-1 break-words">{result.summary}</p>
              </div>
              <Badge variant={hasBugs ? 'error' : 'success'} size="lg">
                {result.totalBugs} issue{result.totalBugs !== 1 ? 's' : ''}
              </Badge>
            </div>
          </Card>

          {!hasBugs ? (
            <Card>
              <p className="text-sm text-emerald-400 text-center py-4">No significant issues detected. Your code looks clean!</p>
            </Card>
          ) : (
            BUG_CATEGORIES.map(({ key, label }) => (
              result[key]?.length > 0 && (
                <Card key={key}>
                  <BugSection label={label} items={result[key]} />
                </Card>
              )
            ))
          )}
        </div>
      )}
    </CodeToolLayout>
  )
}
