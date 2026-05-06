import { useEffect, useMemo, useRef, useState } from 'react';
import { useOrderStore } from '../../stores/orderStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { useProductStore } from '../../stores/productStore.js';
import { useReviewStore } from '../../stores/reviewStore.js';
import { RateProductModal } from '../../components/common/RateProductModal.jsx';
import paymentService from '../../services/paymentService.js';
import { useLocation, useNavigate } from 'react-router-dom';

export function CustomerOrders() {
  const orders = useOrderStore((s) => s.orders);
  const loadFromAPI = useOrderStore((s) => s.loadFromAPI);
  const { role, customerName, isCustomer } = useAuth();
  const products = useProductStore((s) => s.products);
  const hasReviewed = useReviewStore((s) => s.hasReviewed);
  const getReview = useReviewStore((s) => s.getReview);
  const loadReviews = useReviewStore((s) => s.loadFromAPI); // Add fetcher
  const [openRate, setOpenRate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null); // Review to edit
  const [processingId, setProcessingId] = useState(null);

  const toast = useNotifyStore();

  // Load orders and reviews on mount
  useEffect(() => {
    loadFromAPI(); // Load orders from database
    loadReviews(); // Load reviews for rating functionality
  }, [loadFromAPI, loadReviews]);

  const myOrders = useMemo(() => {
    // Backend already filters by user_id, so we can display all orders in the store.
    // We still check isCustomer to ensure we are in a logged-in context if that's the intent,
    // but relying on "customerName" matching is what caused the bug.
    if (isCustomer) {
      return orders;
    }
    return [];
  }, [orders, isCustomer]);

  // toast when order status changes
  const prevMapRef = useRef(new Map())

  useEffect(() => {
    const map = new Map(myOrders.map((o) => [o.id, o.status]))
    const prev = prevMapRef.current
    for (const [id, status] of map.entries()) {
      const old = prev.get(id)
      if (old && old !== status) {
        if (status === 'ready') {
          toast.show({
            type: 'info',
            message: 'Ðon c?a b?n dã s?n sàng! Vui lòng t?i nh?n.',
          })
        } else if (status === 'delivered') {
          toast.show({
            type: 'success',
            message: 'Ðon c?a b?n dã hoàn t?t. Chúc b?n ngon mi?ng!',
          })
        }
      }
    }
    prevMapRef.current = map
  }, [myOrders, toast])



  return (
    <div className="container">
      <h2>Ðon c?a tôi</h2>
      {myOrders.length === 0 ? (
        <div className="empty-cart">B?n chua có don hàng nào.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Th?i gian</th>
              <th>Bàn</th>
              <th>Phuong th?c</th>
              <th>Tr?ng thái</th>
              <th>T?ng ti?n</th>
              <th>Hành d?ng</th>
            </tr>
          </thead>
          <tbody>
            {myOrders.map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                <td>{o.address || 'Không có'}</td>
                <td>
                  {(() => {
                    // Get payment method from payments array
                    const payment = o.payments?.[0];
                    const method = payment?.method || o.paymentMethod || 'cash';
                    if (method === 'vnpay') return 'VNPay';
                    if (method === 'momo') return 'MoMo';
                    return 'Ti?n m?t';
                  })()}
                </td>
                <td>
                  <span className={`status-badge ${o.status}`}>
                    {o.status === 'delivered' || o.status === 'paid' ? 'Hoàn t?t' : 'Ðang pha'}
                  </span>
                </td>
                <td>{(o.total ?? o.total_amount ?? 0).toLocaleString('vi-VN')}d</td>
                <td>
                  {/* No action buttons for now */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Rate purchased items for completed orders - only show items NOT yet reviewed */}
      {(() => {
        const unreviewed = myOrders
          .filter((o) => o.status === 'delivered' || o.status === 'paid')
          .flatMap((o) => o.items)
          .filter((it) => {
            const existingReview = getReview(it.productId, customerName || '?n danh');
            return !existingReview; // Only keep items that haven't been reviewed
          });

        // Remove duplicates by productId
        const uniqueItems = unreviewed.reduce((acc, it) => {
          if (!acc.find(x => x.productId === it.productId)) {
            acc.push(it);
          }
          return acc;
        }, []);

        if (uniqueItems.length === 0) return null;

        return (
          <div className="dashboard-section" style={{ marginTop: 16 }}>
            <h3>Ðánh giá món dã mua</h3>
            <div className="order-items">
              {uniqueItems.map((it, idx) => {
                const p = products.find((pr) => pr.id === it.productId);
                if (!p) return null;

                return (
                  <div key={`${it.productId}-${idx}`} className="order-item">
                    <div className="order-item-left">
                      {p.image && <img src={p.image} alt={p.name} />}
                      <div className="order-item-name">{p.name}</div>
                    </div>
                    <div className="order-item-qty">x{it.quantity}</div>
                    <div style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn"
                        onClick={() => {
                          setSelectedProduct(p);
                          setSelectedReview(null);
                          setOpenRate(true);
                        }}
                      >
                        Ðánh giá
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Show user's reviews */}
      {(() => {
        const reviews = useReviewStore.getState().reviews;
        const myReviews = reviews.filter(r =>
          (r.userName === customerName || r.User?.username === customerName)
        );

        if (myReviews.length === 0) return null;

        return (
          <div className="dashboard-section" style={{ marginTop: 24 }}>
            <h3>Ðánh giá c?a b?n</h3>
            <div className="order-items">
              {myReviews.map((review) => {
                const p = products.find((pr) => pr.id === review.product_id || pr.id === review.productId);
                if (!p) return null;

                return (
                  <div key={review.id} className="order-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div className="order-item-left">
                        {p.image && <img src={p.image} alt={p.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />}
                        <div>
                          <div className="order-item-name" style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ color: '#f59e0b', fontSize: 14 }}>
                            {'?'.repeat(review.rating)}{'?'.repeat(5 - review.rating)}
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
                            fontWeight: 600
                          }}
                        >
                          ? Ðã dánh giá
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
                          setSelectedProduct(p)
                          setSelectedReview(review)
                          setOpenRate(true)
                        }}
                      >
                        Ch?nh s?a
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        );
      })()}

      <RateProductModal
        open={openRate}
        onClose={() => setOpenRate(false)}
        product={selectedProduct}
        existingReview={selectedReview}
      />
    </div>
  )
}
