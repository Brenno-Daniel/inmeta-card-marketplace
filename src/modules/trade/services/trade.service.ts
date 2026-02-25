import { apiClient } from 'src/core/api/axios';
import type {
  Card,
  CardsListResponse,
  CreateTradeRequest,
  CreateTradeResponse,
  UserCardsResponse,
} from 'src/core/types/api';

export interface CatalogQuery {
  rpp?: number;
  page?: number;
}

export async function fetchMyCardsForTrade(): Promise<UserCardsResponse> {
  const { data } = await apiClient.get<UserCardsResponse>('/me/cards');
  return data;
}

export async function fetchCatalogForTrade(
  params: CatalogQuery,
): Promise<CardsListResponse> {
  const { data } = await apiClient.get<CardsListResponse>('/cards', {
    params: {
      rpp: params.rpp ?? 12,
      page: params.page ?? 1,
    },
  });
  return data;
}

export async function createTrade(
  payload: CreateTradeRequest,
): Promise<CreateTradeResponse> {
  const { data } = await apiClient.post<CreateTradeResponse>('/trades', payload);
  return data;
}
