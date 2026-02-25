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
  selectedOfferingId: string | null;
  selectedReceivingId: string | null;
  isLoadingMyCards: boolean;
  isLoadingCatalog: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export const useTradeStore = defineStore('trade', {
  state: (): TradeState => ({
    myCards: [],
    catalogCards: [],
    catalogPage: 1,
    catalogMore: true,
    selectedOfferingId: null,
    selectedReceivingId: null,
    isLoadingMyCards: false,
    isLoadingCatalog: false,
    isSubmitting: false,
    errorMessage: null,
  }),

  getters: {
    selectedOffering: (state): Card | null =>
      state.myCards.find((c) => c.id === state.selectedOfferingId) ?? null,
    selectedReceiving: (state): Card | null =>
      state.catalogCards.find((c) => c.id === state.selectedReceivingId) ?? null,
    canSubmit: (state): boolean =>
      Boolean(state.selectedOfferingId && state.selectedReceivingId),
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

    setSelectedOffering(cardId: string | null): void {
      this.selectedOfferingId = cardId;
    },

    setSelectedReceiving(cardId: string | null): void {
      this.selectedReceivingId = cardId;
    },

    resetSelection(): void {
      this.selectedOfferingId = null;
      this.selectedReceivingId = null;
      this.errorMessage = null;
    },

    async submitTrade(): Promise<string | null> {
      if (!this.selectedOfferingId || !this.selectedReceivingId) return null;
      this.isSubmitting = true;
      this.errorMessage = null;
      try {
        const response = await createTrade({
          cards: [
            { cardId: this.selectedOfferingId, type: 'OFFERING' },
            { cardId: this.selectedReceivingId, type: 'RECEIVING' },
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
