import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { newsPosts } from '../src/news/posts.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')

const sanitizeSiteUrl = (url) => url.replace(/\/+$/, '')

const siteUrl = sanitizeSiteUrl(process.env.VITE_PUBLIC_SITE_URL || 'https://www.example.com')

const xmlEscape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const baseEntries = [
  {
    loc: `${siteUrl}/`,
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    loc: `${siteUrl}/news`,
    changefreq: 'weekly',
    priority: '0.8',
  },
]

const articleEntries = newsPosts.map((post) => ({
  loc: `${siteUrl}/news/${post.slug}`,
  lastmod: post.updatedAt || post.publishedAt,
  changefreq: 'monthly',
  priority: '0.7',
}))

const allEntries = [...baseEntries, ...articleEntries]

const urlXml = allEntries
  .map((entry) => {
    const lines = [
      '  <url>',
      `    <loc>${xmlEscape(entry.loc)}</loc>`,
      entry.lastmod ? `    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : '',
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>',
    ].filter(Boolean)

    return lines.join('\n')
  })
  .join('\n')

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlXml}
</urlset>
`

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

await mkdir(publicDir, { recursive: true })
await writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8')
await writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8')

console.log(`Generated sitemap with ${allEntries.length} URLs: ${path.join(publicDir, 'sitemap.xml')}`)
console.log(`Generated robots file: ${path.join(publicDir, 'robots.txt')}`)