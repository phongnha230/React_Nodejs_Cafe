import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import paymentService from '../services/paymentService.js';

export const usePaymentStore = create((set, get) => ({
  payments: [],
  loading: false,
  error: null,

  // Load payments from API (MySQL Database)
  async loadFromAPI(params = {}) {
    set({ loading: true, error: null });
    try {
      const response = await paymentService.getAll(params);
      const apiPayments = response.data || [];

      // Luôn dùng dữ liệu từ API (kể cả khi rỗng)
      set({ payments: apiPayments, loading: false });
      if (apiPayments.length > 0) {
        storage.set('payments', apiPayments); // Cache vào localStorage
      } else {
        localStorage.removeItem('payments'); // Xóa localStorage nếu API rỗng
      }
      return apiPayments;
    } catch (error) {
      console.error('Load payments from API failed:', error);
      set({ error: error.message, loading: false });
      // Fallback to localStorage on error
      return get().payments;
    }
  },

  // Get payment by ID
  async getById(id) {
    set({ loading: true, error: null });
    try {
      const response = await paymentService.getById(id);
      const payment = response.data;
      set({ loading: false });
      return payment;
    } catch (error) {
      console.error('Get payment by ID failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Thêm thanh toán mới
  async add(paymentData) {
    set({ loading: true, error: null });
    try {
      const response = await paymentService.create(paymentData);
      const newPayment = response.data;
      
      const next = [newPayment, ...get().payments];
      set({ payments: next, loading: false });
      storage.set('payments', next);
      return newPayment;
    } catch (error) {
      console.error('Add payment failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Cập nhật thông tin thanh toán
  async update(id, data) {
    set({ loading: true, error: null });
    try {
      const response = await paymentService.update(id, data);
      const updatedPayment = response.data;
      
      const next = get().payments.map(p =>
        p.id === id ? { ...p, ...data } : p
      );
      set({ payments: next, loading: false });
      storage.set('payments', next);
      return updatedPayment;
    } catch (error) {
      console.error('Update payment failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Cập nhật trạng thái thanh toán (helper method)
  async updateStatus(id, status) {
    return await get().update(id, { status });
  },

  // Xóa thanh toán
  async remove(id) {
    set({ loading: true, error: null });
    try {
      await paymentService.delete(id);
      const next = get().payments.filter(p => p.id !== id);
      set({ payments: next, loading: false });
      storage.set('payments', next);
    } catch (error) {
      console.error('Remove payment failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Set toàn bộ danh sách payments (for admin dashboard)
  setPayments(payments) {
    set({ payments });
    storage.set('payments', payments);
  }
}));
