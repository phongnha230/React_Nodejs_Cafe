import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useOrderStore } from '../../stores/orderStore.js';
import paymentServices from '../../services/paymentServices.js';
import { ROLES } from '../../constants/roles';

const genId = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : `o_${Date.now()}_${Math.random().toString(36).slice(2)}`

export function CartPage() {
  const items = useCartStore((s) => s.detailed());  // Lấy giỏ hàng
  const total = useCartStore((s) => s.total());  // Tính tổng tiền
  const add = useCartStore((s) => s.add);  // Thêm sản phẩm vào giỏ hàng
  const remove = useCartStore((s) => s.remove);  // Xóa sản phẩm khỏi giỏ hàng
  const clear = useCartStore((s) => s.clear);  // Xóa toàn bộ giỏ hàng
  const { role, customerName, isCustomer } = useAuth();  // Lấy thông tin người dùng
  const displayName = customerName ?? 'Khách vãng lai';  // Hiển thị tên người dùng
  const place = useOrderStore((s) => s.place);  // Đặt hàng

  const [showPayment, setShowPayment] = useState(false)  // Hiển thị form thanh toán
  const [selectedPayment, setSelectedPayment] = useState('direct')  // Chọn phương thức thanh toán
  const [address, setAddress] = useState('')  // Địa chỉ giao hàng

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)  // Tính tổng số lượng sản phẩm

  const checkout = () => {
    if (items.length === 0) return  // Nếu không có sản phẩm trong giỏ hàng, không cho đặt hàng
    setAddress('Bàn số 1')
    setShowPayment(true)
  }

  const confirmPayment = async () => {
    if (!address.trim()) {  // Nếu không nhập địa chỉ giao hàng, hiển thị thông báo
      alert('Vui lòng nhập địa chỉ giao hàng')
      return
    }

    const order = {
      id: genId(),
      customerName: isCustomer ? displayName : 'Khách vãng lai',
      items: items.map((i) => ({
        productId: i.productId,  // ID sản phẩm
        quantity: i.quantity,
        product: i.product,  // Thêm product info để backend lấy price
      })),
      total,  // Tổng tiền
      createdAt: new Date().toISOString(),  // Thời gian đặt hàng
      paymentMethod: selectedPayment,
      address: address.trim(),
    };

    try {
      // Lưu order vào database qua API
      const orderId = await place(order);
      console.log('✅ Order created with ID:', orderId);

      // Tạo payment record trong database
      try {
        await paymentServices.create({
          order_id: orderId,  // ID đơn hàng từ database
          amount: total,  // Tổng tiền
          method: selectedPayment === 'direct' ? 'cash' : selectedPayment,  // Phương thức thanh toán
          status: 'completed', // Mặc định đã hoàn tất
          transaction_id:  // ID giao dịch
            selectedPayment !== 'direct' ? `TXN-${Date.now()}` : null,
        });

        console.log('✅ Payment record created successfully');
      } catch (error) {
        console.error('⚠️ Failed to create payment record:', error);
        // Không hiển thị lỗi cho user, vì order đã được tạo
      }

      clear();
      setShowPayment(false);  // Ẩn form thanh toán
      setAddress('');

      if (selectedPayment === 'direct') {
        const w = window.open('', '_blank');
        const lines = items
          .map(
            (i) =>
              `\n${i.product.name} x${i.quantity} - ${(
                i.product.price * i.quantity
              ).toLocaleString('vi-VN')}₫`
          )
          .join('');
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Hóa đơn</title></head><body>
          <pre style="font:14px/1.6 system-ui, -apple-system, Segoe UI, Roboto">CAFÉ APP\n------------------------------\nKhách: ${order.customerName
          }\nBàn: ${order.address}\nThời gian: ${new Date(
            order.createdAt
          ).toLocaleString(
            'vi-VN'
          )}\n\nMặt hàng:${lines}\n\nTổng tiền: ${total.toLocaleString(
            'vi-VN'
          )}₫\nPhương thức: Trực tiếp\n\nCảm ơn quý khách!</pre>
          <script>window.onload=()=>{window.print(); setTimeout(()=>window.close(), 300);}</script>
        </body></html>`;
        w.document.write(html);
        w.document.close();
      } else {
        alert('Thanh toán online đã ghi nhận!');
      }
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      alert('Đặt hàng thất bại: ' + (error.response?.data?.message || error.message));
    }
  }

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
                {items.map((i) => (
                  <div key={i.productId} className="order-item">
                    <div className="order-item-left">
                      <img src={i.product.image} alt={i.product.name} />
                      <div className="order-item-name">{i.product.name}</div>
                    </div>
                    <div className="order-item-qty">x{i.quantity}</div>
                    <div className="order-item-price">
                      {(i.product.price * i.quantity).toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Tạm tính:</strong> {total.toLocaleString('vi-VN')}₫
              </div>
            </div>

            <div className="address-section">
              <label className="address-label">Chọn số bàn:</label>
              <select
                className="address-input"
                value={address || 'Bàn số 1'}
                onChange={(e) => setAddress(e.target.value)}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={`Bàn số ${n}`}>
                    Bàn số {n}
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
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              <div
                className="payment-card"
                style={{
                  background: selectedPayment === 'direct' ? '#ecfeff' : '',
                  borderColor: selectedPayment === 'direct' ? '#06b6d4' : '',
                }}
              >
                <div className="payment-logo">💵</div>
                <span>Trực tiếp</span>
              </div>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="vnpay"
                checked={selectedPayment === 'vnpay'}
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              <div className="payment-card">
                <div className="payment-logo">🏦</div>
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
            <button className="btn" onClick={confirmPayment}>
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>
    )
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
            {items.map((i) => (
              <div key={i.productId} className="cart-item">
                <img
                  className="cart-item-image"
                  src={i.product.image}
                  alt={i.product.name}
                />
                <div className="cart-item-info">
                  <div className="cart-item-price">
                    {i.product.price.toLocaleString('vi-VN')}₫
                  </div>
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => remove(i.productId)}
                    >
                      -
                    </button>
                    <span className="qty-display">{i.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => add(i.productId)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => {
                    for (let j = 0; j < i.quantity; j++) remove(i.productId)
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
                {total.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>

          <button className="checkout-btn" onClick={checkout}>
            Thanh Toán
          </button>
        </>
      )}
    </div>
  )
}
