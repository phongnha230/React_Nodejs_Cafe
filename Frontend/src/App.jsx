import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header.jsx';
import { Footer } from './components/layout/Footer.jsx';
import HomePage from './pages/Home/HomePage.jsx';
import { MenuPage } from './pages/Product/MenuPage.jsx';
import { PublicActivitiesPage } from './pages/Activities/ActivitiesPage.jsx';
import { PublicNewsPage } from './pages/News/NewsPage.jsx';
import { NewsDetailPage } from './pages/News/NewsDetailPage.jsx';
import { CartPage } from './pages/Order/CartPage.jsx';
import { LoginPage } from './pages/Auth/LoginPage.jsx';
import { AdminDashboard } from './pages/Admin/AdminDashboardPage.jsx';
import { RevenuePage } from './pages/Admin/RevenuePage.jsx';
import { AccountsPage } from './pages/Admin/AccountsPage.jsx';
import { AdminMenuPage } from './pages/Admin/MenuPage.jsx';
import { AdminNewsPage } from './pages/Admin/NewsPage.jsx';
import { ActivitiesPage } from './pages/Admin/ActivitiesPage.jsx';
import { VouchersPage } from './pages/Admin/VouchersPage.jsx';
import { OrdersPage } from './pages/Admin/OrdersPage.jsx';
import { TablesPage } from './pages/Admin/TablesPage.jsx';
import ProductReviewsPage from './pages/Product/ProductReviewsPage.jsx';
import ProductDetailPage from './pages/Product/ProductDetailPage.jsx';
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
  const [isVerifying, setIsVerifying] = useState(false);

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

  const isCartPage = location.pathname === ROUTES.CART;
  const isActivitiesPage = location.pathname === ROUTES.ACTIVITIES;
  const isNewsPage = location.pathname === ROUTES.NEWS || location.pathname.startsWith(`${ROUTES.NEWS}/`);
  const isMenuPage = location.pathname === ROUTES.MENU;
  const isProductDetailPage = location.pathname.startsWith('/product/');
  const canAccessOrdersAdmin = [ROLES.ADMIN, ROLES.STAFF, ROLES.BARISTA].includes(role);

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
    <div className={`app ${isAdminPage ? 'admin-theme' : ''}`}>
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
          <Route path={ROUTES.ACTIVITIES} element={<PublicActivitiesPage />} />
          <Route path={ROUTES.NEWS} element={<PublicNewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path={ROUTES.PRODUCT_REVIEWS(':id')} element={<ProductReviewsPage />} />
          <Route path={ROUTES.MY_ORDERS} element={<CustomerOrders />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          <Route
            path={`${ROUTES.ADMIN}/*`}
            element={
              canAccessOrdersAdmin ? (
                <AdminDashboard
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          >
            <Route index element={<Navigate to={role === ROLES.ADMIN ? 'revenue' : 'orders'} replace />} />
            <Route path="revenue" element={role === ROLES.ADMIN ? <RevenuePage /> : <Navigate to="../orders" replace />} />
            <Route path="accounts" element={role === ROLES.ADMIN ? <AccountsPage /> : <Navigate to="../orders" replace />} />
            <Route path="menu" element={role === ROLES.ADMIN ? <AdminMenuPage /> : <Navigate to="../orders" replace />} />
            <Route path="news" element={role === ROLES.ADMIN ? <AdminNewsPage /> : <Navigate to="../orders" replace />} />
            <Route path="activities" element={role === ROLES.ADMIN ? <ActivitiesPage /> : <Navigate to="../orders" replace />} />
            <Route path="vouchers" element={role === ROLES.ADMIN ? <VouchersPage /> : <Navigate to="../orders" replace />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="tables" element={role === ROLES.ADMIN ? <TablesPage /> : <Navigate to="../orders" replace />} />
            <Route path="*" element={<Navigate to={role === ROLES.ADMIN ? 'revenue' : 'orders'} replace />} />
          </Route>

          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isStandaloneAuthPage && !isAdminPage && !isCartPage && !isActivitiesPage && !isNewsPage && !isMenuPage && !isProductDetailPage && <Footer />}

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
