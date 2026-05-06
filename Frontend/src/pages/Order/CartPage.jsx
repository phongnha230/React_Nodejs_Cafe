import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useOrderStore } from '../../stores/orderStore.js';
import paymentService from '../../services/paymentService.js';
import { ROLES } from '../../constants/roles';

const genId = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : `o_${Date.now()}_${Math.random().toString(36).slice(2)}`

export function CartPage() {
  const items = useCartStore((s) => s.detailed());  // L?y gi? hàng
  const total = useCartStore((s) => s.total());  // Tính t?ng ti?n
  const add = useCartStore((s) => s.add);  // Thêm s?n ph?m vào gi? hàng
  const remove = useCartStore((s) => s.remove);  // Xóa s?n ph?m kh?i gi? hàng
  const clear = useCartStore((s) => s.clear);  // Xóa toàn b? gi? hàng
  const { role, customerName, isCustomer } = useAuth();  // L?y thông tin ngu?i dùng
  const displayName = customerName ?? 'Khách vãng lai';  // Hi?n th? tên ngu?i dùng
  const place = useOrderStore((s) => s.place);  // Ð?t hàng

  const [showPayment, setShowPayment] = useState(false)  // Hi?n th? form thanh toán
  const [selectedPayment, setSelectedPayment] = useState('direct')  // Ch?n phuong th?c thanh toán
  const [address, setAddress] = useState('')  // Ð?a ch? giao hàng

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)  // Tính t?ng s? lu?ng s?n ph?m

  const checkout = () => {
    if (items.length === 0) return  // N?u không có s?n ph?m trong gi? hàng, không cho d?t hàng
    setAddress('Bàn s? 1')
    setShowPayment(true)
  }

  const confirmPayment = async () => {
    if (!address.trim()) {  // N?u không nh?p d?a ch? giao hàng, hi?n th? thông báo
      alert('Vui lòng nh?p d?a ch? giao hàng')
      return
    }

    const order = {
      id: genId(),
      customerName: isCustomer ? displayName : 'Khách vãng lai',
      items: items.map((i) => ({
        productId: i.productId,  // ID s?n ph?m
        quantity: i.quantity,
        product: i.product,  // Thêm product info d? backend l?y price
      })),
      total,  // T?ng ti?n
      createdAt: new Date().toISOString(),  // Th?i gian d?t hàng
      paymentMethod: selectedPayment,
      address: address.trim(),
    };

    try {
      // Luu order vào database qua API
      const orderId = await place(order);
      console.log('? Order created with ID:', orderId);

      // T?o payment record trong database
      try {
        await paymentService.create({
          order_id: orderId,  // ID don hàng t? database
          amount: total,  // T?ng ti?n
          method: selectedPayment === 'direct' ? 'cash' : selectedPayment,  // Phuong th?c thanh toán
          status: 'completed', // M?c d?nh dã hoàn t?t
          transaction_id:  // ID giao d?ch
            selectedPayment !== 'direct' ? `TXN-${Date.now()}` : null,
        });

        console.log('? Payment record created successfully');
      } catch (error) {
        console.error('?? Failed to create payment record:', error);
        // Không hi?n th? l?i cho user, vì order dã du?c t?o
      }

      clear();
      setShowPayment(false);  // ?n form thanh toán
      setAddress('');

      if (selectedPayment === 'direct') {
        const w = window.open('', '_blank');
        const lines = items
          .map(
            (i) =>
              `\n${i.product.name} x${i.quantity} - ${(
                i.product.price * i.quantity
              ).toLocaleString('vi-VN')}?`
          )
          .join('');
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Hóa don</title></head><body>
          <pre style="font:14px/1.6 system-ui, -apple-system, Segoe UI, Roboto">CAFÉ APP\n------------------------------\nKhách: ${order.customerName
          }\nBàn: ${order.address}\nTh?i gian: ${new Date(
            order.createdAt
          ).toLocaleString(
            'vi-VN'
          )}\n\nM?t hàng:${lines}\n\nT?ng ti?n: ${total.toLocaleString(
            'vi-VN'
          )}?\nPhuong th?c: Tr?c ti?p\n\nC?m on quý khách!</pre>
          <script>window.onload=()=>{window.print(); setTimeout(()=>window.close(), 300);}</script>
        </body></html>`;
        w.document.write(html);
        w.document.close();
      } else {
        alert('Thanh toán online dã ghi nh?n!');
      }
    } catch (error) {
      console.error('? Order creation failed:', error);
      alert('Ð?t hàng th?t b?i: ' + (error.response?.data?.message || error.message));
    }
  }

  if (showPayment) {
    return (
      <div className="container">
        <h2>Thanh toán</h2>
        <div className="payment-section">
          <div className="payment-info">
            <h3>T?ng ti?n: {total.toLocaleString('vi-VN')}d</h3>
            <div className="order-summary">
              <h4>Ðon hàng c?a b?n</h4>
              <div className="order-items">
                {items.map((i) => (
                  <div key={i.productId} className="order-item">
                    <div className="order-item-left">
                      <img src={i.product.image} alt={i.product.name} />
                      <div className="order-item-name">{i.product.name}</div>
                    </div>
                    <div className="order-item-qty">x{i.quantity}</div>
                    <div className="order-item-price">
                      {(i.product.price * i.quantity).toLocaleString('vi-VN')}?
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>T?m tính:</strong> {total.toLocaleString('vi-VN')}?
              </div>
            </div>

            <div className="address-section">
              <label className="address-label">Ch?n s? bàn:</label>
              <select
                className="address-input"
                value={address || 'Bàn s? 1'}
                onChange={(e) => setAddress(e.target.value)}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={`Bàn s? ${n}`}>
                    Bàn s? {n}
                  </option>
                ))}
              </select>
            </div>

            <p>Ch?n phuong th?c thanh toán:</p>
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
                <div className="payment-logo">??</div>
                <span>Tr?c ti?p</span>
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
                <div className="payment-logo">??</div>
                <span>VNPay</span>
              </div>
            </label>
          </div>

          {selectedPayment !== 'direct' && (
            <div className="qr-section">
              <div className="qr-code">
                {selectedPayment === 'vnpay' ? 'VNPay QR' : 'QR Code'}
              </div>
              <p>Quét mã QR d? thanh toán</p>
            </div>
          )}

          <div className="payment-actions">
            <button
              className="btn secondary"
              onClick={() => setShowPayment(false)}
            >
              Quay l?i
            </button>
            <button className="btn" onClick={confirmPayment}>
              Xác nh?n thanh toán
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Gi? hàng</h2>
      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Chua có s?n ph?m nào trong gi? hàng.</p>
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
                    {i.product.price.toLocaleString('vi-VN')}?
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
              <label>S? lu?ng:</label>
              <input
                type="text"
                value={totalQuantity}
                readOnly
                className="summary-input"
              />
            </div>
            <div className="summary-row">
              <label>T?ng ti?n:</label>
              <div className="total-amount">
                {total.toLocaleString('vi-VN')}?
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
