import express from 'express'
import { createServer } from 'http'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { DatabaseSync } from 'node:sqlite'
import { Server } from 'socket.io'
import cors from 'cors'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:5174']
const adminFaqToken = (process.env.ADMIN_FAQ_TOKEN || '').trim()
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (allowedOrigins.length === 0) {
  allowedOrigins.push(...defaultAllowedOrigins)
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
}

app.use(cors(corsOptions))
app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, 'uploads', 'career-applications')
const dataDir = path.join(__dirname, 'data')
const applicationsStorePath = path.join(dataDir, 'career-applications.json')
const databasePath = path.join(dataDir, 'career-applications.db')
const assistantFaqPath = path.join(__dirname, 'apps', 'public', 'public', 'assistant-faq.json')
const newsPostsPath = path.join(__dirname, 'apps', 'public', 'public', 'news-posts.json')

fs.mkdirSync(uploadsDir, { recursive: true })
fs.mkdirSync(dataDir, { recursive: true })
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir)
  },
  filename: (_req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const extension = path.extname(file.originalname)
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .slice(0, 50)

    callback(null, `${safeBaseName}-${uniqueSuffix}${extension}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx']
    const extension = path.extname(file.originalname).toLowerCase()
    const mimeTypeAllowed =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    if (allowedExtensions.includes(extension) && mimeTypeAllowed) {
      callback(null, true)
      return
    }

    callback(new Error('Resume must be a PDF, DOC, or DOCX file.'))
  },
})

const db = new DatabaseSync(databasePath)
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS career_applications (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    position TEXT NOT NULL,
    city TEXT NOT NULL,
    availability TEXT NOT NULL,
    experience TEXT NOT NULL,
    certifications TEXT NOT NULL DEFAULT '',
    authorization INTEGER NOT NULL,
    resume_original_name TEXT NOT NULL,
    resume_file_name TEXT NOT NULL,
    resume_path TEXT NOT NULL,
    resume_mime_type TEXT NOT NULL,
    resume_size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    reviewer_notes TEXT NOT NULL DEFAULT '',
    submitted_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    reviewed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
  CREATE INDEX IF NOT EXISTS idx_career_applications_position ON career_applications(position);
  CREATE INDEX IF NOT EXISTS idx_career_applications_submitted_at ON career_applications(submitted_at DESC);
`)

const insertCareerApplicationStatement = db.prepare(`
  INSERT INTO career_applications (
    id,
    full_name,
    email,
    phone,
    position,
    city,
    availability,
    experience,
    certifications,
    authorization,
    resume_original_name,
    resume_file_name,
    resume_path,
    resume_mime_type,
    resume_size,
    status,
    reviewer_notes,
    submitted_at,
    updated_at,
    reviewed_at
  ) VALUES (
    :id,
    :fullName,
    :email,
    :phone,
    :position,
    :city,
    :availability,
    :experience,
    :certifications,
    :authorization,
    :resumeOriginalName,
    :resumeFileName,
    :resumePath,
    :resumeMimeType,
    :resumeSize,
    :status,
    :reviewerNotes,
    :submittedAt,
    :updatedAt,
    :reviewedAt
  )
`)

const updateCareerApplicationStatement = db.prepare(`
  UPDATE career_applications
  SET status = :status,
      reviewer_notes = :reviewerNotes,
      updated_at = :updatedAt,
      reviewed_at = :reviewedAt
  WHERE id = :id
`)

const deleteCareerApplicationStatement = db.prepare('DELETE FROM career_applications WHERE id = ?')
const getCareerApplicationStatement = db.prepare('SELECT * FROM career_applications WHERE id = ?')

const mapCareerApplication = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  position: row.position,
  city: row.city,
  availability: row.availability,
  experience: row.experience,
  certifications: row.certifications,
  authorization: Boolean(row.authorization),
  resume: {
    originalName: row.resume_original_name,
    fileName: row.resume_file_name,
    path: row.resume_path,
    mimeType: row.resume_mime_type,
    size: row.resume_size,
  },
  status: row.status,
  reviewerNotes: row.reviewer_notes,
  submittedAt: row.submitted_at,
  updatedAt: row.updated_at,
  reviewedAt: row.reviewed_at,
})

