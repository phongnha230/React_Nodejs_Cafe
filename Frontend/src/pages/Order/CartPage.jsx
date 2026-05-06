import { useEffect, useState } from 'react';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useOrderStore } from '../../stores/orderStore.js';
import paymentService from '../../services/paymentService.js';
import tableService from '../../services/tableService.js';

const genId = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : `o_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export function CartPage() {
  const items = useCartStore((state) => state.detailed());
  const total = useCartStore((state) => state.total());
  const add = useCartStore((state) => state.add);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const { customerName, isCustomer } = useAuth();
  const displayName = customerName ?? 'Khách vãng lai';
  const place = useOrderStore((state) => state.place);

  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('direct');
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const availableTables = tables.filter((table) => table.status === 'available');
  const selectedTable = availableTables.find((table) => String(table.id) === String(selectedTableId));

  useEffect(() => {
    let mounted = true;

    const loadTables = async () => {
      setTablesLoading(true);
      try {
        const response = await tableService.getAll();
        const payload = response.data;
        const apiTables = Array.isArray(payload) ? payload : (payload?.data || []);

        if (!mounted) return;

        setTables(apiTables);
        if (apiTables.length > 0) {
          const firstAvailableTable = apiTables.find((table) => table.status === 'available');
          if (firstAvailableTable) {
            setSelectedTableId((current) => current || String(firstAvailableTable.id));
          }
        }
      } catch (error) {
        console.error('Load tables failed:', error);
      } finally {
        if (mounted) {
          setTablesLoading(false);
        }
      }
    };

    loadTables();

    return () => {
      mounted = false;
    };
  }, []);

  const checkout = () => {
    if (items.length === 0) return;
    if (availableTables.length === 0) {
      alert('Chưa có bàn nào trong hệ thống');
      return;
    }
    setShowPayment(true);
  };

  const confirmPayment = async () => {
    if (!selectedTable) {
      alert('Vui lòng chọn bàn');
      return;
    }

    const tableLabel = `Bàn ${selectedTable.table_number}`;
    const order = {
      id: genId(),
      customerName: isCustomer ? displayName : 'Khách vãng lai',
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
      })),
      total,
      createdAt: new Date().toISOString(),
      paymentMethod: selectedPayment,
      tableId: selectedTable.id,
      tableNumber: selectedTable.table_number,
      address: tableLabel,
    };

    try {
      const orderId = await place(order);

      try {
        await paymentService.create({
          order_id: orderId,
          amount: total,
          method: selectedPayment === 'direct' ? 'cash' : selectedPayment,
          status: 'completed',
          transaction_id: selectedPayment !== 'direct' ? `TXN-${Date.now()}` : null,
        });
      } catch (error) {
        console.error('Failed to create payment record:', error);
      }

      clear();
      setShowPayment(false);

      if (selectedPayment === 'direct') {
        const popup = window.open('', '_blank');
        const lines = items
          .map(
            (item) =>
              `\n${item.product.name} x${item.quantity} - ${(
                item.product.price * item.quantity
              ).toLocaleString('vi-VN')}đ`
          )
          .join('');

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Hóa đơn</title></head><body>
          <pre style="font:14px/1.6 system-ui, -apple-system, Segoe UI, Roboto">CAFE APP\n------------------------------\nKhách: ${
            order.customerName
          }\nBàn: ${order.address}\nThời gian: ${new Date(order.createdAt).toLocaleString(
            'vi-VN'
          )}\n\nMặt hàng:${lines}\n\nTổng tiền: ${total.toLocaleString(
            'vi-VN'
          )}đ\nPhương thức: Trực tiếp\n\nCảm ơn quý khách!</pre>
          <script>window.onload=()=>{window.print(); setTimeout(()=>window.close(), 300);}</script>
        </body></html>`;

        popup.document.write(html);
        popup.document.close();
      } else {
        alert('Thanh toán online đã ghi nhận!');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Đặt hàng thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  if (showPayment) {
    return (
      <div className="container">
        <h2>Thanh toán</h2>
        <div className="payment-section">
          <div className="payment-info">
            <h3>Tổng tiền: {total.toLocaleString('vi-VN')}đ</h3>
            <div className="order-summary">
              <h4>Đơn hàng của bạn</h4>
              <div className="order-items">
                {items.map((item) => (
                  <div key={item.productId} className="order-item">
                    <div className="order-item-left">
                      <img src={item.product.image} alt={item.product.name} />
                      <div className="order-item-name">{item.product.name}</div>
                    </div>
                    <div className="order-item-qty">x{item.quantity}</div>
                    <div className="order-item-price">
                      {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Tạm tính:</strong> {total.toLocaleString('vi-VN')}đ
              </div>
            </div>

            <div className="address-section">
              <label className="address-label">Chọn số bàn:</label>
              <select
                className="address-input"
                value={selectedTableId}
                onChange={(event) => setSelectedTableId(event.target.value)}
                disabled={tablesLoading || availableTables.length === 0}
              >
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Bàn {table.table_number}
                  </option>
                ))}
              </select>
            </div>

            <p>Chọn phương thức thanh toán:</p>
          </div>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="direct"
                checked={selectedPayment === 'direct'}
                onChange={(event) => setSelectedPayment(event.target.value)}
              />
              <div
                className="payment-card"
                style={{
                  background: selectedPayment === 'direct' ? '#ecfeff' : '',
                  borderColor: selectedPayment === 'direct' ? '#06b6d4' : '',
                }}
              >
                <div className="payment-logo">$$</div>
                <span>Trực tiếp</span>
              </div>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="vnpay"
                checked={selectedPayment === 'vnpay'}
                onChange={(event) => setSelectedPayment(event.target.value)}
              />
              <div className="payment-card">
                <div className="payment-logo">QR</div>
                <span>VNPay</span>
              </div>
            </label>
          </div>

          {selectedPayment !== 'direct' && (
            <div className="qr-section">
              <div className="qr-code">
                {selectedPayment === 'vnpay' ? 'VNPay QR' : 'QR Code'}
              </div>
              <p>Quét mã QR để thanh toán</p>
            </div>
          )}

          <div className="payment-actions">
            <button
              className="btn secondary"
              onClick={() => setShowPayment(false)}
            >
              Quay lại
            </button>
            <button
              className="btn"
              onClick={confirmPayment}
              disabled={tablesLoading || !selectedTable}
            >
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Giỏ hàng</h2>
      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                <img
                  className="cart-item-image"
                  src={item.product.image}
                  alt={item.product.name}
                />
                <div className="cart-item-info">
                  <div className="cart-item-price">
                    {item.product.price.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => remove(item.productId)}
                    >
                      -
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => add(item.productId)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => {
                    for (let index = 0; index < item.quantity; index += 1) {
                      remove(item.productId);
                    }
                  }}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <label>Số lượng:</label>
              <input
                type="text"
                value={totalQuantity}
                readOnly
                className="summary-input"
              />
            </div>
            <div className="summary-row">
              <label>Tổng tiền:</label>
              <div className="total-amount">
                {total.toLocaleString('vi-VN')}đ
              </div>
            </div>
          </div>

          <button className="checkout-btn" onClick={checkout}>
            Thanh toán
          </button>
        </>
      )}
    </div>
  );
}
