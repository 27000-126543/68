import { create } from 'zustand';
import type { User, UserRole } from '../types';
import { getLoginUsers } from '../utils/api';

const STORAGE_KEY = 'recruit_auth_user';

const DEFAULT_USERS: User[] = [
  {
    id: 'hq_user',
    name: '刘伟（总部）',
    email: 'hq@test.com',
    role: 'hq',
    scope: {}
  },
  {
    id: 'region_user',
    name: '陈静（华东区）',
    email: 'region@test.com',
    role: 'region',
    scope: { regions: ['华东'] }
  },
  {
    id: 'ent_user',
    name: '王芳（字节跳动）',
    email: 'ent@test.com',
    role: 'enterprise',
    scope: { enterprises: ['字节跳动'] }
  }
];

interface AuthState {
  user: User | null;
  availableUsers: User[];
  loading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  fetchUsers: () => Promise<void>;
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
  availableUsers: DEFAULT_USERS,
  loading: false,
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
  },

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const users = await getLoginUsers();
      if (users && users.length > 0) {
        set({ availableUsers: users });
      }
    } catch {
      // Fallback to default users already in state
    } finally {
      set({ loading: false });
    }
  }
}));
