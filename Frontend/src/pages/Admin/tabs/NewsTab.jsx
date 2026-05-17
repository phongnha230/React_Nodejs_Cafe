import React, { useState } from 'react'
import { Pagination } from '../../../components/common/Pagination.jsx'

export function NewsTab({ news, addNews, updateNews, removeNews }) {
  const [newsPreview, setNewsPreview] = useState('')
  const [editingNewsId, setEditingNewsId] = useState(null)
  const [newsRowPreview, setNewsRowPreview] = useState('')
  const [newsSearch, setNewsSearch] = useState('')
  const [newsPage, setNewsPage] = useState(1)

  const getFilteredNews = () => {
    const q = newsSearch.trim().toLowerCase()
    return q
      ? news.filter(
        (n) =>
          (n.title || '').toLowerCase().includes(q) ||
          (n.excerpt || '').toLowerCase().includes(q) ||
          (n.content || '').toLowerCase().includes(q)
      )
      : news
  }

  const pagedNews = (() => {
    const filtered = getFilteredNews()
    const pageSize = 10
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const page = Math.min(newsPage, totalPages)
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  })()

  const totalPages = Math.max(1, Math.ceil(getFilteredNews().length / 10))

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
          const content = f.content.value.trim()
          const file = f.image.files?.[0]

          if (!title) {
            alert('Vui lòng nhập tiêu đề!')
            return
          }
          if (!content || content.length < 10) {
            alert('Vui lòng nhập nội dung bài viết (tối thiểu 10 ký tự)!')
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
            await addNews({ title, img, excerpt, content })
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
          <div className="news-preview">
            <img src={newsPreview} alt="preview" />
            <span className="muted">Xem trước ảnh</span>
          </div>
        )}
        <input
          name="excerpt"
          placeholder="Mô tả ngắn (không bắt buộc)"
          className="newsletter-input"
        />
        <textarea
          name="content"
          placeholder="Nội dung bài viết. Hỗ trợ Markdown: # tiêu đề, **in đậm**, - danh sách, [link](https://...)"
          className="newsletter-input newsletter-textarea"
          rows={8}
        />
        <button className="btn">Thêm</button>
      </form>

      <div className="admin-search-row">
        <input
          className="newsletter-input"
          placeholder="Tìm theo tiêu đề, mô tả hoặc nội dung..."
          value={newsSearch}
          onChange={(e) => {
            setNewsSearch(e.target.value)
            setNewsPage(1)
          }}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Ảnh</th>
            <th>Mô tả</th>
            <th>Nội dung</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {pagedNews.map((n) => {
            const body = n.content || n.excerpt || ''
            return (
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
                    <div className="news-image-edit">
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
                    <img className="admin-news-thumb" src={n.img} alt={n.title} />
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
                <td>
                  {editingNewsId === n.id ? (
                    <textarea
                      defaultValue={body}
                      onBlur={(e) =>
                        updateNews(n.id, { content: e.target.value })
                      }
                      className="newsletter-input newsletter-textarea table-textarea"
                      rows={5}
                    />
                  ) : (
                    <span className="muted">
                      {body.slice(0, 120)}{body.length > 120 ? '...' : ''}
                    </span>
                  )}
                </td>
                <td className="table-actions">
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
                      >
                        {n.pinned ? 'Bỏ ghim' : 'Ghim'}
                      </button>
                      <button
                        className="btn secondary"
                        onClick={() => {
                          if (confirm('Xóa bài tin này?')) removeNews(n.id)
                        }}
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {totalPages > 1 ? (
        <Pagination
          currentPage={Math.min(newsPage, totalPages)}
          totalPages={totalPages}
          onPageChange={setNewsPage}
        />
      ) : null}
    </div>
  )
}
