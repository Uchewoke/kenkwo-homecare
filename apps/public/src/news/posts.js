export const newsPosts = [
  {
    slug: 'fall-prevention-at-home-checklist',
    title: 'Fall Prevention at Home: A Practical Safety Checklist for Families',
    excerpt:
      'A room-by-room guide to reducing fall risk for older adults while preserving comfort and independence.',
    publishedAt: '2026-05-15',
    updatedAt: '2026-05-18',
    author: 'Kenkwo Clinical Education Team',
    category: 'Senior Safety',
    tags: ['fall prevention', 'home safety', 'senior care'],
    heroImage:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1400&auto=format&fit=crop',
    content: [
      'Falls are one of the leading causes of injury among older adults, but many incidents can be prevented with simple environmental changes and daily routines.',
      'Start with clear walkways in every room. Remove loose rugs, secure cords against walls, and keep commonly used items within easy reach to avoid climbing or stretching.',
      'Improve lighting in high-traffic areas, especially hallways, stairs, and bathrooms. Motion-activated night lights can help during overnight trips.',
      'Bathrooms deserve extra attention. Install grab bars near toilets and showers, use non-slip mats, and consider a shower chair for clients with reduced balance.',
      'Footwear and mobility devices matter just as much as the environment. Encourage closed-heel, non-slip shoes and ensure walkers or canes are properly fitted.',
      'A professional in-home care assessment can identify hidden risks and create a personalized prevention plan based on mobility, medication profile, and daily habits.',
    ],
  },
  {
    slug: 'how-to-choose-between-home-care-and-assisted-living',
    title: 'Home Care vs. Assisted Living: How Families Can Make the Right Decision',
    excerpt:
      'Compare cost, care flexibility, social support, and medical needs when deciding on the best next step for a loved one.',
    publishedAt: '2026-04-29',
    updatedAt: '2026-05-02',
    author: 'Kenkwo Care Coordination Team',
    category: 'Family Guidance',
    tags: ['assisted living', 'home care', 'care planning'],
    heroImage:
      'https://images.unsplash.com/photo-1516307365426-bea591f05011?q=80&w=1400&auto=format&fit=crop',
    content: [
      'Families often weigh home care and assisted living under urgent circumstances. A clear decision framework reduces stress and helps align care with long-term goals.',
      'Home care offers flexibility: schedules, caregiver match, and service intensity can be tailored around the client. This is ideal when someone values familiarity and routine.',
      'Assisted living can be useful when daily oversight, built-in social activities, and centralized services are required beyond what the home environment can support.',
      'Cost comparisons should include hidden expenses. Home care rates vary by hours needed, while assisted living may include base fees plus tiered care add-ons.',
      'Clinical complexity is a major factor. Clients with evolving conditions may benefit from a blended model that starts with home care and transitions only if needs change significantly.',
      'A care consultation can map physical, emotional, and financial priorities into a realistic phased plan, rather than a one-time all-or-nothing decision.',
    ],
  },
  {
    slug: 'caregiver-burnout-warning-signs-and-relief-strategies',
    title: 'Caregiver Burnout: Early Warning Signs and Relief Strategies That Work',
    excerpt:
      'Recognize burnout symptoms early and use structured respite planning to protect caregiver health and continuity of care.',
    publishedAt: '2026-04-12',
    updatedAt: '2026-04-12',
    author: 'Kenkwo Family Support Program',
    category: 'Caregiver Wellness',
    tags: ['burnout', 'respite care', 'family caregiver'],
    heroImage:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1400&auto=format&fit=crop',
    content: [
      'Family caregivers frequently prioritize everyone else first, which can gradually lead to physical fatigue, emotional depletion, and decision fatigue.',
      'Early signs include sleep disruption, irritability, increased anxiety, social withdrawal, and feeling constantly behind regardless of effort.',
      'Start with a realistic respite schedule, not a crisis-based one. Even short, recurring coverage windows can reduce stress and improve consistency of care.',
      'Document core routines, medication timing, and escalation contacts so substitute caregivers can step in confidently without increasing family anxiety.',
      'Set measurable recovery habits for the primary caregiver such as protected sleep blocks, weekly medical appointments, and non-negotiable personal time.',
      'Burnout prevention is not a luxury. It is a care continuity strategy that protects both the caregiver and the loved one receiving support.',
    ],
  },
]

export const newsPostMap = Object.fromEntries(newsPosts.map((post) => [post.slug, post]))