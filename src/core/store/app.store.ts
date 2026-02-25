import { defineStore } from 'pinia';

interface GlobalLoadingState {
  isGlobalLoading: boolean;
  globalLoadingMessage: string | null;
  pendingRequests: number;
}

export const useAppStore = defineStore('app', {
  state: (): GlobalLoadingState => ({
    isGlobalLoading: false,
    globalLoadingMessage: null,
    pendingRequests: 0,
  }),
  getters: {
    isLoading: (state): boolean => state.isGlobalLoading,
    hasPendingRequests: (state): boolean => state.pendingRequests > 0,
  },
  actions: {
    setGlobalLoading(isLoading: boolean, message?: string | null): void {
      this.isGlobalLoading = isLoading;
      this.globalLoadingMessage =
        message ?? (isLoading ? 'Awakening Duel Server...' : null);
    },
    incrementPendingRequests(): void {
      this.pendingRequests += 1;
    },
    decrementPendingRequests(): void {
      if (this.pendingRequests > 0) {
        this.pendingRequests -= 1;
      }

      if (this.pendingRequests === 0) {
        this.isGlobalLoading = false;
        this.globalLoadingMessage = null;
      }
    },
    resetLoadingState(): void {
      this.isGlobalLoading = false;
      this.globalLoadingMessage = null;
      this.pendingRequests = 0;
    },
  },
});

