import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { useAppStore } from '../store/app.store';

export const API_BASE_URL = 'https://cards-marketplace-api.onrender.com/';

const GLOBAL_LOADING_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 60000;

interface AxiosRequestMetadata {
  enableGlobalLoading?: boolean;
  loadingTimeoutId?: number;
}

export interface DuelTradeAxiosRequestConfig<D = unknown>
  extends AxiosRequestConfig<D> {
  metadata?: AxiosRequestMetadata;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

function attachAuthHeader(config: DuelTradeAxiosRequestConfig): void {
  const token = window.localStorage.getItem('dueltrade_token');

  if (!token) {
    return;
  }

  if (!config.headers) {
    config.headers = {};
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
}

function scheduleGlobalLoading(config: DuelTradeAxiosRequestConfig): void {
  const appStore = useAppStore();

  const enableGlobalLoading =
    config.metadata?.enableGlobalLoading ?? true;

  if (!enableGlobalLoading) {
    return;
  }

  appStore.incrementPendingRequests();

  const timeoutId = window.setTimeout(() => {
    appStore.setGlobalLoading(true, 'Awakening Duel Server...');
  }, GLOBAL_LOADING_DELAY_MS);

  config.metadata = {
    ...(config.metadata ?? {}),
    enableGlobalLoading,
    loadingTimeoutId: timeoutId,
  };
}

function clearGlobalLoading(config?: DuelTradeAxiosRequestConfig): void {
  const appStore = useAppStore();

  if (config?.metadata?.loadingTimeoutId !== undefined) {
    window.clearTimeout(config.metadata.loadingTimeoutId);
  }

  if (appStore.hasPendingRequests) {
    appStore.decrementPendingRequests();
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const typedConfig = config as DuelTradeAxiosRequestConfig;

    attachAuthHeader(typedConfig);
    scheduleGlobalLoading(typedConfig);

    return typedConfig;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    clearGlobalLoading(
      response.config as DuelTradeAxiosRequestConfig | undefined,
    );

    return response;
  },
  (error: AxiosError) => {
    clearGlobalLoading(error.config as DuelTradeAxiosRequestConfig | undefined);
    return Promise.reject(error);
  },
);

export { apiClient };

