export default function Footer() {
  return (
    <footer className="border-t border-slate-800 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} DevPilot AI. All rights reserved.
        </p>
        <p className="text-xs text-slate-600">
          Built with ❤️ for developers
        </p>
      </div>
    </footer>
  )
}
