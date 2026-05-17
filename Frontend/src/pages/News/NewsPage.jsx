import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Newspaper } from 'lucide-react'
import { useNewsStore } from '../../stores/newsStore.js'
import { ROUTES } from '../../config/routes.js'

export function PublicNewsPage() {
  const news = useNewsStore((s) => s.news) || []
  const loading = useNewsStore((s) => s.loading)
  const loadNews = useNewsStore((s) => s.loadFromAPI)

  useEffect(() => {
    loadNews()
  }, [loadNews])

  const sorted = useMemo(() => {
    return [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [news])

  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-300">Jokopi Updates</p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight max-[640px]:text-3xl">Tin tức mới nhất</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">
            Cập nhật ưu đãi, món mới và các thông báo từ Jokopi.
          </p>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          {loading && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
              Đang tải tin tức...
            </div>
          )}

          {!loading && sorted.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
              {sorted.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <img src={item.img} alt={item.title} className="aspect-[16/10] w-full object-cover" />
                  <div className="p-5">
                    <h4 className="mb-3 text-lg font-extrabold text-slate-900">{item.title}</h4>
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <CalendarDays className="size-4" />
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mb-5 line-clamp-3 leading-7 text-slate-600">{item.excerpt}</p>
                    <Link
                      to={ROUTES.NEWS_DETAIL(item.id)}
                      className="font-extrabold text-emerald-600 no-underline hover:text-emerald-700"
                    >
                      Đọc thêm
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
              <Newspaper className="mb-3 size-8 text-slate-400" />
              Chưa có tin tức nào được đăng.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
