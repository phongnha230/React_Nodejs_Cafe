import { useMemo, useState, useEffect } from 'react'
import { useProductStore } from '../../stores/productStore.js'
import { useReviewStore } from '../../stores/reviewStore.js'
import { FilterBar } from '../../components/common/FilterBar.jsx'
import { ProductCard } from '../../components/common/ProductCard.jsx'

export function MenuPage() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [price, setPrice] = useState('')
  const products = useProductStore((s) => s.products)
  const loadFromAPI = useProductStore((s) => s.loadFromAPI)
  const loading = useProductStore((s) => s.loading)
  const loadReviews = useReviewStore((s) => s.loadFromAPI)

  // Load products from MySQL khi vào trang
  useEffect(() => {
    loadFromAPI()
    loadReviews() // Load reviews so ProductCard can display ratings
  }, [loadFromAPI, loadReviews])

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
      <FilterBar
        q={q}
        setQ={setQ}
        cat={cat}
        setCat={setCat}
        price={price}
        setPrice={setPrice}
      />
      <div className="grid">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
