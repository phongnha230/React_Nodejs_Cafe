import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import { useCartStore } from './cartStore.js';
import { ROLES } from '../constants/roles';
import authServices from '../services/authServices.js';


const saved = storage.get('auth_state', { role: ROLES.GUEST, customerName: null, token: null });

export const useAuthStore = create((set, get) => ({
  role: saved.role,
  customerName: saved.customerName,
  token: saved.token,
  loading: false,
  error: null,

  // Set auth data sau khi login (sync - không gọi API)
  setAuthData({ token, role, username }) {
    localStorage.setItem('token', token);
    set({ role, customerName: username, token });
    storage.set('auth_state', { role, customerName: username, token });
    try { useCartStore.getState().reloadFromStorage(); } catch { }
  },

  // Login với API
  async login(credentials) {
    set({ loading: true, error: null });
    try {
      const response = await authServices.login(credentials);

      // Backend trả về: { token, user: { id, username, email, role } }
      const { token, user } = response.data;
      const { role, username } = user;

      // Sử dụng setAuthData để lưu state
      get().setAuthData({ token, role, username });
      set({ loading: false });

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      set({ error: error.message || 'Đăng nhập thất bại', loading: false });
      throw error;
    }
  },

  // Register với API
  async register(userData) {
    set({ loading: true, error: null });
    try {
      const response = await authServices.register(userData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error('Register failed:', error);
      set({ error: error.message || 'Đăng ký thất bại', loading: false });
      throw error;
    }
  },

  // Logout với API
  async logout() {
    set({ loading: true, error: null });
    try {
      await authServices.logout();
      localStorage.removeItem('token');
      set({
        role: ROLES.GUEST,
        customerName: null,
        token: null,
        loading: false
      });
      storage.set('auth_state', { role: ROLES.GUEST, customerName: null, token: null });
      try { useCartStore.getState().reloadFromStorage(); } catch { }
    } catch (error) {
      console.error('Logout failed:', error);
      // Vẫn logout ở client dù API lỗi
      localStorage.removeItem('token');
      set({
        role: ROLES.GUEST,
        customerName: null,
        token: null,
        loading: false,
        error: error.message
      });
      storage.set('auth_state', { role: ROLES.GUEST, customerName: null, token: null });
    }
  },

  // Forgot password
  async forgotPassword(email) {
    set({ loading: true, error: null });
    try {
      const response = await authServices.forgotPassword(email);
      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error('Forgot password failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Reset password
  async resetPassword(token, data) {
    set({ loading: true, error: null });
    try {
      const response = await authServices.resetPassword(token, data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error('Reset password failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Verify token on app startup - returns true if token is valid
  async verifyToken() {
    const currentToken = get().token;
    if (!currentToken) {
      return false;
    }

    set({ loading: true, error: null });
    try {
      // Call profile endpoint to verify token is still valid
      const api = (await import('../utils/api.js')).default;
      const response = await api.get('/users/me');

      // Token is valid, update user info if needed
      const user = response.data;
      set({
        customerName: user.username || get().customerName,
        role: user.role || get().role,
        loading: false
      });
      storage.set('auth_state', {
        role: user.role || get().role,
        customerName: user.username || get().customerName,
        token: currentToken
      });

      console.log('✅ Token verified - User:', user.username);
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);

      // CHỈ logout khi token thực sự không hợp lệ (401/403)
      // KHÔNG logout khi lỗi mạng hoặc server chưa sẵn sàng
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        // Token thực sự invalid hoặc expired - cần logout
        console.log('❌ Token expired or invalid - logging out');
        localStorage.removeItem('token');
        set({
          role: ROLES.GUEST,
          customerName: null,
          token: null,
          loading: false
        });
        storage.set('auth_state', { role: ROLES.GUEST, customerName: null, token: null });
        return false;
      } else {
        // Lỗi mạng hoặc server chưa sẵn sàng - GIỮ NGUYÊN đăng nhập
        console.log('⚠️ Network error or server unavailable - keeping auth state');
        set({ loading: false });
        return true; // Giả sử token vẫn valid
      }
    }
  }
}));
