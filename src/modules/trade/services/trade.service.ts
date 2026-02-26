import { apiClient } from 'src/core/api/axios';
import type {
  CardsListResponse,
  CreateTradeRequest,
  CreateTradeResponse,
  TradesListResponse,
  UserCardsResponse,
} from 'src/core/types/api';

export interface CatalogQuery {
  rpp?: number;
  page?: number;
}

export interface TradesQuery {
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

export async function fetchTradesList(
  params: TradesQuery,
): Promise<TradesListResponse> {
  const { data } = await apiClient.get<TradesListResponse>('/trades', {
    params: { rpp: params.rpp ?? 20, page: params.page ?? 1 },
  });
  return data;
}

export async function deleteTrade(tradeId: string): Promise<void> {
  await apiClient.delete(`/trades/${tradeId}`);
}
