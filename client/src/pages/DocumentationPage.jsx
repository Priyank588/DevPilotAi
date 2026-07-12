import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineClipboardDocument,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineCodeBracket
} from 'react-icons/hi2'
import { useNotification } from '../context/NotificationContext'
import CodeEditor from '../components/common/CodeEditor'
import documentationService from '../services/documentationService'

export default function DocumentationPage() {
  const { showToast } = useNotification()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [documentation, setDocumentation] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  const handleGenerate = async () => {
    if (!code.trim()) {
      showToast('Please enter some code to generate documentation', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await documentationService.generateDocs({ code })
      setDocumentation(response.data.data || response.data)

      showToast('Documentation generated successfully!', 'success')
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to generate documentation', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    showToast('Copied to clipboard!', 'success')
  }

  const handleDownload = () => {
    if (!documentation) return

    const content = `
# ${documentation.projectSummary?.title || 'Project Documentation'}

## Project Summary
${documentation.projectSummary?.description || ''}

## Installation Guide
${documentation.installationGuide || ''}

## Folder Structure
\`\`\`
${documentation.folderStructure || ''}
\`\`\`

## API Documentation
${documentation.apiDocumentation || ''}

## Usage Instructions
${documentation.usageInstructions || ''}
    `.trim()

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Documentation downloaded!', 'success')
  }

  const tabs = [
    { id: 'summary', label: 'Project Summary', icon: HiOutlineDocumentText },
    { id: 'installation', label: 'Installation', icon: HiOutlineCheckCircle },
    { id: 'structure', label: 'Folder Structure', icon: HiOutlineCodeBracket },
    { id: 'api', label: 'API Docs', icon: HiOutlineSparkles },
    { id: 'readme', label: 'README', icon: HiOutlineClipboardDocument }
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Documentation Generator
          </h1>
          <p className="text-lg text-gray-400">
            Generate comprehensive documentation for your code automatically
          </p>
        </motion.div>

        {/* Code Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <HiOutlineCodeBracket className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Source Code</h2>
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={loading || !code.trim()}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <HiOutlineSparkles className="w-6 h-6" />
                  Generate Documentation
                </>
              )}
            </motion.button>
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            language="javascript"
            placeholder="// Paste your source code here..."
          />
        </motion.div>

        {/* Documentation Output */}
        {documentation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Tabs */}
            <div className="card p-2 mb-6">
              <div className="flex overflow-x-auto hide-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleCopy(getActiveContent())}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border-white/10 text-white text-sm font-semibold hover:border-white/20 transition-all"
                  >
                    <HiOutlineClipboardDocument className="w-5 h-5" />
                    Copy
                  </motion.button>
                  {activeTab === 'readme' && (
                    <motion.button
                      onClick={handleDownload}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all"
                    >
                      <HiOutlineArrowDownTray className="w-5 h-5" />
                      Download
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    {documentation.projectSummary?.title && (
                      <div>
                        <h4 className="text-xl font-bold text-white mb-3">Title</h4>
                        <p className="text-gray-300 leading-relaxed">
                          {documentation.projectSummary.title}
                        </p>
                      </div>
                    )}
                    {documentation.projectSummary?.description && (
                      <div>
                        <h4 className="text-xl font-bold text-white mb-3">Description</h4>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {documentation.projectSummary.description}
                        </p>
                      </div>
                    )}
                    {documentation.projectSummary?.features && (
                      <div>
                        <h4 className="text-xl font-bold text-white mb-3">Key Features</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          {documentation.projectSummary.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'installation' && (
                  <div className="space-y-4">
                    <pre className="glass rounded-2xl p-6 border-white/10 overflow-x-auto">
                      <code className="text-sm text-gray-300 whitespace-pre-wrap">
                        {documentation.installationGuide || 'No installation guide available'}
                      </code>
                    </pre>
                  </div>
                )}

                {activeTab === 'structure' && (
                  <div className="space-y-4">
                    <pre className="glass rounded-2xl p-6 border-white/10 overflow-x-auto">
                      <code className="text-sm text-gray-300 font-mono whitespace-pre">
                        {documentation.folderStructure || 'No folder structure available'}
                      </code>
                    </pre>
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="space-y-4">
                    <div className="glass rounded-2xl p-6 border-white/10">
                      <div
                        className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: documentation.apiDocumentation || 'No API documentation available'
                        }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'readme' && (
                  <div className="space-y-4">
                    <div className="glass rounded-2xl p-8 border-white/10">
                      <div className="text-gray-300 space-y-6">
                        <div>
                          <h1 className="text-3xl font-bold text-white mb-4">
                            {documentation.projectSummary?.title || 'Project Documentation'}
                          </h1>
                          <p className="text-lg leading-relaxed">
                            {documentation.projectSummary?.description || ''}
                          </p>
                        </div>

                        {documentation.installationGuide && (
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Installation</h2>
                            <pre className="glass rounded-xl p-4 border-white/10 overflow-x-auto">
                              <code className="text-sm whitespace-pre-wrap">
                                {documentation.installationGuide}
                              </code>
                            </pre>
                          </div>
                        )}

                        {documentation.usageInstructions && (
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
                            <p className="whitespace-pre-wrap">{documentation.usageInstructions}</p>
                          </div>
                        )}

                        {documentation.folderStructure && (
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Project Structure</h2>
                            <pre className="glass rounded-xl p-4 border-white/10 overflow-x-auto">
                              <code className="text-sm font-mono whitespace-pre">
                                {documentation.folderStructure}
                              </code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {!documentation && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-16 text-center"
          >
            <HiOutlineDocumentText className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">No Documentation Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Paste your source code above and click "Generate Documentation" to create comprehensive
              documentation automatically using AI.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )

  function getActiveContent() {
    if (!documentation) return ''
    
    switch (activeTab) {
      case 'summary':
        return `${documentation.projectSummary?.title || ''}\n\n${documentation.projectSummary?.description || ''}`
      case 'installation':
        return documentation.installationGuide || ''
      case 'structure':
        return documentation.folderStructure || ''
      case 'api':
        return documentation.apiDocumentation || ''
      case 'readme':
        return `# ${documentation.projectSummary?.title || 'Project'}\n\n${documentation.projectSummary?.description || ''}\n\n## Installation\n${documentation.installationGuide || ''}\n\n## Project Structure\n\`\`\`\n${documentation.folderStructure || ''}\n\`\`\``
      default:
        return ''
    }
  }
}
