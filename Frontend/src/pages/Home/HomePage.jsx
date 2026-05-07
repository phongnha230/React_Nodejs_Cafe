import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../../components/common/Banner'
import { FilterBar } from '../../components/common/FilterBar'
import { ProductCard } from '../../components/common/ProductCard'
import { useProductStore } from '../../stores/productStore'
import { useActivitiesStore } from '../../stores/activitiesStore'
import { useNewsStore } from '../../stores/newsStore'

function AboutSection() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <div className="brand-name-section">
              <span className="brand-text">jokopi.</span>
              <span className="brand-suffix-text">Home</span>
            </div>
            
            <div className="about-grid">
              <article className="about-card">
                <div className="about-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <div className="about-card-info">
                  <h3 className="about-card-title">Không gian yên tĩnh</h3>
                  <p className="about-card-text">
                    Không chỉ là nơi thưởng thức cà phê, mỗi góc nhỏ tại jokopi đều được thiết kế để mang lại sự tĩnh lặng, giúp bạn tách biệt khỏi sự ồn ào của phố thị.
                  </p>
                </div>
              </article>

              <article className="about-card">
                <div className="about-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </div>
                <div className="about-card-info">
                  <h3 className="about-card-title">Menu đa dạng</h3>
                  <p className="about-card-text">
                    Từ những hạt cà phê rang xay nguyên chất đến những thức uống độc quyền, thực đơn của chúng tôi luôn đa dạng và được chuẩn bị tỉ mỉ để chiều lòng mọi gu thưởng thức.
                  </p>
                </div>
              </article>

              <article className="about-card">
                <div className="about-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <div className="about-card-info">
                  <h3 className="about-card-title">Trải nghiệm đặc biệt</h3>
                  <p className="about-card-text">
                    Tại jokopi, mỗi khách hàng đều là một người bạn. Chúng tôi mang đến không gian ấm cúng, tinh tế để bạn có thể "chill" và tận hưởng những khoảnh khắc đáng nhớ.
                  </p>
                </div>
              </article>
            </div>
          </div>

          <aside className="about-images">
            <div className="about-image-wrapper">
              <img
                className="about-showcase-img"
                src="/src/assets/space_coffee.jpg"
                alt="Không gian quán cafe jokopi ấm cúng"
              />
            </div>
            <div className="about-image-wrapper">
              <img
                className="about-showcase-img"
                src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=800&auto=format&fit=crop"
                alt="Khu vực làm việc tại jokopi"
              />
            </div>
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
        <h3 className="section-title">Tìm món & Giỏ hàng</h3>
        <div className="actions-bar">
          <FilterBar
            q={q}
            setQ={setQ}
            cat={cat}
            setCat={setCat}
            price={price}
            setPrice={setPrice}
          />
          <Link className="btn-premium" to="/cart">
            Xem giỏ hàng của bạn
          </Link>
        </div>
      </div>
    </section>
  )
}

function GallerySection() {
  const items = useActivitiesStore((s) => s.items) || []
  return (
    <section className="section reveal" id="activities">
      <div className="container">
        <h3 className="section-title">Hoạt động của quán</h3>
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
  const news = useNewsStore((s) => s.news) || []
  const sorted = useMemo(() => {
    return [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [news])

  return (
    <section className="section reveal" id="news">
      <div className="container">
        <h3 className="section-title">Tin tức mới nhất</h3>
        <div className="news-grid">
          {sorted.slice(0, 3).map((item) => (
            <article key={item.id} className="card news-card">
              <img src={item.img} alt={item.title} className="news-thumb" />
              <div className="news-content">
                <h4>{item.title}</h4>
                <p className="news-date">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                <p>{item.excerpt}</p>
                <Link to={`/news/${item.id}`} className="read-more">Đọc thêm</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { products, loadFromAPI } = useProductStore()
  const loadNews = useNewsStore((s) => s.loadFromAPI)

  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [price, setPrice] = useState('')

  const rootRef = useRef(null)

  useEffect(() => {
    loadFromAPI()
    loadNews()
  }, [])

  const filteredProducts = useMemo(() => {
    let result = (products || []).filter(p => {
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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })

    if (rootRef.current) {
      const reveals = rootRef.current.querySelectorAll('.reveal')
      reveals.forEach((el) => observer.observe(el))
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
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
            <h3 className="section-title">Thực đơn của chúng tôi</h3>
            <div className="grid">
              {filteredProducts.map((p) => (
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
