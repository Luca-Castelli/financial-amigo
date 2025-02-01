"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { startGoogleOAuth, handleOAuthCallback } from "@/lib/auth-client";
import Loading from "@/components/Loading";

const ERROR_MESSAGES = {
  auth_failed: "Authentication failed. Please try again.",
  token_exchange_failed: "Failed to complete authentication. Please try again.",
  session_expired: "Your session has expired. Please log in again.",
  clock_sync:
    "There seems to be a time synchronization issue. Please check your computer's clock is set correctly and try again.",
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDetail = searchParams.get("error_detail");

  useEffect(() => {
    const handleCallback = async () => {
      setIsLoading(true);
      try {
        await handleOAuthCallback();
      } catch (err) {
        console.error("OAuth callback error:", err);
        // Check for clock sync error
        if (
          err instanceof Error &&
          err.toString().includes("Token used too early")
        ) {
          window.location.href = "/login?error=clock_sync";
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Check if we're handling a callback
    if (searchParams.get("code") || window.location.hash) {
      handleCallback();
    }
  }, [searchParams]);

  const handleLogin = () => {
    setIsLoading(true);
    startGoogleOAuth();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Welcome to FinancialAmigo
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Sign in with your Google account to continue
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {(error || errorDetail) && (
            <Alert variant="destructive">
              <AlertDescription>
                {ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] ||
                  errorDetail ||
                  "An error occurred. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleLogin}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
