import React, { useState } from 'react'

export function NewsTab({ news, addNews, updateNews, removeNews }) {
  const [newsPreview, setNewsPreview] = useState('')
  const [editingNewsId, setEditingNewsId] = useState(null)
  const [newsRowPreview, setNewsRowPreview] = useState('')
  const [newsSearch, setNewsSearch] = useState('')
  const [newsPage, setNewsPage] = useState(1)

  return (
    <div className="dashboard-section">
      <h3>Quản lý tin tức</h3>
      <form
        className="newsletter-form"
        onSubmit={async (e) => {
          e.preventDefault()
          const f = e.currentTarget
          const title = f.title.value.trim()
          const imgUrl = f.img.value.trim()
          const excerpt = f.excerpt.value.trim()
          const file = f.image.files?.[0]

          if (!title) {
            alert('Vui lòng nhập tiêu đề!')
            return
          }
          if (!excerpt || excerpt.length < 10) {
            alert('Vui lòng nhập mô tả (tối thiểu 10 ký tự)!')
            return
          }

          let img = imgUrl
          if (file) {
            img = await new Promise((res) => {
              const r = new FileReader()
              r.onload = () => res(r.result)
              r.readAsDataURL(file)
            })
          }

          try {
            await addNews({ title, img, excerpt })
            alert('Thêm tin tức thành công!')
            f.reset()
            setNewsPreview('')
          } catch (error) {
            console.error('Add news error:', error)
            alert('Lỗi: ' + (error.response?.data?.message || error.message))
          }
        }}
      >
        <input
          name="title"
          placeholder="Tiêu đề"
          className="newsletter-input"
        />
        <input
          name="img"
          placeholder="Ảnh (URL)"
          className="newsletter-input"
          onChange={(e) => setNewsPreview(e.target.value)}
        />
        <input
          name="image"
          type="file"
          accept="image/*"
          className="newsletter-input"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) {
              setNewsPreview('')
              return
            }
            const r = new FileReader()
            r.onload = () => setNewsPreview(r.result)
            r.readAsDataURL(f)
          }}
        />
        {newsPreview && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 8,
            }}
          >
            <img
              src={newsPreview}
              alt="preview"
              style={{
                width: 100,
                height: 64,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid #eee',
              }}
            />
            <span className="muted">Xem trước ảnh</span>
          </div>
        )}
        <input
          name="excerpt"
          placeholder="Mô tả ngắn"
          className="newsletter-input"
        />
        <button className="btn">Thêm</button>
      </form>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '12px 0',
        }}
      >
        <input
          className="newsletter-input"
          placeholder="Tìm theo tiêu đề hoặc mô tả..."
          value={newsSearch}
          onChange={(e) => {
            setNewsSearch(e.target.value)
            setNewsPage(1)
          }}
          style={{ flex: 1 }}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Ảnh</th>
            <th>Mô tả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const q = newsSearch.trim().toLowerCase()
            const filtered = q
              ? news.filter(
                (n) =>
                  (n.title || '').toLowerCase().includes(q) ||
                  (n.excerpt || '').toLowerCase().includes(q)
              )
              : news
            const pageSize = 6
            const totalPages = Math.max(
              1,
              Math.ceil(filtered.length / pageSize)
            )
            const page = Math.min(newsPage, totalPages)
            const start = (page - 1) * pageSize
            const items = filtered.slice(start, start + pageSize)
            return items
          })().map((n) => (
            <tr key={n.id}>
              <td>
                {editingNewsId === n.id ? (
                  <input
                    defaultValue={n.title}
                    onBlur={(e) =>
                      updateNews(n.id, { title: e.target.value })
                    }
                    className="newsletter-input"
                  />
                ) : (
                  n.title
                )}
              </td>
              <td>
                {editingNewsId === n.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      defaultValue={n.img}
                      className="newsletter-input"
                      onChange={(e) => setNewsRowPreview(e.target.value)}
                      onBlur={(e) =>
                        updateNews(n.id, { img: e.target.value })
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) {
                          setNewsRowPreview('')
                          return
                        }
                        const r = new FileReader()
                        r.onload = () => {
                          setNewsRowPreview(r.result)
                          updateNews(n.id, { img: r.result })
                        }
                        r.readAsDataURL(f)
                      }}
                    />
                  </div>
                ) : n.img ? (
                  <img
                    src={n.img}
                    alt={n.title}
                    style={{
                      width: 100,
                      height: 64,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  '-'
                )}
              </td>
              <td>
                {editingNewsId === n.id ? (
                  <input
                    defaultValue={n.excerpt}
                    onBlur={(e) =>
                      updateNews(n.id, { excerpt: e.target.value })
                    }
                    className="newsletter-input"
                  />
                ) : (
                  n.excerpt
                )}
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {editingNewsId === n.id ? (
                  <button
                    className="btn"
                    onClick={() => {
                      setEditingNewsId(null)
                      setNewsRowPreview('')
                    }}
                  >
                    Xong
                  </button>
                ) : (
                  <>
                    <button
                      className="btn"
                      onClick={() => {
                        setEditingNewsId(n.id)
                        setNewsRowPreview('')
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className={`btn ${n.pinned ? '' : 'secondary'}`}
                      onClick={() =>
                        updateNews(n.id, { pinned: !n.pinned })
                      }
                      style={{ marginLeft: 8 }}
                    >
                      {n.pinned ? 'Bỏ ghim' : 'Ghim'}
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        if (confirm('Xóa bài tin này?')) removeNews(n.id)
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 8,
        }}
      >
        {(() => {
          const q = newsSearch.trim().toLowerCase()
          const filtered = q
            ? news.filter(
              (n) =>
                (n.title || '').toLowerCase().includes(q) ||
                (n.excerpt || '').toLowerCase().includes(q)
            )
            : news
          const pageSize = 6
          const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
          return (
            <>
              <button
                className="btn secondary"
                disabled={newsPage <= 1}
                onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </button>
              <div style={{ padding: '6px 10px' }}>
                Trang {Math.min(newsPage, totalPages)} / {totalPages}
              </div>
              <button
                className="btn"
                disabled={newsPage >= totalPages}
                onClick={() => setNewsPage((p) => p + 1)}
              >
                Sau
              </button>
            </>
          )
        })()}
      </div>
    </div>
  )
}
