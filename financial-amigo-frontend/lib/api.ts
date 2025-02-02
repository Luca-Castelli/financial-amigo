import axios, { AxiosInstance } from "axios";
import { configureAxios } from "./auth-client";

// Create axios instance first
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000,
});

// Then configure interceptors
configureAxios(api);

// API Types
export type Currency = "CAD" | "USD";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  default_currency: Currency;
}

export interface Account {
  id: string;
  name: string;
  type: "TFSA" | "RRSP" | "FHSA" | "NON_REGISTERED";
  currency: Currency;
  description?: string;
  broker?: string;
  account_number?: string;
  cash_balance: number;
  cash_interest_ytd: number;
}

export type TransactionType = "Buy" | "Sell" | "Dividend";

export interface Transaction {
  id: string;
  date: string;
  symbol: string;
  quantity: number;
  price_native: number;
  commission_native: number;
  currency: Currency;
  type: TransactionType;
  description?: string;
  total_native: number;
  account_id: string;
}

// API endpoints
export const users = {
  me: () => api.get<User>("/api/users/me"),
  updateSettings: (data: { default_currency: Currency }) =>
    api.patch<User>("/api/users/settings", data),
};

export const accounts = {
  list: () => api.get<Account[]>("/api/accounts"),
  create: (data: Omit<Account, "id">) =>
    api.post<Account>("/api/accounts", data),
  get: (id: string) => api.get<Account>(`/api/accounts/${id}`),
  update: (id: string, data: Partial<Account>) =>
    api.patch<Account>(`/api/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/api/accounts/${id}`),
};

export const transactions = {
  list: (accountId?: string) =>
    api.get<Transaction[]>(
      accountId
        ? `/api/transactions?account_id=${accountId}`
        : "/api/transactions"
    ),
  create: (data: Omit<Transaction, "id" | "total_native">) =>
    api.post<Transaction>("/api/transactions", data),
  update: (
    id: string,
    data: Partial<Omit<Transaction, "id" | "total_native">>
  ) => api.patch<Transaction>(`/api/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/api/transactions/${id}`),
};

export default api;
