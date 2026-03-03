import { defineStore } from 'pinia';
import type { Card } from 'src/core/types/api';
import {
  createTrade,
  fetchCatalogForTrade,
  fetchMyCardsForTrade,
  type CatalogQuery,
} from '../services/trade.service';

interface TradeState {
  myCards: Card[];
  catalogCards: Card[];
  catalogPage: number;
  catalogMore: boolean;
  selectedOfferingIds: string[];
  selectedReceivingIds: string[];
  isLoadingMyCards: boolean;
  isLoadingCatalog: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
}

function toggleId(list: string[], cardId: string): string[] {
  return list.includes(cardId) ? list.filter((id) => id !== cardId) : [...list, cardId];
}

export const useTradeStore = defineStore('trade', {
  state: (): TradeState => ({
    myCards: [],
    catalogCards: [],
    catalogPage: 1,
    catalogMore: true,
    selectedOfferingIds: [],
    selectedReceivingIds: [],
    isLoadingMyCards: false,
    isLoadingCatalog: false,
    isSubmitting: false,
    errorMessage: null,
  }),

  getters: {
    selectedOfferings: (state): Card[] =>
      state.myCards.filter((c) => state.selectedOfferingIds.includes(c.id)),
    selectedReceivings: (state): Card[] =>
      state.catalogCards.filter((c) => state.selectedReceivingIds.includes(c.id)),
    canSubmit: (state): boolean =>
      state.selectedOfferingIds.length > 0 && state.selectedReceivingIds.length > 0,
  },

  actions: {
    async loadMyCards(): Promise<void> {
      this.isLoadingMyCards = true;
      this.errorMessage = null;
      try {
        this.myCards = await fetchMyCardsForTrade();
      } catch {
        this.myCards = [];
        this.errorMessage = 'Could not load your cards.';
      } finally {
        this.isLoadingMyCards = false;
      }
    },

    async loadCatalog(reset = true): Promise<void> {
      if (reset) {
        this.catalogPage = 1;
        this.catalogMore = true;
        this.isLoadingCatalog = true;
      }
      this.errorMessage = null;
      try {
        const query: CatalogQuery = { page: this.catalogPage, rpp: 12 };
        const response = await fetchCatalogForTrade(query);
        if (reset) {
          this.catalogCards = response.list;
        } else {
          this.catalogCards = [...this.catalogCards, ...response.list];
        }
        this.catalogMore = response.more;
      } catch {
        if (reset) this.catalogCards = [];
        this.errorMessage = 'Could not load card catalog.';
      } finally {
        this.isLoadingCatalog = false;
      }
    },

    async loadMoreCatalog(): Promise<void> {
      if (!this.catalogMore || this.isLoadingCatalog) return;
      this.catalogPage += 1;
      await this.loadCatalog(false);
    },

    setSelectedOffering(cardId: string): void {
      this.selectedOfferingIds = toggleId(this.selectedOfferingIds, cardId);
    },

    setSelectedReceiving(cardId: string): void {
      this.selectedReceivingIds = toggleId(this.selectedReceivingIds, cardId);
    },

    resetSelection(): void {
      this.selectedOfferingIds = [];
      this.selectedReceivingIds = [];
      this.errorMessage = null;
    },

    async submitTrade(): Promise<string | null> {
      if (!this.canSubmit) return null;
      this.isSubmitting = true;
      this.errorMessage = null;
      try {
        const response = await createTrade({
          cards: [
            ...this.selectedOfferingIds.map((cardId) => ({ cardId, type: 'OFFERING' as const })),
            ...this.selectedReceivingIds.map((cardId) => ({ cardId, type: 'RECEIVING' as const })),
          ],
        });
        this.resetSelection();
        await this.loadMyCards();
        return response.tradeId;
      } catch {
        this.errorMessage = 'Failed to create trade. Try again.';
        return null;
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});
