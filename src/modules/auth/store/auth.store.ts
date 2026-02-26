import { defineStore } from 'pinia';
import type { AuthenticatedUser, LoginRequest } from 'src/core/types/api';
import { fetchCurrentUser, loginUser, registerUser } from '../services/auth.service';
import type { RegisterRequest } from 'src/core/types/api';

const TOKEN_STORAGE_KEY = 'dueltrade_token';

type AuthStatus = 'idle' | 'authenticating' | 'loading-profile';

interface AuthState {
  token: string | null;
  user: AuthenticatedUser | null;
  status: AuthStatus;
  errorMessage: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: window.localStorage.getItem(TOKEN_STORAGE_KEY),
    user: null,
    status: 'idle',
    errorMessage: null,
  }),
  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token && state.user),
    isAuthenticating: (state): boolean => state.status === 'authenticating',
  },
  actions: {
    setToken(token: string | null): void {
      this.token = token;

      if (token) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    },

    async register(payload: RegisterRequest): Promise<void> {
      this.errorMessage = null;
      try {
        await registerUser(payload);
      } catch (error: unknown) {
        this.errorMessage = 'Failed to register duelist. Please try again.';
        throw error;
      }
    },

    async login(payload: LoginRequest): Promise<void> {
      this.status = 'authenticating';
      this.errorMessage = null;

      try {
        const response = await loginUser(payload);

        this.setToken(response.token);
        this.user = response.user;
      } catch (error: unknown) {
        this.errorMessage = 'Invalid credentials or unreachable duel server.';
        this.setToken(null);
        this.user = null;
        throw error;
      } finally {
        this.status = 'idle';
      }
    },

    async hydrateFromToken(): Promise<void> {
      if (!this.token) {
        return;
      }

      this.status = 'loading-profile';
      this.errorMessage = null;

      try {
        const profile = await fetchCurrentUser();
        this.user = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
        };
      } catch (_error: unknown) {
        this.setToken(null);
        this.user = null;
      } finally {
        this.status = 'idle';
      }
    },

    logout(): void {
      this.setToken(null);
      this.user = null;
      this.status = 'idle';
      this.errorMessage = null;
    },
  },
});

