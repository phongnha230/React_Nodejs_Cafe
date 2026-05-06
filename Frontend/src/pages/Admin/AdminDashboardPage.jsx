import { useState, useEffect } from 'react'
import { useOrderStore } from '../../stores/orderStore.js'
import { useUsersStore } from '../../stores/usersStore.js'
import { useNewsStore } from '../../stores/newsStore.js'
import { useProductStore } from '../../stores/productStore.js'
import { useActivitiesStore } from '../../stores/activitiesStore.js'
import { usePaymentStore } from '../../stores/paymentStore.js'
import { Sidebar } from '../../components/layout/Sidebar.jsx'
import paymentService from '../../services/paymentService.js'
import userService from '../../services/userService.js'
export function AdminDashboard({ sidebarOpen, setSidebarOpen }) {
  const orders = useOrderStore((s) => s.orders)
  const loadOrders = useOrderStore((s) => s.loadFromAPI)
  const stats = useOrderStore((s) => s.stats())
  const setOrderStatus = useOrderStore((s) => s.updateStatus)
  const [detailOrder, setDetailOrder] = useState(null)
  const [tab, setTab] = useState('revenue') // revenue | customers | menu | news | orders | payments
  const users = useUsersStore((s) => s.users)
  const customers = useUsersStore((s) => s.getCustomers()) // Only customers
  const loadUsers = useUsersStore((s) => s.loadFromAPI)
  const addUser = useUsersStore((s) => s.add)
  const updateUser = useUsersStore((s) => s.update)
  const removeUser = useUsersStore((s) => s.remove)
  const usersLoading = useUsersStore((s) => s.loading)
  const news = useNewsStore((s) => s.news)
  const loadNews = useNewsStore((s) => s.loadFromAPI)
  const addNews = useNewsStore((s) => s.add)
  const updateNews = useNewsStore((s) => s.update)
  const removeNews = useNewsStore((s) => s.remove)
  const prodList = useProductStore((s) => s.products)
  const loadProducts = useProductStore((s) => s.loadFromAPI)
  const addProduct = useProductStore((s) => s.add)
  const updateProduct = useProductStore((s) => s.update)
  const removeProduct = useProductStore((s) => s.remove)
  const activityItems = useActivitiesStore((s) => s.items)
  const addActivity = useActivitiesStore((s) => s.add)
  const removeActivity = useActivitiesStore((s) => s.remove)
  const payments = usePaymentStore((s) => s.payments)
  const setPayments = usePaymentStore((s) => s.setPayments)
  const updatePaymentStatus = usePaymentStore((s) => s.updateStatus)
  const [editingId, setEditingId] = useState(null)
  const [previewImg, setPreviewImg] = useState('')
  const [newsPreview, setNewsPreview] = useState('')
  const [editingNewsId, setEditingNewsId] = useState(null)
  const [newsRowPreview, setNewsRowPreview] = useState('')
  const [newsSearch, setNewsSearch] = useState('')
  const [newsPage, setNewsPage] = useState(1)
  const [loadingPayments, setLoadingPayments] = useState(false)

  // Calculate monthly revenue
  const monthlyRevenue = orders
    .filter((o) => {
      const orderDate = new Date(o.createdAt)
      const currentDate = new Date()
      return (
        orderDate.getMonth() === currentDate.getMonth() &&
        orderDate.getFullYear() === currentDate.getFullYear()
      )
    })
    .reduce((sum, o) => sum + o.total, 0)

  // Group orders by time periods
  const ordersByTime = orders.reduce((acc, order) => {
    const hour = new Date(order.createdAt).getHours()
    let period
    if (hour >= 6 && hour < 12) period = 'Sáng (6h-12h)'
    else if (hour >= 12 && hour < 18) period = 'Chiều (12h-18h)'
    else if (hour >= 18 && hour < 22) period = 'Tối (18h-22h)'
    else period = 'Đêm (22h-6h)'

    acc[period] = (acc[period] || 0) + 1
    return acc
  }, {})

  // Load all data on mount
  useEffect(() => {
    loadOrders()
    loadNews()
    loadProducts()
  }, [loadOrders, loadNews, loadProducts])

  // Load payments khi chuyển sang tab payments
  useEffect(() => {
    if (tab === 'payments') {
      // Reset payments trước khi load để tránh hiển thị dữ liệu cũ từ localStorage
      setPayments([])
      loadPayments()
    }
    if (tab === 'accounts') {
      loadUsers()
    }
  }, [tab])

  // Hàm load payments từ API
  const loadPayments = async () => {
    try {
      setLoadingPayments(true)
      const response = await paymentService.getAll()
      if (response.data) {
        setPayments(response.data)
        // Xóa localStorage nếu API trả về mảng rỗng (backend đã xóa hết)
        if (response.data.length === 0) {
          localStorage.removeItem('payments')
        }
      } else {
        // Nếu không có response.data, xóa localStorage và set payments rỗng
        setPayments([])
        localStorage.removeItem('payments')
      }
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoadingPayments(false)
    }
  }

  // Xóa user
  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn chắc chắn muốn xóa tài khoản này?')) return
    try {
      await removeUser(userId)
      alert('Xóa tài khoản thành công!')
      await loadUsers() // Reload users after delete
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Có lỗi xảy ra khi xóa tài khoản')
    }
  }

  // Format thời gian
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa đăng nhập'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hour}:${minute}`
  }

  // Format ngày theo dd/MM/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Lấy tên khách hàng từ local orders (vì payment không join với order)
  const getCustomerName = (payment) => {
    // Tìm order từ localStorage
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const localOrder = allOrders[payment.order_id - 1] // order_id là index

    if (localOrder?.customerName) {
      return localOrder.customerName
    }

    // Fallback: tìm từ orderStore
    const order = orders.find((o, idx) => idx + 1 === payment.order_id)
    return order?.customerName || 'Khách hàng #' + payment.order_id
  }

  // Chuyển đổi tên phương thức thanh toán
  const getPaymentMethodName = (method) => {
    const methods = {
      cash: 'Tiền mặt',
      vnpay: 'VNPay',
      mono: 'Mono',
    }
    return methods[method?.toLowerCase()] || method || 'N/A'
  }

  // Chuyển đổi trạng thái
  const getPaymentStatusText = (status) => {
    const statuses = {
      success: 'Thành công',
      completed: 'Thành công',
      failed: 'Thất bại',
      pending: 'Chờ xử lý',
    }
    return statuses[status?.toLowerCase()] || status || 'Chờ xử lý'
  }

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={tab}
        onTabChange={setTab}
      />
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2>Dashboard Quản Lý</h2>
          <button
            onClick={() => {
              if (
                confirm(
                  '🗑️ XÓA TOÀN BỘ DỮ LIỆU GIẢ?\n\nBao gồm:\n- Orders\n- Products\n- News\n- Customers\n- Activities\n\n⚠️ Hành động này không thể hoàn tác!\n\n✅ Sau khi xóa, bạn sẽ dùng dữ liệu từ Backend.'
                )
              ) {
                // Xóa tất cả localStorage
                const keysToRemove = [
                  'orders',
                  'products',
                  'news',
                  'customers',
                  'accounts',
                  'activities',
                  'cart',
                  'payments',
                ]
                keysToRemove.forEach((key) => localStorage.removeItem(key))
                alert(
                  '✅ Đã xóa tất cả dữ liệu giả!\n\n🚀 Giờ hệ thống sẽ dùng dữ liệu từ Backend.'
                )
                window.location.href = '/admin'
              }
            }}
            style={{
              fontSize: '14px',
              padding: '10px 20px',
              backgroundColor: '#f8f9fa',
              color: '#dc3545',
              border: '2px solid #dc3545',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#dc3545'
              e.target.style.color = 'white'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 4px 8px rgba(220,53,69,0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f8f9fa'
              e.target.style.color = '#dc3545'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            🗑️ Xóa dữ liệu test
          </button>
        </div>

        {tab === 'revenue' && (
          <>
            <div className="kpi">
              <div className="card">
                <div>Tổng đơn hàng</div>
                <h3>{stats.totalOrders}</h3>
              </div>
              <div className="card">
                <div>Doanh thu tổng</div>
                <h3>{stats.totalRevenue.toLocaleString('vi-VN')}đ</h3>
              </div>
              <div className="card">
                <div>Doanh thu tháng</div>
                <h3>{monthlyRevenue.toLocaleString('vi-VN')}đ</h3>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="dashboard-section">
                <h3>Top khách hàng mua nhiều nhất</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên khách</th>
                      <th>Số đơn</th>
                      <th>Tổng chi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topBuyers.map((b) => (
                      <tr key={b.customerName}>
                        <td>{b.customerName}</td>
                        <td>{b.count}</td>
                        <td>{b.total.toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="dashboard-section">
                <h3>Thống kê theo thời gian</h3>
                <div className="time-stats">
                  {Object.entries(ordersByTime).map(([period, count]) => (
                    <div key={period} className="time-stat-card">
                      <div className="time-period">{period}</div>
                      <div className="time-count">{count} đơn</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'activities' && (
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
        )}

        {tab === 'accounts' && (
          <div className="dashboard-section">
            <h3>Quản lý đăng nhập</h3>

            {/* Form thêm tài khoản mới */}
            <form
              className="newsletter-form"
              onSubmit={async (e) => {
                e.preventDefault()
                const f = e.currentTarget
                const username = f.username.value.trim()
                const email = f.email.value.trim()
                const password = f.password.value.trim()
                const role = f.role.value

                if (!username || !email || !password) {
                  alert('Vui lòng điền đầy đủ thông tin!')
                  return
                }

                try {
                  await userService.register({
                    username,
                    email,
                    password,
                    role,
                  })
                  alert('Tạo tài khoản thành công!')
                  f.reset()
                  loadUsers() // Reload danh sách
                } catch (error) {
                  console.error('Error creating user:', error)
                  alert(
                    error.response?.data?.message ||
                    'Có lỗi xảy ra khi tạo tài khoản'
                  )
                }
              }}
              style={{ marginBottom: '20px' }}
            >
              <input
                name="username"
                placeholder="Tên người dùng"
                className="newsletter-input"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="newsletter-input"
              />
              <input
                name="password"
                type="password"
                placeholder="Mật khẩu"
                className="newsletter-input"
              />
              <select name="role" className="newsletter-input">
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn">Thêm tài khoản</button>
            </form>

            {usersLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', background: '#f7f7f7' }}>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Tổng số tài khoản: <strong>{users.length}</strong> (
                    <span style={{ color: '#6B4CE6' }}>
                      {users.filter(u => u.role === 'admin').length} admin
                    </span>
                    {' | '}
                    <span style={{ color: '#4CAF50' }}>
                      {users.filter(u => u.role === 'customer').length} customer
                    </span>
                    )
                  </p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                    ℹ️ Tài khoản admin được ẩn
                  </p>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Tên</th>
                      <th>Password</th>
                      <th>Role</th>
                      <th>Số lượt truy cập</th>
                      <th>Lần đăng nhập cuối</th>
                      <th>Ngày tạo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role !== 'admin').length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          style={{ textAlign: 'center', padding: '20px' }}
                        >
                          Chưa có tài khoản customer nào
                        </td>
                      </tr>
                    ) : (
                      users
                        .filter(u => u.role !== 'admin')
                        .map((user) => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.name || user.username || 'N/A'}</td>
                            <td>
                              <span
                                style={{
                                  color: '#999',
                                  letterSpacing: '2px',
                                  fontFamily: 'monospace',
                                }}
                              >
                                ••••••••
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  backgroundColor:
                                    user.role === 'admin' ? '#6B4CE6' : '#4CAF50',
                                  color: 'white',
                                }}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <strong>{user.loginCount || user.login_count || 0}</strong> lần
                            </td>
                            <td style={{ fontSize: '13px' }}>
                              {formatDateTime(user.lastLoginAt || user.last_login_at)}
                            </td>
                            <td style={{ fontSize: '13px' }}>
                              {formatDate(user.createdAt || user.created_at)}
                            </td>
                            <td>
                              <button
                                className="btn secondary"
                                style={{ fontSize: '12px', padding: '4px 12px' }}
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {tab === 'menu' && (
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
                if (!name || !category) return
                addProduct({ name, price, category, image })
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
              <button className="btn">Thêm món</button>
            </form>
            <table className="table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Giá</th>
                  <th>Loại</th>
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
        )}

        {tab === 'news' && (
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
                  alert('✅ Thêm tin tức thành công!')
                  f.reset()
                  setNewsPreview('')
                } catch (error) {
                  console.error('Add news error:', error)
                  alert('❌ Lỗi: ' + (error.response?.data?.message || error.message))
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
            {/* Search & Paging */}
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
                  <th></th>
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
                  if (page !== newsPage) setNewsPage(page)
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
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
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
                          {(newsRowPreview || n.img) && (
                            <img
                              src={newsRowPreview || n.img}
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

            {/* Pagination */}
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
                const totalPages = Math.max(
                  1,
                  Math.ceil(filtered.length / pageSize)
                )
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
        )}
        {tab === 'orders' && (
          <div className="dashboard-section">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3>Danh sách đơn hàng chi tiết</h3>
              <button
                className="btn secondary"
                onClick={() => {
                  if (
                    confirm(
                      '⚠️ Xóa TẤT CẢ đơn hàng?\n\nHành động này không thể hoàn tác!'
                    )
                  ) {
                    localStorage.removeItem('orders')
                    window.location.reload()
                  }
                }}
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                🗑️ Xóa tất cả orders
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Khách hàng</th>
                  <th>Địa chỉ</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                    <td>{o.customerName}</td>
                    <td>{o.address || 'Không có'}</td>
                    <td>
                      <span className={`payment-badge ${o.paymentMethod}`}>
                        {o.paymentMethod === 'vnpay'
                          ? 'VNPay'
                          : o.paymentMethod === 'mono'
                            ? 'Mono'
                            : 'Trực tiếp'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${o.status}`}>
                        {o.status === 'delivered'
                          ? 'Hoàn tất'
                          : o.status === 'ready'
                            ? 'Sẵn sàng'
                            : 'Đang pha'}
                      </span>
                    </td>
                    <td>{o.total.toLocaleString('vi-VN')}đ</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn" onClick={() => setDetailOrder(o)}>
                        Chi tiết
                      </button>
                      {(o.status === 'preparing' || o.status === 'pending') && (
                        <button
                          className="btn"
                          style={{ marginLeft: 8 }}
                          onClick={() => setOrderStatus(o.id, 'ready')}
                        >
                          Đánh dấu sẵn sàng
                        </button>
                      )}
                      {o.status === 'ready' && (
                        <button
                          className="btn"
                          style={{ marginLeft: 8 }}
                          onClick={() => setOrderStatus(o.id, 'delivered')}
                        >
                          Hoàn tất
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'payments' && (
          <div className="dashboard-section">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3>Quản lý thanh toán</h3>
              <button
                className="btn secondary"
                onClick={() => {
                  localStorage.removeItem('payments')
                  loadPayments()
                }}
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                🔄 Làm mới
              </button>
            </div>
            {loadingPayments ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Order ID</th>
                    <th>Khách hàng</th>
                    <th>Phương thức</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        style={{ textAlign: 'center', padding: '20px' }}
                      >
                        Chưa có dữ liệu thanh toán
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td>
                          <span
                            style={{
                              color: '#6B4CE6',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                            onClick={() => {
                              // payment.order_id là index (1, 2, 3...), tìm order theo index
                              const allOrders = JSON.parse(
                                localStorage.getItem('orders') || '[]'
                              )
                              const order = allOrders[payment.order_id - 1] // index bắt đầu từ 0

                              if (order) {
                                setDetailOrder(order)
                              } else {
                                alert(
                                  'Không tìm thấy đơn hàng #' + payment.order_id
                                )
                              }
                            }}
                          >
                            #{payment.order_id}
                          </span>
                        </td>
                        <td>{getCustomerName(payment)}</td>
                        <td>
                          <span className={`payment-badge ${payment.method}`}>
                            {getPaymentMethodName(payment.method)}
                          </span>
                        </td>
                        <td>
                          {Math.round(payment.amount || 0).toLocaleString(
                            'vi-VN'
                          )}
                          đ
                        </td>
                        <td>
                          <span
                            className={`status-badge ${payment.status}`}
                            style={{
                              backgroundColor:
                                payment.status === 'success' ||
                                  payment.status === 'completed'
                                  ? '#4CAF50'
                                  : payment.status === 'failed'
                                    ? '#f44336'
                                    : '#FFA726',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                            }}
                          >
                            {getPaymentStatusText(payment.status)}
                          </span>
                        </td>
                        <td>
                          {formatDate(payment.createdAt || payment.created_at)}
                        </td>
                        <td>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                className="btn"
                                style={{
                                  marginRight: 8,
                                  fontSize: '12px',
                                  padding: '4px 12px',
                                }}
                                onClick={async () => {
                                  try {
                                    await paymentService.update(payment.id, {
                                      status: 'success',
                                    })
                                    updatePaymentStatus(payment.id, 'success')
                                    alert('Đã cập nhật trạng thái thành công!')
                                  } catch (error) {
                                    console.error(
                                      'Error updating payment:',
                                      error
                                    )
                                    alert('Có lỗi xảy ra khi cập nhật')
                                  }
                                }}
                              >
                                Xác nhận
                              </button>
                              <button
                                className="btn secondary"
                                style={{
                                  fontSize: '12px',
                                  padding: '4px 12px',
                                }}
                                onClick={async () => {
                                  try {
                                    await paymentService.update(payment.id, {
                                      status: 'failed',
                                    })
                                    updatePaymentStatus(payment.id, 'failed')
                                    alert('Đã cập nhật trạng thái thất bại!')
                                  } catch (error) {
                                    console.error(
                                      'Error updating payment:',
                                      error
                                    )
                                    alert('Có lỗi xảy ra khi cập nhật')
                                  }
                                }}
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
        {detailOrder && (
          <div className="modal-backdrop" onClick={() => setDetailOrder(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Chi tiết đơn hàng</h3>
                <button
                  className="close-btn"
                  onClick={() => setDetailOrder(null)}
                >
                  ×
                </button>
              </div>
              <div className="order-summary">
                <div className="order-meta">
                  <div>
                    <strong>Khách:</strong> {detailOrder.customerName}
                  </div>
                  <div>
                    <strong>Thời gian:</strong>{' '}
                    {new Date(detailOrder.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div>
                    <strong>Địa chỉ:</strong>{' '}
                    {detailOrder.address || 'Không có'}
                  </div>
                  <div>
                    <strong>Phương thức:</strong>{' '}
                    {detailOrder.paymentMethod === 'vnpay' ? 'VNPay' : 'Mono'}
                  </div>
                </div>
                <div className="order-items">
                  {detailOrder.items.map((it, idx) => {
                    const p = prodList.find((p) => p.id === it.productId)
                    const price = p?.price || 0
                    return (
                      <div className="order-item" key={`${it.productId}-${idx}`}>
                        <div className="order-item-left">
                          {p?.image && <img src={p.image} alt={p?.name} />}
                          <div className="order-item-name">
                            {p?.name || it.productId}
                          </div>
                        </div>
                        <div className="order-item-qty">x{it.quantity}</div>
                        <div className="order-item-price">
                          {(price * it.quantity).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="order-total">
                  <strong>Tổng:</strong>{' '}
                  {detailOrder.total.toLocaleString('vi-VN')}₫
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
