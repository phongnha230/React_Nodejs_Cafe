import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { useNavigate } from 'react-router-dom';
import { useReviewStore } from '../../stores/reviewStore.js';
import { ROUTES } from '../../config/routes';
import { MESSAGES } from '../../constants/messages';

export function ProductCard({ product }) {
  const add = useCartStore((s) => s.add);
  const { isGuest } = useAuth();
  const notify = useNotifyStore();
  const navigate = useNavigate();
  const { avg, count } = useReviewStore((s) => s.average(product.id));
  const [openRate, setOpenRate] = useState(false); // deprecated here; kept to avoid breaking, not used
  return (
    <div className="card">
      <img className="product-img" src={product.image} alt={product.name} />
      <div className="space-between">
        <div>
          <div style={{ fontWeight: 600 }}>{product.name}</div>
          <div className="badge">{product.price.toLocaleString('vi-VN')}đ</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 4,
            }}
          >
            <span style={{ color: '#f59e0b' }}>
              {'★'.repeat(Math.round(avg))}
              {'☆'.repeat(5 - Math.round(avg))}
            </span>
            <span className="muted">({count})</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <button
              type="button"
              className="review-link"
              onClick={() => navigate(ROUTES.PRODUCT_REVIEWS(product.id))}
            >
              Xem chi tiết đánh giá
            </button>
          </div>
        </div>
        <button
          className="btn"
          onClick={() => {
            if (isGuest) {
              notify.show({
                message: MESSAGES.ERROR.UNAUTHORIZED,
                type: 'warning',
                actionLabel: 'Đăng nhập',
                onAction: () => navigate(ROUTES.LOGIN),
                duration: 4000,
              });
              return;
            }
            add(product.id);
            notify.show({
              message: 'Đã thêm vào giỏ hàng',
              type: 'success',
              duration: 1500,
            });
          }}
        >
          Order
        </button>
      </div>
      {/* Rating is only allowed after purchase from CustomerOrders page */}
    </div>
  )
}
