import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProductStore } from '../../stores/productStore.js'
import { useReviewStore } from '../../stores/reviewStore.js'
import { FilterBar } from '../../components/common/FilterBar.jsx'
import { ProductCard } from '../../components/common/ProductCard.jsx'
import { getTableSession, setTableSession } from '../../utils/tableSession.js'

export function MenuPage() {
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [price, setPrice] = useState('')
  const products = useProductStore((s) => s.products)
  const loadFromAPI = useProductStore((s) => s.loadFromAPI)
  const loadReviews = useReviewStore((s) => s.loadFromAPI)
  const currentTableSession = getTableSession()
  const qrTableNumber = Number(
    searchParams.get('table') || currentTableSession?.tableNumber || 0
  )

  useEffect(() => {
    loadFromAPI()
    loadReviews()
  }, [loadFromAPI, loadReviews])

  useEffect(() => {
    const tableNumber = Number(searchParams.get('table'))
    const ts = Number(searchParams.get('ts') || 0)
    const sig = searchParams.get('sig') || null
    if (Number.isInteger(tableNumber) && tableNumber > 0) {
      setTableSession({
        tableNumber,
        ts: Number.isInteger(ts) && ts > 0 ? ts : null,
        sig,
        menu_url: window.location.href,
      })
    }
  }, [searchParams])

  const list = useMemo(() => {
    let res = products.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase())
    )
    if (cat) res = res.filter((p) => p.category === cat)
    if (price === 'asc') res = [...res].sort((a, b) => a.price - b.price)
    if (price === 'desc') res = [...res].sort((a, b) => b.price - a.price)
    return res
  }, [products, q, cat, price])

  return (
    <div className="container">
      {qrTableNumber > 0 && (
        <div className="mb-4 rounded-2xl border border-teal-200 bg-gradient-to-br from-cyan-50 to-emerald-50 px-4 py-3.5 text-cyan-900">
          <strong>QR Order dang bat:</strong> Ban {qrTableNumber}. Mon ban chon se duoc gan vao dung ban nay khi thanh toan.
        </div>
      )}
      <FilterBar
        q={q}
        setQ={setQ}
        cat={cat}
        setCat={setCat}
        price={price}
        setPrice={setPrice}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
