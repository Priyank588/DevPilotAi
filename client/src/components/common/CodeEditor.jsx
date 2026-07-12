import { lazy, Suspense } from 'react'
import useTheme from '../../hooks/useTheme'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' }
]

export { LANGUAGE_OPTIONS }

export default function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  height = '320px',
  readOnly = false,
  showLanguageSelect = true
}) {
  const { darkMode } = useTheme()

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-950/80">
      {showLanguageSelect && onLanguageChange && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-900/60">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Language</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer max-w-[140px] sm:max-w-none"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <Suspense
        fallback={
          <div className="flex items-center justify-center text-sm text-slate-500" style={{ height }}>
            Loading editor…
          </div>
        }
      >
        <MonacoEditor
          height={height}
          language={language}
          value={value}
          onChange={(val) => onChange(val ?? '')}
          theme={darkMode ? 'vs-dark' : 'light'}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 }
          }}
        />
      </Suspense>
    </div>
  )
}
