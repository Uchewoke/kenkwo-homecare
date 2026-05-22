import { useEffect, useState } from 'react'

const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const tokenStorageKey = 'kenkwo.portal.adminFaqToken'

const formatJson = (value) => `${JSON.stringify(value, null, 2)}\n`

export default function AssistantFaqAdminEditor() {
  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window === 'undefined') return ''
    return window.sessionStorage.getItem(tokenStorageKey) || ''
  })
  const [editorValue, setEditorValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const loadFaqConfig = async () => {
    if (!adminToken.trim()) {
      setLoading(false)
      setStatus({ type: 'error', message: 'Enter an admin token to load FAQ settings.' })
      return
    }

    try {
      setLoading(true)
      setStatus({ type: '', message: '' })

      const response = await fetch(`${serverUrl}/api/admin/assistant-faq`, {
        headers: {
          Authorization: `Bearer ${adminToken.trim()}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load FAQ configuration.')
      }

      setEditorValue(formatJson(data.config))
      setStatus({ type: 'success', message: 'FAQ loaded successfully.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminToken.trim()) {
      setLoading(false)
      return
    }

    loadFaqConfig()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(tokenStorageKey, adminToken)
  }, [adminToken])

  const handleSave = async () => {
    if (!adminToken.trim()) {
      setStatus({ type: 'error', message: 'Enter an admin token before saving.' })
      return
    }

    let parsed

    try {
      parsed = JSON.parse(editorValue)
    } catch {
      setStatus({ type: 'error', message: 'JSON is invalid. Please fix syntax before saving.' })
      return
    }

    try {
      setSaving(true)
      setStatus({ type: '', message: '' })

      const response = await fetch(`${serverUrl}/api/admin/assistant-faq`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken.trim()}`,
        },
        body: JSON.stringify(parsed),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save FAQ configuration.')
      }

      setEditorValue(formatJson(data.config))
      setStatus({ type: 'success', message: 'FAQ saved and published successfully.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="faq-admin" className="py-20 sm:py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="mb-8">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4">AI Assistant FAQ</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3">FAQ JSON Editor</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl">
            Edit assistant responses in JSON and publish updates without changing code.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-4 sm:p-6 lg:p-7 space-y-4">
          <div className="grid gap-2">
            <label htmlFor="adminFaqToken" className="text-sm text-slate-400">
              Admin Token
            </label>
            <input
              id="adminFaqToken"
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Enter ADMIN_FAQ_TOKEN"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              File managed by backend: <span className="text-slate-300">assistant-faq.json</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadFaqConfig}
                disabled={loading || saving}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-950 hover:border-slate-500 transition text-sm disabled:opacity-50 min-h-[44px]"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || saving || !editorValue.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 min-h-[44px]"
              >
                {saving ? 'Saving...' : 'Save FAQ'}
              </button>
            </div>
          </div>

          <textarea
            value={editorValue}
            onChange={(event) => setEditorValue(event.target.value)}
            className="w-full h-[360px] sm:h-[440px] bg-slate-950 border border-slate-700 rounded-2xl p-4 font-mono text-xs sm:text-sm outline-none focus:border-blue-500"
            spellCheck={false}
            disabled={loading}
            placeholder={loading ? 'Loading FAQ JSON...' : 'FAQ JSON content'}
          />

          {status.message && (
            <p className={`text-sm ${status.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {status.message}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
