import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineRocketLaunch,
  HiOutlineCodeBracket,
  HiOutlineBugAnt,
  HiOutlineCpuChip,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineBolt,
  HiOutlineCommandLine
} from 'react-icons/hi2'

const features = [
  {
    icon: HiOutlineCodeBracket,
    title: 'AI Code Review',
    description: 'Get instant, intelligent feedback on your code quality, readability, and maintainability.',
    color: 'from-purple-500 to-blue-500'
  },
  {
    icon: HiOutlineBugAnt,
    title: 'Bug Detection',
    description: 'Identify potential bugs, security vulnerabilities, and logical errors before they reach production.',
    color: 'from-rose-500 to-pink-500'
  },
  {
    icon: HiOutlineCpuChip,
    title: 'Complexity Analysis',
    description: 'Understand time and space complexity of your algorithms with detailed explanations.',
    color: 'from-violet-500 to-purple-500'
  },
  {
    icon: HiOutlineDocumentText,
    title: 'Documentation Generator',
    description: 'Auto-generate comprehensive documentation including README, API docs, and guides.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Interview Prep',
    description: 'Generate tailored interview questions with answers for any topic and difficulty level.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: HiOutlineChartBar,
    title: 'Developer Analytics',
    description: 'Track your development progress with beautiful charts and actionable insights.',
    color: 'from-cyan-500 to-blue-500'
  }
]

const steps = [
  {
    number: '01',
    icon: HiOutlineCommandLine,
    title: 'Paste Your Code',
    description: 'Simply paste your code into our powerful Monaco editor with syntax highlighting.'
  },
  {
    number: '02',
    icon: HiOutlineSparkles,
    title: 'AI Analyzes',
    description: 'Our AI engine reviews your code for quality, bugs, complexity, and best practices.'
  },
  {
    number: '03',
    icon: HiOutlineBolt,
    title: 'Get Results',
    description: 'Receive detailed reports with scores, suggestions, and actionable improvement tips.'
  }
]

const stats = [
  { value: '50K+', label: 'Code Reviews' },
  { value: '10K+', label: 'Developers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'Rating' }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] overflow-hidden">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-500/30">
                <HiOutlineRocketLaunch className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">DevPilot</span>
              <span className="text-2xl font-light text-purple-400 tracking-tight">AI</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex items-center gap-10"
            >
              <a href="#features" className="text-base font-medium text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-base font-medium text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#stats" className="text-base font-medium text-gray-300 hover:text-white transition-colors">Stats</a>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link
                to="/login"
                className="text-base font-semibold text-gray-300 hover:text-white transition-colors px-6 py-3"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-base font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3 rounded-xl hover:from-[#6D28D9] hover:to-[#7C3AED] transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 sm:pt-48 sm:pb-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px]"></div>
          <div className="absolute top-40 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[120px]"></div>
        </div>

        <div className="relative container">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center lg:text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-full glass border-purple-500/20 mb-10"
              >
                <HiOutlineSparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">Powered by AI · Built for Developers</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight"
              >
                Build Better Code
                <br />
                <span className="text-gradient">with AI-Powered Tools</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed"
              >
                Code review, bug detection, complexity analysis, and more — all powered by artificial intelligence.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row sm:justify-center lg:justify-start items-center gap-5"
              >
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-2xl shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 transition-all duration-300"
                >
                  Get Started Free
                  <HiOutlineArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white glass border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300"
                >
                  Learn More
                </a>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              <div className="glass-strong rounded-[32px] p-8 shadow-2xl border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-gray-400">Live Analysis</span>
                  </div>
                </div>

                <div className="bg-black/40 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-white/5">
                  <pre className="text-base text-gray-100 leading-loose font-mono">
{`function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Quality', value: '92/100', color: 'emerald' },
                    { label: 'Security', value: 'No issues', color: 'blue' },
                    { label: 'Complexity', value: 'O(n)', color: 'purple' },
                    { label: 'Suggestions', value: '2 found', color: 'amber' }
                  ].map((item) => (
                    <div key={item.label} className="glass rounded-2xl p-5 border-white/5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{item.label}</p>
                      <p className="text-lg font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Everything You Need to
              <br />
              <span className="text-gradient">Ship Better Code</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A comprehensive suite of AI-powered tools designed to make you a more productive developer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group card card-glow cursor-pointer p-8"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-base text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10"></div>
        <div className="relative container">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Trusted by <span className="text-gradient">Developers Worldwide</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-5xl sm:text-6xl font-bold text-gradient mb-3">{stat.value}</p>
                <p className="text-base text-gray-400 font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get started in three simple steps and transform your workflow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 mb-8 shadow-lg">
                  <step.icon className="w-10 h-10 text-purple-400" />
                </div>
                <span className="block text-sm font-bold text-purple-400 mb-4 tracking-[0.2em]">STEP {step.number}</span>
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-base text-gray-400 leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-violet-600/10 to-blue-600/20"></div>
        <div className="relative container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
              Ready to Supercharge Your
              <br />
              <span className="text-gradient">Development Workflow?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Join thousands of developers building better code with AI-powered tools.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300"
            >
              Start Building for Free
              <HiOutlineArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-white/10 bg-[#0B1120] py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <HiOutlineRocketLaunch className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">DevPilot</span>
                  <span className="text-2xl font-light text-purple-400">AI</span>
                </div>
              </div>
              <p className="text-base text-gray-400 leading-relaxed mb-6">
                AI-powered developer tools for better code quality, security, and productivity.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl glass border-white/10 hover:border-purple-500/50 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl glass border-white/10 hover:border-purple-500/50 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl glass border-white/10 hover:border-purple-500/50 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-base font-bold text-white mb-6">Product</h3>
              <ul className="space-y-4">
                <li><a href="#features" className="text-base text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-base text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-base font-bold text-white mb-6">Company</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-base font-bold text-white mb-6">Legal</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">License</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} DevPilot AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">Get Started →</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
