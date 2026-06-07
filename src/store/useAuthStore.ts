import { create } from 'zustand';
import type { User, UserRole } from '../types';
import { generateDefaultUsers } from '../data/mockData';

const STORAGE_KEY = 'recruit_auth_user';

interface AuthState {
  user: User | null;
  availableUsers: User[];
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const loadFromStorage = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (user: User | null) => {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* empty */
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadFromStorage(),
  availableUsers: generateDefaultUsers(),
  isAuthenticated: !!loadFromStorage(),

  login: (userId) => {
    const user = get().availableUsers.find(u => u.id === userId);
    if (user) {
      saveToStorage(user);
      set({ user, isAuthenticated: true });
    }
  },

  logout: () => {
    saveToStorage(null);
    set({ user: null, isAuthenticated: false });
  },

  switchRole: (role) => {
    const target = get().availableUsers.find(u => u.role === role);
    if (target) {
      saveToStorage(target);
      set({ user: target, isAuthenticated: true });
    }
  }
}));
