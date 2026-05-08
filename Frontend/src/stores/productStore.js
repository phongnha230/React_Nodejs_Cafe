import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import { products as seed } from '../data/menu.js';
import productService from '../services/productService.js';

const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : `p_${Date.now()}_${Math.random().toString(36).slice(2)}`);

const unwrapProduct = (response) => response?.data?.data ?? response?.data;

const formatProduct = (product) => ({
  id: product.id,
  name: product.name,
  price: parseFloat(product.price),
  category: product.category,
  image: product.image_url,
  is_available: !!product.is_available,
});

const initial = (() => {
  const saved = storage.get('products');
  if (Array.isArray(saved) && saved.length) return saved;
  storage.set('products', seed);
  return seed;
})();

export const useProductStore = create((set, get) => ({
  products: initial,
  loading: false,
  error: null,

  // Load products from API (MySQL Database)
  async loadFromAPI() {
    set({ loading: true, error: null });
    try {
      const response = await productService.getAll();
      const payload = response.data;
      const apiProducts = Array.isArray(payload) ? payload : (payload?.data || []);

      // Nếu API có dữ liệu, dùng API; nếu không, dùng localStorage
      if (apiProducts.length > 0) {
        const formattedProducts = apiProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          category: p.category,
          image: p.image_url, // Backend dùng image_url, frontend dùng image
          is_available: !!p.is_available,
        }));
        set({ products: formattedProducts, loading: false });
        storage.set('products', formattedProducts); // Cache vào localStorage
        return formattedProducts;
      } else {
        // Không có dữ liệu từ API, dùng localStorage
        set({ loading: false });
        return get().products;
      }
    } catch (error) {
      console.error('Load products from API failed:', error);
      set({ error: error.message, loading: false });
      // Fallback to localStorage on error
      return get().products;
    }
  },

  async add(product) {
    set({ loading: true, error: null });
    try {
      const response = await productService.create({
        name: product.name,
        price: product.price,
        category: product.category,
        image_url: product.image || '',
        description: product.description || null,
        is_available: product.is_available !== undefined ? product.is_available : true,
      });

      const createdProduct = unwrapProduct(response);
      const formatted = formatProduct(createdProduct);

      const next = [formatted, ...get().products];
      set({ products: next, loading: false });
      storage.set('products', next);

      return formatted.id;
    } catch (error) {
      console.error('Add product failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  async update(id, patch) {
    set({ loading: true, error: null });
    try {
      // Only send fields that are present in the patch
      const updateData = {};
      if (patch.name !== undefined) updateData.name = patch.name;
      if (patch.price !== undefined) updateData.price = patch.price;
      if (patch.category !== undefined) updateData.category = patch.category;
      if (patch.image !== undefined) updateData.image_url = patch.image;
      if (patch.is_available !== undefined) updateData.is_available = patch.is_available;

      const response = await productService.update(id, updateData);
      const updatedProduct = unwrapProduct(response);
      const formatted = updatedProduct ? formatProduct(updatedProduct) : null;

      const next = get().products.map(p => (
        p.id === id ? (formatted || { ...p, ...patch }) : p
      ));
      set({ products: next, loading: false });
      storage.set('products', next);
    } catch (error) {
      console.error('Update product failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  async remove(id) {
    set({ loading: true, error: null });
    try {
      await productService.delete(id);

      const next = get().products.filter(p => p.id !== id);
      set({ products: next, loading: false });
      storage.set('products', next);
    } catch (error) {
      console.error('Remove product failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
