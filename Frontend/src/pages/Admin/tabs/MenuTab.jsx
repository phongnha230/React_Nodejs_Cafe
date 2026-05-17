import React, { useState, useEffect } from 'react'
import { Pagination } from '../../../components/common/Pagination.jsx'

export function MenuTab({ prodList, addProduct, updateProduct, removeProduct }) {
  const CATEGORIES = [
    { value: 'coffee', label: 'Cà phê' },
    { value: 'tea', label: 'Trà' },
    { value: 'juice', label: 'Nước ép' },
    { value: 'cake', label: 'Bánh ngọt' },
    { value: 'other', label: 'Khác' },
  ]

  const [editingId, setEditingId] = useState(null)
  const [previewImg, setPreviewImg] = useState('')

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [prodList]);

  const totalPages = Math.ceil(prodList.length / itemsPerPage);
  const currentProducts = prodList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-section">
      <h3>Quản lý thực đơn</h3>
      <form
        className="newsletter-form"
        onSubmit={async (e) => {
          e.preventDefault()
          const f = e.currentTarget
          const name = f.name.value.trim()
          const price = Number(f.price.value || 0)
          const category = f.category.value
          const imgFile = f.image.files?.[0]
          let image = f.imageUrl.value.trim()
          if (imgFile) {
            image = await new Promise((res) => {
              const r = new FileReader()
              r.onload = () => res(r.result)
              r.readAsDataURL(imgFile)
            })
          }
          const description = f.description.value.trim()
          const isAvailable = f.isAvailable.value === 'true'
          if (!name || !category) return
          addProduct({ name, price, category, image, description, is_available: isAvailable })
          f.reset()
          setPreviewImg('')
        }}
      >
        <input
          name="name"
          placeholder="Tên món"
          className="newsletter-input"
        />
        <input
          name="price"
          type="number"
          placeholder="Giá (đ)"
          className="newsletter-input"
        />
        <select name="category" className="newsletter-input">
          <option value="">-- Chọn loại --</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          name="imageUrl"
          placeholder="Ảnh (URL - tùy chọn)"
          className="newsletter-input"
          onChange={(e) => setPreviewImg(e.target.value)}
        />
        <input
          name="image"
          type="file"
          accept="image/*"
          className="newsletter-input"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) {
              setPreviewImg('')
              return
            }
            const r = new FileReader()
            r.onload = () => setPreviewImg(r.result)
            r.readAsDataURL(f)
          }}
        />
        {previewImg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 8,
            }}
          >
            <img
              src={previewImg}
              alt="preview"
              style={{
                width: 72,
                height: 72,
                objectFit: 'cover',
                borderRadius: 10,
                border: '1px solid #eee',
              }}
            />
            <span className="muted">Xem trước ảnh</span>
          </div>
        )}
        <textarea
          name="description"
          placeholder="Mô tả sản phẩm (hiển thị trong trang chi tiết)"
          className="newsletter-input"
          rows={3}
          style={{ resize: 'vertical', minHeight: '60px' }}
        />
        <select name="isAvailable" className="newsletter-input">
          <option value="true">Còn hàng (Sẵn sàng bán)</option>
          <option value="false">Hết hàng (Tạm ngưng)</option>
        </select>
        <button className="btn">Thêm món</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Loại</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((p) => (
            <tr key={p.id}>
              <td>
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <div style={{ width: 48, height: 48, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>
                  )}
                  {editingId === p.id && (
                    <input
                      type="file"
                      accept="image/*"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const base64 = await new Promise((res) => {
                            const r = new FileReader()
                            r.onload = () => res(r.result)
                            r.readAsDataURL(file)
                          })
                          updateProduct(p.id, { image: base64 })
                        }
                      }}
                    />
                  )}
                </div>
              </td>
              <td>
                {editingId === p.id ? (
                  <input
                    defaultValue={p.name}
                    onBlur={(e) =>
                      updateProduct(p.id, { name: e.target.value })
                    }
                    className="newsletter-input"
                  />
                ) : (
                  p.name
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <input
                    type="number"
                    defaultValue={p.price}
                    onBlur={(e) =>
                      updateProduct(p.id, {
                        price: Number(e.target.value || 0),
                      })
                    }
                    className="newsletter-input"
                  />
                ) : (
                  p.price.toLocaleString('vi-VN') + 'đ'
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <select
                    defaultValue={p.category}
                    onChange={(e) =>
                      updateProduct(p.id, { category: e.target.value })
                    }
                    className="newsletter-input"
                    style={{ minWidth: '100px' }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                ) : (
                  CATEGORIES.find(c => c.value === p.category)?.label || p.category
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <textarea
                    defaultValue={p.description || ''}
                    onBlur={(e) =>
                      updateProduct(p.id, { description: e.target.value.trim() })
                    }
                    className="newsletter-input"
                    rows={2}
                    style={{ resize: 'vertical', minWidth: '160px', minHeight: '48px' }}
                    placeholder="Nhập mô tả..."
                  />
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: p.description ? '#334155' : '#94a3b8',
                      fontSize: '13px',
                    }}
                    title={p.description || 'Chưa có mô tả'}
                  >
                    {p.description || '—'}
                  </span>
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <select
                    defaultValue={p.is_available ? 'true' : 'false'}
                    onChange={(e) =>
                      updateProduct(p.id, { is_available: e.target.value === 'true' })
                    }
                    className="newsletter-input"
                    style={{
                      minWidth: '100px',
                      color: 'white',
                      backgroundColor: p.is_available ? '#4CAF50' : '#f44336'
                    }}
                  >
                    <option value="true">Còn hàng</option>
                    <option value="false">Hết hàng</option>
                  </select>
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: p.is_available ? '#4CAF50' : '#f44336',
                      color: 'white',
                    }}
                  >
                    {p.is_available ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                )}
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {editingId === p.id ? (
                  <button
                    className="btn"
                    onClick={() => setEditingId(null)}
                  >
                    Xong
                  </button>
                ) : (
                  <>
                    <button
                      className="btn"
                      onClick={() => setEditingId(p.id)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        if (confirm('Bạn chắc chắn xóa món này?'))
                          removeProduct(p.id)
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
