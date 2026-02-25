export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

export interface Card {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  cards: Card[];
}

export interface PaginatedResponse<TItem> {
  list: TItem[];
  rpp: number;
  page: number;
  more: boolean;
}

export type CardsListResponse = PaginatedResponse<Card>;

export interface AddUserCardsRequest {
  cardIds: string[];
}

export type UserCardsResponse = Card[];

export type TradeCardType = 'OFFERING' | 'RECEIVING';

export interface TradeCardInPayload {
  cardId: string;
  type: TradeCardType;
}

export interface CreateTradeRequest {
  cards: TradeCardInPayload[];
}

export interface CreateTradeResponse {
  tradeId: string;
}

export interface TradeCard {
  id: string;
  cardId: string;
  tradeId: string;
  type: TradeCardType;
  card: Card;
}

export interface TradeListItemUser {
  name: string;
}

export interface TradeListItem {
  id: string;
  userId: string;
  createdAt: string;
  user: TradeListItemUser;
  tradeCards: TradeCard[];
}

export type TradesListResponse = PaginatedResponse<TradeListItem>;

