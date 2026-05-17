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

const parseOrderDate = (value) => {
  if (!value) return new Date();
  let date = new Date(value);
  
  // If standard parsing fails, try to handle DD/MM/YYYY format from the screenshot
  if (Number.isNaN(date.getTime()) && typeof value === 'string') {
    // Check if it matches "HH:mm:ss DD/MM/YYYY" or just "DD/MM/YYYY"
    const parts = value.split(' ');
    const datePart = parts.length > 1 ? parts[1] : parts[0];
    const dateParts = datePart.split('/');
    
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed
      const year = parseInt(dateParts[2], 10);
      
      // If there was a time part, try to use it too
      if (parts.length > 1 && parts[0].includes(':')) {
        const timeParts = parts[0].split(':');
        date = new Date(year, month, day, 
          parseInt(timeParts[0], 10), 
          parseInt(timeParts[1], 10), 
          parseInt(timeParts[2], 10));
      } else {
        date = new Date(year, month, day);
      }
    }
  }
  return date;
};

const getLocalDateKey = (value) => {
  const date = parseOrderDate(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getOrderTotal = (order) => {
  const total = Number(order?.total ?? order?.total_amount ?? 0) || 0;

  if (total > 0) {
    return total;
  }

  return (order?.items || []).reduce((sum, item) => sum + getItemSubtotal(item), 0);
};

const getItemQuantity = (item) => Number(item?.quantity ?? item?.qty ?? 1) || 1;

const getItemUnitPrice = (item) => (
  Number(item?.unitPrice ?? item?.unit_price ?? item?.product?.price ?? item?.Product?.price ?? 0) || 0
);

const getItemSubtotal = (item) => {
  const subtotal = Number(item?.subtotal);
  return Number.isFinite(subtotal) && subtotal > 0
    ? subtotal
    : getItemQuantity(item) * getItemUnitPrice(item);
};

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
          subtotal: Number(order.subtotal ?? order.subtotal_amount ?? order.total_amount ?? 0) || 0,
          discountAmount: Number(order.discountAmount ?? order.discount_amount ?? 0) || 0,
          voucher: order.voucher || null,
          userVoucherId: order.user_voucher_id || null,
          createdAt: order.createdAt || order.created_at,
          tableId: order.tableId ?? order.table_id ?? order.table?.id ?? null,
          tableNumber: order.tableNumber ?? order.table_number ?? order.table?.table_number ?? null,
          address: toAddress(order),
          paymentMethod: primaryPayment?.method || order.paymentMethod || 'cash',
          paymentStatus: primaryPayment?.status || order.paymentStatus || null,
          items: Array.isArray(order.items) ? order.items.map((item) => {
            const product = item.product || item.Product || null;

            return {
              ...item,
              product,
              productId: item.productId ?? item.product_id,
              productName: product?.name || item.productName || item.name,
              productImage: product?.image_url || item.productImage || item.image,
              unitPrice: Number(item.unitPrice ?? item.unit_price ?? product?.price ?? 0) || 0,
              subtotal: Number(item.subtotal ?? 0) || 0,
            };
          }) : [],
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
        voucher_code: order.voucherCode || null,
        user_voucher_id: order.userVoucherId || null,
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
        subtotal: createdOrder.subtotal_amount,
        discountAmount: createdOrder.discount_amount,
        voucher: createdOrder.voucher || null,
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

      return createdOrder;
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
        voucher_code: order.voucherCode || null,
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
        subtotal: createdOrder.subtotal_amount,
        discountAmount: createdOrder.discount_amount,
        voucher: createdOrder.voucher || null,
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

      return createdOrder;
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

  stats(range = '7d') {
    const orders = get().orders || [];
    const billableOrders = orders.filter((order) => order.status !== 'cancelled');
    
    const now = new Date();
    let startDate = new Date(0); // Default: All time

    if (range === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'all') {
      startDate = new Date(0);
    }

    const ordersInPeriod = orders.filter(o => {
      const orderDate = parseOrderDate(o.createdAt || o.created_at);
      return orderDate >= startDate;
    });

    const filteredOrders = ordersInPeriod.filter((order) => order.status !== 'cancelled');

    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    // Status breakdown (use all orders in the period, including cancelled)
    const statusBreakdown = ordersInPeriod.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Revenue chart data
    const dailyRevenue = {};
    if (range === '24h') {
      // Group by hour for last 24h
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourStr = `${d.getHours()}h`;
        dailyRevenue[hourStr] = 0;
      }

      filteredOrders.forEach(order => {
        const d = parseOrderDate(order.createdAt || order.created_at);
        const hourStr = `${d.getHours()}h`;
        if (dailyRevenue[hourStr] !== undefined) {
          dailyRevenue[hourStr] += getOrderTotal(order);
        }
      });
    } else if (range === 'all') {
      // Group by MONTH for 'all' range
      filteredOrders.forEach(order => {
        const d = parseOrderDate(order.createdAt || order.created_at);
        const monthStr = `${d.getMonth() + 1}/${d.getFullYear()}`;
        dailyRevenue[monthStr] = (dailyRevenue[monthStr] || 0) + getOrderTotal(order);
      });
      
      // Sort months chronologically
      const sortedKeys = Object.keys(dailyRevenue).sort((a, b) => {
        const [m1, y1] = a.split('/').map(Number);
        const [m2, y2] = b.split('/').map(Number);
        return y1 !== y2 ? y1 - y2 : m1 - m2;
      });
      
      const sortedRevenue = {};
      sortedKeys.forEach(k => { sortedRevenue[k] = dailyRevenue[k]; });
      Object.keys(dailyRevenue).forEach(k => delete dailyRevenue[k]);
      sortedKeys.forEach(k => { dailyRevenue[k] = sortedRevenue[k]; });

    } else {
      // Group by day
      let daysCount = 7;
      if (range === '30d') daysCount = 30;
      else if (range === 'month') {
        // From 1st of current month to now
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        daysCount = Math.ceil((now.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      }

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateKey(d);
        dailyRevenue[dateStr] = 0;
      }

      filteredOrders.forEach(order => {
        const dateStr = getLocalDateKey(order.createdAt || order.created_at);
        if (dailyRevenue[dateStr] !== undefined) {
          dailyRevenue[dateStr] += getOrderTotal(order);
        }
      });
    }

    const map = new Map();
    for (const order of filteredOrders) {
      const name = order.customerName || 'Khách vãng lai';
      const value = map.get(name) ?? { total: 0, count: 0 };
      value.total += getOrderTotal(order);
      value.count += 1;
      map.set(name, value);
    }

    const topBuyers = Array.from(map.entries())
      .map(([customerName, value]) => ({ customerName, ...value }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const productMap = new Map();
    for (const order of filteredOrders) {
      for (const item of order.items || []) {
        const id = item.productId ?? item.product_id ?? item.product?.id ?? item.Product?.id ?? item.productName ?? item.name;
        const name = item.productName || item.name || item.product?.name || item.Product?.name || 'Sản phẩm';
        const value = productMap.get(id) ?? { id, name, quantity: 0, revenue: 0 };

        value.quantity += getItemQuantity(item);
        value.revenue += getItemSubtotal(item);
        productMap.set(id, value);
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue: totalRevenue || 0,
      realRevenue: totalRevenue || 0,
      displayRevenue: totalRevenue || 0,
      topBuyers,
      topProducts,
      statusBreakdown,
      dailyRevenue,
      totalProductsSold: filteredOrders.reduce(
        (sum, o) => sum + (o.items || []).reduce((itemSum, item) => itemSum + getItemQuantity(item), 0),
        0
      )
    };
  }
}));
