import { useEffect, useMemo, useState } from 'react'

const STATUS_OPTIONS = ['new', 'reviewing', 'contacted', 'hired', 'rejected']

const initialFilters = {
  search: '',
  status: '',
  position: '',
}

const demoApplications = [
  {
    id: 'demo-001',
    fullName: 'Amara Okafor',
    email: 'amara.okafor@example.com',
    phone: '(404) 555-0144',
    position: 'Certified Nursing Assistant',
    city: 'Alpharetta, GA',
    availability: 'Weekdays, Full-time',
    experience:
      'Six years in senior home support including mobility assistance, medication reminders, and companionship.',
    certifications: 'CNA, CPR, BLS',
    reviewerNotes: 'Strong communication skills. Schedule panel interview.',
    status: 'reviewing',
    submittedAt: '2026-05-03T10:20:00.000Z',
    updatedAt: '2026-05-06T12:30:00.000Z',
    resume: {
      originalName: 'Amara-Okafor-Resume.pdf',
      size: 241712,
    },
  },
  {
    id: 'demo-002',
    fullName: 'James Miller',
    email: 'james.miller@example.com',
    phone: '(678) 555-0199',
    position: 'Home Health Aide',
    city: 'Roswell, GA',
    availability: 'Nights and Weekends',
    experience:
      'Four years delivering personal care support and ADL assistance for post-surgery recovery clients.',
    certifications: 'HHA, CPR',
    reviewerNotes: 'Prefers overnight assignments. Verify transportation coverage.',
    status: 'contacted',
    submittedAt: '2026-05-08T09:15:00.000Z',
    updatedAt: '2026-05-11T16:45:00.000Z',
    resume: {
      originalName: 'James-Miller-CV.docx',
      size: 132901,
    },
  },
  {
    id: 'demo-003',
    fullName: 'Fatima Rahman',
    email: 'fatima.rahman@example.com',
    phone: '(770) 555-0132',
    position: 'Licensed Practical Nurse',
    city: 'Sandy Springs, GA',
    availability: 'Flexible',
    experience:
      'Eight years in geriatric and memory-care environments with wound-care and medication administration expertise.',
    certifications: 'LPN, CPR, Dementia Care',
    reviewerNotes: '',
    status: 'new',
    submittedAt: '2026-05-14T13:05:00.000Z',
    updatedAt: '2026-05-14T13:05:00.000Z',
    resume: {
      originalName: 'Fatima-Rahman-Resume.pdf',
      size: 318406,
    },
  },
]

