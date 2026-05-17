import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, List, ShoppingCart, Star, TicketPercent } from 'lucide-react'
import { Banner } from '../../components/common/Banner'
import { FilterBar } from '../../components/common/FilterBar'
import { ProductCard } from '../../components/common/ProductCard'
import { useProductStore } from '../../stores/productStore'
import { useVoucherStore } from '../../stores/voucherStore'
import { formatCurrency } from '../../utils/format'
import spaceImage from '../../assets/space_coffee.jpg'
import cafeImage from '../../assets/Hinh-anh-cafe-dep-nhat.png'

const aboutCards = [
  {
    title: 'Không gian yên tĩnh',
    icon: Home,
    text: 'Không chỉ là nơi thưởng thức cà phê, mỗi góc nhỏ tại Jokopi đều được thiết kế để mang lại sự tĩnh lặng giữa nhịp phố.',
  },
  {
    title: 'Menu đa dạng',
    icon: List,
    text: 'Từ cà phê rang xay đến trà, nước ép và món ăn nhẹ, thực đơn luôn được chuẩn bị kỹ để hợp nhiều gu thưởng thức.',
  },
  {
    title: 'Trải nghiệm đặc biệt',
    icon: Star,
    text: 'Jokopi giữ không gian ấm cúng, tinh tế để bạn có thể nghỉ lại, trò chuyện và tận hưởng những khoảnh khắc đáng nhớ.',
  },
]

function AboutSection() {
  return (
    <section id="about" className="bg-white px-5 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-[1.1fr_0.9fr] gap-10 max-[900px]:grid-cols-1">
        <div>
          <div className="mb-8 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-normal text-slate-950">jokopi.</span>
            <span className="text-lg font-semibold text-emerald-500">Home</span>
          </div>

          <div className="grid gap-4">
            {aboutCards.map((item) => {
              const Icon = item.icon

              return (
                <article
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-100 hover:bg-white hover:shadow-md"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="m-0 leading-7 text-slate-600">{item.text}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
          <div className="overflow-hidden rounded-3xl shadow-lg">
            <img className="h-full min-h-[340px] w-full object-cover" src={spaceImage} alt="Không gian quán cafe Jokopi" />
          </div>
          <div className="mt-12 overflow-hidden rounded-3xl shadow-lg max-[560px]:mt-0">
            <img className="h-full min-h-[340px] w-full object-cover" src={cafeImage} alt="Khu vực phục vụ tại Jokopi" />
          </div>
        </aside>
      </div>
    </section>
  )
}

function ActionsSection({ q, setQ, cat, setCat, price, setPrice }) {
  return (
    <section className="bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <h3 className="mb-4 text-2xl font-extrabold text-slate-900">Tìm món & Giỏ hàng</h3>
        <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm max-[760px]:flex-col max-[760px]:items-stretch">
          <FilterBar q={q} setQ={setQ} cat={cat} setCat={setCat} price={price} setPrice={setPrice} />
          <Link
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 font-bold text-white no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white"
            to="/cart"
          >
            <ShoppingCart className="size-4" />
            Xem giỏ hàng
          </Link>
        </div>
      </div>
    </section>
  )
}

function VoucherSection() {
  const vouchers = useVoucherStore((s) => s.vouchers)
  const loading = useVoucherStore((s) => s.loading)
  const loadVouchers = useVoucherStore((s) => s.loadVouchers)

  useEffect(() => {
    loadVouchers()
  }, [loadVouchers])

  const visibleVouchers = useMemo(
    () => (vouchers || []).filter((voucher) => voucher.is_active !== false).slice(0, 6),
    [vouchers]
  )

  return (
    <section id="vouchers" className="bg-white px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex items-end justify-between gap-4 max-[640px]:items-start max-[640px]:flex-col">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Voucher đang có</h3>
            <p className="mt-2 text-slate-600">Mã ưu đãi đang mở cho khách hàng của Jokopi.</p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 font-bold text-emerald-700 no-underline transition hover:bg-emerald-100 hover:text-emerald-800"
            to="/my-orders"
          >
            <TicketPercent className="size-4" />
            Ví voucher
          </Link>
        </div>

        {loading && visibleVouchers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Đang tải voucher...
          </div>
        ) : visibleVouchers.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
            {visibleVouchers.map((voucher) => {
              const discountText =
                voucher.discount_type === 'percent'
                  ? `Giảm ${Number(voucher.discount_value || 0)}%`
                  : `Giảm ${formatCurrency(Number(voucher.discount_value || 0))}`
              const minOrder = voucher.min_order_amount
                ? `Đơn từ ${formatCurrency(Number(voucher.min_order_amount))}`
                : 'Không yêu cầu đơn tối thiểu'

              return (
                <article
                  className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm"
                  key={voucher.id}
                >
                  <div className="mb-4 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-white">
                    {voucher.code}
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">{voucher.name}</h4>
                  <div className="mb-2 text-2xl font-extrabold text-emerald-600">{discountText}</div>
                  <p className="m-0 text-sm text-slate-600">{minOrder}</p>
                  {voucher.max_discount_amount && (
                    <p className="mt-1 text-sm text-slate-600">
                      Tối đa {formatCurrency(Number(voucher.max_discount_amount))}
                    </p>
                  )}
                  {voucher.type === 'coin_exchange' && (
                    <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      Đổi {Number(voucher.coin_cost || 0).toLocaleString('vi-VN')} xu
                    </span>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Chưa có voucher khả dụng.
          </div>
        )}
      </div>
    </section>
  )
}

export default function HomePage() {
  const { products, loadFromAPI } = useProductStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    loadFromAPI()
  }, [loadFromAPI])

  useEffect(() => {
    if (window.location.hash !== '#vouchers') return
    window.requestAnimationFrame(() => {
      document.getElementById('vouchers')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const filteredProducts = useMemo(() => {
    const result = (products || []).filter((p) => {
      const matchQ = p.name.toLowerCase().includes(q.toLowerCase())
      const matchCat = !cat || p.category === cat
      return matchQ && matchCat
    })

    if (price === 'asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (price === 'desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [products, q, cat, price])

  return (
    <>
      <Banner />
      <AboutSection />
      <ActionsSection q={q} setQ={setQ} cat={cat} setCat={setCat} price={price} setPrice={setPrice} />
      <VoucherSection />
      <section className="bg-slate-50 px-5 py-16" id="menu">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-7 text-2xl font-extrabold text-slate-900">Thực đơn của chúng tôi</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
