import { useState, useEffect } from 'react'
import { useOrderStore } from '../../stores/orderStore.js'
import { useUsersStore } from '../../stores/usersStore.js'
import { useNewsStore } from '../../stores/newsStore.js'
import { useProductStore } from '../../stores/productStore.js'
import { useActivitiesStore } from '../../stores/activitiesStore.js'
import { Sidebar } from '../../components/layout/Sidebar.jsx'
import tableService from '../../services/tableService.js'
import userService from '../../services/userService.js'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts'

export function AdminDashboard({ sidebarOpen, setSidebarOpen }) {
  const orders = useOrderStore((s) => s.orders)
  const loadOrders = useOrderStore((s) => s.loadFromAPI)
  const stats = useOrderStore((s) => s.stats())
  const setOrderStatus = useOrderStore((s) => s.updateStatus)
  const [detailOrder, setDetailOrder] = useState(null)
  const [tab, setTab] = useState('revenue') // revenue | customers | menu | news | orders | tables
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
  const [editingId, setEditingId] = useState(null)
  const [previewImg, setPreviewImg] = useState('')
  const [newsPreview, setNewsPreview] = useState('')
  const [editingNewsId, setEditingNewsId] = useState(null)
  const [newsRowPreview, setNewsRowPreview] = useState('')
  const [newsSearch, setNewsSearch] = useState('')
  const [newsPage, setNewsPage] = useState(1)
  const [tables, setTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [selectedOrderTableFilter, setSelectedOrderTableFilter] = useState('all')

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

  // Chuẩn bị dữ liệu cho biểu đồ tròn (Status Breakdown)
  const pieData = stats.statusBreakdown ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({
    name: name === 'delivered' ? 'Thành công' : name === 'cancelled' ? 'Đã hủy' : 'Đang xử lý',
    value
  })) : []

  const COLORS = ['#4CAF50', '#FF8042', '#0088FE', '#FFBB28']

  // Load all data on mount
  useEffect(() => {
    loadOrders()
    loadNews()
    loadProducts()
    loadTables()
  }, [loadOrders, loadNews, loadProducts])

  const loadTables = async () => {
    try {
      setLoadingTables(true)
      const response = await tableService.getAll()
      const payload = response.data
      const apiTables = Array.isArray(payload) ? payload : (payload?.data || [])
      setTables(apiTables)
    } catch (error) {
      console.error('Error loading tables:', error)
    } finally {
      setLoadingTables(false)
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

  // Chuyển đổi tên phương thức thanh toán
  const getOrderPayment = (order) => (
    Array.isArray(order?.payments) && order.payments.length > 0
      ? order.payments[0]
      : null
  )

  const getPaymentMethodName = (method) => {
    const methods = {
      cash: 'Tiền mặt',
      direct: 'Tiền mặt',
      momo: 'MoMo',
      mono: 'MoMo',
      vnpay: 'VNPay',
      online: 'Online',
      card: 'Thẻ',
    }
    return methods[String(method || '').toLowerCase()] || method || 'N/A'
  }

  const getTableStatusText = (status) => {
    const statuses = {
      available: 'Trống',
      occupied: 'Đang có khách',
      reserved: 'Đã đặt',
      inactive: 'Tạm khóa',
    }
    return statuses[status] || status || 'Không rõ'
  }

  const tableStats = tables.reduce(
    (acc, table) => {
      acc.total += 1
      acc[table.status] = (acc[table.status] || 0) + 1
      return acc
    },
    { total: 0, available: 0, occupied: 0, reserved: 0, inactive: 0 }
  )

  const getOrderTableNumber = (order) => {
    if (order.tableNumber) return Number(order.tableNumber)
    if (order.table_number) return Number(order.table_number)
    const parsed = parseInt(String(order.address || '').replace(/\D+/g, ''), 10)
    return Number.isInteger(parsed) ? parsed : null
  }

  const sortedTables = tables
    .slice()
    .sort((a, b) => a.table_number - b.table_number)

  const selectedFilterTable = sortedTables.find(
    (table) => String(table.id) === selectedOrderTableFilter
  )

  const filteredOrders = orders.filter((order) => {
    if (selectedOrderTableFilter === 'all') return true

    const orderTableId = order.tableId ?? order.table_id ?? null
    if (String(orderTableId) === selectedOrderTableFilter) return true

    if (!selectedFilterTable) return false
    return getOrderTableNumber(order) === selectedFilterTable.table_number
  })

  const activeOrdersByTable = sortedTables.reduce((acc, table) => {
    const matchingOrders = orders.filter((order) => {
      const orderTableId = order.tableId ?? order.table_id ?? null
      const orderTableNumber = getOrderTableNumber(order)
      const isSameTable =
        String(orderTableId) === String(table.id) ||
        orderTableNumber === table.table_number

      return isSameTable &&
        order.status !== 'delivered' &&
        order.status !== 'cancelled'
    })

    acc[table.id] = matchingOrders
    return acc
  }, {})

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
                  'ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â XÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œA TOÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬N BáuÃƒâ€¹Ã…â€œ DáuÃƒâ€šÃ‚Â® LIáuÃƒÂ¢Ã¢â€šÂ¬Ã‚Â U GIáảÃƒâ€šÃ‚Â¢?\n\nBao gáuÃƒÂ¢Ã¢â€šÂ¬Ã…â€œm:\n- Orders\n- Products\n- News\n- Customers\n- Activities\n\nÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â Hành động này không tháuÃƒâ€  hoàn tác!\n\n✅ Sau khi xóa, báảÃƒâ€šÃ‚Â¡n sáảÃƒâ€šÃ‚Â½ dùng dữ liệu táuÃƒâ€šÃ‚Â« Backend.'
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
                  '✅ ÃƒÆ’Ã¢â‚¬Å¾Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£ xóa tất cả dữ liệu giả!\n\n📢 GiáuÃƒâ€šÃ‚Â háuÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ thống sáảÃƒâ€šÃ‚Â½ dùng dữ liệu táuÃƒâ€šÃ‚Â« Backend.'
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
            ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â Xóa dữ liệu test
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
                <div>Doanh thu thựcc</div>
                <h3 style={{ color: '#4CAF50' }}>{(stats.displayRevenue || 0).toLocaleString('vi-VN')}đ</h3>
                <small style={{ color: '#999' }}>CháuÃƒÂ¢Ã¢â€šÂ¬Ã‚Â° tính đơn đÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£ giao</small>
              </div>
              <div className="card">
                <div>Doanh thu lý thuyết</div>
                <h3 style={{ color: '#6B4CE6' }}>{(stats.totalRevenue || 0).toLocaleString('vi-VN')}đ</h3>
                <small style={{ color: '#999' }}>Bao gáuÃƒÂ¢Ã¢â€šÂ¬Ã…â€œm cả đơn đang xử lý</small>
              </div>
            </div>

            <div className="dashboard-sections" style={{ marginBottom: '30px' }}>
              <div className="dashboard-section chart-container" style={{ flex: 2 }}>
                <h3>BiáuÃƒâ€ u đồ Top món bán cháảÃƒâ€šÃ‚Â¡y</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={stats.topProducts || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} ly`, 'Số lượng']}
                      />
                      <Bar dataKey="quantity" fill="#6B4CE6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-section chart-container" style={{ flex: 1 }}>
                <h3>Tỷ lệ đơn hàng</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="dashboard-section">
                <h3>Sản phẩm bán cháảÃƒâ€šÃ‚Â¡y (Top 5)</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng bán</th>
                      <th>Doanh thu món</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts && stats.topProducts.length > 0 ? (
                      stats.topProducts.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td><strong>{p.quantity}</strong> ly</td>
                          <td>{(p.revenue || 0).toLocaleString('vi-VN')}đ</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '12px' }}>Chưa có dữ liệu</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="dashboard-section">
                <h3>Top khách hàng mua nhiáuÃƒâ€šÃ‚Âu nhất</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên khách</th>
                      <th>Số đơn</th>
                      <th>Tổng chi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.topBuyers || []).map((b) => (
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
                <h3>Thống kê theo tháuÃƒâ€šÃ‚Âi gian</h3>
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
                placeholder="ảnh (URL - tùy cháuÃƒâ€šÃ‚Ân)"
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
                  alert('Vui lòng điáuÃƒâ€šÃ‚Ân đầy đủ thông tin!')
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
                    'Có láuÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âi xảy ra khi tạo tài khoản'
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
                    Tài khoản admin được ẩn
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
                  <th>Tiêu đáuÃƒâ€šÃ‚Â</th>
                  <th>ảnh</th>
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
                            {n.pinned ? 'BáuÃƒâ€šÃ‚Â ghim' : 'Ghim'}
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
        {tab === 'tables' && (
          <div className="dashboard-section">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3>Trạng thái bàn</h3>
                <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                  Tự động cập nhật theo đơn hàng.
                </p>
              </div>
              <button
                className="btn secondary"
                onClick={loadTables}
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Làm mới
              </button>
            </div>

            <div className="table-status-grid">
              <div className="table-status-card">
                <div className="table-status-value">{tableStats.total}</div>
                <div className="table-status-label">Tổng bàn</div>
              </div>
              <div className="table-status-card available">
                <div className="table-status-value">{tableStats.available}</div>
                <div className="table-status-label">Bàn trống</div>
              </div>
              <div className="table-status-card occupied">
                <div className="table-status-value">{tableStats.occupied}</div>
                <div className="table-status-label">Đang có khách</div>
              </div>
              <div className="table-status-card inactive">
                <div className="table-status-value">{tableStats.inactive}</div>
                <div className="table-status-label">Tạm khóa</div>
              </div>
            </div>

            {loadingTables ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Đang tải danh sách bàn...</p>
              </div>
            ) : (
              <>
                <div className="table-map">
                  {sortedTables.length === 0 ? (
                    <div className="table-map-empty">Chưa có dữ liệu bàn</div>
                  ) : (
                    sortedTables.map((table) => {
                      const activeOrders = activeOrdersByTable[table.id] || []
                      return (
                        <div
                          key={table.id}
                          className={`table-map-card ${table.status}`}
                        >
                          <div className="table-map-top">
                            <span className="table-map-number">
                              Bàn {table.table_number}
                            </span>
                            <span className={`table-state-badge ${table.status}`}>
                              {getTableStatusText(table.status)}
                            </span>
                          </div>
                          <div className="table-map-body">
                            <div className="table-map-seat">
                              <div className="table-map-seat-inner">
                                {table.table_number}
                              </div>
                            </div>
                          </div>
                          <div className="table-map-meta">
                            {activeOrders.length > 0 ? (
                              <>
                                <strong>{activeOrders.length}</strong> đơn hàng đang mở
                              </>
                            ) : table.status === 'available' ? (
                              'Sẵn sàng nhận khách'
                            ) : table.status === 'inactive' ? (
                              'Tạm ẩn khỏi hệ thống đặt bàn'
                            ) : (
                              'Không có đơn hàng đang mở'
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Số bàn</th>
                      <th>Trạng thái</th>
                      <th>Đơn hàng đang mở</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTables.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{ textAlign: 'center', padding: '20px' }}
                        >
                          Chưa có dữ liệu bàn
                        </td>
                      </tr>
                    ) : (
                      sortedTables.map((table) => {
                        const activeOrders = activeOrdersByTable[table.id] || []
                        return (
                          <tr key={table.id}>
                            <td>{table.id}</td>
                            <td>Bàn {table.table_number}</td>
                            <td>
                              <span className={`table-state-badge ${table.status}`}>
                                {getTableStatusText(table.status)}
                              </span>
                            </td>
                            <td>{activeOrders.length}</td>
                            <td>
                              {table.status === 'occupied'
                                ? 'Bàn này đang được khóa bởi đơn hàng đang mở'
                                : table.status === 'available'
                                  ? 'Khách có thể chọn bàn này'
                                  : table.status === 'inactive'
                                    ? 'Không hiển thị cho khách đặt'
                                    : 'Trạng thái đặc biệt'}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </>
            )}
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
                🔄 Xóa tất cả đơn hàng
              </button>
            </div>
            <div className="orders-filter-bar">
              <label className="orders-filter-label" htmlFor="order-table-filter">
                Lọc theo bàn:
              </label>
              <select
                id="order-table-filter"
                className="orders-filter-select"
                value={selectedOrderTableFilter}
                onChange={(event) => setSelectedOrderTableFilter(event.target.value)}
              >
                <option value="all">Tất cả bàn</option>
                {sortedTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Bàn {table.table_number}
                  </option>
                ))}
              </select>
              <div className="orders-filter-count">
                {filteredOrders.length} don
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Khách hàng</th>
                  <th>Ban</th>
                  <th>Địa chỉ</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiáuÃƒâ€šÃ‚Ân</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                    <td>{o.customerName}</td>
                    <td>{getOrderTableNumber(o) ? 'Ban ' + getOrderTableNumber(o) : 'Mang ve'}</td>
                    <td>{o.address || 'Không có'}</td>
                    <td>
                      <span className={`payment-badge ${getOrderPayment(o)?.method || o.paymentMethod}`}>
                        {getPaymentMethodName(getOrderPayment(o)?.method || o.paymentMethod)}
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
                    <strong>Bàn:</strong>{' '} {getOrderTableNumber(detailOrder) ? 'Ban ' + getOrderTableNumber(detailOrder) : 'Mang ve'}
                  </div>
                  <div>
                    <strong>Địa chỉ:</strong>{' '}
                    {detailOrder.address || 'Không có'}
                  </div>
                  <div>
                    <strong>Phương thức:</strong>{' '}
                    {getPaymentMethodName(getOrderPayment(detailOrder)?.method || detailOrder.paymentMethod)}
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
                          {(price * it.quantity).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="order-total">
                  <strong>Tổng:</strong>{' '}
                  {detailOrder.total.toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

