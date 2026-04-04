import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div
      className="container"
      style={{ textAlign: 'center', padding: '60px 20px' }}
    >
      <h1 style={{ fontSize: '72px', marginBottom: '20px' }}>404</h1>
      <h2 style={{ marginBottom: '20px' }}>Không tìm thấy trang</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <Link to="/" className="btn">
        Về trang chủ
      </Link>
    </div>
  )
}
