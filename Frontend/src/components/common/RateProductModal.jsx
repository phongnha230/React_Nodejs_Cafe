import { useEffect, useState } from 'react'
import { Star, X } from 'lucide-react'
import { useReviewStore } from '../../stores/reviewStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import { useVoucherStore } from '../../stores/voucherStore.js'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function RateProductModal({ open, onClose, product, existingReview }) {
  const addReview = useReviewStore((s) => s.add)
  const updateReview = useReviewStore((s) => s.updateReview)
  const loadWallet = useVoucherStore((s) => s.loadWallet)
  const customerName = useAuthStore((s) => s.customerName) || 'Ẩn danh'
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')

  useEffect(() => {
    if (!open) return

    if (existingReview) {
      setRating(existingReview.rating || 5)
      setComment(existingReview.comment || '')
      setMediaUrl(existingReview.media_url || '')
      return
    }

    setRating(0)
    setComment('')
    setMediaUrl('')
  }, [existingReview, open])

  const submit = async () => {
    if (!rating) return
    try {
      if (existingReview) {
        await updateReview(existingReview.id, {
          rating,
          comment,
          mediaUrl,
        })
      } else {
        const newReview = await addReview({
          productId: product.id,
          userName: customerName,
          rating,
          comment,
          mediaUrl,
        })
        await loadWallet()
        if (newReview?.reward_coins) {
          alert(`Đánh giá thành công! Bạn nhận được ${newReview.reward_coins} xu.`)
        }
      }

      const loadReviews = useReviewStore.getState().loadFromAPI
      await loadReviews()
      onClose?.()
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message)
    }
  }

  if (!open || !product) return null

  const mediaIsVideo = mediaUrl && (
    mediaUrl.startsWith('data:video') ||
    mediaUrl.includes('/video/upload/') ||
    /\.(mp4|mov|webm|mkv|avi)(\?|$)/i.test(mediaUrl)
  )

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="w-[min(360px,95vw)] rounded-md border-2 border-cyan-900 bg-cyan-400 px-4 py-3.5 text-cyan-950 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1.5 text-base font-extrabold">
          {existingReview ? 'Sửa đánh giá' : 'Đánh giá của bạn'}
        </div>
        <div className="mb-1.5 text-[22px] font-black leading-tight text-red-700">
          {product.name}
        </div>

        <div className="my-2.5 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-md border-0 bg-transparent p-0 text-slate-200 transition hover:scale-110',
                n <= rating && 'text-yellow-300'
              )}
              onClick={() => setRating(n)}
              aria-label={`${n} sao`}
            >
              <Star className="size-6 fill-current" />
            </button>
          ))}
        </div>

        <textarea
          className="min-h-[90px] w-full resize-y rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/15"
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

        <input
          className="mt-2 min-h-0 w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-cyan-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cyan-800 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/15"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = () => setMediaUrl(reader.result || '')
            reader.readAsDataURL(file)
          }}
        />

        {mediaUrl && (
          <div className="mt-2.5">
            {mediaIsVideo ? (
              <video
                src={mediaUrl}
                controls
                className="max-h-44 w-full rounded-xl object-cover"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Review media preview"
                className="max-h-44 w-full rounded-xl object-cover"
              />
            )}
            <Button
              type="button"
              className="mt-2 w-full rounded-full bg-lime-400 font-extrabold text-lime-950 hover:bg-lime-300"
              onClick={() => setMediaUrl('')}
            >
              <X className="size-4" />
              Xóa ảnh/video
            </Button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2.5">
          <Button
            type="button"
            className="flex-1 rounded-full bg-lime-400 font-extrabold text-lime-950 hover:bg-lime-300"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-full bg-green-600 font-extrabold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={submit}
            disabled={!rating}
          >
            {existingReview ? 'Cập nhật' : 'Hoàn tất'}
          </Button>
        </div>
      </div>
    </div>
  )
}
