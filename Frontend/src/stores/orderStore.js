import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import orderService from '../services/orderService.js';

const initial = storage.get('orders', []);

const toAddress = (order) => {
  const tableNumber = order?.table?.table_number ?? order?.tableNumber ?? order?.table_number ?? null;
  return order?.address || (tableNumber ? `Ban ${tableNumber}` : 'Mang ve');
};

const getPrimaryPayment = (order) => (
  Array.isArray(order?.payments) && order.payments.length > 0
    ? order.payments[0]
    : null
);

const getCustomerName = (order) => (
  order?.customerName ||
  order?.guest_name ||
  order?.User?.name ||
  order?.User?.username ||
  'Khach QR'
);

export const useOrderStore = create((set, get) => ({
  orders: initial,
  loading: false,
  error: null,

  async loadFromAPI() {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getAll();
      const payload = response.data;
      const apiOrders = Array.isArray(payload) ? payload : (payload?.data || []);

      const normalized = apiOrders.map((order) => {
        const primaryPayment = getPrimaryPayment(order);

        return {
          ...order,
          customerName: getCustomerName(order),
          total: Number(order.total ?? order.total_amount ?? 0) || 0,
          createdAt: order.createdAt || order.created_at,
          tableId: order.tableId ?? order.table_id ?? order.table?.id ?? null,
          tableNumber: order.tableNumber ?? order.table_number ?? order.table?.table_number ?? null,
          address: toAddress(order),
          paymentMethod: primaryPayment?.method || order.paymentMethod || 'cash',
          paymentStatus: primaryPayment?.status || order.paymentStatus || null,
          items: Array.isArray(order.items) ? order.items.map((item) => ({
            ...item,
            productId: item.productId ?? item.product_id,
          })) : [],
          status: order.status || 'pending',
        };
      });

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
        paymentMethod: order.paymentMethod === 'direct' ? 'cash' : order.paymentMethod,
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

  async placeGuest(order) {
    set({ loading: true, error: null });
    try {
      const response = await orderService.createGuest({
        guest_name: order.customerName,
        payment_method: order.paymentMethod === 'direct' ? 'cash' : order.paymentMethod,
        table_id: Number(order.tableId) || null,
        table_number: Number(order.tableNumber) || null,
        ts: Number(order.qrTimestamp) || null,
        sig: order.qrSignature || null,
        note: order.note || null,
        items: order.items.map((item) => ({
          product_id: Number(item.productId) || 0,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.product?.price) || 0,
        })),
      });

      const createdOrder = response.data?.data?.order ?? response.data?.order;
      const guestName = response.data?.data?.guest_name || order.customerName || 'Khach QR';
      if (!createdOrder) {
        throw new Error('Invalid guest order response');
      }

      const formatted = {
        id: createdOrder.id,
        customerName: guestName,
        items: order.items,
        total: createdOrder.total_amount,
        createdAt: createdOrder.created_at,
        paymentMethod: order.paymentMethod === 'direct' ? 'cash' : order.paymentMethod,
        paymentStatus: 'pending',
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
      console.error('Create guest order failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      await orderService.updateStatus(id, { status });

      const next = get().orders.map((order) => (
        order.id === id
          ? {
            ...order,
            status,
            paymentStatus: status === 'delivered'
              ? (order.paymentStatus || 'completed')
              : order.paymentStatus,
          }
          : order
      ));
      set({ orders: next });
      storage.set('orders', next);
    } catch (error) {
      console.error('Update order status failed:', error);
      throw error;
    }
  },

  stats() {
    const orders = get().orders || [];
    const deliveredOrders = orders.filter((order) => order.status === 'delivered');
    const totalOrders = orders.length;
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    // Status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Daily revenue (last 7 days)
    const dailyRevenue = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyRevenue[dateStr] = 0;
    }

    deliveredOrders.forEach(order => {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyRevenue[dateStr] !== undefined) {
        dailyRevenue[dateStr] += (Number(order.total) || 0);
      }
    });

    const map = new Map();
    for (const order of orders) {
      const name = order.customerName || 'Khách vãng lai';
      const value = map.get(name) ?? { total: 0, count: 0 };
      value.total += (Number(order.total) || 0);
      value.count += 1;
      map.set(name, value);
    }

    const topBuyers = Array.from(map.entries())
      .map(([customerName, value]) => ({ customerName, ...value }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue: totalRevenue || 0,
      realRevenue: totalRevenue || 0,
      displayRevenue: totalRevenue || 0,
      topBuyers,
      topProducts: [],
      statusBreakdown,
      dailyRevenue,
      totalProductsSold: deliveredOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0)
    };
  }
}));
