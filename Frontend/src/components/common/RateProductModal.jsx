import { useMemo, useState } from 'react'
import { useReviewStore } from '../../stores/reviewStore.js'
import { useAuthStore } from '../../stores/authStore.js'

export function RateProductModal({ open, onClose, product, existingReview }) {
  const addReview = useReviewStore((s) => s.add)
  const updateReview = useReviewStore((s) => s.updateReview)
  const customerName = useAuthStore((s) => s.customerName) || 'Ẩn danh'
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  // Init state when opening
  // We use a key or effect to reset. Since this is a modal, we can use an effect
  // that runs when 'open' or 'existingReview' changes.
  // Actually simpler: just useState with useEffect sync
  const [initDone, setInitDone] = useState(false)

  if (!open && initDone) setInitDone(false) // reset flag when closed

  if (open && !initDone) {
    if (existingReview) {
      setRating(existingReview.rating || 5)
      setComment(existingReview.comment || '')
    } else {
      setRating(0)
      setComment('')
    }
    setInitDone(true)
  }

  const submit = async () => {
    if (!rating) return
    try {
      if (existingReview) {
        await updateReview(existingReview.id, {
          rating,
          comment,
        })
      } else {
        await addReview({
          productId: product.id,
          userName: customerName,
          rating,
          comment,
        })
      }
      // Reload reviews to update button state
      const loadReviews = useReviewStore.getState().loadFromAPI
      await loadReviews()
      onClose?.()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message)
    }
  }

  if (!open || !product) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-header">{existingReview ? 'Sửa đánh giá' : 'Đánh giá của bạn'}</div>
        <div className="review-product-name">{product.name}</div>

        <div className="review-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`review-star ${n <= rating ? 'filled' : ''}`}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          className="review-input"
          rows={4}
          placeholder="Khoảng 150 kí tự..."
          value={comment}
          onChange={(e) => {
            const text = e.target.value
            const w = text.trim() ? text.trim().split(/\s+/) : []
            if (w.length <= 150) setComment(text)
            else setComment(w.slice(0, 150).join(' ') + ' ')
          }}
        />

        <div className="review-buttons">
          <button className="review-btn review-btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className={`review-btn review-btn-submit ${!rating ? 'disabled' : ''
              }`}
            onClick={submit}
            disabled={!rating}
          >
            {existingReview ? 'Cập nhật' : 'Hoàn tất'}
          </button>
        </div>
      </div>
    </div>
  )
}
