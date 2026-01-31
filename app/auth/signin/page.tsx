// app/auth/signin/page.tsx

"use client";

export const dynamic = "force-dynamic";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../../components/NavBar";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Set to false to handle errors manually
      });

      if (result?.error) {
        // Parse JSON error if it's email_not_verified
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.type === "email_not_verified") {
            setError("Please verify your email before signing in. Check your inbox for the verification link.");
          } else {
            setError(errorData.message || "Authentication failed");
          }
        } catch {
          // Regular error message
          if (result.error === "CredentialsSignin") {
            setError("Invalid email or password");
          } else {
            setError("An error occurred during sign in");
          }
        }
      } else {
        // Success - redirect to home
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar session={null} />
      <div className="flex items-center justify-center py-12">
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md p-6">
          <div>
            <h1 className="text-2xl font-bold">Sign In</h1>
            <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
              {error.includes("verify your email") && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Implement resend verification email
                      alert("Resend verification email functionality coming soon");
                    }}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    Resend Verification Email
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded bg-white text-black"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded bg-white text-black"
              required
              disabled={loading}
            />
          </div>

          <div className="text-right">
            <a
              href="/auth/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded font-medium ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-blue-500 hover:underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}