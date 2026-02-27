import { defineStore } from 'pinia';
import type { Card } from 'src/core/types/api';
import {
  addUserCards,
  fetchCardsCatalog,
  fetchUserCards,
  type CardsCatalogQuery,
  mapCardsToInventory,
} from '../services/inventory.service';

interface InventoryState {
  cards: Card[];
  isLoading: boolean;
  isUpdating: boolean;
  errorMessage: string | null;
}

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    cards: [],
    isLoading: false,
    isUpdating: false,
    errorMessage: null,
  }),
  getters: {
    cardCount: (state): number => state.cards.length,
    hasCards: (state): boolean => state.cards.length > 0,
  },
  actions: {
    async loadInventory(): Promise<void> {
      this.isLoading = true;
      this.errorMessage = null;

      try {
        const response = await fetchUserCards();
        this.cards = mapCardsToInventory(response);
      } catch {
        this.errorMessage = 'Unable to load your deck box.';
        this.cards = [];
      } finally {
        this.isLoading = false;
      }
    },

    async addCards(cardIds: string[]): Promise<void> {
      if (!cardIds.length) {
        return;
      }

      this.isUpdating = true;
      this.errorMessage = null;

      try {
        await addUserCards(cardIds);
        await this.loadInventory();
      } catch {
        this.errorMessage = 'Failed to add cards to your deck.';
      } finally {
        this.isUpdating = false;
      }
    },

    async loadCatalogPage(query: CardsCatalogQuery) {
      return fetchCardsCatalog(query);
    },
  },
});
