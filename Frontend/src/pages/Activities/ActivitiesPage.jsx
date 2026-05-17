import { ImageOff } from 'lucide-react'
import { useActivitiesStore } from '../../stores/activitiesStore.js'

export function PublicActivitiesPage() {
  const items = useActivitiesStore((s) => s.items) || []

  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-300">Jokopi Corner</p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight max-[640px]:text-3xl">Hoạt động của quán</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">
            Những khoảnh khắc, không gian và trải nghiệm mới nhất tại quán.
          </p>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          {items.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
              {items.map((it) => (
                <div key={it.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <img
                    className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
                    src={it.img}
                    alt="Hoạt động tại quán Jokopi"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
              <ImageOff className="mb-3 size-8 text-slate-400" />
              Chưa có hoạt động nào được đăng.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
