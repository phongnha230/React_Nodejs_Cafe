import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import newsService from '../services/newService.js';

const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : `n_${Date.now()}_${Math.random().toString(36).slice(2)}`);

const unwrapNews = (response) => response?.data?.data ?? response?.data;

const stripMarkdown = (value = '') =>
  String(value)
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]+]\([^)]*\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const makeExcerpt = (news, fallback = {}) => {
  const explicitExcerpt = news.excerpt || news.description || fallback.excerpt;
  if (explicitExcerpt) return explicitExcerpt;

  const source = stripMarkdown(news.content || fallback.content || '');
  return source.length > 150 ? `${source.slice(0, 147)}...` : source;
};

const formatNews = (news, fallback = {}) => ({
  id: news.id,
  title: news.title || fallback.title || '',
  img: news.img || news.image || news.image_url || fallback.img || '',
  excerpt: makeExcerpt(news, fallback),
  content: news.content || fallback.content || fallback.excerpt || '',
  pinned: news.pinned || news.is_pinned || false,
  createdAt: news.createdAt || news.created_at || Date.now(),
});

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
      const formattedNews = apiNews.map(news => formatNews(news));

      set({ news: formattedNews, loading: false });
      storage.set('news', formattedNews);
      return formattedNews;
    } catch (error) {
      console.error('Load news from API failed:', error);
      set({ error: error.message, loading: false });
      return get().news; // Fallback to cache
    }
  },

  // Load a single news item, useful for opening detail page directly
  async loadById(id) {
    set({ loading: true, error: null });
    try {
      const response = await newsService.getById(id);
      const payload = unwrapNews(response);
      const formatted = formatNews(payload);
      const exists = get().news.some(n => String(n.id) === String(id));
      const next = exists
        ? get().news.map(n => String(n.id) === String(id) ? formatted : n)
        : [formatted, ...get().news];

      set({ news: next, loading: false });
      storage.set('news', next);
      return formatted;
    } catch (error) {
      console.error('Load news detail failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Add new news
  async add({ title, img, excerpt, content }) {
    set({ loading: true, error: null });
    try {
      const response = await newsService.create({
        title,
        image_url: img,  // Send as image_url to match backend field
        content: content || excerpt || title,  // Markdown body
        excerpt,
        status: 'published'  // Set status to published by default
      });
      const newNews = unwrapNews(response);
      const formatted = formatNews(newNews, { title, img, excerpt, content });

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
      const updateData = {};
      if (patch.title !== undefined) updateData.title = patch.title;
      if (patch.content !== undefined) updateData.content = patch.content;
      if (patch.excerpt !== undefined) updateData.excerpt = patch.excerpt;
      if (patch.img !== undefined) updateData.image_url = patch.img;
      if (patch.status !== undefined) updateData.status = patch.status;
      if (patch.pinned !== undefined) updateData.is_pinned = patch.pinned;

      const response = await newsService.update(id, updateData);
      const updatedNews = unwrapNews(response);
      const formatted = updatedNews ? formatNews(updatedNews, patch) : null;

      const next = get().news.map(n => n.id === id ? (formatted || { ...n, ...patch }) : n);
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