const normalizeAssistantFaqEntry = (entry) => {
  if (!entry || typeof entry !== 'object') return null

  const keywords = Array.isArray(entry.keywords)
    ? entry.keywords
        .filter((keyword) => typeof keyword === 'string')
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
    : []

  const response = typeof entry.response === 'string' ? entry.response.trim() : ''

  if (keywords.length === 0 || response.length === 0) {
    return null
  }

  return {
    id: typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : `faq-${Date.now()}`,
    keywords,
    response,
    leadType: entry.leadType === 'caregiver' ? 'caregiver' : 'client',
  }
}

const normalizeAssistantFaqConfig = (payload) => {
  const sourceItems = Array.isArray(payload) ? payload : payload?.items
  if (!Array.isArray(sourceItems)) {
    return null
  }

  const items = sourceItems.map(normalizeAssistantFaqEntry).filter(Boolean)
  if (items.length === 0) {
    return null
  }

  return {
    version:
      typeof payload?.version === 'string' && payload.version.trim()
        ? payload.version.trim()
        : '1.0',
    lastUpdated: new Date().toISOString().slice(0, 10),
    items,
  }
}

const readAssistantFaqConfig = () => {
  if (!fs.existsSync(assistantFaqPath)) {
    return null
  }

  try {
    const raw = fs.readFileSync(assistantFaqPath, 'utf8')
    const parsed = JSON.parse(raw)
    return normalizeAssistantFaqConfig(parsed)
  } catch {
    return null
  }
}

const normalizeNewsPost = (post) => {
  if (!post || typeof post !== 'object') return null

  const requiredTextFields = [
    'slug',
    'title',
    'excerpt',
    'publishedAt',
    'updatedAt',
    'author',
    'category',
    'heroImage',
  ]

  const hasAllRequiredFields = requiredTextFields.every(
    (field) => typeof post[field] === 'string' && post[field].trim().length > 0,
  )

  const tags = Array.isArray(post.tags)
    ? post.tags.filter((tag) => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean)
    : []

  const content = Array.isArray(post.content)
    ? post.content
        .filter((paragraph) => typeof paragraph === 'string')
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : []

  if (!hasAllRequiredFields || content.length === 0) {
    return null
  }

  return {
    slug: post.slug.trim(),
    title: post.title.trim(),
    excerpt: post.excerpt.trim(),
    publishedAt: post.publishedAt.trim(),
    updatedAt: post.updatedAt.trim(),
    author: post.author.trim(),
    category: post.category.trim(),
    tags,
    heroImage: post.heroImage.trim(),
    content,
  }
}

const normalizeNewsPostsConfig = (payload) => {
  const sourceItems = Array.isArray(payload) ? payload : payload?.items
  if (!Array.isArray(sourceItems)) {
    return null
  }

  const items = sourceItems.map(normalizeNewsPost).filter(Boolean)
  if (items.length === 0) {
    return null
  }

  return {
    version:
      typeof payload?.version === 'string' && payload.version.trim()
        ? payload.version.trim()
        : '1.0',
    lastUpdated: new Date().toISOString().slice(0, 10),
    items,
  }
}

const readNewsPostsConfig = () => {
  if (!fs.existsSync(newsPostsPath)) {
    return null
  }

  try {
    const raw = fs.readFileSync(newsPostsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return normalizeNewsPostsConfig(parsed)
  } catch {
    return null
  }
}

const getAdminTokenFromRequest = (req) => {
  const authHeader = typeof req.headers.authorization === 'string' ? req.headers.authorization : ''
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim()
  }

  const xAdminToken = req.headers['x-admin-token']
  if (typeof xAdminToken === 'string') {
    return xAdminToken.trim()
  }

  const xAdminKey = req.headers['x-admin-key']
  if (typeof xAdminKey === 'string') {
    return xAdminKey.trim()
  }

  return ''
}

