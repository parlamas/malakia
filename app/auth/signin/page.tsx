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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
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
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 font-medium"
          >
            Sign In
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