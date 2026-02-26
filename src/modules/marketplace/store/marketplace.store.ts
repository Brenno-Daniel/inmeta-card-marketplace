import { defineStore } from 'pinia';
import type { TradeListItem } from 'src/core/types/api';
import { fetchTrades, type TradesQuery } from '../services/marketplace.service';

interface MarketplaceState {
  trades: TradeListItem[];
  page: number;
  rpp: number;
  more: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  errorMessage: string | null;
}

export const useMarketplaceStore = defineStore('marketplace', {
  state: (): MarketplaceState => ({
    trades: [],
    page: 1,
    rpp: 6,
    more: true,
    isLoading: false,
    isLoadingMore: false,
    errorMessage: null,
  }),
  actions: {
    async loadFirstPage(): Promise<void> {
      this.page = 1;
      this.more = true;
      this.isLoading = true;
      this.errorMessage = null;

      try {
        const response = await fetchTrades(this.buildQuery());
        this.trades = response.list;
        this.more = response.more;
      } catch (_error: unknown) {
        this.trades = [];
        this.errorMessage = 'Unable to load live marketplace.';
      } finally {
        this.isLoading = false;
      }
    },

    async loadNextPage(): Promise<void> {
      if (!this.more || this.isLoadingMore) {
        return;
      }

      this.isLoadingMore = true;

      try {
        this.page += 1;
        const response = await fetchTrades(this.buildQuery());
        this.trades = [...this.trades, ...response.list];
        this.more = response.more;
      } catch (_error: unknown) {
        this.errorMessage = 'Failed to fetch more trades.';
        this.page -= 1;
      } finally {
        this.isLoadingMore = false;
      }
    },

    buildQuery(): TradesQuery {
      return {
        page: this.page,
        rpp: this.rpp,
      };
    },
  },
});

