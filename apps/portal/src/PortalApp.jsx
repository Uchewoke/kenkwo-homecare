import CareerApplicationsAdminPanel from './components/CareerApplicationsAdminPanel'
import CaregiverMessaging from './components/CaregiverMessaging'

const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173'

export default function PortalApp() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Kenkwo Operations Portal</h1>
            <p className="text-sm text-slate-400">Messaging and hiring operations</p>
          </div>
          <a
            href={publicSiteUrl}
            className="border border-slate-700 hover:border-slate-500 transition px-4 py-2 rounded-xl text-sm font-medium"
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