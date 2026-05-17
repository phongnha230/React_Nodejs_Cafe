import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { useNewsStore } from '../../stores/newsStore.js'
import { ROUTES } from '../../config/routes.js'

export function NewsDetailPage() {
  const { id } = useParams()
  const news = useNewsStore((s) => s.news) || []
  const loading = useNewsStore((s) => s.loading)
  const loadNews = useNewsStore((s) => s.loadFromAPI)
  const loadNewsById = useNewsStore((s) => s.loadById)

  useEffect(() => {
    if (news.length === 0) {
      loadNews()
    }
  }, [loadNews, news.length])

  const item = useMemo(() => news.find((entry) => String(entry.id) === String(id)), [news, id])

  useEffect(() => {
    if (!item && id) {
      loadNewsById(id).catch(() => {})
    }
  }, [id, item, loadNewsById])

  if (loading && !item) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          Đang tải tin tức...
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          <p className="mb-4">Không tìm thấy tin tức này.</p>
          <Link className="font-extrabold text-emerald-600 no-underline hover:text-emerald-700" to={ROUTES.NEWS}>
            Quay lại tin tức
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-4xl px-5 py-12">
      <Link
        className="mb-6 inline-flex items-center gap-2 font-extrabold text-emerald-600 no-underline hover:text-emerald-700"
        to={ROUTES.NEWS}
      >
        <ArrowLeft className="size-4" />
        Quay lại tin tức
      </Link>

      {item.img && (
        <img className="mb-7 aspect-[16/9] w-full rounded-3xl object-cover shadow-sm" src={item.img} alt={item.title} />
      )}

      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
        <CalendarDays className="size-4" />
        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
      </p>
      <h1 className="mb-4 text-4xl font-extrabold leading-tight text-slate-950 max-[640px]:text-3xl">{item.title}</h1>
      {item.excerpt && <p className="mb-8 text-xl leading-8 text-slate-600">{item.excerpt}</p>}
      <div className="max-w-none space-y-4 text-slate-700 [&_a]:font-bold [&_a]:text-emerald-600 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-950 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-slate-950 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-950 [&_img]:rounded-2xl [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-8 [&_strong]:text-slate-950">
        <ReactMarkdown>{item.content || item.excerpt || ''}</ReactMarkdown>
      </div>
    </article>
  )
}
