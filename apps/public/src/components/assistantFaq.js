const includesAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword))

const buildClientLeadPrompt = ({ phoneNumber, bookingEmail }) =>
  `To get started quickly, share your care needs, preferred schedule, and city. You can also call ${phoneNumber} or email ${bookingEmail} to connect with a care coordinator.`

const buildCaregiverLeadPrompt = ({ phoneNumber, bookingEmail }) =>
  `For faster review, complete the Careers application with your resume, certifications, and availability. If you need support, contact recruiting at ${phoneNumber} or ${bookingEmail}.`

const formatTemplate = (text, contactDetails) =>
  text
    .replaceAll('{phoneNumber}', contactDetails.phoneNumber)
    .replaceAll('{bookingEmail}', contactDetails.bookingEmail)

const normalizeFaqEntry = (entry) => {
  if (!entry || typeof entry !== 'object') return null

  const keywords = Array.isArray(entry.keywords)
    ? entry.keywords
        .filter((keyword) => typeof keyword === 'string')
        .map((keyword) => keyword.toLowerCase().trim())
        .filter(Boolean)
    : []

  if (keywords.length === 0 || typeof entry.response !== 'string' || !entry.response.trim()) {
    return null
  }

  return {
    id: typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : 'faq-item',
    keywords,
    response: entry.response.trim(),
    leadType: entry.leadType === 'caregiver' ? 'caregiver' : 'client',
  }
}

export const defaultAssistantFaq = [
  {
    id: 'services',
    keywords: ['service', 'services', 'care plan', 'home care', 'support at home'],
    response:
      'We provide Skilled Nursing, Private Rehabilitation, Companion Care, Homemaker Services, Respite Care, and IV Infusion Services.',
    leadType: 'client',
  },
  {
    id: 'pricing',
    keywords: ['price', 'cost', 'rate', 'rates', 'afford', 'payment'],
    response:
      'Pricing depends on care level, visit frequency, and clinical needs. We provide personalized quotes after a consultation.',
    leadType: 'client',
  },
  {
    id: 'availability',
    keywords: ['available', 'availability', '24/7', 'same day', 'urgent', 'weekend', 'overnight'],
    response:
      'We offer flexible scheduling, including overnight and weekend coverage, based on caregiver availability and care requirements.',
    leadType: 'client',
  },
  {
    id: 'service-area',
    keywords: ['location', 'area', 'city', 'where do you serve', 'north atlanta', 'georgia'],
    response:
      'Kenkwo Homecare serves families across North Atlanta and surrounding communities.',
    leadType: 'client',
  },
  {
    id: 'care-start',
    keywords: ['how do i start', 'get started', 'next step', 'consultation', 'book'],
    response:
      'Start by booking a consultation so we can understand needs, schedule, and preferred care approach.',
    leadType: 'client',
  },
  {
    id: 'caregiver-screening',
    keywords: ['background check', 'screened', 'trusted', 'qualified', 'training'],
    response:
      'Our caregiver selection process prioritizes professionalism, compassion, and role-fit for each family care plan.',
    leadType: 'client',
  },
  {
    id: 'contact',
    keywords: ['contact', 'phone', 'email', 'call', 'reach you'],
    response: 'You can reach Kenkwo Homecare at {phoneNumber} or {bookingEmail}.',
    leadType: 'client',
  },
  {
    id: 'caregiver-apply',
    keywords: ['job', 'jobs', 'career', 'caregiver job', 'apply', 'hiring', 'employment'],
    response:
      'We are actively reviewing caregiver applications for multiple roles. Use the Careers section to submit your information.',
    leadType: 'caregiver',
  },
  {
    id: 'caregiver-docs',
    keywords: ['resume', 'certification', 'license', 'cna', 'lpn', 'rn', 'hha'],
    response:
      'Please include your resume, active certifications/licenses, care experience summary, and work availability in your application.',
    leadType: 'caregiver',
  },
  {
    id: 'caregiver-followup',
    keywords: ['application status', 'follow up', 'interview', 'recruiter', 'when will i hear'],
    response:
      'Our recruiting team reviews submissions and contacts qualified applicants for next-step interviews.',
    leadType: 'caregiver',
  },
]

export const loadAssistantFaq = async () => {
  try {
    const response = await fetch('/assistant-faq.json', { cache: 'no-store' })
    if (!response.ok) return []

    const payload = await response.json()
    const sourceItems = Array.isArray(payload) ? payload : payload?.items
    if (!Array.isArray(sourceItems)) return []

    return sourceItems.map(normalizeFaqEntry).filter(Boolean)
  } catch {
    return []
  }
}

export const findAssistantFaqResponse = (messageText, contactDetails, faqEntries = defaultAssistantFaq) => {
  const normalized = messageText.toLowerCase()

  const matched = faqEntries.find((entry) => includesAny(normalized, entry.keywords))
  if (!matched) return null

  const baseResponse = formatTemplate(matched.response, contactDetails)

  if (matched.leadType === 'caregiver') {
    return `${baseResponse} ${buildCaregiverLeadPrompt(contactDetails)}`
  }

  return `${baseResponse} ${buildClientLeadPrompt(contactDetails)}`
}
