import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { ROUTES } from '../../config/routes';
import { MESSAGES } from '../../constants/messages';

export function Header({ onMenuClick }) {
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const { logout, customerName, isAdmin, isCustomer, isGuest } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');
  const toast = useNotifyStore();

  useEffect(() => {
    const ids = ['about', 'activities', 'news', 'menu', 'contact'];
    const handler = () => {
      let current = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 110 && rect.bottom > 110) {
          current = id;
          break;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const goto = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="header">
      <div className="header-top-bar"></div>
      <div className="container header-inner">
        {isAdmin && onMenuClick && (
          <button className="hamburger-btn" onClick={onMenuClick}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        <div className="brand">
          <div className="brand-logo">☕</div>
          <span className="brand-name">
            jokopi.
            <span className="brand-suffix">{isAdmin ? 'Admin' : 'Home'}</span>
          </span>
        </div>

        <nav className="nav">
          <NavLink
            to={ROUTES.HOME}
            end
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Trang chủ
          </NavLink>
          <a
            href="#menu"
            onClick={goto('menu')}
            className={`nav-link ${activeSection === 'menu' ? 'active' : ''}`}
          >
            Thực đơn
          </a>
          <a
            href="#activities"
            onClick={goto('activities')}
            className={`nav-link ${activeSection === 'activities' ? 'active' : ''}`}
          >
            Hoạt động
          </a>
          <a
            href="#news"
            onClick={goto('news')}
            className={`nav-link ${activeSection === 'news' ? 'active' : ''}`}
          >
            Tin tức
          </a>
          <a
            href="#contact"
            onClick={goto('contact')}
            className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
          >
            Liên hệ
          </a>
          <Link
            to={ROUTES.CART}
            className="nav-link cart-link"
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
          >
            <span className="cart-link-icon" aria-hidden="true">
              <FiShoppingBag />
            </span>
            <span className="cart-link-text">Giỏ hàng</span>
            <span className="cart-link-count">{count}</span>
          </Link>
          {isCustomer && (
            <NavLink
              to={ROUTES.MY_ORDERS}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Đơn của tôi
            </NavLink>
          )}
        </nav>

        <div className="header-cta">
          {isGuest ? (
            <Link className="btn login-btn" to={ROUTES.LOGIN}>
              Login
            </Link>
          ) : (
            <button
              className="btn login-btn"
              onClick={() => {
                toast.show({
                  message: MESSAGES.CONFIRM.LOGOUT,
                  type: 'warning',
                  actionLabel: 'Đăng xuất',
                  onAction: () => {
                    logout();
                    navigate(ROUTES.HOME);
                  },
                });
              }}
            >
              Logout ({customerName})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
