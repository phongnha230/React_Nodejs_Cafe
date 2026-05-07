import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { useState, useEffect } from 'react';
import { ROUTES } from './config/routes';
import { ROLES } from './constants/roles';

export default function App() {
  const role = useAuthStore(s => s.role);
  const verifyToken = useAuthStore(s => s.verifyToken);
  const toast = useNotifyStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const isAdminPage = location.pathname.startsWith(ROUTES.ADMIN);
  const isHomePage = location.pathname === ROUTES.HOME;
  const isStandaloneAuthPage = location.pathname === ROUTES.LOGIN;

  // Verify token on app startup to maintain persistent login
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await verifyToken();
      } catch (error) {
        console.error('Auth verification error:', error);
      } finally {
        setIsVerifying(false);
      }
    };
    checkAuth();
  }, [verifyToken]);

  // Pass sidebar control to AdminDashboard via custom event
  useEffect(() => {
    if (isAdminPage) {
      const handler = () => setSidebarOpen(true);
      window.addEventListener('openAdminSidebar', handler);
      return () => window.removeEventListener('openAdminSidebar', handler);
    }
  }, [isAdminPage]);

  // Show loading while verifying token
  if (isVerifying) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>☕</div>
          <div>Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!isStandaloneAuthPage && (
        <Header onMenuClick={(isAdminPage || isHomePage) ? () => setSidebarOpen(true) : undefined} />
      )}
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
      {!isStandaloneAuthPage && <Footer />}
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
