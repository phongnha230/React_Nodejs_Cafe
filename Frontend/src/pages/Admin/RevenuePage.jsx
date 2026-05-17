import { useNavigate, useOutletContext } from 'react-router-dom'
import { Camera, Coffee, Newspaper, Package, Table2, Users } from 'lucide-react'
import { getAdminSectionHref } from './adminSections'
import { RevenueTab } from './tabs/RevenueTab'

const quickLinks = [
  { key: 'accounts', label: 'Tài khoản', icon: Users, desc: 'Quản lý người dùng' },
  { key: 'menu', label: 'Thực đơn', icon: Coffee, desc: 'Chỉnh sửa món ăn' },
  { key: 'orders', label: 'Đơn hàng', icon: Package, desc: 'Xử lý đơn mới' },
  { key: 'news', label: 'Tin tức', icon: Newspaper, desc: 'Đăng bài viết mới' },
  { key: 'tables', label: 'Bàn & QR', icon: Table2, desc: 'Quản lý vị trí' },
  { key: 'activities', label: 'Hoạt động', icon: Camera, desc: 'Hình ảnh quán' },
]

export function RevenuePage() {
  const { stats, orders, revenueRange, setRevenueRange } = useOutletContext() || {}
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-800">Truy cập nhanh</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon

            return (
              <button
                key={link.key}
                type="button"
                className="group flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                onClick={() => navigate(getAdminSectionHref(link.key))}
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon className="size-6" />
                </span>
                <span className="text-sm font-extrabold text-slate-900">{link.label}</span>
                <span className="text-xs leading-5 text-slate-500">{link.desc}</span>
              </button>
            )
          })}
        </div>
      </section>

      <RevenueTab stats={stats} orders={orders} revenueRange={revenueRange} setRevenueRange={setRevenueRange} />
    </div>
  )
}
