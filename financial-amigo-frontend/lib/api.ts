import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function refreshAccessToken(refresh_token: string): Promise<string> {
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to refresh access token");
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const session = await getSession();
  if (!session?.access_token) {
    throw new ApiError(401, "Not authenticated");
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    // If we get a 401, try to refresh the token
    if (response.status === 401 && session.refresh_token) {
      try {
        // Get new access token
        const newAccessToken = await refreshAccessToken(session.refresh_token);

        // Update session token (this is temporary until next session update)
        session.access_token = newAccessToken;

        // Retry the original request with new token
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newAccessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!retryResponse.ok) {
          throw new ApiError(retryResponse.status, await retryResponse.text());
        }

        return retryResponse.json();
      } catch (error) {
        throw new ApiError(401, "Token refresh failed");
      }
    }

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Network error");
  }
}

// Types for account management
export type AccountType = "TFSA" | "RRSP" | "FHSA" | "NON_REGISTERED";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  description?: string;
  broker?: string;
  account_number?: string;
  cash_balance: number;
  cash_interest_ytd: number;
}

export interface CreateAccountData {
  name: string;
  type: AccountType;
  currency: string;
  description?: string;
  broker?: string;
  account_number?: string;
}

export interface UpdateAccountData {
  name?: string;
  description?: string;
  broker?: string;
  account_number?: string;
}

export const api = {
  // User settings
  async getCurrentUser() {
    return fetchWithAuth("/api/users/me");
  },

  async updateUserSettings(data: { default_currency: string }) {
    return fetchWithAuth("/api/users/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Account management
  async getAccounts(): Promise<Account[]> {
    return fetchWithAuth("/api/accounts");
  },

  async getAccount(id: string): Promise<Account> {
    return fetchWithAuth(`/api/accounts/${id}`);
  },

  async createAccount(data: CreateAccountData): Promise<Account> {
    return fetchWithAuth("/api/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    return fetchWithAuth(`/api/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteAccount(
    id: string
  ): Promise<{ status: string; message: string }> {
    return fetchWithAuth(`/api/accounts/${id}`, {
      method: "DELETE",
    });
  },

  // Transaction management
  async getTransactions(accountId?: number) {
    const endpoint = accountId
      ? `/api/transactions?account_id=${accountId}`
      : "/api/transactions";
    return fetchWithAuth(endpoint);
  },

  async createTransaction(data: {
    account_id: number;
    type: string;
    symbol?: string;
    quantity?: number;
    price?: number;
    total: number;
    date: string;
  }) {
    return fetchWithAuth("/api/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
