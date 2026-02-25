import { apiClient } from 'src/core/api/axios';
import type { TradesListResponse } from 'src/core/types/api';

export interface TradesQuery {
  rpp?: number;
  page?: number;
}

export async function fetchTrades(
  params: TradesQuery,
): Promise<TradesListResponse> {
  const { data } = await apiClient.get<TradesListResponse>('/trades', {
    params: {
      rpp: params.rpp ?? 6,
      page: params.page ?? 1,
    },
  });

  return data;
}

