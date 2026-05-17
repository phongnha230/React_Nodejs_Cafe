import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import reviewService from '../services/reviewService.js';

const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : `r_${Date.now()}_${Math.random().toString(36).slice(2)}`);

const unwrapReview = (response) => response?.data?.data ?? response?.data;

const getReviewUserName = (review = {}) => (
  review.userName ||
  review.customerName ||
  review.customer_name ||
  review.User?.username ||
  review.user?.username ||
  null
);

const formatReview = (review, fallback = {}) => ({
  ...review,
  userName: getReviewUserName(review) || fallback.userName || null,
  media_url: review.media_url || review.mediaUrl || fallback.mediaUrl || fallback.media_url || null,
});

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
      const payload = response.data;
      const apiReviews = Array.isArray(payload) ? payload : (payload?.data || []);
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
  async add({ productId, userName, rating, comment, mediaUrl }) {
    set({ loading: true, error: null });
    try {
      const response = await reviewService.create({
        product_id: productId,
        userName,
        rating: Number(rating) || 0,
        comment: comment || '',
        media_url: mediaUrl || null
      });
      const newReview = formatReview(unwrapReview(response), { mediaUrl, userName });
      const next = [newReview, ...get().reviews];
      set({ reviews: next, loading: false });
      storage.set('reviews', next);
      return newReview;
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
    return get().reviews.find(r => (
      (Number(r.product_id) === pid || Number(r.productId) === pid) &&
      getReviewUserName(r) === userName
    ));
  },

  hasReviewed(productId, userName) {
    const pid = Number(productId);
    return !!get().reviews.find(r => (
      (Number(r.product_id) === pid || Number(r.productId) === pid) &&
      getReviewUserName(r) === userName
    ));
  },

  // Update a review
  async updateReview(id, { rating, comment, mediaUrl }) {
    set({ loading: true, error: null });
    try {
      const updateData = { rating, comment };
      if (mediaUrl !== undefined) updateData.media_url = mediaUrl;

      const response = await reviewService.update(id, updateData);
      const updated = formatReview(unwrapReview(response), { mediaUrl });
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