const formatDateTime = (value) => {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const formatStatusLabel = (status) => {
  switch (status) {
    case 'reviewing':
      return 'Reviewing'
    case 'contacted':
      return 'Contacted'
    case 'hired':
      return 'Hired'
    case 'rejected':
      return 'Rejected'
    default:
      return 'New'
  }
}

const statusToneClass = (status) => {
  switch (status) {
    case 'reviewing':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    case 'contacted':
      return 'bg-blue-500/15 text-blue-300 border-blue-500/30'
    case 'hired':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'rejected':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  }
}

export default function CareerApplicationsAdminPanel() {
  const [applications, setApplications] = useState(demoApplications)
  const [filters, setFilters] = useState(initialFilters)
  const [selectedApplicationId, setSelectedApplicationId] = useState(demoApplications[0]?.id ?? '')
  const [detailForm, setDetailForm] = useState({
    status: demoApplications[0]?.status ?? '',
    reviewerNotes: demoApplications[0]?.reviewerNotes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const filteredApplications = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase()

    return applications.filter((application) => {
      const matchesSearch =
        !searchTerm ||
        application.fullName.toLowerCase().includes(searchTerm) ||
        application.email.toLowerCase().includes(searchTerm) ||
        application.position.toLowerCase().includes(searchTerm)

      const matchesStatus = !filters.status || application.status === filters.status
      const matchesPosition = !filters.position || application.position === filters.position

      return matchesSearch && matchesStatus && matchesPosition
    })
  }, [applications, filters])

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId],
  )

  const availablePositions = useMemo(
    () => [...new Set(applications.map((application) => application.position))],
    [applications],
  )

  const statusCountMap = useMemo(
    () =>
      applications.reduce((accumulator, item) => {
        accumulator[item.status] = (accumulator[item.status] ?? 0) + 1
        return accumulator
      }, {}),
    [applications],
  )

  useEffect(() => {
    if (filteredApplications.length === 0) {
      setSelectedApplicationId('')
      setDetailForm({ status: '', reviewerNotes: '' })
      return
    }

    const selectedStillVisible = filteredApplications.some(
      (application) => application.id === selectedApplicationId,
    )

    if (!selectedStillVisible) {
      const nextSelected = filteredApplications[0]
      setSelectedApplicationId(nextSelected.id)
      setDetailForm({
        status: nextSelected.status,
        reviewerNotes: nextSelected.reviewerNotes ?? '',
      })
    }
  }, [filteredApplications, selectedApplicationId])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
    setMessage('')
  }

  const handleSelectApplication = (application) => {
    setSelectedApplicationId(application.id)
    setDetailForm({
      status: application.status,
      reviewerNotes: application.reviewerNotes ?? '',
    })
    setMessage('')
  }

  const handleDetailChange = (event) => {
    const { name, value } = event.target
    setDetailForm((current) => ({ ...current, [name]: value }))
  }

  const handleSaveApplication = () => {
    if (!selectedApplication) return

    setSaving(true)

    setApplications((current) =>
      current.map((application) =>
        application.id === selectedApplication.id
          ? {
              ...application,
              status: detailForm.status,
              reviewerNotes: detailForm.reviewerNotes,
              updatedAt: new Date().toISOString(),
            }
          : application,
      ),
    )

    setMessage('Changes saved locally in this browser session.')
    setSaving(false)
  }

  const handleDeleteApplication = () => {
    if (!selectedApplication) return

    const confirmDelete = window.confirm(
      `Remove ${selectedApplication.fullName} from this dashboard view?`,
    )
    if (!confirmDelete) return

    setApplications((current) =>
      current.filter((application) => application.id !== selectedApplication.id),
    )
    setMessage('Application removed from the local dashboard list.')
  }

  const resetDemoData = () => {
    setApplications(demoApplications)
    setFilters(initialFilters)
    const first = demoApplications[0]
    setSelectedApplicationId(first?.id ?? '')
    setDetailForm({
      status: first?.status ?? '',
      reviewerNotes: first?.reviewerNotes ?? '',
    })
    setMessage('Demo data restored.')
  }

  return (
    <section id="admin" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4">Admin Panel</p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-3">Career Application Manager</h2>
            <p className="text-slate-400 max-w-3xl">
              Frontend-only dashboard mode with local demo records.
            </p>
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            className="self-start md:self-auto px-5 py-3 rounded-2xl border border-slate-700 bg-slate-900 hover:border-blue-500/50 transition"
          >
            Restore Demo Data
          </button>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-500 text-sm mb-1">Total</p>
            <h3 className="text-3xl font-bold">{applications.length}</h3>
          </div>
          {STATUS_OPTIONS.map((status) => (
            <div key={status} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-slate-500 text-sm mb-1">{formatStatusLabel(status)}</p>
              <h3 className="text-3xl font-bold">{statusCountMap[status] ?? 0}</h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-5 lg:p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search applicants"
                  className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition"
                />
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition"
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <select
                  name="position"
                  value={filters.position}
                  onChange={handleFilterChange}
                  className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition"
                >
                  <option value="">All positions</option>
                  {availablePositions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              {message && <p className="text-green-400 text-sm">{message}</p>}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[28px] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Applications</h3>
                <p className="text-sm text-slate-500">{`${filteredApplications.length} shown`}</p>
              </div>

              <div className="max-h-[720px] overflow-y-auto divide-y divide-slate-800">
                {filteredApplications.length === 0 && (
                  <div className="px-6 py-10 text-center text-slate-500">
                    No applications match the current filters.
                  </div>
                )}

                {filteredApplications.map((application) => (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => handleSelectApplication(application)}
                    className={`w-full text-left px-6 py-5 transition hover:bg-slate-800/60 ${
                      selectedApplicationId === application.id ? 'bg-slate-800/80' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{application.fullName}</h4>
                          <span
                            className={`text-xs border px-3 py-1 rounded-full ${statusToneClass(application.status)}`}
                          >
                            {formatStatusLabel(application.status)}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {application.position} · {application.city} · {application.email}
                        </p>
                      </div>

                      <div className="text-sm text-slate-500">
                        <p>{formatDateTime(application.submittedAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-6 lg:p-7 sticky top-6">
            {selectedApplication ? (
              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-2xl font-semibold">{selectedApplication.fullName}</h3>
                    <span
                      className={`text-xs border px-3 py-1 rounded-full ${statusToneClass(selectedApplication.status)}`}
                    >
                      {formatStatusLabel(selectedApplication.status)}
                    </span>
                  </div>
                  <p className="text-slate-400">{selectedApplication.position}</p>
                </div>

                <div className="grid gap-4 text-sm">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <p className="text-slate-500 mb-1">Contact</p>
                    <p>{selectedApplication.email}</p>
                    <p>{selectedApplication.phone}</p>
                    <p>
                      {selectedApplication.city} · {selectedApplication.availability}
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <p className="text-slate-500 mb-1">Resume</p>
                    <p className="text-slate-300">{selectedApplication.resume.originalName}</p>
                    <p className="text-slate-500 mt-2">
                      {Math.round(selectedApplication.resume.size / 1024)} KB · Preview disabled in frontend-only mode
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <p className="text-slate-500 mb-1">Experience</p>
                    <p className="leading-relaxed text-slate-300">{selectedApplication.experience}</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <p className="text-slate-500 mb-1">Certifications</p>
                    <p className="leading-relaxed text-slate-300">
                      {selectedApplication.certifications || 'None listed'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2" htmlFor="status">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={detailForm.status}
                      onChange={handleDetailChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2" htmlFor="reviewerNotes">
                      Reviewer Notes
                    </label>
                    <textarea
                      id="reviewerNotes"
                      name="reviewerNotes"
                      value={detailForm.reviewerNotes}
                      onChange={handleDetailChange}
                      rows="5"
                      placeholder="Add interview notes, follow-up details, or internal comments."
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSaveApplication}
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3 rounded-2xl font-semibold transition"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteApplication}
                    disabled={saving}
                    className="flex-1 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3 rounded-2xl font-semibold transition"
                  >
                    Remove From List
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Submitted {formatDateTime(selectedApplication.submittedAt)} · Updated{' '}
                  {formatDateTime(selectedApplication.updatedAt)}
                </p>
              </div>
            ) : (
              <div className="min-h-[520px] flex items-center justify-center text-center text-slate-500">
                Select an application to review local details.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}