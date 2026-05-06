import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import orderService from '../services/orderService.js';

const initial = storage.get('orders', []);

const toAddress = (order) => {
  const tableNumber = order?.table?.table_number ?? order?.tableNumber ?? order?.table_number ?? null;
  return order?.address || (tableNumber ? `Ban ${tableNumber}` : 'Mang ve');
};

export const useOrderStore = create((set, get) => ({
  orders: initial,
  serverStats: null,
  loading: false,
  error: null,

  async loadFromAPI() {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getAll();
      const payload = response.data;
      const apiOrders = Array.isArray(payload) ? payload : (payload?.data || []);

      const normalized = apiOrders.map((order) => ({
        ...order,
        total: Number(order.total ?? order.total_amount ?? 0) || 0,
        createdAt: order.createdAt || order.created_at,
        tableId: order.tableId ?? order.table_id ?? order.table?.id ?? null,
        tableNumber: order.tableNumber ?? order.table_number ?? order.table?.table_number ?? null,
        address: toAddress(order),
        paymentMethod: order.paymentMethod || 'direct',
        items: Array.isArray(order.items) ? order.items.map((item) => ({
          ...item,
          productId: item.productId ?? item.product_id,
        })) : [],
        status: order.status || 'pending',
      }));

      if (normalized.length > 0) {
        set({ orders: normalized, loading: false });
        storage.set('orders', normalized);
        return normalized;
      }

      set({ loading: false });
      return get().orders;
    } catch (error) {
      console.error('Load orders from API failed:', error);
      set({ error: error.message, loading: false });
      return get().orders;
    }
  },

  async place(order) {
    set({ loading: true, error: null });
    try {
      const response = await orderService.create({
        table_id: Number(order.tableId) || null,
        table_number: Number(order.tableNumber) || null,
        note: order.note || null,
        items: order.items.map((item) => ({
          product_id: Number(item.productId) || 0,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.product?.price) || 0,
        })),
      });

      const createdOrder = response.data?.data?.order ?? response.data?.order;
      if (!createdOrder) {
        throw new Error('Invalid create order response');
      }

      const formatted = {
        id: createdOrder.id,
        customerName: order.customerName,
        items: order.items,
        total: createdOrder.total_amount,
        createdAt: createdOrder.created_at,
        paymentMethod: order.paymentMethod,
        tableId: createdOrder.table_id ?? order.tableId ?? null,
        tableNumber: createdOrder.table_number ?? order.tableNumber ?? null,
        address: order.address || toAddress(createdOrder),
        status: createdOrder.status,
      };

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
      await orderService.updateStatus(id, { status });

      const next = get().orders.map((order) => (
        order.id === id ? { ...order, status } : order
      ));
      set({ orders: next });
      storage.set('orders', next);
    } catch (error) {
      console.error('Update order status failed:', error);
      const next = get().orders.map((order) => (
        order.id === id ? { ...order, status } : order
      ));
      set({ orders: next });
      storage.set('orders', next);
    }
  },

  async loadStatsFromAPI() {
    try {
      const response = await orderService.getStats();
      set({ serverStats: response.data });
      return response.data;
    } catch (error) {
      console.error('Load stats failed:', error);
    }
  },

  stats() {
    const orders = get().orders;
    const serverStats = get().serverStats;

    if (serverStats) {
      return {
        ...serverStats,
        displayRevenue: serverStats.realRevenue || 0
      };
    }

    const deliveredOrders = orders.filter((order) => order.status === 'delivered');
    const totalOrders = orders.length;
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
    const map = new Map();

    for (const order of orders) {
      const name = order.customerName || 'Khach vang lai';
      const value = map.get(name) ?? { total: 0, count: 0 };
      value.total += order.total;
      value.count += 1;
      map.set(name, value);
    }

    const topBuyers = Array.from(map.entries())
      .map(([customerName, value]) => ({ customerName, ...value }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      realRevenue: totalRevenue,
      displayRevenue: totalRevenue,
      topBuyers,
      topProducts: []
    };
  }
}));
