import { useEffect, useRef, useState } from 'react'
import CaregiverCareerPortal from './components/CaregiverCareerPortal'
import SeoHead from './seo/SeoHead'
import NewsListPage from './news/NewsListPage'
import NewsArticlePage from './news/NewsArticlePage'
import { newsPostMap, newsPosts } from './news/posts'

const portalUrl = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174'
const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173'

export default function PublicApp() {
  const phoneNumber = '(404) 000-0000'
  const phoneHref = 'tel:+14040000000'
  const bookingEmail = 'info@kenkwohomecare.com'

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! Welcome to Kenkwo Homecare. How can we help you today?',
    },
  ])

  const [input, setInput] = useState('')
  const [isChatSending, setIsChatSending] = useState(false)
  const chatEndRef = useRef(null)

  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    date: '',
  })

  const [bookingStatus, setBookingStatus] = useState({
    type: '',
    message: '',
  })
  const bookingSectionRef = useRef(null)

  const buildAssistantReply = (messageText) => {
    const normalized = messageText.toLowerCase()

    if (normalized.includes('price') || normalized.includes('cost')) {
      return 'Our care plans are personalized, so pricing depends on care level and schedule. Tap Schedule Consultation and we can provide a custom quote.'
    }

    if (normalized.includes('nurse') || normalized.includes('nursing')) {
      return 'Yes, we provide skilled nursing services including medication support and recovery monitoring. We can match you with a nurse quickly.'
    }

    if (normalized.includes('job') || normalized.includes('career') || normalized.includes('apply')) {
      return 'Great to hear your interest. Please use Apply Today in the Careers section, and our hiring team will review your application.'
    }

    return 'Thank you for contacting Kenkwo Homecare. A care coordinator will reach out shortly. You can also call us directly for immediate assistance.'
  }

  const sendMessage = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isChatSending) return

    setMessages((prevMessages) => [...prevMessages, { role: 'user', text: trimmedInput }])

    setInput('')
    setIsChatSending(true)

    await new Promise((resolve) => setTimeout(resolve, 650))

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'assistant', text: buildAssistantReply(trimmedInput) },
    ])
    setIsChatSending(false)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isChatSending])

  const handleBookingChange = (event) => {
    const { name, value } = event.target
    setBookingForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = (event) => {
    event.preventDefault()

    const { fullName, phone, email, date } = bookingForm
    if (!fullName || !phone || !email || !date) {
      setBookingStatus({
        type: 'error',
        message: 'Please complete all fields before booking.',
      })
      return
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValidEmail) {
      setBookingStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      })
      return
    }

    const subject = encodeURIComponent('New Care Consultation Booking Request')
    const body = encodeURIComponent(
      `Name: ${fullName}\nPhone: ${phone}\nEmail: ${email}\nPreferred Date: ${date}`,
    )
    window.location.href = `mailto:${bookingEmail}?subject=${subject}&body=${body}`

    setBookingStatus({
      type: 'success',
      message: 'Booking details prepared. Your email app should open to send the request.',
    })

    setBookingForm({
      fullName: '',
      phone: '',
      email: '',
      date: '',
    })
  }

  const handleScheduleConsultationClick = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const normalizePath = (path) => {
    if (!path) return '/'
    if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
    return path
  }

  const currentPath = normalizePath(window.location.pathname)
  const activeArticleSlug = currentPath.startsWith('/news/')
    ? currentPath.replace('/news/', '')
    : ''
  const activeArticle = newsPostMap[activeArticleSlug]

  if (currentPath === '/news') {
    const canonicalUrl = `${siteUrl}/news`

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SeoHead
          title="Kenkwo Newsroom | Homecare Updates and Family Resources"
          description="Read Kenkwo Homecare news, clinical guidance, and family support articles designed to improve in-home care decisions."
          canonicalUrl={canonicalUrl}
          imageUrl={newsPosts[0].heroImage}
          jsonLdObject={{
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Kenkwo Newsroom',
            url: canonicalUrl,
            hasPart: newsPosts.map((post) => ({
              '@type': 'Article',
              headline: post.title,
              url: `${siteUrl}/news/${post.slug}`,
              datePublished: post.publishedAt,
            })),
          }}
        />

        <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-semibold text-lg">Kenkwo Homecare</a>
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <a href="/" className="hover:text-white transition">Home</a>
              <a href="/news" className="text-white">News</a>
              <a href={portalUrl} className="hover:text-white transition">Portal</a>
            </div>
          </div>
        </header>

        <NewsListPage />
      </div>
    )
  }

  if (activeArticleSlug) {
    const canonicalUrl = `${siteUrl}/news/${activeArticleSlug}`
    const title = activeArticle
      ? `${activeArticle.title} | Kenkwo Newsroom`
      : 'Article Not Found | Kenkwo Newsroom'
    const description = activeArticle
      ? activeArticle.excerpt
      : 'The requested news article could not be found.'
    const imageUrl = activeArticle?.heroImage || newsPosts[0].heroImage

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <SeoHead
          title={title}
          description={description}
          canonicalUrl={canonicalUrl}
          imageUrl={imageUrl}
          jsonLdObject={
            activeArticle
              ? {
                  '@context': 'https://schema.org',
                  '@type': 'Article',
                  headline: activeArticle.title,
                  description: activeArticle.excerpt,
                  datePublished: activeArticle.publishedAt,
                  dateModified: activeArticle.updatedAt,
                  author: {
                    '@type': 'Organization',
                    name: activeArticle.author,
                  },
                  image: activeArticle.heroImage,
                  mainEntityOfPage: canonicalUrl,
                }
              : null
          }
        />

        <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-semibold text-lg">Kenkwo Homecare</a>
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <a href="/" className="hover:text-white transition">Home</a>
              <a href="/news" className="hover:text-white transition">News</a>
              <a href={portalUrl} className="hover:text-white transition">Portal</a>
            </div>
          </div>
        </header>

        <NewsArticlePage slug={activeArticleSlug} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SeoHead
        title="Kenkwo Homecare | Premium In-Home Care Services"
        description="Kenkwo Homecare delivers premium in-home nursing, rehabilitation, and companion care across North Atlanta with responsive caregiver matching."
        canonicalUrl={`${siteUrl}/`}
        imageUrl="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop"
        jsonLdObject={{
          '@context': 'https://schema.org',
          '@type': 'HomeAndConstructionBusiness',
          name: 'Kenkwo Homecare',
          url: `${siteUrl}/`,
          telephone: '+1-404-000-0000',
          areaServed: 'North Atlanta, Georgia',
          sameAs: [portalUrl],
        }}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-950" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <nav className="flex items-center justify-between mb-20">
            <div>
              <h1 className="text-2xl font-bold tracking-wide">Kenkwo Homecare</h1>
              <p className="text-sm text-slate-400">Premium In-Home Care Services</p>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
              <a href="#services" className="hover:text-white transition">Services</a>
              <a href="#about" className="hover:text-white transition">About</a>
              <a href="/news" className="hover:text-white transition">News</a>
              <a href="#careers" className="hover:text-white transition">Careers</a>
              <a href={portalUrl} className="hover:text-white transition">Portal</a>
              <a href="#contact" className="hover:text-white transition">Contact</a>
            </div>
          </nav>

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm text-blue-300 mb-6">
                Serving North Atlanta Families
              </div>

              <h2 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                Compassionate Care.
                <span className="block text-blue-400">Luxury-Level Service.</span>
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
                Kenkwo Homecare provides premium in-home care services designed to help seniors and recovering patients live safely, comfortably, and independently.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleScheduleConsultationClick}
                  className="bg-blue-600 hover:bg-blue-700 transition px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/20"
                >
                  Schedule Consultation
                </button>

                <a
                  href={phoneHref}
                  className="border border-slate-700 hover:border-slate-500 transition px-6 py-4 rounded-2xl font-semibold bg-slate-900/40"
                >
                  Call Now
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <h3 className="text-3xl font-bold text-blue-400">24/7</h3>
                  <p className="text-slate-400 text-sm mt-1">Care Availability</p>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-blue-400">Fast</h3>
                  <p className="text-slate-400 text-sm mt-1">Caregiver Placement</p>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-blue-400">Premium</h3>
                  <p className="text-slate-400 text-sm mt-1">Personalized Care</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 border border-slate-800 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop"
                  alt="Homecare"
                  className="rounded-3xl h-[500px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4">
              Our Services
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Complete Homecare Solutions</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Tailored care plans designed around each client’s health, comfort, and lifestyle needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Skilled Nursing',
                description:
                  'Professional nursing support for medication management, wound care, chronic condition monitoring, and recovery assistance.',
              },
              {
                title: 'Private Rehabilitation',
                description:
                  'Post-surgery and rehabilitation support focused on mobility, recovery, and patient independence.',
              },
              {
                title: 'Companion Care',
                description:
                  'Meaningful companionship and emotional support to improve quality of life and reduce isolation.',
              },
              {
                title: 'Homemaker Services',
                description:
                  'Light housekeeping, meal preparation, errands, and household assistance for daily living.',
              },
              {
                title: 'Respite Care',
                description:
                  'Reliable temporary relief for family caregivers while ensuring continuity of care.',
              },
              {
                title: 'IV Infusion Services',
                description:
                  'Advanced nursing care with safe and professional IV infusion support in the comfort of home.',
              },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <div className="w-6 h-6 rounded-full bg-blue-400" />
                </div>

                <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                <p className="text-slate-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop"
              alt="Caregiver"
              className="rounded-[32px] h-[550px] object-cover w-full"
            />
          </div>

          <div>
            <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4">
              Why Families Choose Us
            </p>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
              Personalized Care With Professional Excellence
            </h2>

            <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
              <p>
                At Kenkwo Homecare, we believe exceptional care goes beyond basic assistance. Our mission is to provide compassionate, high-quality support that enhances dignity, independence, and peace of mind.
              </p>

              <p>
                We combine professional healthcare expertise with a luxury-level client experience, ensuring every family receives responsive communication, trusted caregivers, and personalized attention.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-2">Trusted Caregivers</h3>
                <p className="text-slate-400">Carefully screened and compassionate professionals.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-2">Flexible Care Plans</h3>
                <p className="text-slate-400">Customized services tailored to each family.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CaregiverCareerPortal />

      <section id="contact" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-10 lg:p-14 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>

            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Contact Kenkwo Homecare today to discuss your care needs and schedule a personalized consultation.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-500 text-sm mb-2">Phone</p>
                <h3 className="text-lg font-semibold">{phoneNumber}</h3>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-500 text-sm mb-2">Email</p>
                <h3 className="text-lg font-semibold">info@kenkwohomecare.com</h3>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-500 text-sm mb-2">Location</p>
                <h3 className="text-lg font-semibold">North Atlanta, Georgia</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 w-[360px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50">
        <div className="bg-blue-600 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">AI Care Assistant</h3>
            <p className="text-xs text-blue-100">24/7 Patient Support</p>
          </div>

          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        </div>

        <div className="h-[300px] overflow-y-auto p-4 space-y-3 bg-slate-950">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isChatSending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm bg-slate-800 text-slate-200">
                Typing...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-slate-800 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask about care services..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none"
          />

          <button
            onClick={sendMessage}
            disabled={isChatSending}
            className="bg-blue-600 hover:bg-blue-700 px-5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>

      <section ref={bookingSectionRef} id="booking" className="py-24 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Book a Care Consultation</h2>
            <p className="text-slate-400">Schedule appointments directly online.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-6">Appointment Booking</h3>

              <form className="space-y-5" onSubmit={handleBookingSubmit}>
                <input
                  name="fullName"
                  value={bookingForm.fullName}
                  onChange={handleBookingChange}
                  placeholder="Full Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4"
                  required
                />
                <input
                  name="phone"
                  value={bookingForm.phone}
                  onChange={handleBookingChange}
                  placeholder="Phone Number"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4"
                  required
                />
                <input
                  name="email"
                  value={bookingForm.email}
                  onChange={handleBookingChange}
                  placeholder="Email Address"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4"
                  required
                />
                <input
                  name="date"
                  value={bookingForm.date}
                  onChange={handleBookingChange}
                  type="date"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4"
                  required
                />

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-semibold">
                  Confirm Booking
                </button>

                {bookingStatus.message && (
                  <p
                    className={`text-sm ${
                      bookingStatus.type === 'error' ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {bookingStatus.message}
                  </p>
                )}
              </form>
            </div>

            <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-6">Integrated Platform Features</h3>

              <div className="grid gap-4">
                {[
                  'Real-time caregiver messaging',
                  'Secure patient portal',
                  'Stripe payment processing',
                  'Admin dashboard analytics',
                  'CRM integration support',
                  'SEO optimized blog/news system',
                  'Caregiver job applications',
                  'HIPAA-friendly architecture',
                ].map((feature) => (
                  <div
                    key={feature}
                    className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="news" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-blue-400 font-semibold uppercase tracking-widest mb-3">Newsroom</p>
              <h2 className="text-4xl font-bold mb-3">Latest Homecare Insights</h2>
              <p className="text-slate-400 max-w-2xl">
                Expert guidance for family caregivers, senior safety, and informed care planning.
              </p>
            </div>
            <a href="/news" className="text-blue-300 hover:text-blue-200 font-medium">
              View All Articles
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {newsPosts.slice(0, 3).map((post) => (
              <article
                key={post.slug}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/40 transition"
              >
                <img src={post.heroImage} alt={post.title} className="h-44 w-full object-cover" />
                <div className="p-6">
                  <p className="text-xs text-blue-300 uppercase tracking-widest mb-3">{post.category}</p>
                  <h3 className="text-xl font-semibold mb-3 leading-tight">{post.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <a href={`/news/${post.slug}`} className="text-blue-300 hover:text-blue-200 text-sm">
                    Read More
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Patient Portal</h3>
              <p className="text-slate-400 mb-6">
                Patients and families can securely access care plans, invoices, appointments, and updates.
              </p>

              <button className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-2xl">
                Access Portal
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Caregiver Careers</h3>
              <p className="text-slate-400 mb-6">
                Apply online and upload certifications directly from the portal.
              </p>

              <button className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-2xl">
                Apply Now
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Secure Payments</h3>
              <p className="text-slate-400 mb-6">
                Stripe integration for invoices, subscriptions, and online payments.
              </p>

              <button className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-2xl">
                Pay Invoice
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-4 text-sm text-slate-500">
          <p>© 2026 Kenkwo Homecare. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/news" className="hover:text-white transition">Newsroom</a>
            <a href={portalUrl} className="hover:text-white transition">Operations Portal</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}