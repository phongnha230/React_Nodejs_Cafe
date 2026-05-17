import React, { useState, useEffect } from 'react'
import { getPaymentMethodName, getOrderTableNumber, getOrderPayment } from './utils.js'
import { Pagination } from '../../../components/common/Pagination.jsx'

export function OrdersTab({ 
  filteredOrders, 
  setOrderStatus, 
  setDetailOrder, 
  selectedOrderTableFilter, 
  setSelectedOrderTableFilter, 
  sortedTables 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
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
          {filteredOrders.length} đơn
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Khách hàng</th>
            <th>Bàn</th>
            <th>Địa chỉ</th>
            <th>Phương thức</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((o) => (
            <tr key={o.id}>
              <td>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
              <td>{o.customerName}</td>
              <td>{getOrderTableNumber(o) ? 'Bàn ' + getOrderTableNumber(o) : 'Mang về'}</td>
              <td>{o.address || 'Không có'}</td>
              <td>
                <span className={`payment-badge \${getOrderPayment(o)?.method || o.paymentMethod}`}>
                  {getPaymentMethodName(getOrderPayment(o)?.method || o.paymentMethod)}
                </span>
              </td>
              <td>
                <span className={`status-badge \${o.status}`}>
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
