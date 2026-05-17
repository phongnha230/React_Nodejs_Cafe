import { create } from 'zustand';
import voucherService from '../services/voucherService.js';

const getPayload = (response, fallback = []) => response?.data?.data ?? fallback;

export const useVoucherStore = create((set, get) => ({
  coins: 0,
  vouchers: [],
  walletVouchers: [],
  loading: false,
  error: null,

  async loadVouchers() {
    set({ loading: true, error: null });
    try {
      const response = await voucherService.getAll();
      const vouchers = getPayload(response, []);
      set({ vouchers, loading: false });
      return vouchers;
    } catch (error) {
      set({ error: error.message, loading: false });
      return get().vouchers;
    }
  },

  async loadWallet() {
    set({ loading: true, error: null });
    try {
      const response = await voucherService.getWallet();
      const wallet = getPayload(response, { coins: 0, vouchers: [] });
      set({
        coins: Number(wallet.coins || 0),
        walletVouchers: Array.isArray(wallet.vouchers) ? wallet.vouchers : [],
        loading: false,
      });
      return wallet;
    } catch (error) {
      set({ error: error.message, loading: false });
      return { coins: get().coins, vouchers: get().walletVouchers };
    }
  },

  async redeem(id) {
    set({ loading: true, error: null });
    try {
      await voucherService.redeem(id);
      await get().loadWallet();
      await get().loadVouchers();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  async loadAdminVouchers() {
    set({ loading: true, error: null });
    try {
      const response = await voucherService.getAdminAll();
      const vouchers = getPayload(response, []);
      set({ vouchers, loading: false });
      return vouchers;
    } catch (error) {
      set({ error: error.message, loading: false });
      return get().vouchers;
    }
  },

  async createVoucher(data) {
    set({ loading: true, error: null });
    try {
      await voucherService.create(data);
      await get().loadAdminVouchers();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  async updateVoucher(id, data) {
    set({ loading: true, error: null });
    try {
      await voucherService.update(id, data);
      await get().loadAdminVouchers();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  async deleteVoucher(id) {
    set({ loading: true, error: null });
    try {
      const response = await voucherService.delete(id);
      await get().loadAdminVouchers();
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
