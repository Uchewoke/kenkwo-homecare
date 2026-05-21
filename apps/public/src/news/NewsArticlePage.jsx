import { newsPostMap } from './posts'

const formatDate = (dateString) =>
  new Intl.DateTimeFormat([], {
    dateStyle: 'medium',
  }).format(new Date(dateString))

export default function NewsArticlePage({ slug }) {
  const post = newsPostMap[slug]

  if (!post) {
    return (
      <main className="min-h-screen bg-slate-950 text-white py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-400 mb-3">Article not found</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-6">This news article is unavailable</h1>
          <a href="/news" className="text-blue-300 hover:text-blue-200">
            Return to Newsroom
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-20 sm:pb-24">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        <a href="/news" className="text-blue-300 hover:text-blue-200 text-sm">
          Back to Newsroom
        </a>

        <header className="mt-8 mb-10">
          <p className="text-xs uppercase tracking-widest text-blue-300 mb-3">
            {post.category} · {formatDate(post.publishedAt)}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">{post.title}</h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">{post.excerpt}</p>
          <p className="text-slate-500 text-sm mt-4">
            By {post.author} · Updated {formatDate(post.updatedAt)}
          </p>
        </header>

        <img
          src={post.heroImage}
          alt={post.title}
          className="rounded-[28px] w-full h-[240px] sm:h-[320px] lg:h-[420px] object-cover mb-10"
        />

        <div className="space-y-6 text-slate-200 text-base sm:text-lg leading-relaxed">
          {post.content.map((paragraph, index) => (
            <p key={`${post.slug}-${index}`}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}