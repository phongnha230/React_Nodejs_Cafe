import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts'

export function RevenueTab({ stats, orders = [] }) {
  if (!stats) return <div className="loading-stats">Đang tải dữ liệu thống kê...</div>;

  const totalRevenue = Number(stats.totalRevenue) || 0;
  const totalOrders = stats.totalOrders || 0;
  const totalProductsSold = stats.totalProductsSold || 0;

  // Group orders by time periods
  const ordersByTime = (orders || []).reduce((acc, order) => {
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
  const barData = stats.dailyRevenue ? Object.entries(stats.dailyRevenue).map(([name, revenue]) => ({ name, revenue })) : []

  return (
    <>
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">Tổng doanh thu</div>
            <div className="stat-value">{(totalRevenue || 0).toLocaleString('vi-VN')}đ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-label">Đơn hàng hoàn tất</div>
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
          <h3>Biểu đồ doanh thu (7 ngày gần nhất)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + 'đ'} />
                <Bar dataKey="revenue" fill="#6B4CE6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h3>Tỷ lệ đơn hàng theo trạng thái</h3>
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
    </>
  )
}
