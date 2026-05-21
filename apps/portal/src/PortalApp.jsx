import CareerApplicationsAdminPanel from './components/CareerApplicationsAdminPanel'
import CaregiverMessaging from './components/CaregiverMessaging'

const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173'

export default function PortalApp() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Kenkwo Operations Portal</h1>
            <p className="text-sm text-slate-400">Messaging and hiring operations</p>
          </div>
          <a
            href={publicSiteUrl}
            className="inline-flex items-center justify-center border border-slate-700 hover:border-slate-500 transition px-4 py-2 rounded-xl text-sm font-medium w-full sm:w-auto min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Back to Public Site
          </a>
        </div>
      </header>

      <main>
        <CaregiverMessaging />
        <CareerApplicationsAdminPanel />
      </main>
    </div>
  )
}