import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { useNotifyStore } from '../../stores/notifyStore.js';
import { ROUTES } from '../../config/routes';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { MESSAGES } from '../../constants/messages';

export function Sidebar({ isOpen, onClose, activeTab, onTabChange }) {
  const { role, customerName, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useNotifyStore();

  const handleLogout = () => {
    toast.show({
      message: MESSAGES.CONFIRM.LOGOUT,
      type: 'warning',
      actionLabel: 'Đăng xuất',
      onAction: () => {
        logout();
        navigate(ROUTES.HOME);
        onClose();
      },
    });
  };

  const menuItems = [
    { key: 'revenue', label: 'Xem doanh thu', icon: '📊' },
    { key: 'accounts', label: 'Quản lý đăng nhập', icon: '👥' },
    { key: 'menu', label: 'Thực đơn', icon: '☕' },
    { key: 'news', label: 'Tin tức', icon: '📰' },
    { key: 'activities', label: 'Hoạt động', icon: '📸' },
    { key: 'orders', label: 'Quản lý đơn hàng', icon: '📦' },
    { key: 'payments', label: 'Quản lý thanh toán', icon: '💳' },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Dashboard</h3>
          <button className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-item ${
                activeTab === item.key ? 'active' : ''
              }`}
              onClick={() => {
                // Always go to /admin to show dashboard content
                navigate(ROUTES.ADMIN);
                // Defer state change slightly to allow route switch
                setTimeout(() => {
                  if (onTabChange) onTabChange(item.key);
                  if (onClose) onClose();
                }, 0);
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-icon">👤</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{customerName || 'Admin'}</div>
              <div className="sidebar-user-role">
                {ROLE_LABELS[role] || 'Người dùng'}
              </div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  )
}

