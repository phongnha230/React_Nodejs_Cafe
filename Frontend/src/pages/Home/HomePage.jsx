import { useEffect, useMemo, useRef, useState } from 'react'
import { Banner } from '../../components/common/Banner.jsx'
import { FilterBar } from '../../components/common/FilterBar.jsx'
import { ProductCard } from '../../components/common/ProductCard.jsx'
import { useProductStore } from '../../stores/productStore.js'
import { Link } from 'react-router-dom'
import { useNewsStore } from '../../stores/newsStore.js'
import { useActivitiesStore } from '../../stores/activitiesStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import { useReviewStore } from '../../stores/reviewStore.js'
import { Sidebar } from '../../components/layout/Sidebar.jsx'

function AboutSection() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <header className="brand-name-section">
          <h2 className="brand-text">jokopi.</h2>
          <span className="brand-suffix-text">Home</span>
        </header>
        <div className="about-layout">
          <div className="about-features">
            <article className="about-card">
              <div className="about-card-icon">??</div>
              <h3 className="about-card-title">Không gian yên tinh</h3>
              <p className="about-card-text">
                Không ch? là noi d? thu?ng th?c cà phê, mà còn là m?t không gian
                yên tinh d? b?n thoát kh?i cu?c s?ng b?n r?n.
              </p>
            </article>
            <article className="about-card">
              <div className="about-card-icon">?</div>
              <h3 className="about-card-title">Menu da d?ng</h3>
              <p className="about-card-text">
                Menu da d?ng t? cà phê rang nguyên ch?t, trà thanh mát d?n các
                th?c u?ng d?c quy?n du?c ch? bi?n c?n th?n.
              </p>
            </article>
            <article className="about-card">
              <div className="about-card-icon">?</div>
              <h3 className="about-card-title">Tr?i nghi?m d?c bi?t</h3>
              <p className="about-card-text">
                V?i không gian ?m cúng, trang trí t? m? và tinh t?, chúng tôi
                mang d?n cho b?n tr?i nghi?m tho?i mái và "chill".
              </p>
            </article>
          </div>
          <aside className="about-images">
            <img
              className="about-showcase-img"
              src="/src/assets/space_coffee.jpg"
              alt="Không gian quán cafe jokopi ?m cúng và hi?n d?i"
            />
            <img
              className="about-showcase-img"
              src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=800&auto=format&fit=crop"
              alt="Khu v?c làm vi?c t?i quán cafe jokopi"
            />
          </aside>
        </div>
      </div>
    </section>
  )
}

function ActionsSection({ q, setQ, cat, setCat, price, setPrice }) {
  return (
    <section className="section actions">
      <div className="container">
        <h3 className="section-title">Tìm món & Gi? hàng</h3>
        <div className="actions-bar">
          <FilterBar
            q={q}
            setQ={setQ}
            cat={cat}
            setCat={setCat}
            price={price}
            setPrice={setPrice}
          />
          <Link className="btn" to="/cart">
            Xem gi? hàng
          </Link>
        </div>
      </div>
    </section>
  )
}

function GallerySection() {
  const items = useActivitiesStore((s) => s.items)
  return (
    <section className="section" id="activities">
      <div className="container">
        <h3 className="section-title">Ho?t d?ng c?a quán</h3>
        <div className="gallery">
          {items.map((it) => (
            <img
              key={it.id}
              className="gallery-img"
              src={it.img}
              alt={`gallery-${it.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsSection() {
  const news = useNewsStore((s) => s.news)
  const sorted = useMemo(() => {
    return [...news].sort((a, b) => {
      const pa = a.pinned ? 1 : 0
      const pb = b.pinned ? 1 : 0
      if (pa !== pb) return pb - pa // pinned first
      const ca = typeof a.createdAt === 'number' ? a.createdAt : 0
      const cb = typeof b.createdAt === 'number' ? b.createdAt : 0
      return cb - ca // newest first
    })
  }, [news])
  return (
    <section className="section" id="news">
      <div className="container">
        <h3 className="section-title">Tin t?c v? quán</h3>
        <div className="news-grid">
          {sorted.map((n, i) => (
            <article key={i} className="card">
              <img className="news-thumb" src={n.img} alt={n.title} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {n.pinned && <span className="badge">Ghim</span>}
                <div style={{ fontWeight: 600, fontSize: 16 }}>{n.title}</div>
              </div>
              <div style={{
                color: '#555',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.5'
              }}>
                {n.excerpt}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomePage({ sidebarOpen, setSidebarOpen }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [price, setPrice] = useState('')
  const [activeTab, setActiveTab] = useState('revenue')
  const rootRef = useRef(null)
  const products = useProductStore((s) => s.products)
  const loadFromAPI = useProductStore((s) => s.loadFromAPI)
  const loadNews = useNewsStore((s) => s.loadFromAPI)
  const loadReviews = useReviewStore((s) => s.loadFromAPI)
  const role = useAuthStore((s) => s.role)

  // Load products from MySQL khi vào trang
  useEffect(() => {
    loadFromAPI()
  }, [loadFromAPI])

  // Load news so that news section displays latest articles
  useEffect(() => {
    loadNews()
  }, [loadNews])

  // Load reviews so that ratings are displayed on product cards
  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  useEffect(() => {
    const root = rootRef.current || document
    const els = root.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

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
    <>
      {role === 'admin' && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
      <div ref={rootRef}>
        <Banner />
        <div className="reveal">
          <AboutSection />
        </div>
        <div className="reveal">
          <ActionsSection
            q={q}
            setQ={setQ}
            cat={cat}
            setCat={setCat}
            price={price}
            setPrice={setPrice}
          />
        </div>
        <section className="section reveal" id="menu">
          <div className="container">
            <h3 className="section-title">Menu</h3>
            <div className="grid">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
        <div className="reveal">
          <GallerySection />
        </div>
        <div className="reveal">
          <NewsSection />
        </div>
      </div>
    </>
  )
}
