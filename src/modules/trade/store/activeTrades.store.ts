import { defineStore } from 'pinia';
import type { TradeListItem } from 'src/core/types/api';
import {
  deleteTrade as deleteTradeApi,
  fetchTradesList,
} from '../services/trade.service';

interface ActiveTradesState {
  trades: TradeListItem[];
  isLoading: boolean;
  isDeletingId: string | null;
  errorMessage: string | null;
}

export const useActiveTradesStore = defineStore('activeTrades', {
  state: (): ActiveTradesState => ({
    trades: [],
    isLoading: false,
    isDeletingId: null,
    errorMessage: null,
  }),

  actions: {
    async loadMyTrades(userId: string): Promise<void> {
      this.isLoading = true;
      this.errorMessage = null;
      const all: TradeListItem[] = [];
      let page = 1;
      let more = true;

      const maxPages = 10;
      try {
        while (more && page <= maxPages) {
          const response = await fetchTradesList({ page, rpp: 20 });
          const mine = response.list.filter((t) => t.userId === userId);
          all.push(...mine);
          more = response.more && response.list.length > 0;
          page += 1;
        }
        this.trades = all;
      } catch {
        this.trades = [];
        this.errorMessage = 'Could not load your active trades.';
      } finally {
        this.isLoading = false;
      }
    },

    async revokeTrade(tradeId: string): Promise<void> {
      this.isDeletingId = tradeId;
      this.errorMessage = null;
      try {
        await deleteTradeApi(tradeId);
        this.trades = this.trades.filter((t) => t.id !== tradeId);
      } catch {
        this.errorMessage = 'Failed to revoke trade.';
      } finally {
        this.isDeletingId = null;
      }
    },
  },
});
