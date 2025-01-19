import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const session = await getSession();
  if (!session?.access_token) {
    throw new ApiError(401, "Not authenticated");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
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
  async getAccounts() {
    return fetchWithAuth("/api/accounts");
  },

  async createAccount(data: {
    name: string;
    type: string;
    currency: string;
    broker?: string;
  }) {
    return fetchWithAuth("/api/accounts", {
      method: "POST",
      body: JSON.stringify(data),
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
