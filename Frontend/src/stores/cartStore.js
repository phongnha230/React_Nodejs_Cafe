import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import { useProductStore } from './productStore.js';
import { ROLES } from '../constants/roles';

function getCartKey() {
  const auth = storage.get('auth_state', { role: ROLES.GUEST, customerName: null });
  if (auth.role === ROLES.ADMIN) return 'cart_admin';
  if (auth.role === ROLES.CUSTOMER) {
    const name = (auth.customerName || 'anon').toString().trim().toLowerCase().replace(/\s+/g, '_');
    return `cart_customer_${name}`;
  }
  return 'cart_guest';
}

function normalizeCartItems(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      productId: item?.productId,
      quantity: Number(item?.quantity) || 0,
    }))
    .filter((item) => item.productId !== undefined && item.productId !== null && item.quantity > 0);
}

function readCartItems() {
  const items = normalizeCartItems(storage.get(getCartKey(), []));
  storage.set(getCartKey(), items);
  return items;
}

const initial = readCartItems();

export const useCartStore = create((set, get) => ({
  items: initial,
  add(productId) {
    const items = [...get().items];
    const found = items.find(i => i.productId === productId);
    if (found) found.quantity += 1; else items.push({ productId, quantity: 1 });
    set({ items }); storage.set(getCartKey(), items);
  },
  remove(productId) {
    const items = get().items.map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0);
    set({ items }); storage.set(getCartKey(), items);
  },
  clear() { set({ items: [] }); storage.set(getCartKey(), []); },
  reloadFromStorage() {
    set({ items: readCartItems() });
  },
  total() {
    const prods = useProductStore.getState().products;
    return get().items.reduce((sum, i) => {
      const p = prods.find(p => p.id === i.productId);
      return sum + (p ? p.price * i.quantity : 0);
    }, 0);
  },
  detailed() {
    const prods = useProductStore.getState().products;
    return get().items.map(i => ({ ...i, product: prods.find(p => p.id === i.productId) }));
  }
}));
