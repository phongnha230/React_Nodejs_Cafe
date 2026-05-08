import { useNavigate, useOutletContext } from 'react-router-dom'
import { getAdminSectionHref } from './adminSections'
import { RevenueTab } from './tabs/RevenueTab'

export function RevenuePage() {
  const { stats, orders } = useOutletContext() || {}
  const navigate = useNavigate()

  const quickLinks = [
    { key: 'accounts', label: 'Tài khoản', icon: '👥', desc: 'Quản lý người dùng' },
    { key: 'menu', label: 'Thực đơn', icon: '☕', desc: 'Chỉnh sửa món ăn' },
    { key: 'orders', label: 'Đơn hàng', icon: '📦', desc: 'Xử lý đơn mới' },
    { key: 'news', label: 'Tin tức', icon: '📰', desc: 'Đăng bài viết mới' },
    { key: 'tables', label: 'Bàn & QR', icon: '🪑', desc: 'Quản lý vị trí' },
    { key: 'activities', label: 'Hoạt động', icon: '📸', desc: 'Hình ảnh quán' },
  ]

  return (
    <div className="revenue-page">
      <section className="quick-nav-section">
        <h3 className="section-title">🚀 Truy cập nhanh</h3>
        <div className="quick-nav-grid">
          {quickLinks.map(link => (
            <div
              key={link.key}
              className="quick-nav-card"
              onClick={() => navigate(getAdminSectionHref(link.key))}
            >
              <span className="quick-nav-icon">{link.icon}</span>
              <div className="quick-nav-info">
                <span className="quick-nav-label">{link.label}</span>
                <span className="quick-nav-desc">{link.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <RevenueTab stats={stats} orders={orders} />
    </div>
  )
}
