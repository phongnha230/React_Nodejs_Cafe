import { create } from 'zustand';
import { storage } from '../utils/storage.js';
import userServices from '../services/usersServices.js';

const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : `u_${Date.now()}_${Math.random().toString(36).slice(2)}`);

export const useUsersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  // Load all users from API (both admin and customer)
  async loadFromAPI(params = {}) {
    set({ loading: true, error: null });
    try {
      const response = await userServices.getAll(params);
      const apiUsers = response.data || [];
      
      // Format data
      const formattedUsers = apiUsers.map(user => ({
        id: user.id,
        username: user.username || user.name,
        email: user.email,
        role: user.role || 'customer',
        name: user.name,
        phone: user.phone,
        loginCount: user.login_count || 0,
        lastLoginAt: user.last_login_at,
        createdAt: user.createdAt || user.created_at,
        updatedAt: user.updatedAt || user.updated_at,
      }));

      set({ users: formattedUsers, loading: false });
      storage.set('users', formattedUsers);
      return formattedUsers;
    } catch (error) {
      console.error('Load users from API failed:', error);
      set({ error: error.message, loading: false });
      return get().users; // Fallback to cache
    }
  },

  // Get all customers (role='customer')
  getCustomers() {
    return get().users.filter(u => u.role === 'customer');
  },

  // Get all admins (role='admin')
  getAdmins() {
    return get().users.filter(u => u.role === 'admin');
  },

  // Get user by ID
  async getById(id) {
    set({ loading: true, error: null });
    try {
      const response = await userServices.getById(id);
      const user = response.data;
      set({ loading: false });
      return user;
    } catch (error) {
      console.error('Get user by ID failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Add new user (legacy - thường dùng register)
  add({ name, email, password, role = 'customer' }) {
    // Check duplicate email
    const exists = get().users.some(u => u.email?.toLowerCase() === email?.toLowerCase());
    if (exists) return false;

    const newUser = { 
      id: genId(), 
      username: name,
      name, 
      email, 
      password, 
      role,
      createdAt: new Date().toISOString()
    };
    const next = [newUser, ...get().users];
    set({ users: next });
    storage.set('users', next);
    return true;
  },

  // Update user
  async update(id, data) {
    set({ loading: true, error: null });
    try {
      const response = await userServices.update(id, data);
      const updatedUser = response.data;
      
      const next = get().users.map(u => 
        u.id === id ? { ...u, ...data, updatedAt: new Date().toISOString() } : u
      );
      set({ users: next, loading: false });
      storage.set('users', next);
      return updatedUser;
    } catch (error) {
      console.error('Update user failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Remove user
  async remove(id) {
    set({ loading: true, error: null });
    try {
      await userServices.delete(id);
      const next = get().users.filter(u => u.id !== id);
      set({ users: next, loading: false });
      storage.set('users', next);
    } catch (error) {
      console.error('Remove user failed:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Search users
  search(query) {
    if (!query) return get().users;
    const q = query.toLowerCase();
    return get().users.filter(u => 
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q)
    );
  }
}));

