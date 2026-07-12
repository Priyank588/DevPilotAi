import { HiOutlineRocketLaunch, HiOutlineCodeBracket, HiOutlineCpuChip } from 'react-icons/hi2'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_50%)]"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <HiOutlineRocketLaunch className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">DevPilot</span>
              <span className="text-2xl font-light text-indigo-200 ml-1">AI</span>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Build Better Code<br />
            <span className="text-indigo-200">with AI-Powered Tools</span>
          </h1>

          <p className="text-lg text-indigo-100/80 mb-12 max-w-md">
            Code review, bug detection, complexity analysis, and more — all powered by artificial intelligence.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/90 animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <HiOutlineCodeBracket className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">AI Code Review</p>
                <p className="text-sm text-indigo-200/70">Get instant feedback on code quality</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/90 animate-slide-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <HiOutlineCpuChip className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Smart Analysis</p>
                <p className="text-sm text-indigo-200/70">Complexity & performance insights</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 xl:left-20">
            <div className="glass-card px-4 py-3 animate-float">
              <code className="text-sm text-indigo-200 font-mono">
                <span className="text-emerald-300">const</span> quality = <span className="text-amber-300">await</span> ai.review(code);
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-slate-900">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
