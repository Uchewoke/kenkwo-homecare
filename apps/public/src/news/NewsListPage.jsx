import { newsPosts } from './posts'

const formatDate = (dateString) =>
  new Intl.DateTimeFormat([], {
    dateStyle: 'medium',
  }).format(new Date(dateString))

export default function NewsListPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-14">
          <p className="text-blue-400 font-semibold uppercase tracking-widest mb-4">Newsroom</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Homecare News and Education</h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl">
            Practical updates, family guidance, and clinical care insights from the Kenkwo team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {newsPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-slate-900 border border-slate-800 rounded-[28px] overflow-hidden hover:border-blue-500/40 transition"
            >
              <img src={post.heroImage} alt={post.title} className="h-48 sm:h-56 w-full object-cover" />
              <div className="p-6 sm:p-7">
                <p className="text-xs uppercase tracking-widest text-blue-300 mb-3">
                  {post.category} · {formatDate(post.publishedAt)}
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight mb-4">{post.title}</h2>
                <p className="text-slate-400 leading-relaxed mb-6 text-sm sm:text-base">{post.excerpt}</p>
                <a
                  href={`/news/${post.slug}`}
                  className="inline-flex items-center text-blue-300 hover:text-blue-200 font-medium"
                >
                  Read Article
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}