const requireAdminFaqAuth = (req, res, next) => {
  if (!adminFaqToken) {
    return res.status(503).json({
      message: 'Admin FAQ auth is not configured. Set ADMIN_FAQ_TOKEN on the server.',
    })
  }

  const providedToken = getAdminTokenFromRequest(req)
  if (!providedToken || providedToken !== adminFaqToken) {
    return res.status(401).json({ message: 'Unauthorized admin token.' })
  }

  return next()
}

const migrateLegacyCareerApplications = () => {
  if (!fs.existsSync(applicationsStorePath)) {
    return
  }

  const existingCount = db.prepare('SELECT COUNT(*) AS count FROM career_applications').get().count
  if (existingCount > 0) {
    return
  }

  try {
    const fileContents = fs.readFileSync(applicationsStorePath, 'utf8')
    const parsed = JSON.parse(fileContents)

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return
    }

    db.exec('BEGIN')
    for (const application of parsed) {
      insertCareerApplicationStatement.run({
        id: application.id,
        fullName: application.fullName ?? '',
        email: application.email ?? '',
        phone: application.phone ?? '',
        position: application.position ?? '',
        city: application.city ?? '',
        availability: application.availability ?? '',
        experience: application.experience ?? '',
        certifications: application.certifications ?? '',
        authorization: application.authorization ? 1 : 0,
        resumeOriginalName: application.resume?.originalName ?? '',
        resumeFileName: application.resume?.fileName ?? '',
        resumePath: application.resume?.path ?? '',
        resumeMimeType: application.resume?.mimeType ?? '',
        resumeSize: application.resume?.size ?? 0,
        status: application.status ?? 'new',
        reviewerNotes: application.reviewerNotes ?? '',
        submittedAt: application.submittedAt ?? new Date().toISOString(),
        updatedAt: application.updatedAt ?? application.submittedAt ?? new Date().toISOString(),
        reviewedAt: application.reviewedAt ?? null,
      })
    }
    db.exec('COMMIT')
    console.log(`Migrated ${parsed.length} career applications into SQLite.`)
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('Failed to migrate legacy career applications:', error)
  }
}

migrateLegacyCareerApplications()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
})

// In-memory message store per room (session-scoped)
const roomMessages = {}

const buildCareerApplicationsQuery = ({ search, status, position, limit, offset }) => {
  const whereClauses = []
  const queryParams = {}

  if (status) {
    whereClauses.push('status = :status')
    queryParams.status = status
  }

  if (position) {
    whereClauses.push('position = :position')
    queryParams.position = position
  }

  if (search) {
    whereClauses.push(`(
      LOWER(full_name) LIKE LOWER(:search) OR
      LOWER(email) LIKE LOWER(:search) OR
      LOWER(phone) LIKE LOWER(:search) OR
      LOWER(position) LIKE LOWER(:search) OR
      LOWER(city) LIKE LOWER(:search) OR
      LOWER(availability) LIKE LOWER(:search) OR
      LOWER(experience) LIKE LOWER(:search) OR
      LOWER(certifications) LIKE LOWER(:search)
    )`)
    queryParams.search = `%${search}%`
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

  return {
    countSql: `SELECT COUNT(*) AS count FROM career_applications ${whereSql}`,
    countParams: queryParams,
    listSql: `
      SELECT *
      FROM career_applications
      ${whereSql}
      ORDER BY datetime(submitted_at) DESC
      LIMIT :limit OFFSET :offset
    `,
    listParams: {
      ...queryParams,
      limit,
      offset,
    },
  }
}

app.get('/api/career-applications', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : ''
  const position = typeof req.query.position === 'string' ? req.query.position.trim() : ''
  const limitValue = Number.parseInt(
    typeof req.query.limit === 'string' ? req.query.limit : '25',
    10,
  )
  const offsetValue = Number.parseInt(
    typeof req.query.offset === 'string' ? req.query.offset : '0',
    10,
  )

  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 100) : 25
  const offset = Number.isFinite(offsetValue) ? Math.max(offsetValue, 0) : 0

  const { countSql, countParams, listSql, listParams } = buildCareerApplicationsQuery({
    search,
    status,
    position,
    limit,
    offset,
  })

  const total = db.prepare(countSql).get(countParams).count
  const applications = db.prepare(listSql).all(listParams).map(mapCareerApplication)
  const statusCounts = db
    .prepare('SELECT status, COUNT(*) AS count FROM career_applications GROUP BY status')
    .all()
  const availablePositions = db
    .prepare('SELECT DISTINCT position FROM career_applications ORDER BY position ASC')
    .all()
    .map((row) => row.position)

  res.json({
    applications,
    total,
    statusCounts,
    availablePositions,
    filters: {
      search,
      status,
      position,
      limit,
      offset,
    },
  })
})

