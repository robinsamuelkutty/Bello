import { create } from "zustand";

export const useSpotifySidebarStore = create((set) => ({
  // Indicates whether the sidebar is pinned open.
  persist: false,
  // Controls the current visibility of the sidebar.
  isVisible: false,

  // Toggle persistent (pinned) state and update visibility accordingly.
  togglePersist: () =>
    set((state) => {
      if (!state.persist) {
        // When pinning: set persist and visible to true.
        return { persist: true, isVisible: true };
      } else {
        // When unpinning: set both persist and visible to false.
        return { persist: false, isVisible: false };
      }
    }),

  // Set visibility for hover effects.
  setVisible: (visible) => set({ isVisible: visible }),
}));
