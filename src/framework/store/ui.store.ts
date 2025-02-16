import { create } from "zustand";
import type { StateCreator } from "zustand";

// UI State types
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
  
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Store implementation
const createUIStore: StateCreator<UIState> = (set) => ({
  sidebarOpen: false,
  theme: 'light',
  isLoading: false,
  error: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
});

export const useUIStore = create(createUIStore); 