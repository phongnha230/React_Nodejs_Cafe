import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Clock3, IceCreamBowl, Leaf, Search, ShoppingCart, Star } from 'lucide-react'
import { useProductStore } from '../../stores/productStore.js'
import { useReviewStore } from '../../stores/reviewStore.js'
import { useCartStore } from '../../stores/cartStore.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useNotifyStore } from '../../stores/notifyStore.js'
import { ROUTES } from '../../config/routes'
import { MESSAGES } from '../../constants/messages'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const categoryLabels = {
  coffee: 'Cà phê',
  tea: 'Trà',
  juice: 'Nước ép',
  'milk-tea': 'Trà sữa',
  food: 'Đồ ăn',
}

const categoryDescriptions = {
  coffee: 'Được pha chế từ hạt cà phê Robusta và Arabica chọn lọc, rang xay tại chỗ mỗi ngày để giữ trọn hương vị đậm đà.',
  tea: 'Trà thượng hạng từ vùng cao, pha chế tinh tế kết hợp cùng nguyên liệu tươi ngon, mang đến hương vị thanh mát tự nhiên.',
  juice: 'Nước ép từ trái cây tươi 100%, không thêm đường nhân tạo, giữ nguyên vitamin và dưỡng chất tự nhiên.',
  'milk-tea': 'Trà sữa pha chế thủ công với trà đen cao cấp, sữa tươi nguyên chất và topping được làm mới mỗi ngày.',
  food: 'Món ăn nhẹ được chuẩn bị tươi mới, kết hợp hoàn hảo với thức uống để mang lại trải nghiệm trọn vẹn.',
}

const suggestedPairings = {
  coffee: ['Bánh mì trứng', 'Matcha latte'],
  tea: ['Trà sữa trân châu', 'Bánh mì trứng'],
  juice: ['Bánh mì trứng', 'Trà Đào'],
  'milk-tea': ['Bánh mì trứng', 'Cà phê sữa'],
  food: ['Cà phê sữa', 'Trà sữa Thái xanh'],
}

function StarRating({ rating, size = 'size-5' }) {
  const rounded = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)))

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size,
            star <= rounded ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
          )}
        />
      ))}
    </div>
  )
}

const getReviewCustomerName = (review = {}) => (
  review.customer_name ||
  review.customerName ||
  review.userName ||
  review.User?.username ||
  review.user?.username ||
  'Khách hàng'
)

function ReviewCard({ review }) {
  const date = new Date(review.created_at || review.createdAt)
  const mediaUrl = review.media_url || review.mediaUrl
  const isVideo = (mediaUrl || '').match(/\.(mp4|webm|ogg)$/i)
  const customerName = getReviewCustomerName(review)

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-300 text-base font-extrabold text-white">
          {customerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">{customerName}</div>
          <div className="text-xs text-slate-400">{date.toLocaleDateString('vi-VN')}</div>
        </div>
        <div className="ml-auto">
          <StarRating rating={review.rating} size="size-4" />
        </div>
      </div>

      {review.comment && (
        <p className="m-0 text-sm leading-relaxed text-slate-600">{review.comment}</p>
      )}

      {mediaUrl && (
        <div className="mt-3 overflow-hidden rounded-xl">
          {isVideo ? (
            <video src={mediaUrl} controls className="max-h-52 w-full rounded-xl object-cover" />
          ) : (
            <img src={mediaUrl} alt="Review" className="max-h-52 w-full rounded-xl object-cover" />
          )}
        </div>
      )}
    </article>
  )
}

function RelatedCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white text-inherit no-underline shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-2 hover:border-slate-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-40 w-full object-cover transition duration-500 hover:scale-[1.08] max-[600px]:h-28"
      />
      <div className="px-4 py-3.5">
        <div className="mb-1.5 text-[15px] font-bold text-slate-800">{product.name}</div>
        <div className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-600">
          {product.price.toLocaleString('vi-VN')}đ
        </div>
      </div>
    </Link>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const products = useProductStore((s) => s.products)
  const loadProducts = useProductStore((s) => s.loadFromAPI)
  const reviews = useReviewStore((s) => s.reviews)
  const loadReviews = useReviewStore((s) => s.loadFromAPI)
  const addToCart = useCartStore((s) => s.add)
  const { isGuest } = useAuth()
  const notify = useNotifyStore()
  const [quantity, setQuantity] = useState(1)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    loadProducts()
    loadReviews()
  }, [loadProducts, loadReviews])

  const product = products.find((p) => String(p.id) === String(id))
  const pid = Number(id)

  const productReviews = reviews.filter(
    (r) => Number(r.product_id) === pid || Number(r.productId) === pid
  )

  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / productReviews.length
      : 0

  const relatedProducts = product
    ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
    : []

  const pairings = product
    ? products.filter((p) => {
      const names = suggestedPairings[product.category] || []
      return names.some((n) => p.name.includes(n)) && p.id !== product.id
    }).slice(0, 3)
    : []

  const handleAddToCart = () => {
    if (isGuest) {
      notify.show({
        message: MESSAGES.ERROR.UNAUTHORIZED,
        type: 'warning',
        actionLabel: 'Đăng nhập',
        onAction: () => navigate(ROUTES.LOGIN),
        duration: 4000,
      })
      return
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id)
    }
    notify.show({
      message: `Đã thêm ${quantity} ${product.name} vào giỏ hàng`,
      type: 'success',
      actionLabel: 'Xem giỏ',
      onAction: () => navigate(ROUTES.CART),
      duration: 2500,
    })
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <Search className="mx-auto mb-4 size-16 text-slate-400" />
        <h2 className="mb-2 mt-0 text-2xl font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
        <p className="mb-6 mt-0 text-slate-500">
          Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          to={ROUTES.MENU}
          className="inline-flex rounded-full bg-emerald-500 px-5 py-3 font-bold text-white no-underline transition hover:bg-emerald-600 hover:text-white"
        >
          Quay lại thực đơn
        </Link>
      </div>
    )
  }

  const catLabel = categoryLabels[product.category] || product.category || 'Thức uống'
  const catDesc = categoryDescriptions[product.category] || ''

  return (
    <div className="mx-auto max-w-[1200px] animate-in fade-in slide-in-from-bottom-4 duration-500 px-5 pb-16 pt-6 max-[600px]:px-3 max-[600px]:pb-10 max-[600px]:pt-4">
      <nav className="mb-7 flex items-center gap-2 text-sm">
        <Link to={ROUTES.HOME} className="text-slate-500 no-underline transition hover:text-violet-600">
          Trang chủ
        </Link>
        <ChevronRight className="size-4 text-slate-300" />
        <Link to={ROUTES.MENU} className="text-slate-500 no-underline transition hover:text-violet-600">
          Thực đơn
        </Link>
        <ChevronRight className="size-4 text-slate-300" />
        <span className="font-semibold text-slate-900">{product.name}</span>
      </nav>

      <section className="mb-14 grid grid-cols-2 gap-12 max-[900px]:grid-cols-1 max-[900px]:gap-7">
        <div>
          <div
            className={cn(
              'relative aspect-square overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-100 to-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition duration-500 hover:scale-[1.02] max-[600px]:rounded-2xl',
              imgLoaded && 'bg-transparent'
            )}
          >
            <img
              src={product.image}
              alt={product.name}
              className={cn(
                'h-full w-full object-cover transition duration-700 hover:scale-[1.08]',
                !product.is_available && 'opacity-50 grayscale'
              )}
              onLoad={() => setImgLoaded(true)}
            />
            {!product.is_available && (
              <div className="absolute right-5 top-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 px-5 py-2 text-sm font-bold tracking-wide text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)]">
                Hết hàng
              </div>
            )}
            <div className="absolute left-5 top-5 rounded-full border border-violet-600/15 bg-white/90 px-4.5 py-2 text-[13px] font-bold tracking-wide text-violet-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur">
              {catLabel}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 py-2">
          <div className="flex flex-col gap-3">
            <h1 className="m-0 text-4xl font-extrabold leading-tight tracking-normal text-slate-900 max-[900px]:text-[28px] max-[600px]:text-2xl">
              {product.name}
            </h1>
            <div className="flex items-center gap-2.5">
              <StarRating rating={avgRating} size="size-[22px]" />
              <span className="text-base font-bold text-amber-500">
                {avgRating > 0 ? avgRating.toFixed(1) : '0'} / 5
              </span>
              <span className="text-sm font-medium text-slate-400">
                ({productReviews.length} đánh giá)
              </span>
            </div>
          </div>

          <div className="inline-flex w-fit items-center rounded-[20px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 px-7 py-3.5">
            <span className="text-[32px] font-extrabold tracking-normal text-emerald-600 max-[900px]:text-[26px]">
              {product.price.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="mb-2.5 mt-0 text-sm font-bold uppercase tracking-[0.08em] text-violet-600">
              Giới thiệu
            </h3>
            <div className="whitespace-pre-wrap text-[15px] leading-8 text-slate-600 [&_ol]:mb-3 [&_ol]:pl-5 [&_p]:mb-3 [&_p]:mt-0 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ul]:pl-5">
              {product.description ? (
                <ReactMarkdown>{product.description}</ReactMarkdown>
              ) : (
                <p><strong>{product.name}</strong> là một trong những thức uống đặc trưng tại jokopi. {catDesc}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
            {[
              { icon: Leaf, title: 'Nguyên liệu tươi', desc: '100% tự nhiên' },
              { icon: Clock3, title: 'Pha chế nhanh', desc: '3-5 phút' },
              { icon: IceCreamBowl, title: 'Phục vụ lạnh', desc: 'Đá xay mịn' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600">
                  <Icon className="size-6" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-800">{title}</div>
                  <div className="text-xs font-medium text-slate-400">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2 max-[900px]:flex-col">
            <div className="flex overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="size-11 rounded-none text-xl font-bold text-slate-700 hover:bg-slate-200 hover:text-violet-600 disabled:opacity-30"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="flex min-w-9 items-center justify-center text-lg font-extrabold text-slate-800">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="size-11 rounded-none text-xl font-bold text-slate-700 hover:bg-slate-200 hover:text-violet-600"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </Button>
            </div>

            <Button
              type="button"
              className="flex-1 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 px-7 py-3.5 text-base font-bold text-white shadow-[0_8px_20px_rgba(107,76,230,0.25)] hover:-translate-y-0.5 hover:from-violet-500 hover:to-violet-400 hover:shadow-[0_14px_30px_rgba(107,76,230,0.35)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none max-[900px]:w-full"
              onClick={handleAddToCart}
              disabled={!product.is_available}
            >
              {product.is_available ? (
                <>
                  <ShoppingCart className="size-4" />
                  Thêm vào giỏ · {(product.price * quantity).toLocaleString('vi-VN')}đ
                </>
              ) : (
                'Sản phẩm đã hết hàng'
              )}
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 flex items-center gap-3 text-2xl font-extrabold text-slate-900">
            Đánh giá từ khách hàng
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-violet-600 px-2 text-[13px] font-bold text-white">
              {productReviews.length}
            </span>
          </h2>
          {avgRating > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[42px] font-extrabold leading-none text-amber-500">
                {avgRating.toFixed(1)}
              </span>
              <StarRating rating={avgRating} size="size-6" />
            </div>
          )}
        </div>

        {productReviews.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12 text-center">
            <p className="m-0 text-base text-slate-500">
              Chưa có đánh giá nào cho sản phẩm này.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Hãy là người đầu tiên chia sẻ trải nghiệm!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 max-[900px]:grid-cols-1">
            {productReviews.slice(0, 6).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}

        {productReviews.length > 6 && (
          <div className="mt-5 text-center">
            <Link
              to={ROUTES.PRODUCT_REVIEWS(product.id)}
              className="inline-block rounded-xl bg-violet-600/5 px-6 py-2.5 text-[15px] font-bold text-violet-600 no-underline transition hover:translate-x-1 hover:bg-violet-600/10"
            >
              Xem tất cả {productReviews.length} đánh giá
            </Link>
          </div>
        )}
      </section>

      {pairings.length > 0 && (
        <section className="mb-14">
          <h2 className="m-0 mb-2 flex items-center gap-3 text-2xl font-extrabold text-slate-900">
            Kết hợp hoàn hảo
          </h2>
          <p className="mb-6 mt-0 text-[15px] text-slate-500">
            Những món thường được gọi cùng {product.name}
          </p>
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 max-[600px]:grid-cols-2 max-[600px]:gap-3">
            {pairings.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="mb-14">
          <h2 className="m-0 mb-5 flex items-center gap-3 text-2xl font-extrabold text-slate-900">
            Có thể bạn cũng thích
          </h2>
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 max-[600px]:grid-cols-2 max-[600px]:gap-3">
            {relatedProducts.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
