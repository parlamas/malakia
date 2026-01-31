// app/auth/verification-success/page.tsx

"use client";

export const dynamic = "force-dynamic";

import NavBar from "../../../components/NavBar";

export default function VerificationSuccess() {
  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar session={null} />
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Verified Successfully!</h1>
            <p className="text-gray-600">
              Your email address has been verified. You can now sign in to your account.
            </p>
          </div>
          
          <a
            href="/auth/signin"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 font-medium"
          >
            Sign In Now
          </a>
        </div>
      </div>
    </div>
  );
}