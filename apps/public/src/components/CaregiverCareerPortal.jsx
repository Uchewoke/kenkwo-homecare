import { useState } from 'react'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  city: '',
  availability: '',
  experience: '',
  certifications: '',
  authorization: false,
  resume: null,
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export default function CaregiverCareerPortal() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] ?? null : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    if (!form.resume) {
      setStatus({ type: 'error', message: 'Please upload your resume before submitting.' })
      return
    }

    if (!form.authorization) {
      setStatus({
        type: 'error',
        message: 'You must confirm your authorization to work and be contacted.',
      })
      return
    }

    const submission = new FormData()
    submission.append('fullName', form.fullName)
    submission.append('email', form.email)
    submission.append('phone', form.phone)
    submission.append('position', form.position)
    submission.append('city', form.city)
    submission.append('availability', form.availability)
    submission.append('experience', form.experience)
    submission.append('certifications', form.certifications)
    submission.append('authorization', String(form.authorization))
    submission.append('resume', form.resume)

    try {
      setIsSubmitting(true)
      const response = await fetch(`${apiBaseUrl}/api/career-applications`, {
        method: 'POST',
        body: submission,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit application.')
      }

      setStatus({
        type: 'success',
        message: `Application submitted successfully. Reference ID: ${data.application.id}`,
      })
      setForm(initialForm)
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="careers" className="py-20 lg:py-24 bg-gradient-to-br from-blue-950/40 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4">
            Caregiver Careers
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Apply to Join the Kenkwo Team</h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Submit your caregiver application online with your contact information, role preference,
            availability, and resume.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 sm:p-8 lg:p-10 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2" htmlFor="position">
                  Desired Position
                </label>
                <select
                  id="position"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Certified Nursing Assistant">Certified Nursing Assistant</option>
                  <option value="Licensed Practical Nurse">Licensed Practical Nurse</option>
                  <option value="Registered Nurse">Registered Nurse</option>
                  <option value="Home Health Aide">Home Health Aide</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2" htmlFor="city">
                  City / State
                </label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2" htmlFor="availability">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select availability</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Per diem">Per diem</option>
                  <option value="Overnight">Overnight</option>
                  <option value="Weekend">Weekend</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2" htmlFor="experience">
                Care Experience Summary
              </label>
              <textarea
                id="experience"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                rows="5"
                placeholder="Describe your caregiving background, years of experience, and specialties."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2" htmlFor="certifications">
                Certifications and Licenses
              </label>
              <textarea
                id="certifications"
                name="certifications"
                value={form.certifications}
                onChange={handleChange}
                rows="3"
                placeholder="List CPR, CNA, RN license, HHA certification, or other credentials."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2" htmlFor="resume">
                Resume Upload
              </label>
              <input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
                required
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                name="authorization"
                checked={form.authorization}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-blue-600"
              />
              <span>
                I confirm I am authorized to work and I consent to be contacted regarding this
                application.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? 'Submitting Application…' : 'Submit Application'}
            </button>

            {status.message && (
              <p
                className={`text-sm ${
                  status.type === 'error' ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {status.message}
              </p>
            )}
          </form>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4">What We Collect</h3>
              <div className="space-y-3 text-slate-300">
                <p>• Contact details for follow-up</p>
                <p>• Role and availability preferences</p>
                <p>• Experience summary and certifications</p>
                <p>• Resume file for recruitment review</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-slate-800 rounded-[32px] p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4">Application Review Process</h3>
              <div className="space-y-4 text-slate-300">
                <p>• Our hiring team reviews your role preferences and availability.</p>
                <p>• We verify submitted credentials and relevant care experience.</p>
                <p>• Qualified candidates are contacted for the next interview step.</p>
                <p>• You will receive follow-up updates from our recruiting team.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}