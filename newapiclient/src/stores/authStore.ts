import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Credentials } from '../types/api';

interface AuthState {
  credentials: Credentials | null;
  baseUrl: string;
  isAuthenticated: boolean;
  setCredentials: (credentials: Credentials | null) => void;
  setBaseUrl: (url: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      credentials: null,
      baseUrl: '',
      isAuthenticated: false,
      
      setCredentials: (credentials) =>
        set({ credentials, isAuthenticated: !!credentials }),
      
      setBaseUrl: (url) =>
        set({ baseUrl: url }),
      
      logout: () =>
        set({ credentials: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        baseUrl: state.baseUrl,
      }),
    }
  )
);
