import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import reviewService from '../services/reviewService.js';

const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : `r_${Date.now()}_${Math.random().toString(36).slice(2)}`);

export const useReviewStore = create((set, get) => ({
  reviews: storage.get('reviews') || [],
  loading: false,
  error: null,

  // Load reviews from API (MySQL Database)
  async loadFromAPI(productId = null) {
    set({ loading: true, error: null });
    try {
      const params = productId ? { product_id: productId } : {};
      const response = await reviewService.getAll(params);
      const apiReviews = response.data || [];
      set({ reviews: apiReviews, loading: false });
      storage.set('reviews', apiReviews);
      return apiReviews;
    } catch (error) {
      console.error('Load reviews from API failed:', error);
      set({ error: error.message, loading: false });
      return get().reviews;
    }
  },

  // Add new review
  async add({ productId, userName, rating, comment }) {
    set({ loading: true, error: null });
    try {
      const response = await reviewService.create({
        product_id: productId,
        userName,
        rating: Number(rating) || 0,
        comment: comment || ''
      });
      const newReview = response.data;
      const next = [newReview, ...get().reviews];
      set({ reviews: next, loading: false });
      storage.set('reviews', next);
      return newReview.id;
    } catch (error) {
      console.error('Add review failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Remove review (admin only)
  async remove(id) {
    set({ loading: true, error: null });
    try {
      await reviewService.delete(id);
      const next = get().reviews.filter(r => r.id !== id);
      set({ reviews: next, loading: false });
      storage.set('reviews', next);
    } catch (error) {
      console.error('Remove review failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get reviews for a specific product
  forProduct(productId) {
    const pid = Number(productId);
    return get().reviews.filter(r => (Number(r.product_id) === pid || Number(r.productId) === pid));
  },

  // Calculate average rating for a product
  average(productId) {
    const pid = Number(productId);
    const list = get().reviews.filter(r => (Number(r.product_id) === pid || Number(r.productId) === pid));
    if (!list.length) return { avg: 0, count: 0 };
    const sum = list.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return { avg: sum / list.length, count: list.length };
  },

  // Check if user has already reviewed a product
  getReview(productId, userName) {
    const pid = Number(productId);
    return get().reviews.find(r => (Number(r.product_id) === pid || Number(r.productId) === pid) && r.userName === userName);
  },

  hasReviewed(productId, userName) {
    const pid = Number(productId);
    return !!get().reviews.find(r => (Number(r.product_id) === pid || Number(r.productId) === pid) && r.userName === userName);
  },

  // Update a review
  async updateReview(id, { rating, comment }) {
    set({ loading: true, error: null });
    try {
      const response = await reviewService.update(id, { rating, comment });
      const updated = response.data;
      const next = get().reviews.map(r => r.id === id ? updated : r);
      set({ reviews: next, loading: false });
      storage.set('reviews', next);
      return updated;
    } catch (error) {
      console.error('Update review failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
