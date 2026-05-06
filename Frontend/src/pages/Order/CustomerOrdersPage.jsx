import { useEffect, useMemo, useRef, useState } from 'react';
import { useOrderStore } from '../../stores/orderStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { useProductStore } from '../../stores/productStore.js';
import { useReviewStore } from '../../stores/reviewStore.js';
import { RateProductModal } from '../../components/common/RateProductModal.jsx';

const getPaymentMethodLabel = (order) => {
  const payment = order.payments?.[0];
  const method = payment?.method || order.paymentMethod || 'cash';

  if (method === 'vnpay') return 'VNPay';
  if (method === 'momo' || method === 'mono') return 'MoMo';
  return 'Tiền mặt';
};

const isCompletedOrder = (order) => (
  order.status === 'delivered' || order.status === 'paid'
);

export function CustomerOrders() {
  const orders = useOrderStore((s) => s.orders);
  const loadFromAPI = useOrderStore((s) => s.loadFromAPI);
  const { customerName, isCustomer } = useAuth();
  const products = useProductStore((s) => s.products);
  const getReview = useReviewStore((s) => s.getReview);
  const loadReviews = useReviewStore((s) => s.loadFromAPI);
  const [openRate, setOpenRate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const toast = useNotifyStore();
  const prevMapRef = useRef(new Map());

  useEffect(() => {
    loadFromAPI();
    loadReviews();
  }, [loadFromAPI, loadReviews]);

  const myOrders = useMemo(() => (
    isCustomer ? orders : []
  ), [orders, isCustomer]);

  useEffect(() => {
    const map = new Map(myOrders.map((order) => [order.id, order.status]));
    const prev = prevMapRef.current;

    for (const [id, status] of map.entries()) {
      const old = prev.get(id);
      if (!old || old === status) continue;

      if (status === 'ready') {
        toast.show({
          type: 'info',
          message: 'Đơn của bạn đã sẵn sàng. Vui lòng tới nhận.',
        });
      } else if (status === 'delivered') {
        toast.show({
          type: 'success',
          message: 'Đơn của bạn đã hoàn tất.',
        });
      }
    }

    prevMapRef.current = map;
  }, [myOrders, toast]);

  const unreviewedItems = useMemo(() => {
    const items = myOrders
      .filter(isCompletedOrder)
      .flatMap((order) => order.items || [])
      .filter((item) => {
        const existingReview = getReview(item.productId, customerName || 'Ẩn danh');
        return !existingReview;
      });

    return items.reduce((acc, item) => {
      if (!acc.find((entry) => entry.productId === item.productId)) {
        acc.push(item);
      }
      return acc;
    }, []);
  }, [customerName, getReview, myOrders]);

  const myReviews = useMemo(() => {
    const reviews = useReviewStore.getState().reviews;
    return reviews.filter(
      (review) => review.userName === customerName || review.User?.username === customerName
    );
  }, [customerName]);

  return (
    <div className="container">
      <h2>Đơn của tôi</h2>
      {myOrders.length === 0 ? (
        <div className="empty-cart">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Bàn</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {myOrders.map((order) => (
              <tr key={order.id}>
                <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                <td>{order.address || 'Không có'}</td>
                <td>{getPaymentMethodLabel(order)}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {isCompletedOrder(order) ? 'Hoàn tất' : 'Đang pha'}
                  </span>
                </td>
                <td>{(order.total ?? order.total_amount ?? 0).toLocaleString('vi-VN')}đ</td>
                <td>{/* Reserved for future actions */}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {unreviewedItems.length > 0 && (
        <div className="dashboard-section" style={{ marginTop: 16 }}>
          <h3>Đánh giá món đã mua</h3>
          <div className="order-items">
            {unreviewedItems.map((item, index) => {
              const product = products.find((entry) => entry.id === item.productId);
              if (!product) return null;

              return (
                <div key={`${item.productId}-${index}`} className="order-item">
                  <div className="order-item-left">
                    {product.image && <img src={product.image} alt={product.name} />}
                    <div className="order-item-name">{product.name}</div>
                  </div>
                  <div className="order-item-qty">x{item.quantity}</div>
                  <div style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="btn"
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedReview(null);
                        setOpenRate(true);
                      }}
                    >
                      Đánh giá
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {myReviews.length > 0 && (
        <div className="dashboard-section" style={{ marginTop: 24 }}>
          <h3>Đánh giá của bạn</h3>
          <div className="order-items">
            {myReviews.map((review) => {
              const product = products.find(
                (entry) => entry.id === review.product_id || entry.id === review.productId
              );
              if (!product) return null;

              return (
                <div
                  key={review.id}
                  className="order-item"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <div className="order-item-left">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div className="order-item-name" style={{ fontWeight: 600 }}>
                          {product.name}
                        </div>
                        <div style={{ color: '#f59e0b', fontSize: 14 }}>
                          {'*'.repeat(review.rating)}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: '#10b981',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Đã đánh giá
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <div style={{ color: '#555', fontStyle: 'italic', paddingLeft: 62 }}>
                      "{review.comment}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, paddingLeft: 62 }}>
                    <button
                      className="btn secondary"
                      style={{ fontSize: 12, padding: '4px 12px' }}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedReview(review);
                        setOpenRate(true);
                      }}
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <RateProductModal
        open={openRate}
        onClose={() => setOpenRate(false)}
        product={selectedProduct}
        existingReview={selectedReview}
      />
    </div>
  );
}
