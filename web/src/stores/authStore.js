import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      setUser: (user) => set({ user }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (loading) => set({ loading }),

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

      clearAuth: () => set({
        user: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);