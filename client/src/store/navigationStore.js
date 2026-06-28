import { create } from 'zustand';

export const useNavigationStore = create((set) => ({
  currentPath: window.location.pathname,
  isAuthenticated: false,
  setPath: (path) => {
    window.history.pushState({}, '', path);
    set({ currentPath: path });
  },
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),
}));
