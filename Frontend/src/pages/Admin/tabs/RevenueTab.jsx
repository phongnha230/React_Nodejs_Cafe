import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList
} from 'recharts'

export function RevenueTab({ stats, orders = [], revenueRange = '7d', setRevenueRange }) {
  if (!stats) return <div className="loading-stats">Đang tải dữ liệu thống kê...</div>;

  const totalRevenue = Number(stats.totalRevenue) || 0;
  const totalOrders = stats.totalOrders || 0;
  const totalProductsSold = stats.totalProductsSold || 0;

  // Filter orders by range for the time breakdown section
  const now = new Date();
  let startDate = new Date(0);
  if (revenueRange === '24h') startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  else if (revenueRange === '7d') { startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); startDate.setHours(0, 0, 0, 0); }
  else if (revenueRange === '30d') { startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); startDate.setHours(0, 0, 0, 0); }
  else if (revenueRange === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const filteredOrdersForBreakdown = (orders || []).filter(o => {
    const d = new Date(o.createdAt || o.created_at);
    return d >= startDate && o.status !== 'cancelled';
  });

  const ordersByTime = filteredOrdersForBreakdown.reduce((acc, order) => {
    const hour = new Date(order.createdAt).getHours()
    let period
    if (hour >= 6 && hour < 12) period = 'Sáng (6h-12h)'
    else if (hour >= 12 && hour < 18) period = 'Chiều (12h-18h)'
    else if (hour >= 18 && hour < 22) period = 'Tối (18h-22h)'
    else period = 'Đêm (22h-6h)'

    acc[period] = (acc[period] || 0) + 1
    return acc
  }, {})

  // Pie chart data
  const pieData = stats.statusBreakdown ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({
    name: name === 'delivered' ? 'Thành công' : name === 'cancelled' ? 'Đã hủy' : 'Đang xử lý',
    value
  })) : []

  const COLORS = ['#4CAF50', '#FF8042', '#0088FE', '#FFBB28']

  // Bar chart data
  const formatCurrency = (value) => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`
  const formatCompactCurrency = (value) => {
    const amount = Number(value) || 0

    if (amount >= 1000000) return `${Math.round(amount / 100000) / 10}tr`
    if (amount >= 1000) return `${Math.round(amount / 1000)}k`
    return `${amount}`
  }

  const barData = stats.dailyRevenue
    ? Object.entries(stats.dailyRevenue).map(([name, revenue]) => ({ name, revenue: Number(revenue) || 0 }))
    : []

  const rangeLabels = {
    '24h': '24 giờ qua',
    '7d': '7 ngày gần nhất',
    '30d': '30 ngày gần nhất',
    'month': 'Tháng này',
    'all': 'Tất cả'
  }

  const getRangeTitle = () => {
    const now = new Date();
    let start = new Date();
    if (revenueRange === '24h') return `${rangeLabels[revenueRange]} (${now.getHours()}h hôm qua - ${now.getHours()}h hôm nay)`;
    if (revenueRange === '7d') start.setDate(now.getDate() - 7);
    else if (revenueRange === '30d') start.setDate(now.getDate() - 30);
    else if (revenueRange === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (revenueRange === 'all') return `${rangeLabels[revenueRange]} (Toàn bộ lịch sử)`;

    const format = (d) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return `${rangeLabels[revenueRange]} (${format(start)} - ${format(now)})`;
  };

  return (
    <div className="revenue-tab-container">
      <div className="revenue-header">
        <div className="header-title">
          <h2>Biểu đồ Doanh thu</h2>
          <span className="range-subtitle">{getRangeTitle()}</span>
        </div>
      </div>
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">Doanh thu ({rangeLabels[revenueRange]})</div>
            <div className="stat-value">{(totalRevenue || 0).toLocaleString('vi-VN')}đ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-label">Đơn hàng hợp lệ</div>
            <div className="stat-value">{totalOrders || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">☕</div>
          <div className="stat-info">
            <div className="stat-label">Sản phẩm bán ra</div>
            <div className="stat-value">{totalProductsSold || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-info">
            <div className="stat-label">Giá trị trung bình</div>
            <div className="stat-value">
              {totalOrders > 0
                ? Math.round(totalRevenue / totalOrders).toLocaleString('vi-VN')
                : 0}đ
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Biểu đồ Doanh thu ({rangeLabels[revenueRange]})</h3>
            <div className="range-selector" style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(rangeLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRevenueRange(key)}
                  className={`btn-range ${revenueRange === key ? 'active' : ''}`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: revenueRange === key ? '#6B4CE6' : 'white',
                    color: revenueRange === key ? 'white' : '#4b5563',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {barData.length > 0 && barData.some(d => d.revenue > 0) ? (
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatCompactCurrency} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                    labelFormatter={(label) => {
                      if (revenueRange === '24h') return `Lúc ${label}`;
                      if (revenueRange === 'all') return `Tháng ${label}`;
                      return `Ngày ${label}`;
                    }}
                  />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#6B4CE6" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={formatCurrency}
                      style={{ fill: '#111827', fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-message" style={{ color: '#9ca3af', fontSize: '14px' }}>Chưa có dữ liệu Doanh thu</div>
            )}
          </div>
        </div>

        <div className="chart-container" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '20px' }}>Tỷ lệ đơn hàng theo trạng thái</h3>
          <div style={{ flex: 1, width: '100%', minHeight: 320, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF6C00" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F44336" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C62828" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1565C0" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius="65%"
                    outerRadius="90%"
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => {
                      let fill;
                      if (entry.name === 'Thành công') fill = "url(#colorSuccess)";
                      else if (entry.name === 'Đã hủy') fill = "url(#colorDanger)";
                      else fill = "url(#colorWarning)";
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={40} 
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#374151', fontWeight: 600, fontSize: '13px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-message" style={{ color: '#9ca3af', fontSize: '14px' }}>Chưa có dữ liệu đơn hàng</div>
            )}
            
            {pieData.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng cộng</div>
                <div style={{ fontSize: '28px', color: '#111827', fontWeight: 800 }}>
                  {pieData.reduce((acc, curr) => acc + curr.value, 0)}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>đơn hàng</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Sản phẩm bán chạy (Top 5)</h3>
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
    </div>
  )
}

