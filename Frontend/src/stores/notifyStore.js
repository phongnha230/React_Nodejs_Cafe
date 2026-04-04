import { create } from 'zustand';

export const useNotifyStore = create((set) => ({
  open: false,
  message: '',
  type: 'info', // info | success | warning | error
  actionLabel: '',
  onAction: null,
  show({ message, type = 'info', actionLabel = '', onAction = null, duration = 3000 }) {
    set({ open: true, message, type, actionLabel, onAction });
    if (duration > 0) {
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => set({ open: false }), duration);
    }
  },
  hide() { set({ open: false }); }
}));
