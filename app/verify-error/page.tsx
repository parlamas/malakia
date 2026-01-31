// app/verify-error/page.tsx

"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "../../components/NavBar";

function VerifyErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "Email verification failed.";
  
  if (error === "missing-token") {
    errorMessage = "Verification link is incomplete.";
  } else if (error === "invalid-token") {
    errorMessage = "This verification link is invalid or has expired.";
  } else if (error === "server-error") {
    errorMessage = "A server error occurred. Please try again.";
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar session={null} />
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>

          <p className="text-gray-600 mb-6">
            Please try signing in and requesting a new verification email.
          </p>

          <div className="space-y-3">
            <a
              href="/auth/signin"
              className="block w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
            >
              Go to Sign In
            </a>
            
            <a
              href="/"
              className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-center"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-black">
        <NavBar session={null} />
        <div className="flex items-center justify-center py-12">
          <div className="w-full max-w-md p-6">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <VerifyErrorContent />
    </Suspense>
  );
}