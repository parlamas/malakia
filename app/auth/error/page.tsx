// app/auth/error/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "../../../components/NavBar";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication.";
  
  if (error === "email_not_verified") {
    errorMessage = "Please verify your email before signing in. Check your inbox for the verification link.";
  } else if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password.";
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar />
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>

          <div className="space-y-3">
            {error === "email_not_verified" && (
              <>
                <p className="text-gray-600">
                  Didn't receive the verification email?
                </p>
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Resend Verification Email
                </button>
              </>
            )}
            
            <div className="pt-4 border-t">
              <a
                href="/auth/signin"
                className="block text-center text-blue-500 hover:underline"
              >
                ← Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-black">
        <NavBar />
        <div className="flex items-center justify-center py-12">
          <div className="w-full max-w-md p-6">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}