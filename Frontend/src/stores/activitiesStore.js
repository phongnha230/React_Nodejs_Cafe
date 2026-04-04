import { create } from 'zustand';
import { storage } from '../utils/storage.js';

const seed = [
  'https://images.unsplash.com/photo-1527169402691-feff5539e52c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?q=80&w=800&auto=format&fit=crop'
];

let initial;
try {
  const raw = localStorage.getItem('activities');
  if (raw) {
    const parsed = JSON.parse(raw);
    initial = Array.isArray(parsed) ? parsed : [];
  } else {
    initial = seed.map((url, i) => ({ id: `a_${Date.now()}_${i}`, img: url, createdAt: Date.now() - i * 1000 }));
    storage.set('activities', initial);
  }
} catch { initial = []; }

const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`);

export const useActivitiesStore = create((set, get) => ({
  items: initial,
  add(img) {
    const next = [{ id: genId(), img, createdAt: Date.now() }, ...get().items];
    set({ items: next });
    storage.set('activities', next);
  },
  remove(id) {
    const next = get().items.filter(x => x.id !== id);
    set({ items: next });
    storage.set('activities', next);
  }
}));
