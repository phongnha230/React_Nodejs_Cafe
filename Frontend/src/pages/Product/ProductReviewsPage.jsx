import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProductStore } from '../../stores/productStore.js'
import { useReviewStore } from '../../stores/reviewStore.js'
import { useAuthStore } from '../../stores/authStore.js'

export function ProductReviews() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const products = useProductStore((s) => s.products)
  const removeReview = useReviewStore((s) => s.remove)
  const forProduct = useReviewStore((s) => s.forProduct)
  const average = useReviewStore((s) => s.average)
  const loadFromAPI = useReviewStore((s) => s.loadFromAPI) // Add this

  useEffect(() => {
    loadFromAPI(id)
  }, [id, loadFromAPI])

  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)),
    [products, id]
  )
  const reviews = forProduct(id)
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
  const { avg, count } = average(id)

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Đánh giá cho: {product?.name || id}</h2>
        <button className="btn secondary" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          margin: '6px 0 16px',
        }}
      >
        <span style={{ color: '#f59e0b', fontSize: 18 }}>
          {'★'.repeat(Math.round(avg))}
          {'☆'.repeat(5 - Math.round(avg))}
        </span>
        <span className="badge">{count} đánh giá</span>
      </div>

      {reviews.length === 0 ? (
        <div className="card" style={{ padding: 16 }}>
          Chưa có đánh giá nào.
        </div>
      ) : (
        <div className="order-items">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="order-item"
              style={{ alignItems: 'flex-start' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>{r.User?.username || r.user?.username || r.userName || 'Ẩn danh'}</strong>
                  <span className="muted">
                    {new Date(r.created_at || r.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div style={{ color: '#f59e0b', margin: '4px 0' }}>
                  {'★'.repeat(r.rating)}
                  {'☆'.repeat(5 - r.rating)}
                </div>
                <div>
                  {r.comment || (
                    <span className="muted">(Không có nội dung)</span>
                  )}
                </div>
              </div>
              {role === 'admin' && (
                <button
                  className="btn secondary"
                  onClick={async () => {
                    if (confirm('Xóa đánh giá này?')) {
                      await removeReview(r.id)
                      // Reload reviews to update UI
                      await loadFromAPI(id)
                    }
                  }}
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
