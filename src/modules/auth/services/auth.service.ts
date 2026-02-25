import { apiClient } from 'src/core/api/axios';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
} from 'src/core/types/api';

const AUTH_BASE_PATH = '';

export async function registerUser(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>(
    `${AUTH_BASE_PATH}/register`,
    payload,
  );

  return data;
}

export async function loginUser(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    `${AUTH_BASE_PATH}/login`,
    payload,
  );

  return data;
}

export async function fetchCurrentUser(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/me');
  return data;
}

