import { useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { OrdersTab } from './tabs/OrdersTab.jsx'
import {
  getOrderPayment,
  getOrderTableNumber,
  getPaymentMethodName,
} from './tabs/utils.js'

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [detailOrder, setDetailOrder] = useState(null)

  const { orders, setOrderStatus, sortedTables, prodList } = useOutletContext()

  const selectedOrderTableFilter = searchParams.get('table') || 'all'

  const selectedFilterTable = useMemo(
    () =>
      sortedTables.find(
        (table) => String(table.id) === selectedOrderTableFilter
      ),
    [selectedOrderTableFilter, sortedTables]
  )

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (selectedOrderTableFilter === 'all') return true

        const orderTableId = order.tableId ?? order.table_id ?? null
        if (String(orderTableId) === selectedOrderTableFilter) return true
        if (!selectedFilterTable) return false

        return getOrderTableNumber(order) === selectedFilterTable.table_number
      }),
    [orders, selectedFilterTable, selectedOrderTableFilter]
  )

  const handleFilterChange = (value) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value === 'all') {
      nextParams.delete('table')
    } else {
      nextParams.set('table', value)
    }
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <>
      <OrdersTab
        filteredOrders={filteredOrders}
        setOrderStatus={setOrderStatus}
        setDetailOrder={setDetailOrder}
        selectedOrderTableFilter={selectedOrderTableFilter}
        setSelectedOrderTableFilter={handleFilterChange}
        sortedTables={sortedTables}
      />

      {detailOrder && (
        <div className="modal-backdrop" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
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
                  <strong>Bàn:</strong>{' '}
                  {getOrderTableNumber(detailOrder)
                    ? `Bàn ${getOrderTableNumber(detailOrder)}`
                    : 'Mang về'}
                </div>
                <div>
                  <strong>Địa chỉ:</strong> {detailOrder.address || 'Không có'}
                </div>
                <div>
                  <strong>Phương thức:</strong>{' '}
                  {getPaymentMethodName(
                    getOrderPayment(detailOrder)?.method ||
                      detailOrder.paymentMethod
                  )}
                </div>
              </div>
              <div className="order-items">
                {detailOrder.items.map((item, index) => {
                  const product = prodList.find(
                    (entry) => Number(entry.id) === Number(item.productId)
                  )

                  return (
                    <div
                      className="order-item"
                      key={`${item.productId}-${index}`}
                    >
                      <div className="order-item-left">
                        {product?.image && (
                          <img src={product.image} alt={product?.name} />
                        )}
                        <div className="order-item-name">
                          {product?.name || item.productId}
                        </div>
                      </div>
                      <div className="order-item-qty">x{item.quantity}</div>
                      <div className="order-item-price">
                        {((product?.price || 0) * item.quantity).toLocaleString(
                          'vi-VN'
                        )}
                        đ
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="order-total">
                <strong>Tổng:</strong> {detailOrder.total.toLocaleString('vi-VN')}
                đ
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
