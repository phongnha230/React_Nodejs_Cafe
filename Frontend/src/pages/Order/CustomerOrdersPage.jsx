import { useEffect, useMemo, useRef, useState } from 'react';
import { useOrderStore } from '../../stores/orderStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { useProductStore } from '../../stores/productStore.js';
import { useReviewStore } from '../../stores/reviewStore.js';
import { useVoucherStore } from '../../stores/voucherStore.js';
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

const isVideoMedia = (url = '') => (
  url.includes('/video/upload/') || /\.(mp4|mov|webm|mkv|avi)(\?|$)/i.test(url)
);

const getReviewUserName = (review = {}) => (
  review.userName ||
  review.customerName ||
  review.customer_name ||
  review.User?.username ||
  review.user?.username ||
  null
);

export function CustomerOrders() {
  const orders = useOrderStore((s) => s.orders);
  const loadFromAPI = useOrderStore((s) => s.loadFromAPI);
  const { customerName, isCustomer } = useAuth();
  const products = useProductStore((s) => s.products);
  const reviews = useReviewStore((s) => s.reviews);
  const getReview = useReviewStore((s) => s.getReview);
  const loadReviews = useReviewStore((s) => s.loadFromAPI);
  const [openRate, setOpenRate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const coins = useVoucherStore((s) => s.coins);
  const vouchers = useVoucherStore((s) => s.vouchers);
  const walletVouchers = useVoucherStore((s) => s.walletVouchers);
  const loadVouchers = useVoucherStore((s) => s.loadVouchers);
  const loadWallet = useVoucherStore((s) => s.loadWallet);
  const redeemVoucher = useVoucherStore((s) => s.redeem);

  const toast = useNotifyStore();
  const prevMapRef = useRef(new Map());

  useEffect(() => {
    loadFromAPI();
    loadReviews();
    if (isCustomer) {
      loadVouchers();
      loadWallet();
    }
  }, [isCustomer, loadFromAPI, loadReviews, loadVouchers, loadWallet]);

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
  }, [customerName, getReview, myOrders, reviews]);

  const myReviews = useMemo(() => {
    return reviews.filter(
      (review) => getReviewUserName(review) === customerName
    );
  }, [customerName, reviews]);

  return (
    <div className="container">
      <h2>Đơn của tôi</h2>
      {isCustomer && (
        <div className="dashboard-section" style={{ marginBottom: 16 }}>
          <h3>Ví xu và voucher</h3>
          <p style={{ fontWeight: 700 }}>Xu hiện có: {coins.toLocaleString('vi-VN')}</p>
          <div className="order-items">
            {vouchers.filter((voucher) => voucher.type === 'coin_exchange').map((voucher) => (
              <div key={voucher.id} className="order-item">
                <div>
                  <div className="order-item-name">{voucher.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>
                    Cần {Number(voucher.coin_cost || 0).toLocaleString('vi-VN')} xu - Mã {voucher.code}
                  </div>
                </div>
                <button
                  className="btn"
                  disabled={coins < Number(voucher.coin_cost || 0)}
                  onClick={async () => {
                    try {
                      await redeemVoucher(voucher.id);
                      alert('Đổi voucher thành công');
                    } catch (error) {
                      alert('Đổi voucher thất bại: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                >
                  Đổi voucher
                </button>
              </div>
            ))}
          </div>
          {walletVouchers.filter((entry) => !entry.is_used && entry.voucher).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Voucher đang có:</strong>
              <div className="order-items" style={{ marginTop: 8 }}>
                {walletVouchers.filter((entry) => !entry.is_used && entry.voucher).map((entry) => (
                  <div key={entry.id} className="order-item">
                    <div>
                      <div className="order-item-name">{entry.voucher.name}</div>
                      <div style={{ color: '#6b7280', fontSize: 14 }}>Mã {entry.voucher.code}</div>
                    </div>
                    <span className="status-badge delivered">Sẵn sàng dùng</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
                  {(review.media_url || review.mediaUrl) && (
                    <div style={{ paddingLeft: 62 }}>
                      {isVideoMedia(review.media_url || review.mediaUrl) ? (
                        <video
                          src={review.media_url || review.mediaUrl}
                          controls
                          style={{ width: '100%', maxWidth: 320, maxHeight: 180, borderRadius: 10, objectFit: 'cover' }}
                        />
                      ) : (
                        <img
                          src={review.media_url || review.mediaUrl}
                          alt='Review media'
                          style={{ width: '100%', maxWidth: 320, maxHeight: 180, borderRadius: 10, objectFit: 'cover' }}
                        />
                      )}
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
