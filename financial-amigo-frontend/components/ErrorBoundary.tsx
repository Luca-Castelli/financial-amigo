"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

// Add proper error boundary props
interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const { clearAuth } = useAuth();

  useEffect(() => {
    if (error.message.includes("401")) {
      clearAuth();
    }
  }, [error]);

  return (
    <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
      <h3 className="font-bold">Application Error</h3>
      <p className="text-sm mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded"
      >
        Try Again
      </button>
    </div>
  );
}
