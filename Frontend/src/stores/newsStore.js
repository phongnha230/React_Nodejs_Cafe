import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import newsService from '../services/newService.js';

const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : `n_${Date.now()}_${Math.random().toString(36).slice(2)}`);

export const useNewsStore = create((set, get) => ({
  news: [],
  loading: false,
  error: null,

  // Load news from API (MySQL Database)
  async loadFromAPI() {
    set({ loading: true, error: null });
    try {
      const response = await newsService.getAll();
      const payload = response.data;
      const apiNews = Array.isArray(payload) ? payload : (payload?.data || []);

      // Format data nếu cần
      const formattedNews = apiNews.map(news => ({
        id: news.id,
        title: news.title || '',
        img: news.img || news.image || news.image_url || '',
        excerpt: news.excerpt || news.content || news.description || '',
        pinned: news.pinned || false,
        createdAt: news.createdAt || news.created_at || Date.now(),
      }));

      set({ news: formattedNews, loading: false });
      storage.set('news', formattedNews);
      return formattedNews;
    } catch (error) {
      console.error('Load news from API failed:', error);
      set({ error: error.message, loading: false });
      return get().news; // Fallback to cache
    }
  },

  // Add new news
  async add({ title, img, excerpt }) {
    set({ loading: true, error: null });
    try {
      const response = await newsService.create({
        title,
        image_url: img,  // Send as image_url to match backend field
        content: excerpt || title,  // Backend requires 'content', not 'excerpt'
        status: 'published'  // Set status to published by default
      });
      const newNews = response.data;

      const formatted = {
        id: newNews.id,
        title: newNews.title || title,
        img: newNews.image_url || img || '',  // Use image_url from backend
        excerpt: newNews.content || excerpt,
        pinned: newNews.pinned || false,
        createdAt: newNews.createdAt || newNews.created_at || Date.now(),
      };

      const next = [formatted, ...get().news];
      set({ news: next, loading: false });
      storage.set('news', next);
      return formatted.id;
    } catch (error) {
      console.error('Add news failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update news
  async update(id, patch) {
    set({ loading: true, error: null });
    try {
      await newsService.update(id, patch);
      const next = get().news.map(n => n.id === id ? { ...n, ...patch } : n);
      set({ news: next, loading: false });
      storage.set('news', next);
    } catch (error) {
      console.error('Update news failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Remove news
  async remove(id) {
    set({ loading: true, error: null });
    try {
      await newsService.delete(id);
      const next = get().news.filter(n => n.id !== id);
      set({ news: next, loading: false });
      storage.set('news', next);
    } catch (error) {
      console.error('Remove news failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
