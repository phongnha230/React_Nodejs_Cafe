import { useAuthStore } from '../stores/authStore.js';
import { ROLES } from '../constants/roles';

/**
 * Custom hook để sử dụng authentication state và actions
 * @returns {Object} Auth state và actions
 */
export function useAuth() {
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const customerName = useAuthStore((s) => s.customerName);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = !!token;
  const isAdmin = role === ROLES.ADMIN;
  const isCustomer = role === ROLES.CUSTOMER;
  const isGuest = role === ROLES.GUEST;

  return {
    role,
    token,
    customerName,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isCustomer,
    isGuest,
  };
}