app.get('/api/career-applications/:id', (req, res) => {
  const application = getCareerApplicationStatement.get(req.params.id)

  if (!application) {
    return res.status(404).json({ message: 'Career application not found.' })
  }

  return res.json({ application: mapCareerApplication(application) })
})

app.post('/api/career-applications', upload.single('resume'), (req, res) => {
  const now = new Date().toISOString()
  const {
    fullName,
    email,
    phone,
    position,
    city,
    availability,
    experience,
    certifications,
    authorization,
  } = req.body

  const missingFields = []
  if (!fullName?.trim()) missingFields.push('fullName')
  if (!email?.trim()) missingFields.push('email')
  if (!phone?.trim()) missingFields.push('phone')
  if (!position?.trim()) missingFields.push('position')
  if (!city?.trim()) missingFields.push('city')
  if (!availability?.trim()) missingFields.push('availability')
  if (!experience?.trim()) missingFields.push('experience')
  if (!authorization) missingFields.push('authorization')
  if (!req.file) missingFields.push('resume')

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Please complete all required fields.',
      missingFields,
    })
  }

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailIsValid) {
    return res.status(400).json({ message: 'Please enter a valid email address.' })
  }

  const application = {
    id: `care-${Date.now()}`,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    position: position.trim(),
    city: city.trim(),
    availability: availability.trim(),
    experience: experience.trim(),
    certifications: certifications?.trim() || '',
    authorization: authorization === 'on' || authorization === 'true',
    resume: {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: `/uploads/career-applications/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
    status: 'new',
    reviewerNotes: '',
    submittedAt: now,
    updatedAt: now,
    reviewedAt: null,
  }

  insertCareerApplicationStatement.run({
    id: application.id,
    fullName: application.fullName,
    email: application.email,
    phone: application.phone,
    position: application.position,
    city: application.city,
    availability: application.availability,
    experience: application.experience,
    certifications: application.certifications,
    authorization: application.authorization ? 1 : 0,
    resumeOriginalName: application.resume.originalName,
    resumeFileName: application.resume.fileName,
    resumePath: application.resume.path,
    resumeMimeType: application.resume.mimeType,
    resumeSize: application.resume.size,
    status: application.status,
    reviewerNotes: application.reviewerNotes,
    submittedAt: application.submittedAt,
    updatedAt: application.updatedAt,
    reviewedAt: application.reviewedAt,
  })

  console.log(`[career-application] ${application.fullName} (${application.position})`)

  return res.status(201).json({
    message: 'Career application submitted successfully.',
    application,
  })
})

app.patch('/api/career-applications/:id', (req, res) => {
  const existingApplication = getCareerApplicationStatement.get(req.params.id)

  if (!existingApplication) {
    return res.status(404).json({ message: 'Career application not found.' })
  }

  const allowedStatuses = new Set(['new', 'reviewing', 'contacted', 'hired', 'rejected'])
  const nextStatus = typeof req.body.status === 'string' ? req.body.status.trim() : ''
  const nextReviewerNotes =
    typeof req.body.reviewerNotes === 'string' ? req.body.reviewerNotes.trim() : ''

  if (nextStatus && !allowedStatuses.has(nextStatus)) {
    return res.status(400).json({
      message: 'Invalid status value.',
      allowedStatuses: Array.from(allowedStatuses),
    })
  }

  const updatedAt = new Date().toISOString()
  const appliedStatus = nextStatus || existingApplication.status
  const reviewedAt =
    appliedStatus !== 'new' && appliedStatus !== existingApplication.status
      ? updatedAt
      : existingApplication.reviewed_at

  updateCareerApplicationStatement.run({
    id: req.params.id,
    status: appliedStatus,
    reviewerNotes:
      nextReviewerNotes.length > 0 || req.body.reviewerNotes === ''
        ? nextReviewerNotes
        : existingApplication.reviewer_notes,
    updatedAt,
    reviewedAt,
  })

  const updatedApplication = getCareerApplicationStatement.get(req.params.id)

  return res.json({
    message: 'Career application updated successfully.',
    application: mapCareerApplication(updatedApplication),
  })
})

app.delete('/api/career-applications/:id', (req, res) => {
  const existingApplication = getCareerApplicationStatement.get(req.params.id)

  if (!existingApplication) {
    return res.status(404).json({ message: 'Career application not found.' })
  }

  const resumePath = path.join(uploadsDir, existingApplication.resume_file_name)
  if (fs.existsSync(resumePath)) {
    fs.unlinkSync(resumePath)
  }

  deleteCareerApplicationStatement.run(req.params.id)

  return res.json({ message: 'Career application deleted successfully.' })
})

app.get('/api/admin/assistant-faq', requireAdminFaqAuth, (_req, res) => {
  const faqConfig = readAssistantFaqConfig()

  if (!faqConfig) {
    return res.status(404).json({ message: 'Assistant FAQ configuration was not found or is invalid.' })
  }

  return res.json({ config: faqConfig })
})

app.put('/api/admin/assistant-faq', requireAdminFaqAuth, (req, res) => {
  const normalizedConfig = normalizeAssistantFaqConfig(req.body)

  if (!normalizedConfig) {
    return res.status(400).json({
      message:
        'Invalid FAQ payload. Provide items with non-empty keywords arrays and response text.',
    })
  }

  try {
    fs.writeFileSync(assistantFaqPath, `${JSON.stringify(normalizedConfig, null, 2)}\n`, 'utf8')
    return res.json({ message: 'Assistant FAQ configuration updated successfully.', config: normalizedConfig })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to write assistant FAQ configuration.',
      detail: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

app.get('/api/admin/blog-posts', requireAdminFaqAuth, (_req, res) => {
  const newsConfig = readNewsPostsConfig()

  if (!newsConfig) {
    return res.status(404).json({ message: 'Blog posts configuration was not found or is invalid.' })
  }

  return res.json({ config: newsConfig })
})

app.put('/api/admin/blog-posts', requireAdminFaqAuth, (req, res) => {
  const normalizedConfig = normalizeNewsPostsConfig(req.body)

  if (!normalizedConfig) {
    return res.status(400).json({
      message:
        'Invalid blog posts payload. Provide items with required text fields, tags, and content paragraphs.',
    })
  }

  try {
    fs.writeFileSync(newsPostsPath, `${JSON.stringify(normalizedConfig, null, 2)}\n`, 'utf8')
    return res.json({ message: 'Blog posts configuration updated successfully.', config: normalizedConfig })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to write blog posts configuration.',
      detail: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`)

  socket.on('join_room', ({ room, userName }) => {
    socket.join(room)
    socket.data.room = room
    socket.data.userName = userName

    if (!roomMessages[room]) roomMessages[room] = []

    // Send history to the newly joined client only
    socket.emit('message_history', roomMessages[room])

    // Notify everyone in the room
    io.to(room).emit('system_event', {
      text: `${userName} joined the conversation`,
      timestamp: new Date().toISOString(),
    })

    console.log(`[join] ${userName} → room "${room}"`)
  })

  socket.on('send_message', ({ room, text, userName }) => {
    if (!text || !text.trim()) return

    const message = {
      id: `${Date.now()}-${socket.id}`,
      userName,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    }

    if (!roomMessages[room]) roomMessages[room] = []
    roomMessages[room].push(message)

    io.to(room).emit('receive_message', message)
  })

  socket.on('disconnect', () => {
    const { room, userName } = socket.data || {}
    if (room && userName) {
      io.to(room).emit('system_event', {
        text: `${userName} left the conversation`,
        timestamp: new Date().toISOString(),
      })
    }
    console.log(`[disconnect] ${socket.id}`)
  })
})

const PORT = Number(process.env.PORT || 3001)
httpServer.listen(PORT, () => {
  console.log(`Messaging server ready → http://localhost:${PORT}`)
})
