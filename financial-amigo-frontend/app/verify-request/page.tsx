"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function VerifyRequest() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              A sign in link has been sent to your email address.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              If you don't see it, check your spam folder.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
