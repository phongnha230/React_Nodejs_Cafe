import React, { useState } from 'react'

export function ActivitiesTab({ activityItems, addActivity, removeActivity }) {
  const [previewImg, setPreviewImg] = useState('')

  return (
    <div className="dashboard-section">
      <h3>Quản lý hoạt động (thư viện ảnh)</h3>
      <form
        className="newsletter-form"
        onSubmit={async (e) => {
          e.preventDefault()
          const f = e.currentTarget
          const url = f.url.value.trim()
          const file = f.image.files?.[0]
          if (!url && !file) return
          let img = url
          if (file) {
            img = await new Promise((res) => {
              const r = new FileReader()
              r.onload = () => res(r.result)
              r.readAsDataURL(file)
            })
          }
          addActivity(img)
          f.reset()
          setPreviewImg('')
        }}
      >
        <input
          name="url"
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
          <img
            src={previewImg}
            alt="preview"
            style={{
              width: 100,
              height: 64,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #eee',
            }}
          />
        )}
        <button className="btn">Thêm ảnh</button>
      </form>
      <div className="gallery" style={{ marginTop: 12 }}>
        {activityItems.map((it) => (
          <div key={it.id} className="card" style={{ padding: 8 }}>
            <img
              src={it.img}
              alt={it.id}
              style={{
                width: '100%',
                height: 160,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 8,
              }}
            >
              <button
                className="btn secondary"
                onClick={() => {
                  if (confirm('Xóa ảnh này?')) removeActivity(it.id)
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
