"use client";

import axios, { AxiosInstance } from "axios";

// Types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  default_currency: string;
}

// Token management
const AUTH_KEY = "fa_auth";

// Simple encryption for token storage
const encrypt = (data: string): string => btoa(data);
const decrypt = (data: string): string => atob(data);

export function storeTokens(tokens: AuthTokens): void {
  try {
    sessionStorage.setItem(AUTH_KEY, encrypt(JSON.stringify(tokens)));
  } catch (error) {
    console.error("Failed to store auth tokens:", error);
    clearAuth();
  }
}

export function getStoredTokens(): AuthTokens | null {
  try {
    const data = sessionStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(decrypt(data)) : null;
  } catch (error) {
    console.error("Failed to retrieve auth tokens:", error);
    clearAuth();
    return null;
  }
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_KEY);
  delete axios.defaults.headers.common.Authorization;
}

/**
 * Start Google OAuth flow
 */
export function startGoogleOAuth(): void {
  // Force HTTPS in production
  if (
    process.env.NODE_ENV === "production" &&
    window.location.protocol !== "https:"
  ) {
    window.location.href = `https://${window.location.host}${window.location.pathname}`;
    return;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("Backend URL not configured");
  }

  window.location.href = `${backendUrl}/api/auth/google`;
}

/**
 * Handle OAuth callback response
 */
export async function handleOAuthCallback(): Promise<void> {
  if (typeof window === "undefined") return;

  // Check for error in query params
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const errorDetail = urlParams.get("error_detail");

  if (error) {
    console.error("OAuth error:", error, errorDetail);
    window.location.href = `/login?error=${error}${
      errorDetail ? `&error_detail=${errorDetail}` : ""
    }`;
    return;
  }

  // Check for tokens in URL fragment
  const fragment = window.location.hash.substring(1);
  const fragmentParams = new URLSearchParams(fragment);
  const accessToken = fragmentParams.get("access_token");
  const refreshToken = fragmentParams.get("refresh_token");

  if (accessToken && refreshToken) {
    // Store tokens and redirect to dashboard
    storeTokens({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "bearer",
    });
    window.location.href = "/dashboard";
    return;
  }

  // If no tokens and no error, something went wrong
  window.location.href = "/login?error=auth_failed";
}

/**
 * Configure axios instance with auth interceptors
 */
export function configureAxios(instance: AxiosInstance): void {
  // Request interceptor
  instance.interceptors.request.use(
    async (config) => {
      const tokens = getStoredTokens();
      if (tokens?.access_token) {
        config.headers.Authorization = `Bearer ${tokens.access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const tokens = getStoredTokens();

      // Handle 401 and token refresh
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        tokens?.refresh_token
      ) {
        originalRequest._retry = true;

        try {
          const { data } = await instance.post("/api/auth/refresh", {
            refresh_token: tokens.refresh_token,
          });

          storeTokens(data);
          instance.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
          return instance(originalRequest);
        } catch (refreshError) {
          clearAuth();
          window.location.href = "/login?error=session_expired";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}
