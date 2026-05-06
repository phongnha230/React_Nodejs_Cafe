import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import orderService from '../services/orderService.js';

const initial = storage.get('orders', []);

export const useOrderStore = create((set, get) => ({
  orders: initial,
  loading: false,
  error: null,

  // Load orders from API (MySQL Database)
  async loadFromAPI() {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getAll();
      const payload = response.data;
      const apiOrders = Array.isArray(payload) ? payload : (payload?.data || []);

      // Normalize API data to match frontend store schema
      const normalized = apiOrders.map((o) => ({
        ...o,
        total: Number(o.total ?? o.total_amount ?? 0) || 0,
        createdAt: o.createdAt || o.created_at,
        address: o.address || (o.table_number ? `Bàn số ${o.table_number}` : 'Mang về'),
        // Backend order doesn't have paymentMethod yet, preserve if exists or default
        paymentMethod: o.paymentMethod || 'direct',
        items: Array.isArray(o.items) ? o.items.map(i => ({
          ...i,
          productId: i.productId ?? i.product_id,
        })) : [],
        // Ensure status is preserved from backend
        status: o.status || 'pending',
      }));

      // Nếu API có dữ liệu, dùng API; nếu không, dùng localStorage
      if (normalized.length > 0) {
        set({ orders: normalized, loading: false });
        storage.set('orders', normalized); // Cache vào localStorage
        return normalized;
      } else {
        // Không có dữ liệu từ API, dùng localStorage
        set({ loading: false });
        return get().orders;
      }
    } catch (error) {
      console.error('Load orders from API failed:', error);
      set({ error: error.message, loading: false });
      // Fallback to localStorage on error
      return get().orders;
    }
  },

  async place(order) {
    set({ loading: true, error: null });
    try {
      // Call backend API to create order
      const response = await orderService.create({
        // Backend expects an integer table_number. Extract number from address like "Bàn số 1".
        table_number: (() => {
          const n = parseInt(String(order.address || '').replace(/\D+/g, ''));
          return Number.isInteger(n) && n > 0 ? n : 1;
        })(),
        note: order.note || null,
        items: order.items.map(item => ({
          product_id: Number(item.productId) || 0,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.product?.price) || 0,
        })),
      });

      const createdOrder = response.data.order;

      // Format for frontend store
      const formatted = {
        id: createdOrder.id,
        customerName: order.customerName,
        items: order.items,
        total: createdOrder.total_amount,
        createdAt: createdOrder.created_at,
        paymentMethod: order.paymentMethod,
        address: order.address,
        status: createdOrder.status,
      };

      // Add to local store
      const next = [formatted, ...get().orders];
      set({ orders: next, loading: false });
      storage.set('orders', next);

      return createdOrder.id;
    } catch (error) {
      console.error('Create order failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  async updateStatus(id, status) {
    try {
      // Update backend first
      await orderService.updateStatus(id, { status });

      // Then update local state
      const next = get().orders.map(o => o.id === id ? { ...o, status } : o);
      set({ orders: next });
      storage.set('orders', next);
    } catch (error) {
      console.error('Update order status failed:', error);
      // Still update locally even if backend fails
      const next = get().orders.map(o => o.id === id ? { ...o, status } : o);
      set({ orders: next });
      storage.set('orders', next);
    }
  },
  stats() {
    const orders = get().orders;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const map = new Map();
    for (const o of orders) {
      const v = map.get(o.customerName) ?? { total: 0, count: 0 };
      v.total += o.total; v.count += 1;
      map.set(o.customerName, v);
    }
    const topBuyers = Array.from(map.entries())
      .map(([customerName, v]) => ({ customerName, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    return { totalOrders, totalRevenue, topBuyers };
  }
}));
