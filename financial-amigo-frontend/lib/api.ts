import axios, { AxiosInstance } from "axios";
import { configureAxios } from "./auth-client";

// Create axios instance first
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000,
});

// Then configure interceptors
configureAxios(api); // Pass api instance to configure

// API Types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  default_currency: string;
}

export interface Account {
  id: string;
  name: string;
  type: "TFSA" | "RRSP" | "FHSA" | "NON_REGISTERED";
  currency: "CAD" | "USD";
  description?: string;
  broker?: string;
  account_number?: string;
  cash_balance: number;
  cash_interest_ytd: number;
}

// API endpoints
export const users = {
  me: () => api.get<{ user: User }>("/api/auth/me"),
  updateSettings: (data: { default_currency: string }) =>
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

export default api;
