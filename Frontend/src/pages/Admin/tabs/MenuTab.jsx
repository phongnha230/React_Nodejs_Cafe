import React, { useState } from 'react'

export function MenuTab({ prodList, addProduct, updateProduct, removeProduct }) {
  const [editingId, setEditingId] = useState(null)
  const [previewImg, setPreviewImg] = useState('')

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
          const category = f.category.value.trim()
          const imgFile = f.image.files?.[0]
          let image = f.imageUrl.value.trim()
          if (imgFile) {
            image = await new Promise((res) => {
              const r = new FileReader()
              r.onload = () => res(r.result)
              r.readAsDataURL(imgFile)
            })
          }
          const isAvailable = f.isAvailable.checked
          if (!name || !category) return
          addProduct({ name, price, category, image, is_available: isAvailable })
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
        <input
          name="category"
          placeholder="Loại (coffee/tea/juice/...)"
          className="newsletter-input"
        />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
          <input
            name="isAvailable"
            type="checkbox"
            defaultChecked
            style={{ width: 18, height: 18 }}
          />
          <label>Sẵn sàng bán (Còn hàng)</label>
        </div>
        <button className="btn">Thêm món</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {prodList.map((p) => (
            <tr key={p.id}>
              <td>
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
                  '-'
                )}
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
                  <input
                    defaultValue={p.category}
                    onBlur={(e) =>
                      updateProduct(p.id, { category: e.target.value })
                    }
                    className="newsletter-input"
                  />
                ) : (
                  p.category
                )}
              </td>
              <td>
                <button
                  className={`btn ${p.is_available ? '' : 'secondary'}`}
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: p.is_available ? '#4CAF50' : '#f44336',
                    color: 'white',
                    border: 'none',
                  }}
                  onClick={() =>
                    updateProduct(p.id, { is_available: !p.is_available })
                  }
                >
                  {p.is_available ? 'Còn hàng' : 'Hết hàng'}
                </button>
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
    </div>
  )
}
