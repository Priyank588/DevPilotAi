import { Link } from 'react-router-dom'
import { HiOutlineHome, HiOutlineSquares2X2 } from 'react-icons/hi2'
import Button from '../components/common/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden px-4">
      {/* Floating animated decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-[120px] animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-[140px] animate-float"
        style={{ animationDelay: '2s', animationDuration: '8s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] animate-float"
        style={{ animationDelay: '4s', animationDuration: '10s' }}
      />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Large gradient 404 */}
        <h1 className="text-[10rem] sm:text-[12rem] font-black leading-none select-none bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button variant="primary" size="lg" icon={HiOutlineHome}>
              Go Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="lg" icon={HiOutlineSquares2X2}>
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Decorative line */}
        <div className="mt-16 flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-700" />
          <span className="text-xs text-slate-600 font-medium tracking-widest uppercase">
            DevPilot AI
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-700" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          33% { transform: translateY(-20px) scale(1.05); }
          66% { transform: translateY(10px) scale(0.95); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
