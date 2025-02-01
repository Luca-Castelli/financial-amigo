"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, getStoredTokens } from "./auth-client";
import api from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
});

// Routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    user: null,
    isLoading: true,
    error: null,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Only verify if we have tokens
        const tokens = getStoredTokens();
        if (!tokens) {
          setState((prev) => ({ ...prev, isLoading: false }));
          if (!PUBLIC_PATHS.includes(pathname)) {
            router.push("/login");
          }
          return;
        }

        // Verify tokens with backend
        const { data } = await api.get("/api/auth/me");
        setState({
          user: data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Auth verification failed:", error);
        setState({
          user: null,
          isLoading: false,
          error: "Authentication failed",
        });

        if (!PUBLIC_PATHS.includes(pathname)) {
          router.push("/login");
        }
      }
    };

    verifyAuth();
  }, [pathname]);

  // Show loading state
  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
