import Card from './Card'
import PageHeader from './PageHeader'
import CodeEditor from './CodeEditor'
import Button from './Button'

export default function CodeToolLayout({
  icon,
  title,
  subtitle,
  gradient,
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onSubmit,
  submitLabel,
  submitIcon,
  loading = false,
  disabled = false,
  toolbar,
  children
}) {
  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in min-w-0">
      <PageHeader icon={icon} title={title} subtitle={subtitle} gradient={gradient} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 min-w-0">
        <Card padding="p-4 sm:p-5" className="min-w-0">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-sm font-semibold text-white">Source Code</h2>
            <span className="text-xs text-slate-500 truncate">{code.split('\n').length} lines</span>
          </div>
          {toolbar}
          <CodeEditor
            value={code}
            onChange={onCodeChange}
            language={language}
            onLanguageChange={onLanguageChange}
            height="min(420px, 50vh)"
          />
          <div className="mt-4">
            <Button
              variant="primary"
              icon={submitIcon}
              loading={loading}
              onClick={onSubmit}
              disabled={disabled || !code.trim()}
              fullWidth
            >
              {submitLabel}
            </Button>
          </div>
        </Card>

        <div className="min-w-0 space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}
