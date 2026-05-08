import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header.jsx';
import { Footer } from './components/layout/Footer.jsx';
import HomePage from './pages/Home/HomePage.jsx';
import { MenuPage } from './pages/Product/MenuPage.jsx';
import { CartPage } from './pages/Order/CartPage.jsx';
import { LoginPage } from './pages/Auth/LoginPage.jsx';
import { AdminDashboard } from './pages/Admin/AdminDashboardPage.jsx';
import { RevenuePage } from './pages/Admin/RevenuePage.jsx';
import { AccountsPage } from './pages/Admin/AccountsPage.jsx';
import { AdminMenuPage } from './pages/Admin/MenuPage.jsx';
import { AdminNewsPage } from './pages/Admin/NewsPage.jsx';
import { ActivitiesPage } from './pages/Admin/ActivitiesPage.jsx';
import { OrdersPage } from './pages/Admin/OrdersPage.jsx';
import { TablesPage } from './pages/Admin/TablesPage.jsx';
import { ProductReviews } from './pages/Product/ProductReviewsPage.jsx';
import { CustomerOrders } from './pages/Order/CustomerOrdersPage.jsx';
import { NotFoundPage } from './pages/NotFound/NotFoundPage.jsx';
import { useAuthStore } from './stores/authStore.js';
import { useNotifyStore } from './stores/notifyStore.js';
import { useState, useEffect, useCallback } from 'react';
import { ROUTES } from './config/routes';
import { ROLES } from './constants/roles';
import { getAdminSectionFromPathname, getAdminSectionHref } from './pages/Admin/adminSections';
import { Sidebar } from './components/layout/Sidebar.jsx';

export default function App() {
  const role = useAuthStore(s => s.role);
  const verifyToken = useAuthStore(s => s.verifyToken);
  const toast = useNotifyStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const isAdminPage = location.pathname.startsWith(ROUTES.ADMIN);
  const isStandaloneAuthPage = location.pathname === ROUTES.LOGIN;

  // Xác thực token khi mở app
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        await verifyToken();
      } catch (error) {
        console.error('Auth verification error:', error);
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, [verifyToken]);

  // Khóa cuộn trang khi mở Sidebar
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
  }, [sidebarOpen]);

  const handleTabChange = useCallback((section) => {
    navigate(getAdminSectionHref(section));
    setSidebarOpen(false);
  }, [navigate]);

  const activeTab = getAdminSectionFromPathname(location.pathname);

  if (isVerifying) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="loading-icon">☕</div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!isStandaloneAuthPage && (
        <Header onMenuClick={role === ROLES.ADMIN ? () => setSidebarOpen(true) : undefined} />
      )}

      {role === ROLES.ADMIN && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}

      <main className="main-content">
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path={ROUTES.CART} element={<CartPage />} />
          <Route path={ROUTES.MENU} element={<MenuPage />} />
          <Route path={ROUTES.PRODUCT_REVIEWS(':id')} element={<ProductReviews />} />
          <Route path={ROUTES.MY_ORDERS} element={<CustomerOrders />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          <Route
            path={`${ROUTES.ADMIN}/*`}
            element={
              role === ROLES.ADMIN ? (
                <AdminDashboard
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          >
            <Route index element={<Navigate to="revenue" replace />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="menu" element={<AdminMenuPage />} />
            <Route path="news" element={<AdminNewsPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="*" element={<Navigate to="revenue" replace />} />
          </Route>

          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isStandaloneAuthPage && !isAdminPage && <Footer />}

      {toast.open && (
        <div className={`toast ${toast.type}`} onClick={toast.hide}>
          <div className="toast-content" onClick={e => e.stopPropagation()}>
            <div className="toast-message">{toast.message}</div>
            {toast.actionLabel && (
              <button className="btn toast-action" onClick={() => {
                toast.hide();
                if (toast.onAction) toast.onAction();
              }}>{toast.actionLabel}</button>
            )}
            <button className="toast-close" onClick={toast.hide}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
