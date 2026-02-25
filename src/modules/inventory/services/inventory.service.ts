import { apiClient } from 'src/core/api/axios';
import type {
  AddUserCardsRequest,
  Card,
  CardsListResponse,
  UserCardsResponse,
} from 'src/core/types/api';

export interface CardsCatalogQuery {
  rpp?: number;
  page?: number;
}

export async function fetchUserCards(): Promise<UserCardsResponse> {
  const { data } = await apiClient.get<UserCardsResponse>('/me/cards');
  return data;
}

export async function addUserCards(cardIds: string[]): Promise<void> {
  const payload: AddUserCardsRequest = {
    cardIds,
  };

  await apiClient.post('/me/cards', payload);
}

export async function fetchCardsCatalog(
  params: CardsCatalogQuery,
): Promise<CardsListResponse> {
  const { data } = await apiClient.get<CardsListResponse>('/cards', {
    params: {
      rpp: params.rpp ?? 12,
      page: params.page ?? 1,
    },
  });

  return data;
}

export function mapCardsToInventory(cards: UserCardsResponse): Card[] {
  return cards;
}

